import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Infinity as InfinityIcon, Sparkles, ChevronRight, RefreshCw, Github, Keyboard } from 'lucide-react';
import { computerTrivia } from '@/data/trivia';
import pkg from '@/package.json';

interface WelcomePageProps {
  onStartPractice: () => void;
  onStartExam: () => void;
  onStartInfinite: () => void;
}

export default function WelcomePage({
  onStartPractice,
  onStartExam,
  onStartInfinite
}: WelcomePageProps) {
  const [tip, setTip] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // 随机选择一条奇闻异事
  const randomizeTip = () => {
    setIsAnimating(true);
    // 简单的淡出淡入效果
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * computerTrivia.length);
      setTip(computerTrivia[randomIndex]);
      setIsAnimating(false);
    }, 200);
  };

  useEffect(() => {
    // 使用 setTimeout 将状态更新推迟到下一个事件循环，避免“在 Effect 中同步调用 setState”的警告
    const timer = setTimeout(() => {
      randomizeTip();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-3 py-6 md:px-6 md:py-12 animate-in fade-in zoom-in-95 duration-500">
      {/* Hero Section */}
      <div className="text-center mb-6 md:mb-12 max-w-2xl">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-20 md:h-20 bg-blue-600 rounded-xl md:rounded-2xl shadow-lg shadow-blue-200 mb-3 md:mb-6 rotate-3 hover:rotate-6 transition-transform">
          <span className="text-white font-bold text-xl md:text-3xl">IT</span>
        </div>
        <h1 className="text-xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-4 tracking-tight">
          初中信息技术练习平台
        </h1>
        <p className="text-xs md:text-lg text-gray-500 leading-relaxed px-4">
          欢迎回来！这里有丰富的题库和多种练习模式，助你轻松应对考试。准备好开始今天的学习了吗？
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 w-full max-w-4xl mb-6 md:mb-12">
        {/* Practice Mode */}
        <button
          onClick={onStartPractice}
          className="group bg-white border border-gray-100 p-3 md:p-6 rounded-xl md:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-row md:flex-col h-auto md:h-full relative overflow-hidden items-center md:items-start gap-3 md:gap-0"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity hidden md:block">
            <BookOpen size={80} className="text-blue-600" />
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center mb-0 md:mb-4 group-hover:bg-blue-600 transition-colors shrink-0">
            <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-2">基础练习</h3>
            <p className="text-[10px] md:text-sm text-gray-500 mb-0 md:mb-4 flex-1 line-clamp-1 md:line-clamp-none">
              按模块分类练习，循序渐进掌握知识点。
            </p>
            <div className="flex items-center text-blue-600 font-medium text-[10px] md:text-sm group-hover:translate-x-1 transition-transform mt-0.5 md:mt-0">
              开始练习 <ChevronRight className="ml-0.5 w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
        </button>

        {/* Exam Mode */}
        <button
          onClick={onStartExam}
          className="group bg-white border border-gray-100 p-3 md:p-6 rounded-xl md:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-row md:flex-col h-auto md:h-full relative overflow-hidden items-center md:items-start gap-3 md:gap-0"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity hidden md:block">
            <GraduationCap size={80} className="text-purple-600" />
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-50 rounded-lg md:rounded-xl flex items-center justify-center mb-0 md:mb-4 group-hover:bg-purple-600 transition-colors shrink-0">
            <GraduationCap className="w-4 h-4 md:w-6 md:h-6 text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-2">模拟考试</h3>
            <p className="text-[10px] md:text-sm text-gray-500 mb-0 md:mb-4 flex-1 line-clamp-1 md:line-clamp-none">
              全真模拟考试环境，随机抽题，限时作答。
            </p>
            <div className="flex items-center text-purple-600 font-medium text-[10px] md:text-sm group-hover:translate-x-1 transition-transform mt-0.5 md:mt-0">
              进入考场 <ChevronRight className="ml-0.5 w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
        </button>

        {/* Infinite Mode */}
        <button
          onClick={onStartInfinite}
          className="group bg-white border border-gray-100 p-3 md:p-6 rounded-xl md:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-row md:flex-col h-auto md:h-full relative overflow-hidden items-center md:items-start gap-3 md:gap-0"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity hidden md:block">
            <InfinityIcon size={80} className="text-green-600" />
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 bg-green-50 rounded-lg md:rounded-xl flex items-center justify-center mb-0 md:mb-4 group-hover:bg-green-600 transition-colors shrink-0">
            <InfinityIcon className="w-4 h-4 md:w-6 md:h-6 text-green-600 group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-0.5 md:mb-2">无限刷题</h3>
            <p className="text-[10px] md:text-sm text-gray-500 mb-0 md:mb-4 flex-1 line-clamp-1 md:line-clamp-none">
              海量题库随机出题，即时反馈，刷题神器。
            </p>
            <div className="flex items-center text-green-600 font-medium text-[10px] md:text-sm group-hover:translate-x-1 transition-transform mt-0.5 md:mt-0">
              开始刷题 <ChevronRight className="ml-0.5 w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* Trivia Card */}
      <div className="w-full max-w-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
        {/* Decorative Background Icon */}
        <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12 pointer-events-none">
          <Sparkles size={120} />
        </div>
        
        <div className="p-2.5 bg-white rounded-xl shadow-sm shrink-0 z-10">
          <Sparkles size={22} className="text-indigo-600" />
        </div>
        <div className="flex-1 z-10">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              科技趣闻
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] rounded-full font-medium">冷知识</span>
            </h4>
            <button 
              onClick={randomizeTip}
              className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
              title="换一个"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <p className={`text-sm text-indigo-800/80 leading-relaxed transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {tip}
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-400 bg-gray-50 px-6 py-3 rounded-full border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <div className="flex items-center gap-2">
          <Keyboard size={16} />
          <span className="font-medium">快捷键支持：</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-xs font-sans text-gray-500 shadow-sm">1-4</kbd>
            <span>选择</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-xs font-sans text-gray-500 shadow-sm">Enter</kbd>
            <span>确认</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-xs font-sans text-gray-500 shadow-sm">← / →</kbd>
            <span>切换</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 text-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <p className="mb-2">© {new Date().getFullYear()} nowscott. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4">
          <a 
            href="https://github.com/nowscott/junior-it-quiz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-gray-600 transition-colors"
          >
            <Github size={14} />
            <span>Open Source</span>
          </a>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400 font-mono text-xs">v{pkg.version}</span>
        </div>
      </footer>
    </div>
  );
}
