import React from 'react';
import { ModuleData, Question } from '@/data/types';
import { Edit2, Plus, Trash2 } from 'lucide-react';

interface Props {
  module: ModuleData;
  onAdd: () => void;
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
}

export default function QuestionList({ module, onAdd, onEdit, onDelete }: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {module.title}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({module.questions.length} 题)
          </span>
        </h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> 添加题目
        </button>
      </div>

      <div className="space-y-4">
        {module.questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">#{idx + 1}</span>
                  <h3 className="font-medium text-gray-900 line-clamp-2">{q.text}</h3>
                </div>
                {q.image && (
                  <div className="mt-2">
                    <img
                      src={q.image}
                      alt="题目图片"
                      className="max-h-40 rounded-lg border border-gray-200 object-contain bg-white"
                    />
                  </div>
                )}
                <div className="text-sm text-gray-500 pl-1">
                  答案: <span className="font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">{q.options[q.correctAnswer]}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(q)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="编辑"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(q.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="删除"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
