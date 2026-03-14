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

解析要求：
1. **禁止使用选项字母**：由于选项顺序可能会被打乱，解析中**绝对不要出现** "A"、"B"、"C"、"D" 或 "选项A" 等指代。请直接引用**选项的文字内容**。
2. **结构清晰**：
   - **✅ 正确答案解析**：首先明确指出正确答案的内容，详细解释其原理、定义以及为什么它是正确的。
   - **❌ 干扰项辨析**：按每个干扰项**单独一段**输出，段首以该干扰项的**选项文字加粗**起始，后接冒号和简洁有力的理由；不要使用序号或字母。
3. **内容深度**：字数控制在 500-700 字左右。不仅要解释题目本身，还要适当拓展相关的知识点，帮助学生理解背后的概念。
4. **风格规范**：
   - 语言通俗易懂，适合初中生。
   - **不要**复述题目题干。
   - **不要**有开场白（如“这道题考察的是...”）和结束语（如“希望你学会了...”）。
   - **不要**在结尾提出问题。
5. 如果提供了图片，请结合图片中的关键信息进行说明，但不要在答案中描述“图片显示了什么”，而是把图片作为知识点依据融入解释。

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

        const completion = await openai.chat.completions.create({
            model: "qwen3.5-plus",
            messages
        });

        const explanation = completion.choices[0].message.content;

        return NextResponse.json({ explanation });
    } catch (error) {
        console.error('Error generating explanation:', error);
        return NextResponse.json(
            { error: 'Failed to generate explanation' },
            { status: 500 }
        );
    }
}
