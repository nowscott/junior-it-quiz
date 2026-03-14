'use client';

import { Menu } from 'lucide-react';
import Sidebar from './layout/Sidebar';
import ProgressModal from './modals/ProgressModal';
import SettingsModal from './modals/SettingsModal';
import ConfirmationModal from './modals/ConfirmationModal';
import WelcomePage from './home/WelcomePage';
import QuizHeader from './quiz/QuizHeader';
import QuizMain from './quiz/QuizMain';

import { useQuizState } from '@/hooks/useQuizState';
import { useExamLogic } from '@/hooks/useExamLogic';

export default function QuizApp() {
  const { state, actions } = useQuizState();
  const { handlers, computed } = useExamLogic(state, actions);

  const {
    currentModuleId, mode, currentQuestionIndex, userAnswers,
    examQuestions, sidebarOpen, sidebarCollapsed,
    examSubmitted, showResultCard, isProgressModalOpen, isSettingsModalOpen,
    examState, exitConfirmOpen, submitConfirmOpen, clearConfirmOpen,
    examSessionId, examSeedString, examConfig, timeLeft, notification,
    defaultModuleId
  } = state;

  const {
    setSidebarOpen, setSidebarCollapsed, setIsProgressModalOpen,
    setIsSettingsModalOpen, setExitConfirmOpen, setSubmitConfirmOpen,
    setClearConfirmOpen, setExamConfig
  } = actions;

  const {
    handleModuleChange, prepareExam, startExam, startInfinite,
    submitExam, performSubmit, handleAnswer, handleNextQuestion,
    handlePrevQuestion, handleExitExam, confirmExitExam,
    handleClearProgress, confirmClearProgress, checkNavigation,
    handleBackToResult, restartExam, reviewWrong,
    handleOpenSettings, showNotification, closeNotification,
    handleGoHome
  } = handlers;

  const {
    currentModuleData, currentQuestion, isExamActive,
    isReviewing, examResult
  } = computed;

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
          onGoHome={handleGoHome}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          checkNavigation={(action) => action()}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-50/50">
        {mode === 'welcome' ? (
          <div className="flex-1 overflow-y-auto">
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
                handleModuleChange(defaultModuleId);
              }}
              onStartExam={prepareExam}
              onStartInfinite={startInfinite}
            />
          </div>
        ) : (
          <>
            <QuizHeader 
              currentModuleData={currentModuleData}
              mode={mode}
              examState={examState}
              examSubmitted={examSubmitted}
              isExamActive={isExamActive}
              isReviewing={isReviewing}
              timeLeft={timeLeft}
              currentQuestionIndex={currentQuestionIndex}
              onExitExam={handleExitExam}
              onBackToResult={handleBackToResult}
              onOpenProgress={() => setIsProgressModalOpen(true)}
            />

            <ProgressModal 
              isOpen={isProgressModalOpen}
              onClose={() => setIsProgressModalOpen(false)}
              title={isReviewing ? '答题卡（回顾）' : currentModuleData.title}
              questions={currentModuleData.questions}
              userAnswers={userAnswers[mode === 'exam' ? 'exam' : currentModuleId] || {}}
              currentIndex={currentQuestionIndex}
              onJump={(index) => actions.setCurrentQuestionIndex(index)}
              showResults={isReviewing}
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
                <QuizMain 
                  mode={mode}
                  examState={examState}
                  showResultCard={showResultCard}
                  examConfig={examConfig}
                  examResult={examResult}
                  examQuestions={examQuestions}
                  currentQuestion={currentQuestion}
                  currentQuestionIndex={currentQuestionIndex}
                  currentUserAnswer={currentUserAnswer}
                  timeLeft={timeLeft}
                  examSeedString={examSeedString}
                  examSessionId={examSessionId}
                  currentModuleData={currentModuleData}
                  examSubmitted={examSubmitted}
                  isReviewing={isReviewing}
                  showResult={showResult}
                  onStartExam={startExam}
                  onRestartExam={restartExam}
                  onReviewWrong={reviewWrong}
                  onAnswer={handleAnswer}
                  onPrevQuestion={handlePrevQuestion}
                  onNextQuestion={handleNextQuestion}
                  onSubmitExam={() => submitExam()}
                  onBackToResult={handleBackToResult}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
