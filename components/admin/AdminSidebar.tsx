import { Plus, Pencil } from 'lucide-react';
import { QuestionData } from '@/data/types';
import React, { useState } from 'react';

interface Props {
  data: QuestionData;
  selectedModuleId: string | null;
  onSelect: (id: string) => void;
  isDev: boolean;
  onCreateModule: () => void;
  onRenameModule: (id: string, newTitle: string) => void;
}

export default function AdminSidebar({
  data,
  selectedModuleId,
  onSelect,
  isDev,
  onCreateModule,
  onRenameModule
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setTempTitle(currentTitle);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTempTitle('');
  };

  const submitEdit = () => {
    if (!editingId) return;
    const trimmed = tempTitle.trim();
    if (trimmed && data[editingId]?.title !== trimmed) {
      onRenameModule(editingId, trimmed);
    }
    cancelEdit();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="font-bold text-lg text-gray-800">
          题库管理
        </div>
        <button
          type="button"
          onClick={onCreateModule}
          disabled={!isDev}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-100 disabled:opacity-50"
          title={isDev ? '新建模块' : '仅支持本地开发环境新建模块'}
        >
          <Plus size={14} />
          新建
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.entries(data).map(([id, module]) => {
          const isSelected = selectedModuleId === id;
          const isEditing = editingId === id;
          return (
            <div
              key={id}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(id)}
                className="flex-1 text-left truncate"
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={submitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        submitEdit();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEdit();
                      }
                    }}
                    className="w-full bg-transparent border border-blue-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                ) : (
                  <span className="truncate">{module.title}</span>
                )}
              </button>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => startEdit(id, module.title)}
                  disabled={!isDev}
                  className="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 disabled:opacity-40"
                  title={isDev ? '重命名模块' : '仅支持本地开发环境修改模块名称'}
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
