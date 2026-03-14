import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 {...props} className="text-xl font-bold mt-4 mb-2" />,
          h2: (props) => <h2 {...props} className="text-lg font-bold mt-4 mb-2" />,
          h3: (props) => <h3 {...props} className="text-base font-bold mt-3 mb-2" />,
          p: (props) => <p {...props} className="my-2 leading-7" />,
          ul: (props) => <ul {...props} className="list-disc ml-6 my-2" />,
          ol: (props) => <ol {...props} className="list-decimal ml-6 my-2" />,
          li: (props) => <li {...props} className="my-1" />,
          strong: (props) => <strong {...props} className="font-semibold" />,
          em: (props) => <em {...props} className="italic" />,
          code: (props) => {
            const isInline = (props as any).inline as boolean | undefined;
            const baseClass = (props.className ? props.className + ' ' : '');
            if (isInline) {
              return <code {...props} className={baseClass + 'px-1 py-0.5 rounded bg-gray-100 text-gray-800'} />;
            }
            return <code {...props} className={baseClass + 'block p-3 rounded bg-gray-900 text-gray-100 overflow-x-auto text-sm'} />;
          },
          blockquote: (props) => <blockquote {...props} className="border-l-4 border-gray-300 pl-4 my-2 text-gray-700" />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
