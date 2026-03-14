'use client';

import { ChevronLeft, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react';
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
  isReviewing,
  showResult,
  onStartExam,
  onRestartExam,
  onReviewWrong,
  onAnswer,
  onPrevQuestion,
  onNextQuestion,
  onSubmitExam,
  onBackToResult,
}: QuizMainProps) {
  
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

  return (
    <div className="space-y-6">
      <QuestionCard 
        key={currentQuestion.id} 
        question={currentQuestion}
        userAnswer={currentUserAnswer}
        onSelectAnswer={onAnswer}
        showResult={showResult}
        mode={mode}
        sessionId={examSessionId}
      />
      
      {/* 题目下方的导航按钮 */}
      <div className="flex items-center justify-between gap-4 px-2">
        <button 
          onClick={onPrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex-1 max-w-[160px] px-4 py-3 rounded-2xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft size={18} className="mr-1" /> 上一题
        </button>
        
        {isReviewing ? (
          <button 
            onClick={onBackToResult}
            className="flex-1 max-w-[200px] px-6 py-3 rounded-2xl text-sm font-bold bg-gray-800 text-white hover:bg-gray-900 shadow-lg shadow-gray-200 flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            <ArrowLeft size={18} className="mr-2" /> 返回成绩单
          </button>
        ) : mode === 'exam' && !examSubmitted && currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1 ? (
          <button 
            onClick={onSubmitExam}
            className="flex-1 max-w-[200px] px-6 py-3 rounded-2xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            提交试卷 <CheckCircle size={18} className="ml-2" />
          </button>
        ) : (
          <button 
            onClick={onNextQuestion}
            disabled={mode !== 'infinite' && currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1}
            className="flex-1 max-w-[200px] px-6 py-3 rounded-2xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            {mode === 'infinite' ? '下一题' : (currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1 ? '已完成' : '下一题')}
            <ChevronRight size={18} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}
