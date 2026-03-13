# 初中信息技术选择题练习系统 (Next.js 重构版)

这是一个基于现代 Web 技术栈重构的信息技术练习系统，旨在提供更流畅、美观且功能丰富的在线刷题体验。

## 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [TailwindCSS](https://tailwindcss.com/)
- **图标**: [Lucide React](https://lucide.dev/)
- **部署**: [Vercel](https://vercel.com/) (推荐)

## 核心功能

1.  **模块化练习**：包含6个基础知识模块，支持即时答题反馈。
2.  **随机综合考试**：
    *   从全库随机抽取20道题目。
    *   模拟真实考试环境，交卷后显示成绩单和错题解析。
3.  **随机无尽模式**：
    *   **智能洗牌算法**：确保题目在不重复的情况下循环出现。
    *   **自动续题**：答题后自动跳转下一题，提供沉浸式刷题体验。
4.  **现代化 UI**：
    *   响应式设计，完美适配移动端和桌面端。
    *   优雅的动画和交互效果。
    *   支持题目插图放大查看。

## 本地运行

1.  安装依赖：
    ```bash
    npm install
    ```

2.  启动开发服务器：
    ```bash
    npm run dev
    ```

3.  打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 部署到 Vercel

本项目针对 Vercel 进行了优化，部署非常简单：

1.  将代码推送到 GitHub。
2.  登录 [Vercel](https://vercel.com)，点击 "Add New..." -> "Project"。
3.  导入你的 GitHub 仓库。
4.  保持默认配置，点击 "Deploy"。

## 目录结构

- `app/`: Next.js 路由和页面入口。
- `components/`: React UI 组件 (Sidebar, QuestionCard, ResultCard 等)。
- `data/`: 题库数据 (TypeScript 格式)。
- `public/`: 静态资源 (图片等)。
- `lib/`: 工具函数。

## 致谢与版权

本项目重构自 **lanxin140513** 的 [cwezczbxxjslx](https://github.com/lanxin140513/cwezczbxxjslx) 仓库。
题库数据及部分原始资源均来源于该仓库，在此表示感谢！

---
*Next.js 重构版*
