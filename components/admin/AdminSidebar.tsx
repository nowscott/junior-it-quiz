import { AlertCircle, Save } from 'lucide-react';
import { QuestionData } from '@/data/types';
import React from 'react';

type Message = { type: 'success' | 'error'; text: string } | null;

interface Props {
  data: QuestionData;
  selectedModuleId: string | null;
  onSelect: (id: string) => void;
  onSaveAll: () => void;
  saving: boolean;
  isDev: boolean;
  message: Message;
}

export default function AdminSidebar({
  data,
  selectedModuleId,
  onSelect,
  onSaveAll,
  saving,
  isDev,
  message
}: Props) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0">
      <div className="p-4 border-b border-gray-100 font-bold text-lg text-gray-800">
        题库管理
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.entries(data).map(([id, module]) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedModuleId === id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {module.title}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100">
        {!isDev && (
          <div className="mb-3 p-3 bg-yellow-50 text-yellow-700 text-xs rounded-lg border border-yellow-100 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              生产环境无法修改数据。请在本地运行 <code>npm run dev</code> 进行编辑，然后提交代码。
            </span>
          </div>
        )}
        <button
          onClick={onSaveAll}
          disabled={saving || !isDev}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isDev ? '仅支持本地开发环境保存' : '保存到本地文件'}
        >
          {saving ? '保存中...' : (<><Save size={18} /> 保存全部更改</>)}
        </button>
        {message && (
          <div
            className={`mt-2 text-xs text-center p-2 rounded ${
              message.type === 'success'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
