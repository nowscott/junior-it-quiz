import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const questionsFilePath = path.join(process.cwd(), 'data', 'questions.json');

export async function GET() {
  try {
    const data = fs.readFileSync(questionsFilePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read questions file' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // 限制仅在本地开发环境允许写入文件
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Data modification is only allowed in local development environment. On Vercel, the file system is read-only.' }, 
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    // 简单的验证，确保数据是对象
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // 写入文件
    fs.writeFileSync(questionsFilePath, JSON.stringify(body, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, message: 'Questions updated successfully' });
  } catch (error) {
    console.error('Failed to save questions:', error);
    return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 });
  }
}
