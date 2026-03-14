import React, { useState } from 'react';
import { GraduationCap, Clock, ListOrdered, PlayCircle, X } from 'lucide-react';

interface ExamIntroProps {
  questionCount: number;
  timeLimit: number;
  onStart: (seed?: string) => void;
}

export default function ExamIntro({
  questionCount,
  timeLimit,
  onStart
}: ExamIntroProps) {
  const [seedInput, setSeedInput] = useState('');

  const handleStart = () => {
    if (seedInput.trim()) {
      onStart(seedInput.trim());
      return;
    }
    onStart();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Icon */}
      <div className="w-32 h-32 bg-purple-50 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <GraduationCap size={64} className="text-purple-600" />
      </div>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
        随机综合考试
      </h2>
      
      {/* Description */}
      <p className="text-gray-500 max-w-md mb-10 leading-relaxed">
        系统将从题库中随机抽取题目组成试卷。请在规定时间内完成作答，提交后系统将自动评分并提供详细解析。
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col items-center">
          <div className="flex items-center text-gray-400 mb-2 space-x-1">
            <ListOrdered size={16} />
            <span className="text-xs font-bold uppercase">题目数量</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{questionCount} <span className="text-sm font-normal text-gray-400">题</span></div>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-col items-center">
          <div className="flex items-center text-gray-400 mb-2 space-x-1">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase">考试限时</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{timeLimit} <span className="text-sm font-normal text-gray-400">分钟</span></div>
        </div>
      </div>

      {/* Seed Input (Optional) */}
      <div className="w-full max-w-xs mb-6 relative">
        <input
          type="text"
          placeholder="输入种子号（选填，用于重温考试）"
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value)}
          className="w-full px-4 py-2 pr-10 text-sm text-center border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all placeholder-gray-400"
        />
        {seedInput && (
          <button
            onClick={() => setSeedInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="清空"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        className="group relative px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-200 hover:bg-purple-700 hover:shadow-xl hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none flex items-center space-x-3 overflow-hidden"
      >
        <span className="relative z-10">{seedInput ? '重温考试' : '开始答题'}</span>
        <PlayCircle size={24} className="relative z-10 group-hover:translate-x-1 transition-transform" />
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      </button>
      
      <p className="text-xs text-gray-400 mt-6">
        点击开始后即刻开始计时
      </p>
    </div>
  );
}
