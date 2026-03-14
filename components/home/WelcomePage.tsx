import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Infinity as InfinityIcon, Lightbulb, ChevronRight } from 'lucide-react';

interface WelcomePageProps {
  onStartPractice: () => void;
  onStartExam: () => void;
  onStartInfinite: () => void;
}

const TIPS = [
  "每天坚持练习 20 题，轻松掌握信息技术知识点！",
  "错题是最好的老师，记得多查看错题回顾哦。",
  "模拟考试能帮助你适应真实考试的时间压力。",
  "善用无尽模式，碎片时间也能刷几道题。",
  "遇到不懂的题目，仔细阅读解析是关键。",
  "定期复习已做过的题目，温故而知新。",
  "保持良好的心态，考试时不要紧张。",
  "理解比死记硬背更重要，尝试弄懂背后的原理。"
];

export default function WelcomePage({
  onStartPractice,
  onStartExam,
  onStartInfinite
}: WelcomePageProps) {
  const [tip, setTip] = useState('');

  useEffect(() => {
    // 随机选择一条小贴士
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
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

      {/* Tip Card */}
      <div className="w-full max-w-2xl bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
        <div className="p-2 bg-orange-100 rounded-lg shrink-0">
          <Lightbulb size={20} className="text-orange-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-orange-800 mb-1">复习小贴士</h4>
          <p className="text-sm text-orange-700/80 leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}
