import { X, CheckCircle2 } from 'lucide-react';
import { type Question } from '@/data/questions';
import clsx from 'clsx';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  questions: Question[];
  userAnswers: Record<number, number>;
  currentIndex: number;
  onJump: (index: number) => void;
}

export default function ProgressModal({
  isOpen,
  onClose,
  title,
  questions,
  userAnswers,
  currentIndex,
  onJump
}: ProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              已完成 {Object.keys(userAnswers).length} / {questions.length} 道题
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
            {questions.map((q, idx) => {
              const isAnswered = userAnswers[idx] !== undefined;
              const isCurrent = currentIndex === idx;
              
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    onJump(idx);
                    onClose();
                  }}
                  className={clsx(
                    "relative aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2",
                    isCurrent 
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm z-10 scale-105" 
                      : isAnswered
                        ? "border-green-100 bg-green-50 text-green-600 hover:border-green-300"
                        : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-gray-100"
                  )}
                  title={`第 ${idx + 1} 题`}
                >
                  {idx + 1}
                  {isAnswered && (
                    <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full">
                      <CheckCircle2 size={12} className="text-green-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer / Legend */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex items-center justify-center space-x-6">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-3 h-3 rounded-md border-2 border-blue-600 bg-blue-50 mr-2" />
            当前题
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-3 h-3 rounded-md bg-green-50 border-2 border-green-100 mr-2" />
            已做
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-3 h-3 rounded-md bg-gray-50 border-2 border-gray-50 mr-2" />
            未做
          </div>
        </div>
      </div>
    </div>
  );
}
