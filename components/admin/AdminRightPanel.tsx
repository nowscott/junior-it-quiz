import React from 'react';
import { Save, ArrowDownWideNarrow, AlertCircle, Check, ArrowUpDown, Shuffle } from 'lucide-react';
import { ModuleData } from '@/data/types';

interface Props {
  selectedModule: ModuleData | null;
  onSaveAll: () => void;
  isDev: boolean;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  defaultAscNext: boolean;
  explainAscNext: boolean;
  onToggleDefaultSort: () => void;
  onToggleExplainSort: () => void;
  onShuffle: () => void;
}

export default function AdminRightPanel({
  selectedModule,
  onSaveAll,
  isDev,
  saveStatus,
  defaultAscNext,
  explainAscNext,
  onToggleDefaultSort,
  onToggleExplainSort,
  onShuffle
}: Props) {
  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col fixed inset-y-0 right-0">
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onSaveAll}
          disabled={!isDev || saveStatus === 'saving'}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold transition-all
            ${saveStatus === 'success' ? 'bg-green-600 text-white'
              : saveStatus === 'error' ? 'bg-red-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'}
            disabled:opacity-50 disabled:cursor-not-allowed`}
          title={!isDev ? '仅支持本地开发环境保存' : '保存到本地文件'}
        >
          {saveStatus === 'saving' ? '保存中...' : saveStatus === 'success' ? (<><Check size={18} /> 保存成功</>) : (<><Save size={18} /> 保存全部更改</>)}
        </button>
        {!isDev && (
          <div className="mt-3 p-3 bg-yellow-50 text-yellow-700 text-xs rounded-lg border border-yellow-100 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>生产环境无法修改数据。请在本地运行 npm run dev 进行编辑，然后提交代码。</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="text-xs font-semibold text-gray-500">题目排序</div>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={onToggleDefaultSort}
            disabled={!selectedModule}
            className="w-full flex items-center gap-2 justify-center py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 disabled:opacity-50"
          >
            <ArrowUpDown size={16} />
            {`默认顺序（${defaultAscNext ? '正' : '逆'}）`}
          </button>
          <button
            onClick={onToggleExplainSort}
            disabled={!selectedModule}
            className="w-full flex items-center gap-2 justify-center py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 disabled:opacity-50"
          >
            <ArrowDownWideNarrow size={16} />
            {`解析字数（${explainAscNext ? '递增' : '递减'}）`}
          </button>
          <button
            onClick={onShuffle}
            disabled={!selectedModule}
            className="w-full flex items-center gap-2 justify-center py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 disabled:opacity-50"
          >
            <Shuffle size={16} />
            随机顺序
          </button>
        </div>
        {selectedModule && (
          <div className="text-xs text-gray-500">
            当前模块：<span className="font-medium text-gray-700">{selectedModule.title}</span>
            <span className="ml-1">（{selectedModule.questions.length} 题）</span>
          </div>
        )}
      </div>
    </div>
  );
}
