import { useMemo, useEffect, useCallback } from 'react';
import { questionData, type Question, type ModuleData } from '@/data/questions';
import { useQuizState, PROGRESS_STORAGE_KEY } from './useQuizState';

// Helper for seed encoding/decoding
const encodeSeed = (seed: number, count: number, time: number): string => {
  const raw = `${seed}-${count}-${time}`;
  return btoa(raw).replace(/=/g, '');
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
  } catch {
    return null;
  }
};

export function useExamLogic(
  state: ReturnType<typeof useQuizState>['state'],
  actions: ReturnType<typeof useQuizState>['actions']
) {
  const {
    currentModuleId, mode, currentQuestionIndex, userAnswers,
    examQuestions, infiniteQuestions, examSubmitted, showResultCard,
    examState, examConfig, timeLeft, infinitePool
  } = state;

  const {
    setMode, setCurrentModuleId, setCurrentQuestionIndex, setUserAnswers,
    setExamQuestions, setInfiniteQuestions, setSidebarOpen, setExamSubmitted,
    setShowResultCard, setExamState, setExitConfirmOpen, setSubmitConfirmOpen,
    setClearConfirmOpen, setExamSessionId, setExamSeedString, setExamConfig,
    setTimeLeft, setInfinitePool, setNotification, setIsSettingsModalOpen
  } = actions;

  // Notification helpers
  const showNotification = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({ isOpen: true, title, message, type });
  }, [setNotification]);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  }, [setNotification]);

  // Data helpers
  const getAllQuestions = useCallback(() => {
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
  }, []);

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
  const isExamActive = mode === 'exam' && examState === 'active' && !examSubmitted;
  const isReviewing = mode === 'exam' && examState === 'result' && !showResultCard;

  // Navigation Logic
  const checkNavigation = useCallback((action: () => void) => {
    if (isExamActive) {
      if (window.confirm('正在考试中，离开将丢失当前进度，确认离开？')) {
        action();
      }
    } else {
      action();
    }
  }, [isExamActive]);

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

  const handleGoHome = () => {
    checkNavigation(() => {
      setMode('welcome');
      setSidebarOpen(false);
    });
  };

  const prepareExam = () => {
    checkNavigation(() => {
      setMode('exam');
      setExamState('intro');
      setSidebarOpen(false);
      setShowResultCard(false);
      setExamSubmitted(false);
    });
  };

  const startExam = (customSeedString?: string) => {
    const allQuestions = getAllQuestions();
    
    let seed = Date.now();
    let questionCount = examConfig.questionCount;
    let timeLimit = examConfig.timeLimit;

    if (customSeedString) {
      try {
        const decoded = decodeSeed(customSeedString);
        if (decoded) {
          seed = decoded.seed;
          questionCount = decoded.count;
          timeLimit = decoded.time;
          setExamConfig({ questionCount, timeLimit });
        } else {
          if (/^\d+$/.test(customSeedString)) {
             seed = parseInt(customSeedString);
          } else {
             throw new Error('Invalid seed format');
          }
        }
      } catch {
        console.error('种子解析失败');
        showNotification('无效的种子', '输入的种子格式不正确或已损坏。请检查后重试，或直接点击“开始答题”生成新试卷。', 'error');
        return;
      }
    }

    setExamSessionId(seed);
    setExamSeedString(encodeSeed(seed, questionCount, timeLimit));

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
      .sort(() => rng() - 0.5)
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
    setTimeLeft(timeLimit * 60);
  };

  const performSubmit = useCallback(() => {
    setExamSubmitted(true);
    setExamState('result');
    setShowResultCard(true);
    setCurrentQuestionIndex(0);
    setSubmitConfirmOpen(false);
  }, [setExamSubmitted, setExamState, setShowResultCard, setCurrentQuestionIndex, setSubmitConfirmOpen]);

  const submitExam = useCallback((auto = false) => {
    if (!auto) {
      setSubmitConfirmOpen(true);
      return;
    }
    performSubmit();
  }, [setSubmitConfirmOpen, performSubmit]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExamActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamActive, timeLeft, setTimeLeft, submitExam]);

  // Infinite mode logic
  const startInfinite = () => {
    checkNavigation(() => {
      setMode('infinite');
      setExamSessionId(Date.now());
      setInfiniteQuestions([]);
      setCurrentQuestionIndex(0);
      setUserAnswers(prev => ({ ...prev, 'infinite': {} }));
      setSidebarOpen(false);
      setShowResultCard(false);
      
      const allQuestions = getAllQuestions();
      if (allQuestions.length > 0) {
        const firstQ = allQuestions[Math.floor(Math.random() * allQuestions.length)];
        // id is already a UUID string
        setInfiniteQuestions([{ ...firstQ }]);
      }
    });
  };

  useEffect(() => {
    if (mode === 'infinite' && infinitePool.length === 0) {
      const pool = getAllQuestions();
      setInfinitePool(pool.sort(() => Math.random() - 0.5));
    }
  }, [mode, infinitePool.length, getAllQuestions, setInfinitePool]);

  const handleNextQuestion = () => {
    if (mode === 'infinite') {
      if (infinitePool.length > 0) {
        const nextQ = infinitePool[0];
        setInfinitePool(prev => prev.slice(1));
        // Use existing UUID, do not overwrite with number
        setInfiniteQuestions(prev => [...prev, { ...nextQ }]);
        setCurrentQuestionIndex(prev => prev + 1);
        
        if (infinitePool.length <= 1) {
           const newPool = getAllQuestions();
           setInfinitePool(newPool.sort(() => Math.random() - 0.5));
        }
      } else {
        const newPool = getAllQuestions();
        setInfinitePool(newPool.sort(() => Math.random() - 0.5));
      }
    } else {
      setCurrentQuestionIndex(prev => Math.min((currentModuleData?.questions.length || 1) - 1, prev + 1));
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const moduleId = mode === 'exam' ? 'exam' : (mode === 'infinite' ? 'infinite' : currentModuleId);
    const questionId = currentQuestion?.id;
    
    if (!questionId) return;

    setUserAnswers(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [questionId]: answerIndex
      }
    }));

    if (mode === 'infinite') {
      setTimeout(() => {
        handleNextQuestion();
      }, 1000);
    }
  };

  const handleClearProgress = () => {
    setClearConfirmOpen(true);
  };

  const confirmClearProgress = () => {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setClearConfirmOpen(false);
    showNotification('清理完成', '已清空所有进度', 'success');
  };

  // Result calculation
  // Simplified to avoid React Compiler "Expected static flag was missing" error with useMemo + early return
  const examResult = (() => {
    if (!examQuestions.length) return { score: 0, correct: 0 };
    let correct = 0;
    examQuestions.forEach((q) => {
      if (userAnswers['exam']?.[q.id] === q.correctAnswer) correct++;
    });
    return {
      score: Math.round((correct / examQuestions.length) * 100),
      correct
    };
  })();

  return {
    handlers: {
      handleGoHome,
      handleModuleChange,
      prepareExam,
      startExam,
      startInfinite,
      submitExam,
      performSubmit,
      handleAnswer,
      handleNextQuestion,
      handlePrevQuestion: () => setCurrentQuestionIndex(prev => Math.max(0, prev - 1)),
      handleExitExam: () => setExitConfirmOpen(true),
      confirmExitExam: () => { performSubmit(); setExitConfirmOpen(false); },
      handleClearProgress,
      confirmClearProgress,
      checkNavigation,
      handleBackToResult: () => setShowResultCard(true),
      restartExam: () => prepareExam(),
      reviewWrong: () => {
        setShowResultCard(false);
        setExamState('result');
        const firstWrongIndex = examQuestions.findIndex((q) => userAnswers['exam']?.[q.id] !== q.correctAnswer);
        if (firstWrongIndex !== -1) setCurrentQuestionIndex(firstWrongIndex);
      },
      handleOpenSettings: () => { setIsSettingsModalOpen(true); setSidebarOpen(false); },
      showNotification,
      closeNotification
    },
    computed: {
      currentModuleData,
      currentQuestion,
      isExamActive,
      isReviewing,
      examResult
    }
  };
}
