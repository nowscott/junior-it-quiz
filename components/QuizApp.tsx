'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Menu, ChevronLeft, ChevronRight, CheckCircle, Clock, Search, LogOut
} from 'lucide-react';
import { questionData, type ModuleData, type Question } from '@/data/questions';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import QuestionCard from './QuestionCard';
import ResultCard from './ResultCard';
import ProgressModal from './ProgressModal';
import SettingsModal from './SettingsModal';
import ExamIntro from './ExamIntro';
import ConfirmationModal from './ConfirmationModal';

type AppMode = 'practice' | 'exam' | 'infinite';
type ExamState = 'intro' | 'active' | 'result';

const PROGRESS_STORAGE_KEY = 'quiz_progress_v1';
const SETTINGS_STORAGE_KEY = 'quiz_settings_v1';

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
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [examState, setExamState] = useState<ExamState>('intro');
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  
  // 考试配置
  const [examConfig, setExamConfig] = useState({
    questionCount: 20,
    timeLimit: 60 // 分钟
  });

  // 倒计时
  const [timeLeft, setTimeLeft] = useState(0); // 秒
  
  // 无尽模式相关
  const [infinitePool, setInfinitePool] = useState<Question[]>([]);
  
  // 初始化从 localStorage 读取进度和设置
  useEffect(() => {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setUserAnswers(parsed.answers || {});
        if (parsed.lastModuleId) setCurrentModuleId(parsed.lastModuleId);
        if (parsed.lastIndex !== undefined) setCurrentQuestionIndex(parsed.lastIndex);
      } catch (e) {
        console.error('Failed to parse saved progress', e);
      }
    }

    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        setExamConfig(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, []);

  // 检查是否正在考试中
  const isExamActive = mode === 'exam' && examState === 'active' && !examSubmitted;

  // 进度保存到 localStorage
  useEffect(() => {
    if (Object.keys(userAnswers).length > 0) {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
        answers: userAnswers,
        lastModuleId: currentModuleId,
        lastIndex: currentQuestionIndex
      }));
    }
  }, [userAnswers, currentModuleId, currentQuestionIndex]);

  // 设置保存到 localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(examConfig));
  }, [examConfig]);

  // 考试计时逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExamActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitExam(true); // 自动交卷
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamActive, timeLeft]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClearProgress = () => {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    alert('已清空所有进度');
  };
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

  // 退出考试（提前交卷）
  const handleExitExam = () => {
    // 无论是点“退出”还是底部的“提交”，逻辑是一样的，都是提前交卷
    // 直接复用 submitConfirmOpen 逻辑，或者直接打开 exitConfirmOpen
    // 为了文案区分，这里使用 exitConfirmOpen，逻辑也是执行 performSubmit
    setExitConfirmOpen(true);
  };
  
  const confirmExitExam = () => {
    performSubmit();
    setExitConfirmOpen(false);
  };

  // 切换模块
  const handleModuleChange = (moduleId: string) => {
    setMode('practice');
    setCurrentModuleId(moduleId);
    setCurrentQuestionIndex(0);
    setSidebarOpen(false);
    setExamSubmitted(false);
    setShowResultCard(false);
  };

  // 准备进入考试模式（显示介绍页）
  const prepareExam = () => {
    setMode('exam');
    setExamState('intro');
    setSidebarOpen(false);
    setShowResultCard(false);
    setExamSubmitted(false);
  };

  // 正式开始考试
  const startExam = () => {
    const allQuestions = getAllQuestions();
    
    // 随机取题目数量 (根据设置)
    const count = Math.min(examConfig.questionCount, allQuestions.length);
    const newExamQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, count).map((q, i) => ({
      ...q,
      examQuestionId: i + 1
    }));
    
    setExamQuestions(newExamQuestions);
    setExamState('active');
    setCurrentQuestionIndex(0);
    setUserAnswers(prev => ({ ...prev, 'exam': {} }));
    setExamSubmitted(false);
    setShowResultCard(false);
    setTimeLeft(examConfig.timeLimit * 60); // 设置倒计时
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

  // 打开设置
  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
    setSidebarOpen(false);
  };


  // 提交试卷
  const submitExam = (auto = false) => {
    // 如果不是自动提交（即手动点击提交按钮），则不直接执行逻辑，而是打开确认弹窗
    if (!auto) {
      setSubmitConfirmOpen(true);
      return;
    }
    
    // 执行实际提交逻辑
    performSubmit();
    
    // 如果是自动提交（时间到），不需要弹窗，因为界面会直接切换到结果页
    // 如果需要提示，可以在结果页显示 "时间已到，自动交卷"
  };

  const performSubmit = () => {
    setExamSubmitted(true);
    setExamState('result');
    setShowResultCard(true); // 显示成绩卡
    setCurrentQuestionIndex(0);
    setSubmitConfirmOpen(false); // 关闭可能存在的弹窗
  };

  const restartExam = () => {
    prepareExam();
  };

  const reviewWrong = () => {
    setShowResultCard(false);
    setExamState('result'); // 保持结果状态，但隐藏成绩卡以查看题目
    // 找到第一个错题
    const firstWrongIndex = examQuestions.findIndex((q, i) => userAnswers['exam']?.[i] !== q.correctAnswer);
    if (firstWrongIndex !== -1) {
      setCurrentQuestionIndex(firstWrongIndex);
    }
  };

  const examResult = useMemo(() => {
    if (!examQuestions.length) return { score: 0, correct: 0 };
    let correct = 0;
    examQuestions.forEach((q, i) => {
      if (userAnswers['exam']?.[i] === q.correctAnswer) correct++;
    });
    return {
      score: Math.round((correct / examQuestions.length) * 100),
      correct
    };
  }, [userAnswers, examQuestions]);

  const currentUserAnswer = userAnswers[mode === 'exam' ? 'exam' : (mode === 'infinite' ? 'infinite' : currentModuleId)]?.[currentQuestionIndex] ?? null;
  const showResult = (mode === 'exam' && examSubmitted) || ((mode === 'practice' || mode === 'infinite') && currentUserAnswer !== null);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Mobile Menu Button - 考试进行中不显示 */}
      {!sidebarOpen && !isExamActive && (
        <button 
          className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar - 考试进行中不显示 */}
      {!isExamActive && (
        <Sidebar 
          currentModuleId={currentModuleId}
          mode={mode}
          onModuleChange={handleModuleChange}
          onStartExam={prepareExam}
          onStartInfinite={startInfinite}
          onOpenSettings={handleOpenSettings}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          checkNavigation={(action) => action()} // 默认放行，因为 QuizApp 已经处理了显隐逻辑
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50/50">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
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
                   handleExitExam();
                 }}
                 className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100 hover:bg-red-100 transition-colors"
                 title="提前交卷"
               >
                 <CheckCircle size={14} className="mr-1" />
                 交卷
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
                 onClick={() => mode === 'practice' && setIsProgressModalOpen(true)}
                 className={clsx(
                   "text-xs md:text-sm font-medium px-3 py-1 rounded-full transition-all flex items-center",
                   mode === 'practice' 
                     ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100" 
                     : "bg-gray-100 text-gray-500"
                 )}
               >
                 {mode === 'infinite' ? (
                   <span>无尽模式 | 第 {currentQuestionIndex + 1} 题</span>
                 ) : (
                   <span>进度: {currentQuestionIndex + 1} / {currentModuleData?.questions.length}</span>
                 )}
                 {mode === 'practice' && <Search size={12} className="ml-1 opacity-50" />}
               </button>
             </div>
          </div>
        </header>

        {/* Modals */}
        <ProgressModal 
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          title={currentModuleData.title}
          questions={currentModuleData.questions}
          userAnswers={userAnswers[currentModuleId] || {}}
          currentIndex={currentQuestionIndex}
          onJump={(index) => setCurrentQuestionIndex(index)}
        />

        <SettingsModal 
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          examConfig={examConfig}
          onUpdateExamConfig={setExamConfig}
          onClearProgress={handleClearProgress}
        />

        <ConfirmationModal 
          isOpen={exitConfirmOpen}
          onClose={() => setExitConfirmOpen(false)}
          onConfirm={confirmExitExam}
          title="提前交卷"
          message="确认提前交卷并查看成绩？交卷后将无法修改答案。"
          confirmText="交卷"
          cancelText="继续答题"
          variant="danger"
        />

        <ConfirmationModal 
          isOpen={submitConfirmOpen}
          onClose={() => setSubmitConfirmOpen(false)}
          onConfirm={performSubmit}
          title="提交试卷"
          message="确认提交试卷？提交后将无法修改答案。"
          confirmText="提交"
          cancelText="继续答题"
          variant="info"
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-24">
            {mode === 'exam' && examState === 'intro' ? (
              <ExamIntro 
                questionCount={examConfig.questionCount}
                timeLimit={examConfig.timeLimit}
                onStart={startExam}
              />
            ) : showResultCard && mode === 'exam' ? (
              <ResultCard 
                score={examResult.score}
                correctCount={examResult.correct}
                totalQuestions={examQuestions.length}
                onRestart={restartExam}
                onReviewWrong={reviewWrong}
                timeUsed={formatTime(examConfig.timeLimit * 60 - timeLeft)}
              />
            ) : currentQuestion ? (
              <div className="space-y-6">
                <QuestionCard 
                  key={currentQuestion.id} 
                  question={currentQuestion}
                  userAnswer={currentUserAnswer}
                  onSelectAnswer={handleAnswer}
                  showResult={showResult}
                  mode={mode}
                />
                
                {/* 题目下方的导航按钮 */}
                <div className="flex items-center justify-between gap-4 px-2">
                  <button 
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 max-w-[160px] px-4 py-3 rounded-2xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shadow-sm"
                  >
                    <ChevronLeft size={18} className="mr-1" /> 上一题
                  </button>
                  
                  {mode === 'exam' && !examSubmitted && currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1 ? (
                    <button 
                      onClick={() => submitExam()}
                      className="flex-1 max-w-[200px] px-6 py-3 rounded-2xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                    >
                      提交试卷 <CheckCircle size={18} className="ml-2" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleNextQuestion}
                      disabled={mode !== 'infinite' && currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1}
                      className="flex-1 max-w-[200px] px-6 py-3 rounded-2xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                    >
                      {mode === 'infinite' ? '下一题' : (currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1 ? '已完成' : '下一题')}
                      <ChevronRight size={18} className="ml-1" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-32 bg-gray-100 rounded-xl mx-auto w-full max-w-lg"></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
