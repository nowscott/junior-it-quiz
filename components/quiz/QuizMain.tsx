'use client';

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Question, ModuleData } from '@/data/questions';
import { AppMode, ExamState, ExamConfig } from '@/hooks/useQuizState';
import { formatTime } from '@/utils/format';
import QuestionCard from './QuestionCard';
import ResultCard from './ResultCard';
import ExamIntro from './ExamIntro';

interface QuizMainProps {
  mode: Exclude<AppMode, 'welcome'>;
  examState: ExamState;
  showResultCard: boolean;
  examConfig: ExamConfig;
  examResult: { score: number; correct: number };
  examQuestions: Question[];
  currentQuestion: Question | undefined;
  currentQuestionIndex: number;
  currentUserAnswer: number | null;
  timeLeft: number;
  examSeedString: string;
  examSessionId: number;
  currentModuleData: ModuleData;
  examSubmitted: boolean;
  isReviewing: boolean;
  showResult: boolean;
  onStartExam: (seed?: string) => void;
  onRestartExam: () => void;
  onReviewWrong: () => void;
  onAnswer: (index: number) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onSubmitExam: () => void;
  onBackToResult: () => void;
}

export default function QuizMain({
  mode,
  examState,
  showResultCard,
  examConfig,
  examResult,
  examQuestions,
  currentQuestion,
  currentQuestionIndex,
  currentUserAnswer,
  timeLeft,
  examSeedString,
  examSessionId,
  currentModuleData,
  examSubmitted,
  showResult,
  onStartExam,
  onRestartExam,
  onReviewWrong,
  onAnswer,
  onPrevQuestion,
  onNextQuestion,
  onSubmitExam,
}: QuizMainProps) {
  
  const isLastQuestion = mode !== 'infinite' && currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1;

  // 键盘快捷键支持：左右方向键切换题目
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在输入框中触发
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        if (currentQuestionIndex > 0) {
          onPrevQuestion();
        }
      } else if (e.key === 'ArrowRight') {
        if (mode === 'infinite') {
          onNextQuestion();
        } else {
          // 非无尽模式下，如果是最后一题则不响应（因为需要提交）
          if (currentQuestionIndex < (currentModuleData?.questions.length || 1) - 1) {
            onNextQuestion();
          }
        }
      } else if (e.key === 'Enter') {
        // 在考试模式下，按 Enter 键自动下一题
        if (mode === 'exam' && !examSubmitted && !isLastQuestion) {
          onNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, mode, currentModuleData, onPrevQuestion, onNextQuestion, examSubmitted, isLastQuestion]);

  if (mode === 'exam' && examState === 'intro') {
    return (
      <ExamIntro 
        questionCount={examConfig.questionCount}
        timeLimit={examConfig.timeLimit}
        onStart={onStartExam}
      />
    );
  }

  if (showResultCard && mode === 'exam') {
    return (
      <ResultCard 
        score={examResult.score}
        correctCount={examResult.correct}
        totalQuestions={examQuestions.length}
        onRestart={onRestartExam}
        onReviewWrong={onReviewWrong}
        timeUsed={formatTime(examConfig.timeLimit * 60 - timeLeft)}
        examSeed={examSeedString}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-20 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-32 bg-gray-100 rounded-xl mx-auto w-full max-w-lg"></div>
      </div>
    );
  }

  const handleNext = () => {
    if (mode === 'infinite') {
      onNextQuestion();
    } else {
      if (currentQuestionIndex < (currentModuleData?.questions.length || 1) - 1) {
        onNextQuestion();
      }
    }
  };

  return (
    <div className="space-y-3 md:space-y-6">
      {/* 导航按钮移动到题目上方 */}
      <div className="flex items-center justify-between px-1">
        <button 
          onClick={onPrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="group flex items-center gap-1 pl-1 pr-3 py-1.5 md:pl-2 md:pr-4 md:py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white/80 transition-all disabled:opacity-0 disabled:cursor-not-allowed"
        >
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 group-hover:shadow-sm transition-all">
            <ChevronLeft size={16} />
          </div>
          <span className="text-xs md:text-sm">上一题</span>
        </button>
        
        {mode === 'exam' && !examSubmitted && isLastQuestion ? (
          <button 
            onClick={onSubmitExam}
            className="group flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-bold bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="text-xs md:text-sm">提交试卷</span>
            <CheckCircle size={16} />
          </button>
        ) : (
          <button 
            onClick={handleNext}
            disabled={isLastQuestion}
            className="group flex items-center gap-1 pl-3 pr-1 py-1.5 md:pl-4 md:pr-2 md:py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="text-xs md:text-sm">{mode === 'infinite' ? '下一题' : (isLastQuestion ? '已完成' : '下一题')}</span>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 group-hover:shadow-sm transition-all">
              <ChevronRight size={16} />
            </div>
          </button>
        )}
      </div>

      <QuestionCard 
        key={currentQuestion.id} 
        question={currentQuestion}
        userAnswer={currentUserAnswer}
        onSelectAnswer={onAnswer}
        showResult={showResult}
        mode={mode}
        sessionId={examSessionId}
        questionNumber={currentQuestionIndex + 1}
      />
    </div>
  );
}
