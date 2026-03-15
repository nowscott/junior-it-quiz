'use client';

import { useState, useEffect } from 'react';
import { Settings2, ListOrdered, Clock, Save, Trash2, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { SETTINGS_STORAGE_KEY, PROGRESS_STORAGE_KEY } from '@/hooks/useQuizState';
import clsx from 'clsx';

interface SettingsViewProps {
  isOpen: boolean;
  onClose: () => void;
  onClearProgress: () => void;
}

export default function SettingsView({ isOpen, onClose, onClearProgress }: SettingsViewProps) {
  const [tempConfig, setTempConfig] = useState<{ questionCount: number; timeLimit: number }>({ questionCount: 30, timeLimit: 30 });
  const [saving, setSaving] = useState<'idle' | 'success'>('idle');
  const [clearOpen, setClearOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.questionCount === 'number' && typeof parsed?.timeLimit === 'number') {
            setTempConfig({ questionCount: parsed.questionCount, timeLimit: parsed.timeLimit });
          }
        } catch {}
      }
    }
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !clearOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, clearOpen]);

  const handleSave = () => {
    const normalized = {
      questionCount: Math.max(1, Math.floor(tempConfig.questionCount || 1)),
      timeLimit: Math.max(1, Math.floor(tempConfig.timeLimit || 1)),
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    setTempConfig(normalized);
    setSaving('success');
    setTimeout(() => {
      setSaving('idle');
      // 可选：保存后自动关闭
      // onClose();
    }, 1200);
  };

  const handleConfirmClear = () => {
    onClearProgress();
    setClearOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={clsx(
          "fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      >
        <div 
          className={clsx(
            "bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 transform",
            isOpen ? "scale-100 translate-y-0 pointer-events-auto" : "scale-95 translate-y-4 pointer-events-none"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center space-x-3 text-gray-900">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Settings2 size={22} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">系统设置</h3>
                <p className="text-xs text-gray-500 font-medium">个性化你的练习体验</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-8">
            {/* Exam Config Section */}
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                考试配置
              </h4>
              
              <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 space-y-6">
                {/* Question Count */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm group-hover:border-blue-200 group-hover:text-blue-500 transition-colors">
                      <ListOrdered size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-700">试题数量</div>
                      <div className="text-xs text-gray-500">每场模拟考试生成的题目数</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <button
                      onClick={() => setTempConfig(c => ({ ...c, questionCount: Math.max(5, c.questionCount - 5) }))}
                      className="w-8 h-8 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-blue-600 font-bold transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={tempConfig.questionCount}
                      min={1}
                      onChange={(e) => setTempConfig({ ...tempConfig, questionCount: Number(e.target.value) })}
                      className="w-16 py-1 text-center font-bold text-gray-800 bg-transparent outline-none border-b border-transparent focus:border-blue-500 transition-colors"
                    />
                    <button
                      onClick={() => setTempConfig(c => ({ ...c, questionCount: c.questionCount + 5 }))}
                      className="w-8 h-8 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-blue-600 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Time Limit */}
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm group-hover:border-blue-200 group-hover:text-blue-500 transition-colors">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-700">时间限制</div>
                      <div className="text-xs text-gray-500">模拟考试的总时长（分钟）</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-blue-600 tabular-nums">{tempConfig.timeLimit} <span className="text-xs text-gray-400 font-normal">分钟</span></span>
                     </div>
                     <input 
                        type="range" 
                        min="10" 
                        max="120" 
                        step="5"
                        value={tempConfig.timeLimit}
                        onChange={(e) => setTempConfig({...tempConfig, timeLimit: Number(e.target.value)})}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                     />
                  </div>
                </div>
              </div>
            </section>

            {/* Data Management Section */}
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                数据管理
              </h4>
              
              <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center text-red-500 shadow-sm">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">清空所有进度</div>
                    <div className="text-xs text-red-400/80">此操作不可恢复，请谨慎操作</div>
                  </div>
                </div>
                <button
                  onClick={() => setClearOpen(true)}
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold shadow-sm hover:bg-red-50 hover:border-red-300 transition-all active:scale-95"
                >
                  立即清空
                </button>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              设置会自动保存到本地浏览器
            </div>
            <button
              onClick={handleSave}
              className={clsx(
                "px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95",
                saving === 'success'
                  ? 'bg-green-500 text-white shadow-green-200 hover:bg-green-600'
                  : 'bg-gray-900 text-white shadow-gray-200 hover:bg-gray-800'
              )}
            >
              {saving === 'success' ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>已保存</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>保存设置</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleConfirmClear}
        title="清空进度"
        message="确认清空所有进度？此操作无法撤销。"
        confirmText="确认清空"
        cancelText="取消"
        variant="danger"
      />
    </>
  );
}
