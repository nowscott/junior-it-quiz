'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Menu, ChevronLeft, ChevronRight, CheckCircle, Clock, Search, LogOut, ArrowLeft
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
import WelcomePage from './WelcomePage';

type AppMode = 'welcome' | 'practice' | 'exam' | 'infinite';
type ExamState = 'intro' | 'active' | 'result';

const PROGRESS_STORAGE_KEY = 'quiz_progress_v1';
const SETTINGS_STORAGE_KEY = 'quiz_settings_v1';

// 简单的混淆算法
const encodeSeed = (seed: number, count: number, time: number): string => {
  const raw = `${seed}-${count}-${time}`;
  // 简单的 Base64 编码，实际生产中可以加盐或异或
  return btoa(raw).replace(/=/g, ''); // 移除 Base64 的填充符，使其看起来更像随机字符串
};

const decodeSeed = (encoded: string): { seed: number, count: number, time: number } | null => {
  try {
    const raw = atob(encoded);
    const parts = raw.split('-');
    if (parts.length === 3) {
      return {
        seed: parseInt(parts[0]),
        count: parseInt(parts[1]),
        time: parseInt(parts[2])
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

export default function QuizApp() {
  // 动态获取第一个模块 ID 作为默认值
  const defaultModuleId = Object.keys(questionData)[0] || 'module1';
  
  const [currentModuleId, setCurrentModuleId] = useState<string>(''); // 初始不选中任何模块
  const [mode, setMode] = useState<AppMode>('welcome');
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
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false); // 新增：清空确认弹窗
  const [invalidSeedModalOpen, setInvalidSeedModalOpen] = useState(false); // Deprecated, use notification instead
  // 新增：考试场次 ID，用于生成随机种子
  const [examSessionId, setExamSessionId] = useState<number>(0);
  const [examSeedString, setExamSeedString] = useState<string>(''); // 新增：保存完整的种子字符串
  
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
  
  // 检查是否在查看错题（已提交，且不在结果页）
  const isReviewing = mode === 'exam' && examState === 'result' && !showResultCard;

  // 返回成绩单
  const handleBackToResult = () => {
    setShowResultCard(true);
  };

  // 退出考试（提前交卷）进度保存到 localStorage
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

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const handleClearProgress = () => {
    // 替换原生 confirm 为自定义逻辑：这里需要一个 ConfirmModal 状态，或者直接用 notification 提示结果
    // 由于 confirm 是阻塞的，要替换它需要 UI 状态变更。
    // 为了简化，这里我们先用 notification 提示，但真正的确认逻辑需要一个专门的 clearConfirmOpen 状态
    setClearConfirmOpen(true);
  };
  const confirmClearProgress = () => {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setClearConfirmOpen(false);
    showNotification('清理完成', '已清空所有进度', 'success');
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

  // 统一的导航拦截检查
  const checkNavigation = (action: () => void) => {
    if (isExamActive) {
      if (window.confirm('正在考试中，离开将丢失当前进度，确认离开？')) {
        action();
      }
    } else {
      action();
    }
  };

  // 切换模块
  const handleModuleChange = (moduleId: string) => {
    checkNavigation(() => {
      setMode('practice');
      setCurrentModuleId(moduleId);
      setCurrentQuestionIndex(0);
      setSidebarOpen(false);
      setExamSubmitted(false);
      setShowResultCard(false);
    });
  };

  // 准备进入考试模式（显示介绍页）
  const prepareExam = () => {
    checkNavigation(() => {
      setMode('exam');
      setExamState('intro');
      setSidebarOpen(false);
      setShowResultCard(false);
      setExamSubmitted(false);
      // 清空可能存在的上次考试种子输入
      // 这里不需要做，因为 ExamIntro 组件内部维护了 seedInput 状态
    });
  };

  // 正式开始考试
  const startExam = (customSeedString?: string) => {
    const allQuestions = getAllQuestions();
    
    let seed = Date.now();
    let questionCount = examConfig.questionCount;
    let timeLimit = examConfig.timeLimit;

    // 解析种子字符串
    if (customSeedString) {
      try {
        const decoded = decodeSeed(customSeedString);
        if (decoded) {
          seed = decoded.seed;
          questionCount = decoded.count;
          timeLimit = decoded.time;
          
          // 更新当前配置以匹配种子
          setExamConfig({ questionCount, timeLimit });
        } else {
          // 尝试兼容旧的纯数字格式（如果需要）
          // 或者直接报错
          if (/^\d+$/.test(customSeedString)) {
             seed = parseInt(customSeedString);
          } else {
             throw new Error('Invalid seed format');
          }
        }
      } catch (e) {
        console.error('Failed to parse seed', e);
        showNotification('无效的种子', '输入的种子格式不正确或已损坏。请检查后重试，或直接点击“开始答题”生成新试卷。', 'error');
        return; // 直接返回，阻止进入考试
      }
    }

    setExamSessionId(seed);
    // 生成新的种子字符串 (混淆后)
    setExamSeedString(encodeSeed(seed, questionCount, timeLimit));

    // 随机取题目数量 (根据设置)
    // 为了实现完全可重温，这里应该也使用 seed 来随机选取题目
    // 但目前先保持随机选取，仅选项打乱受 seed 控制
    // 修正：如果要是真正的“重温”，题目选取也必须是确定性的
    // 所以我们需要一个带种子的随机函数来替代 Math.random()
    
    const seededRandom = (s: number) => {
      let localSeed = s;
      return () => {
        localSeed = (localSeed * 9301 + 49297) % 233280;
        return localSeed / 233280;
      };
    };
    
    const rng = seededRandom(seed);
    
    const count = Math.min(questionCount, allQuestions.length);
    const newExamQuestions = [...allQuestions]
      .sort(() => rng() - 0.5) // 使用带种子的随机排序
      .slice(0, count)
      .map((q, i) => ({
        ...q,
        examQuestionId: i + 1
      }));
    
    setExamQuestions(newExamQuestions);
    setExamState('active');
    setCurrentQuestionIndex(0);
    setUserAnswers(prev => ({ ...prev, 'exam': {} }));
    setExamSubmitted(false);
    setShowResultCard(false);
    setTimeLeft(timeLimit * 60); // 设置倒计时
  };

  // 开始无尽模式
  const startInfinite = () => {
    checkNavigation(() => {
      setMode('infinite');
      // 生成新的场次 ID
      setExamSessionId(Date.now());
      
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
    });
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
          mode={mode === 'welcome' ? 'practice' : mode} // Sidebar 暂时不支持 welcome 模式，这里做个兼容
          onModuleChange={handleModuleChange}
          onStartExam={prepareExam}
          onStartInfinite={startInfinite}
          onOpenSettings={handleOpenSettings}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          checkNavigation={(action) => action()} // 默认放行
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50/50">
        {mode === 'welcome' ? (
          <div className="flex-1 overflow-y-auto">
            {/* Mobile Menu Button - 欢迎页也需要能打开侧边栏 */}
            {!sidebarOpen && (
              <button 
                className="fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
            )}
            
            <WelcomePage 
              onStartPractice={() => {
                // 默认开始第一个模块
                handleModuleChange(defaultModuleId);
              }}
              onStartExam={prepareExam}
              onStartInfinite={startInfinite}
            />
          </div>
        ) : (
          <>
            {/* Header */}
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
                   handleExitExam();
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
                 onClick={handleBackToResult}
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
                 onClick={() => (mode === 'practice' || isReviewing) && setIsProgressModalOpen(true)}
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

        {/* Progress Modal */}
        <ProgressModal 
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          title={isReviewing ? '答题卡（回顾）' : currentModuleData.title}
          questions={currentModuleData.questions}
          userAnswers={userAnswers[mode === 'exam' ? 'exam' : currentModuleId] || {}}
          currentIndex={currentQuestionIndex}
          onJump={(index) => setCurrentQuestionIndex(index)}
          showResults={isReviewing} // 在回顾模式下显示正误
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

        <ConfirmationModal 
          isOpen={clearConfirmOpen}
          onClose={() => setClearConfirmOpen(false)}
          onConfirm={confirmClearProgress}
          title="清空进度"
          message="确认清空所有进度？此操作无法撤销。"
          confirmText="确认清空"
          cancelText="取消"
          variant="danger"
        />

        <ConfirmationModal 
          isOpen={notification.isOpen}
          onClose={closeNotification}
          onConfirm={closeNotification}
          title={notification.title}
          message={notification.message}
          confirmText="知道了"
          cancelText="" 
          variant={notification.type === 'error' ? 'danger' : notification.type === 'success' ? 'info' : 'warning'}
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
                examSeed={examSeedString}
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
                sessionId={examSessionId} // 传递场次 ID
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
                  
                  {isReviewing ? (
                    <button 
                      onClick={handleBackToResult}
                      className="flex-1 max-w-[200px] px-6 py-3 rounded-2xl text-sm font-bold bg-gray-800 text-white hover:bg-gray-900 shadow-lg shadow-gray-200 flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                    >
                      <ArrowLeft size={18} className="mr-2" /> 返回成绩单
                    </button>
                  ) : mode === 'exam' && !examSubmitted && currentQuestionIndex === (currentModuleData?.questions.length || 1) - 1 ? (
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
          </>
        )}
      </main>
    </div>
  );
}
