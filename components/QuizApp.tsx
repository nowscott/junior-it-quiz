'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Menu, X, ChevronLeft, ChevronRight, CheckCircle, Clock, Search
} from 'lucide-react';
import { questionData, type ModuleData, type Question } from '@/data/questions';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import QuestionCard from './QuestionCard';
import ResultCard from './ResultCard';

type AppMode = 'practice' | 'exam' | 'infinite';

export default function QuizApp() {
  // 动态获取第一个模块 ID 作为默认值
  const defaultModuleId = Object.keys(questionData)[0] || 'module1';
  
  const [currentModuleId, setCurrentModuleId] = useState<string>(defaultModuleId);
  const [mode, setMode] = useState<AppMode>('practice');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, Record<number, number>>>({});
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [infiniteQuestions, setInfiniteQuestions] = useState<Question[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const [jumpInput, setJumpInput] = useState('');
  
  // 无尽模式相关
  const [infinitePool, setInfinitePool] = useState<Question[]>([]);
  
  // 收集所有题目的辅助函数
  const getAllQuestions = () => {
    const allQuestions: Question[] = [];
    Object.entries(questionData).forEach(([modId, modData]) => {
      modData.questions.forEach(q => {
        allQuestions.push({
          ...q,
          sourceModule: modId,
          sourceModuleName: modData.title.split('、')[1] || modData.title
        });
      });
    });
    return allQuestions;
  };

  // 初始化无尽模式题库池
  useEffect(() => {
    if (mode === 'infinite' && infinitePool.length === 0) {
      const pool = getAllQuestions();
      // 洗牌
      setInfinitePool(pool.sort(() => Math.random() - 0.5));
    }
  }, [mode, infinitePool.length]);

  const currentModuleData = useMemo(() => {
    if (mode === 'exam') {
      return {
        title: '随机综合考试',
        questions: examQuestions,
        moduleTag: '综合考试'
      } as ModuleData;
    }
    if (mode === 'infinite') {
      return {
        title: '随机无尽模式',
        questions: infiniteQuestions,
        moduleTag: '无尽模式'
      } as ModuleData;
    }
    return questionData[currentModuleId] || { title: '未找到模块', questions: [] };
  }, [currentModuleId, mode, examQuestions, infiniteQuestions]);

  const currentQuestion = currentModuleData?.questions[currentQuestionIndex];

  // 答题处理
  const handleAnswer = (answerIndex: number) => {
    const moduleId = mode === 'exam' ? 'exam' : (mode === 'infinite' ? 'infinite' : currentModuleId);
    
    setUserAnswers(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [currentQuestionIndex]: answerIndex
      }
    }));

    // 无尽模式自动跳转
    if (mode === 'infinite') {
      setTimeout(() => {
        handleNextQuestion();
      }, 1000);
    }
  };

  const handleNextQuestion = () => {
    if (mode === 'infinite') {
      // 从池中取下一题
      if (infinitePool.length > 0) {
        const nextQ = infinitePool[0];
        setInfinitePool(prev => prev.slice(1)); // 移除已取出的题目
        setInfiniteQuestions(prev => [...prev, { ...nextQ, id: prev.length + 1 }]);
        setCurrentQuestionIndex(prev => prev + 1);
        
        // 如果池空了，重新填充并洗牌
        if (infinitePool.length <= 1) {
           const newPool = getAllQuestions();
           setInfinitePool(newPool.sort(() => Math.random() - 0.5));
        }
      } else {
        // 如果池子初始化失败，强制重新初始化
        const newPool = getAllQuestions();
        setInfinitePool(newPool.sort(() => Math.random() - 0.5));
      }
    } else {
      setCurrentQuestionIndex(prev => Math.min((currentModuleData?.questions.length || 1) - 1, prev + 1));
    }
  };

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  // 切换模块
  const handleModuleChange = (moduleId: string) => {
    if (mode === 'exam' && !examSubmitted && examQuestions.length > 0) {
      if (!confirm('正在考试中，切换模块将丢失当前进度，确认切换？')) return;
    }
    setMode('practice');
    setCurrentModuleId(moduleId);
    setCurrentQuestionIndex(0);
    setSidebarOpen(false);
    setExamSubmitted(false);
    setShowResultCard(false);
  };

  // 开始考试
  const startExam = () => {
    if (mode === 'exam' && !examSubmitted && !confirm('确认重新开始考试？')) return;
    
    const allQuestions = getAllQuestions();
    
    // 随机取20题 (如果总题数少于20，则取全部)
    const count = Math.min(20, allQuestions.length);
    const newExamQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, count).map((q, i) => ({
      ...q,
      examQuestionId: i + 1
    }));
    
    setExamQuestions(newExamQuestions);
    setMode('exam');
    setCurrentQuestionIndex(0);
    setUserAnswers(prev => ({ ...prev, 'exam': {} }));
    setExamSubmitted(false);
    setShowResultCard(false);
    setSidebarOpen(false);
  };

  // 开始无尽模式
  const startInfinite = () => {
    setMode('infinite');
    // 初始化第一题
    setInfiniteQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers(prev => ({ ...prev, 'infinite': {} }));
    setSidebarOpen(false);
    setShowResultCard(false);
    
    // 手动触发第一题生成
    const allQuestions = getAllQuestions();
    if (allQuestions.length > 0) {
      const firstQ = allQuestions[Math.floor(Math.random() * allQuestions.length)];
      setInfiniteQuestions([{ ...firstQ, id: 1 }]);
    }
  };

  // 提交试卷
  const submitExam = () => {
    if (!confirm('确认提交试卷？提交后将无法修改答案。')) return;
    setExamSubmitted(true);
    setShowResultCard(true); // 显示成绩卡
    setCurrentQuestionIndex(0); 
  };

  const restartExam = () => {
    startExam();
  };

  const reviewWrong = () => {
    setShowResultCard(false);
    // 找到第一个错题
    const firstWrongIndex = examQuestions.findIndex((q, i) => userAnswers['exam']?.[i] !== q.correctAnswer);
    if (firstWrongIndex !== -1) {
      setCurrentQuestionIndex(firstWrongIndex);
    }
  };

  const jumpToQuestion = (questionId: number) => {
    // 找到该 ID 对应的索引
    const index = currentModuleData.questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
      // 如果在移动端，跳转后关闭侧边栏
      setSidebarOpen(false);
      setJumpInput(''); // 清空输入
    } else {
      alert('当前模块未找到该题号');
    }
  };

  const handleHeaderJump = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(jumpInput);
    if (!isNaN(id)) {
      jumpToQuestion(id);
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const calculateScore = () => {
    if (!examQuestions.length) return { score: 0, correct: 0 };
    let correct = 0;
    examQuestions.forEach((q, i) => {
      if (userAnswers['exam']?.[i] === q.correctAnswer) correct++;
    });
    return {
      score: Math.round((correct / examQuestions.length) * 100),
      correct
    };
  };

  const examResult = useMemo(() => calculateScore(), [userAnswers, examQuestions]);

  const currentUserAnswer = userAnswers[mode === 'exam' ? 'exam' : (mode === 'infinite' ? 'infinite' : currentModuleId)]?.[currentQuestionIndex] ?? null;
  const showResult = (mode === 'exam' && examSubmitted) || ((mode === 'practice' || mode === 'infinite') && currentUserAnswer !== null);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Mobile Menu Button */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Sidebar 
        currentModuleId={currentModuleId}
        mode={mode}
        onModuleChange={handleModuleChange}
        onStartExam={startExam}
        onStartInfinite={startInfinite}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onJumpToQuestion={jumpToQuestion}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50/50">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
          <div className="ml-10 md:ml-0 flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              {currentModuleData?.title}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 跳转题号 (仅练习模式) */}
            {mode === 'practice' && (
              <form onSubmit={handleHeaderJump} className="relative hidden md:block group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-xs text-gray-400 font-medium">No.</span>
                </div>
                <input 
                  type="number"
                  placeholder="题号"
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  className="w-32 pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-gray-50 focus:bg-white placeholder-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  type="submit"
                  disabled={!jumpInput}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-1 disabled:opacity-50 transition-colors"
                >
                  <Search size={14} />
                </button>
              </form>
            )}
             {mode === 'exam' && !examSubmitted && (
               <div className="flex items-center px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium border border-purple-100">
                 <Clock size={14} className="mr-2" />
                 考试中
               </div>
             )}
             
             <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
               {mode === 'infinite' ? (
                 <span className="flex items-center">
                   无尽模式 <span className="mx-2 text-gray-300">|</span> 第 {currentQuestionIndex + 1} 题
                 </span>
               ) : (
                 <span>进度: {currentQuestionIndex + 1} / {currentModuleData?.questions.length}</span>
               )}
             </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-20">
            {showResultCard && mode === 'exam' ? (
              <ResultCard 
                score={examResult.score}
                correctCount={examResult.correct}
                totalQuestions={examQuestions.length}
                onRestart={restartExam}
                onReviewWrong={reviewWrong}
              />
            ) : currentQuestion ? (
              <QuestionCard 
                key={currentQuestion.id} // 强制重新渲染以重置状态
                question={currentQuestion}
                userAnswer={currentUserAnswer}
                onSelectAnswer={handleAnswer}
                showResult={showResult}
                mode={mode}
              />
            ) : (
              <div className="text-center py-20 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-32 bg-gray-100 rounded-xl mx-auto w-full max-w-lg"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Navigation */}
        <div className="bg-white border-t border-gray-200 p-4 shadow-lg shadow-gray-200/50 z-20">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <button 
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center transition-all active:scale-95"
            >
              <ChevronLeft size={18} className="mr-1" /> 上一题
            </button>
            
            {mode === 'exam' && !examSubmitted && currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1 ? (
              <button 
                onClick={submitExam}
                className="px-8 py-2.5 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 flex items-center transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                提交试卷 <CheckCircle size={18} className="ml-2" />
              </button>
            ) : (
              <button 
                onClick={handleNextQuestion}
                disabled={mode !== 'infinite' && currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1}
                className="px-8 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                {mode === 'infinite' ? '下一题' : (currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1 ? '已完成' : '下一题')}
                <ChevronRight size={18} className="ml-1" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
