import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  className?: string;
}

const markdownComponents: Components = {
  h1: ({ ...props }) => <h1 {...props} className="text-xl font-bold mt-4 mb-2" />,
  h2: ({ ...props }) => <h2 {...props} className="text-lg font-bold mt-4 mb-2" />,
  h3: ({ ...props }) => <h3 {...props} className="text-base font-bold mt-3 mb-2" />,
  p: ({ ...props }) => <p {...props} className="my-2 leading-7" />,
  ul: ({ ...props }) => <ul {...props} className="list-disc ml-6 my-2" />,
  ol: ({ ...props }) => <ol {...props} className="list-decimal ml-6 my-2" />,
  li: ({ ...props }) => <li {...props} className="my-1" />,
  strong: ({ ...props }) => <strong {...props} className="font-semibold" />,
  em: ({ ...props }) => <em {...props} className="italic" />,
  blockquote: ({ ...props }) => <blockquote {...props} className="border-l-4 border-gray-300 pl-4 my-2 text-gray-700" />,
  
  // 👉 新增：接管 <pre> 标签，多行代码的外层容器样式放在这里
  pre: ({ ...props }) => (
    <pre {...props} className="block p-3 my-3 rounded bg-gray-900 text-gray-100 overflow-x-auto text-sm" />
  ),

  // 👉 修改：优化 <code> 标签逻辑
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code: ({ inline, className, children, ...props }: any) => {
    const isInline = inline;
    const baseClass = className ? className + ' ' : '';
    
    if (isInline) {
      // 行内代码（如 `a?.xls`），保留原有的浅色背景样式
      return (
        <code {...props} className={baseClass + 'px-1 py-0.5 rounded bg-gray-100 text-gray-800'}>
          {children}
        </code>
      );
    }
    
    // 多行代码块（背景和 padding 已经由 <pre> 标签提供）
    // 关键点：添加 whitespace-pre 来严格保留换行和缩进
    return (
      <code {...props} className={baseClass + 'whitespace-pre font-mono'}>
        {children}
      </code>
    );
  },
};

export default function MarkdownRenderer({ content, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}