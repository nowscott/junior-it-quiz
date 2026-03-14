'use client';

import { CheckCircle, ArrowLeft, Clock, Search } from 'lucide-react';
import clsx from 'clsx';
import { ModuleData } from '@/data/questions';
import { AppMode, ExamState } from '@/hooks/useQuizState';
import { formatTime } from '@/utils/format';

interface QuizHeaderProps {
  currentModuleData: ModuleData;
  mode: AppMode;
  examState: ExamState;
  examSubmitted: boolean;
  isExamActive: boolean;
  isReviewing: boolean;
  timeLeft: number;
  currentQuestionIndex: number;
  onExitExam: () => void;
  onBackToResult: () => void;
  onOpenProgress: () => void;
}

export default function QuizHeader({
  currentModuleData,
  mode,
  examState,
  examSubmitted,
  isExamActive,
  isReviewing,
  timeLeft,
  currentQuestionIndex,
  onExitExam,
  onBackToResult,
  onOpenProgress,
}: QuizHeaderProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 z-30 flex-shrink-0">
      <div className="ml-10 md:ml-0 flex items-center gap-4 overflow-hidden">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight truncate">
          {currentModuleData?.title}
        </h2>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
         {/* 退出考试按钮 */}
         {isExamActive && (
           <button 
             type="button"
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               onExitExam();
             }}
             className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100 hover:bg-red-100 transition-colors"
             title="提前交卷"
           >
             <CheckCircle size={14} className="mr-1" />
             交卷
           </button>
         )}

         {/* 返回成绩单按钮 (错题回顾时显示) */}
         {isReviewing && (
           <button 
             type="button"
             onClick={onBackToResult}
             className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
             title="返回成绩单"
           >
             <ArrowLeft size={14} className="mr-1" />
             返回成绩单
           </button>
         )}

         {mode === 'exam' && examState === 'active' && !examSubmitted && (
           <div className="flex items-center px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium border border-purple-100 whitespace-nowrap">
             <Clock size={14} className="mr-1 md:mr-2" />
             {formatTime(timeLeft)}
           </div>
         )}
         
         <div className="relative">
           <button 
             onClick={() => (mode === 'practice' || isReviewing) && onOpenProgress()}
             className={clsx(
               "text-xs md:text-sm font-medium px-3 py-1 rounded-full transition-all flex items-center",
               (mode === 'practice' || isReviewing)
                 ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100" 
                 : "bg-gray-100 text-gray-500"
             )}
           >
             {mode === 'infinite' ? (
               <span>无尽模式 | 第 {currentQuestionIndex + 1} 题</span>
             ) : isReviewing ? (
               <span>查看答题卡</span>
             ) : (
               <span>进度: {currentQuestionIndex + 1} / {currentModuleData?.questions.length}</span>
             )}
             {(mode === 'practice' || isReviewing) && <Search size={12} className="ml-1 opacity-50" />}
           </button>
         </div>
      </div>
    </header>
  );
}
