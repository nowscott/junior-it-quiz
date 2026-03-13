import { useState, useEffect } from 'react';
import { X, Trash2, Settings2, Clock, ListOrdered, Save } from 'lucide-react';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examConfig: {
    questionCount: number;
    timeLimit: number; // in minutes
  };
  onUpdateExamConfig: (config: { questionCount: number; timeLimit: number }) => void;
  onClearProgress: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  examConfig,
  onUpdateExamConfig,
  onClearProgress
}: SettingsModalProps) {
  const [tempConfig, setTempConfig] = useState(examConfig);

  // 当外部配置改变时更新内部状态
  useEffect(() => {
    setTempConfig(examConfig);
  }, [examConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateExamConfig(tempConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-gray-900">
            <Settings2 size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold">系统设置</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Exam Settings Section */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">考试配置</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <ListOrdered size={16} className="text-gray-400" />
                  <span>题目数量</span>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  {[10, 20, 30, 50].map((num) => (
                    <button
                      key={num}
                      onClick={() => setTempConfig({ ...tempConfig, questionCount: num })}
                      className={clsx(
                        "px-3 py-1 text-xs font-bold rounded-md transition-all",
                        tempConfig.questionCount === num 
                          ? "bg-white text-blue-600 shadow-sm" 
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Clock size={16} className="text-gray-400" />
                  <span>时间限制 (分钟)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input 
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={tempConfig.timeLimit}
                    onChange={(e) => setTempConfig({ ...tempConfig, timeLimit: parseInt(e.target.value) })}
                    className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-sm font-bold text-blue-600 w-8">{tempConfig.timeLimit}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Data Management Section */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">数据管理</h4>
            
            <button
              onClick={() => {
                if (confirm('确认清空所有练习进度吗？此操作不可撤销。')) {
                  onClearProgress();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-red-50 hover:bg-red-50 text-red-600 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <Trash2 size={20} className="text-red-400 group-hover:text-red-600 transition-colors" />
                <div className="text-left">
                  <div className="text-sm font-bold">清空练习进度</div>
                  <div className="text-xs opacity-60">重置所有已做题目的记录</div>
                </div>
              </div>
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Save size={18} />
            <span>保存并应用</span>
          </button>
        </div>
      </div>
    </div>
  );
}
