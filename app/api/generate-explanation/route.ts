import { NextResponse } from 'next/server';
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        // 生产环境未配置密钥时直接短路返回，避免构建/运行失败
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
        const distractorsList = options
            .filter((_: string, idx: number) => idx !== correctAnswer)
            .map((opt: string) => `• ${opt}`)
            .join('\n');

        const prompt = `请为以下初中信息技术选择题生成详细解析。

解析要求（严格遵守格式与空行）：
1. 禁止使用选项字母：由于选项顺序可能被打乱，解析中绝对不要出现 "A"、"B"、"C"、"D" 或 "选项A" 等指代；请直接引用选项的文字内容。
2. 结构与空行控制（必须严格遵守）：
   - ✅ 正确答案解析：以“✅ 正确答案解析：”起始，后接解释正文；该段结束后必须紧跟一个空行（即段落后使用“两次换行”）。
   - ❌ 干扰项辨析：按每个干扰项单独成段，段首以该干扰项的选项文字加粗起始（形如：**选项文本**：理由）；每个干扰项段之间必须使用一个空行分隔（即段落之间使用“两次换行”）；不要使用序号或字母。
3. 内容深度：字数控制在 500-700 字左右；不仅解释题目本身，还要适当拓展相关知识点。
4. 风格规范：
   - 语言通俗易懂，适合初中生。
   - 不要复述题目题干。
   - 不要有开场白或结束语。
   - 不要在结尾提出问题。
5. 图片说明：如果提供了图片，请结合图片中的关键信息进行说明，但不要描述“图片显示了什么”，而是把图片作为知识点依据融入解释。

输出模板（务必遵循换行与段间空行）：
✅ 正确答案解析：

{对“正确选项文本”的解释，结束后空一行}

❌ 干扰项辨析：

**{干扰项1文本}**：{理由}

**{干扰项2文本}**：{理由}

**{干扰项3文本}**：{理由}

题目：${question}
选项列表：
${optionsList}
干扰项列表：
${distractorsList}
正确答案：${correctOptionText}`;

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

        const messages: ChatCompletionMessageParam[] = [
            { role: "system", content: "你是一位经验丰富的初中信息技术老师，擅长用通俗易懂且深入浅出的语言为学生讲解习题。" },
            imageUrl
                ? { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }, { type: "text", text: prompt }] }
                : { role: "user", content: prompt }
        ];

        // 按需初始化客户端（避免在模块加载阶段因缺少密钥而抛错）
        const openai = new OpenAI({
            apiKey: process.env.DASHSCOPE_API_KEY,
            baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
        });

        const stream = await openai.chat.completions.create({
            model: "qwen3.5-plus",
            messages,
            stream: true,
        });

        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    const reasoning = (chunk.choices[0]?.delta as any)?.reasoning_content || "";
                    
                    if (reasoning) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'reasoning', text: reasoning })}\n\n`));
                    }
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
