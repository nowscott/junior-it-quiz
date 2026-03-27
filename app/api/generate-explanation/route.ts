import { NextResponse } from 'next/server';
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        if (!process.env.DASHSCOPE_API_KEY) {
            return NextResponse.json(
                { error: '未配置 DASHSCOPE_API_KEY，已禁用解析生成功能' },
                { status: 501 }
            );
        }

        const body = await request.json();
        const { question, options, correctAnswer, image } = body;

        if (!question || !options || correctAnswer === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const correctOptionText = options[correctAnswer];
        const optionsList = options.map((opt: string) => `• ${opt}`).join('\n');

        const prompt = `请为以下初中信息技术选择题生成详细解析。

解析要求（严格遵守格式与空行）：
1. 禁止使用选项字母：解析中绝对不要出现 "A"、"B"、"C"、"D" 或 "选项A" 等指代；请直接引用选项的文字内容。
2. 智能结构与空行控制（请根据题目类型自动选择以下两种模式之一）：
   
   ▶ 模式一：【概念/理论辨析题】（需要辨析各选项时使用）
   - 先输出“✅ 正确答案解析：”并解释正确原因，结束后必须空一行（即段落后使用“两次换行”）。
   - 然后输出“❌ 干扰项辨析：”，按每个需要辨析的干扰项单独成段，段首以该选项文字加粗起始（形如：**选项文本**：理由）；每个干扰项段落之间必须空一行。

   ▶ 模式二：【计算/推导/操作步骤题】（如进制转换、容量计算等，不需要强行解释错误数字时使用）
   - 直接输出“✅ 解题过程与正确答案：”，详细、清晰地写出计算步骤或推导过程。
   - 只要讲清得出正确答案的完整方法即可，不需要对明显是错误计算结果的干扰项进行生硬的解释。如果某个选项代表了常见的“易错陷阱”，可以单独加一段“⚠️ 易错点提示：”进行说明，否则直接忽略错误选项。结束后空一行。

3. Markdown 格式与特殊字符转义（非常重要）：
   - 你的输出将直接作为 Markdown 文本被渲染。
   - 当提及星号（*）、下划线（_）、波浪号（~）等可能触发 Markdown 格式的特殊字符（如通配符、运算符）时，**必须使用行内代码块将其包裹**（例如写成 \`*\` 或 \`_\`），或使用反斜杠进行转义（例如写成 \\*），绝对不能让它们意外变成加粗或斜体。
   - 当提及具体的文件名、路径、代码片段、快捷键或特定符号组合时，请统一使用行内代码块包裹（例如 \`a*3.doc\` 或 \`Ctrl+C\`），以保证前端显示清晰且不破坏排版。

4. 内容深度：
   - 概念题：不仅解释题目本身，还要适当拓展相关知识点。
   - 计算/操作题：核心是把公式、计算方法和步骤写得通俗易懂，步步清晰。
   
5. 风格规范：
   - 语言通俗易懂，适合初中生。
   - 不要复述题目题干。
   - 不要有开场白或结束语。
   - 不要在结尾提出问题。
   
6. 图片说明：如果提供了图片，请结合图片中的关键信息进行说明，把图片作为知识点依据融入解释。

题目：${question}
选项列表：
${optionsList}
正确答案：${correctOptionText}
`;

        let imageUrl: string | null = null;
        if (typeof image === 'string' && image.trim().length > 0) {
            const trimmed = image.trim();
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
                imageUrl = trimmed;
            } else if (trimmed.startsWith('/')) {
                const absPath = path.join(process.cwd(), 'public', trimmed.replace(/^\//, ''));
                try {
                    const buf = await fs.readFile(absPath);
                    const ext = path.extname(absPath).toLowerCase();
                    const mime =
                        ext === '.png' ? 'image/png' :
                        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                        ext === '.webp' ? 'image/webp' :
                        ext === '.svg' ? 'image/svg+xml' :
                        'application/octet-stream';
                    imageUrl = `data:${mime};base64,${buf.toString('base64')}`;
                } catch {
                    imageUrl = null;
                }
            }
        }

        // 兼容 OpenAI 的多模态消息格式
        const messages: ChatCompletionMessageParam[] = [
            { role: "system", content: "你是一位经验丰富的初中信息技术老师，擅长用通俗易懂且深入浅出的语言为学生讲解习题。" },
            imageUrl
                ? { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }, { type: "text", text: prompt }] }
                : { role: "user", content: prompt }
        ];

        const openai = new OpenAI({
            apiKey: process.env.DASHSCOPE_API_KEY,
            baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
        });

        // 👉 直接使用原生的多模态模型 qwen3.5-plus
        const stream = await openai.chat.completions.create({
            model: "qwen3.5-flash-2026-02-23", 
            messages,
            stream: true,
            temperature: 0.3, 
        });

        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: content })}\n\n`));
                    }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            },
        });

        return new NextResponse(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error('Error generating explanation:', error);
        return NextResponse.json(
            { error: 'Failed to generate explanation' },
            { status: 500 }
        );
    }
}