# 初中信息技术选择题练习系统 (Next.js 重构版)

这是一个基于现代 Web 技术栈重构的初中信息技术选择题练习系统，旨在提供更流畅、美观且功能丰富的在线刷题体验。

## ✨ 核心特性

- **多模式练习**：
  - **基础练习**：按知识点模块分类练习，即时反馈正误，支持错题回顾。
  - **模拟考试**：随机抽取题目，限时答题，模拟真实考试环境，交卷后生成详细成绩单。
  - **无尽模式**：随机无限刷题，挑战连续答对记录。

- **智能化辅助**：
  - **错题本**：自动记录答错的题目，方便针对性复习。
  - **解析复制**：支持一键复制题目解析（自动去除 Markdown 格式，提取纯文本），便于整理笔记。
  - **进度保存**：自动保存答题进度，关闭浏览器后可继续上次练习。

- **个性化设置**：
  - **自定义考试参数**：支持自定义模拟考试的题目数量和考试时长。
  - **数据管理**：支持一键清除所有答题记录和进度，重置练习状态。

- **现代化 UI/UX**：
  - **响应式设计**：完美适配移动端、平板和桌面端。
  - **流畅交互**：优雅的动画效果，无缝的页面切换，支持键盘快捷键（ESC 退出设置等）。
  - **沉浸体验**：清爽的界面设计，专注于答题。

- **管理后台 (开发环境)**：
  - 内置 `/admin` 路由，提供图形化界面管理和编辑题库数据。
  - 支持题目图片的预览和路径配置。

## 🛠 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (App Router)
- **语言**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI 库**: [React 19](https://react.dev/)
- **样式**: [TailwindCSS 4](https://tailwindcss.com/)
- **图标**: [Lucide React](https://lucide.dev/)
- **部署**: [Vercel](https://vercel.com/) (推荐)

## 🚀 快速开始

1.  **克隆项目**：
    ```bash
    git clone https://github.com/your-username/junior-it-quiz.git
    cd junior-it-quiz
    ```

2.  **安装依赖**：
    ```bash
    npm install
    ```

3.  **启动开发服务器**：
    ```bash
    npm run dev
    ```

4.  **访问应用**：
    打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 📂 目录结构

```
junior-it-quiz/
├── app/                  # Next.js App Router 路由和页面
│   ├── admin/            # 管理后台页面
│   ├── api/              # API 路由 (处理题目数据)
│   └── page.tsx          # 应用入口
├── components/           # React UI 组件
│   ├── home/             # 首页组件 (WelcomePage)
│   ├── layout/           # 布局组件 (Sidebar)
│   ├── modals/           # 弹窗组件 (确认、进度等)
│   ├── quiz/             # 答题核心组件 (QuestionCard, ResultCard 等)
│   └── settings/         # 设置相关组件 (SettingsView)
├── data/                 # 题库数据
│   ├── questions.json    # 题目数据源 (JSON 格式)
│   └── types.ts          # TypeScript 类型定义
├── hooks/                # 自定义 React Hooks (状态管理、逻辑处理)
├── public/               # 静态资源
│   └── images/           # 题目图片 (按模块分类: module1, module2...)
└── utils/                # 工具函数
```

## 📝 数据管理

- **题库文件**：主要数据存储在 `data/questions.json` 中。
- **图片资源**：题目图片存放于 `public/images/moduleX/` 目录下，引用路径如 `/images/module1/1-162.png`。
- **管理功能**：在开发模式 (`npm run dev`) 下，访问 `/admin` 可以图形化地添加、修改和删除题目。
- **生产环境**：在 Vercel 等平台部署时，文件系统通常是只读的，因此管理功能仅用于本地开发和数据维护。

## 📄 开源协议

本项目基于 [MIT 协议](LICENSE) 开源。

## 🤝 致谢与版权

本项目重构自 **lanxin140513** 的 [cwezczbxxjslx](https://github.com/lanxin140513/cwezczbxxjslx) 仓库。
题库数据及部分原始资源均来源于该仓库，在此表示感谢！

---
*Next.js 重构版 - 为初中生信息技术复习提供更好的工具*
