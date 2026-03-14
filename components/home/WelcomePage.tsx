import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Infinity as InfinityIcon, Sparkles, ChevronRight, RefreshCw, Github } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-12 animate-in fade-in zoom-in-95 duration-500">
      {/* Hero Section */}
      <div className="text-center mb-12 max-w-2xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-6 rotate-3 hover:rotate-6 transition-transform">
          <span className="text-white font-bold text-3xl">IT</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          初中信息技术练习平台
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          欢迎回来！这里有丰富的题库和多种练习模式，助你轻松应对考试。准备好开始今天的学习了吗？
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
        {/* Practice Mode */}
        <button
          onClick={onStartPractice}
          className="group bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col h-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={80} className="text-blue-600" />
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
            <BookOpen size={24} className="text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">基础练习</h3>
          <p className="text-sm text-gray-500 mb-4 flex-1">
            按模块分类练习，循序渐进掌握知识点。适合日常复习和查漏补缺。
          </p>
          <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            开始练习 <ChevronRight size={16} className="ml-1" />
          </div>
        </button>

        {/* Exam Mode */}
        <button
          onClick={onStartExam}
          className="group bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col h-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <GraduationCap size={80} className="text-purple-600" />
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
            <GraduationCap size={24} className="text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">模拟考试</h3>
          <p className="text-sm text-gray-500 mb-4 flex-1">
            全真模拟考试环境，随机抽题，限时作答。检测你的真实水平。
          </p>
          <div className="flex items-center text-purple-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            进入考场 <ChevronRight size={16} className="ml-1" />
          </div>
        </button>

        {/* Infinite Mode */}
        <button
          onClick={onStartInfinite}
          className="group bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col h-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <InfinityIcon size={80} className="text-indigo-600" />
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
            <InfinityIcon size={24} className="text-indigo-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">无尽模式</h3>
          <p className="text-sm text-gray-500 mb-4 flex-1">
            海量题目随机出现，挑战你的极限。适合利用碎片时间刷题。
          </p>
          <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            即刻挑战 <ChevronRight size={16} className="ml-1" />
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
