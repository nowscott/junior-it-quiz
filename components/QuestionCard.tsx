import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, Maximize2 } from 'lucide-react';
import clsx from 'clsx';
import { type Question } from '@/data/questions';
import Image from 'next/image';

interface QuestionCardProps {
  question: Question;
  userAnswer: number | null;
  onSelectAnswer: (answer: number) => void;
  showResult: boolean; // 是否显示正确/错误状态
  mode: 'practice' | 'exam' | 'infinite';
}

export default function QuestionCard({
  question,
  userAnswer,
  onSelectAnswer,
  showResult,
  mode
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(userAnswer);
  
  useEffect(() => {
    setSelectedOption(userAnswer);
  }, [userAnswer, question.id]);

  const handleSelect = (idx: number) => {
    if (showResult && mode !== 'exam') return; // 如果已经显示结果且不是考试模式，禁止修改
    if (mode === 'exam' && showResult) return; // 考试结束后禁止修改
    
    setSelectedOption(idx);
    onSelectAnswer(idx);
  };

  const getOptionStatus = (idx: number) => {
    if (!showResult) {
      if (selectedOption === idx) return 'selected';
      return 'default';
    }
    
    if (idx === question.correctAnswer) return 'correct';
    if (selectedOption === idx && idx !== question.correctAnswer) return 'incorrect';
    return 'default';
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 transition-all duration-300 hover:shadow-md">
      {/* 题号与标签 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <span className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm">
            {mode === 'infinite' ? '∞' : (question.examQuestionId || question.id)}
          </span>
          {question.sourceModuleName && (
            <span className="px-3 py-1 rounded-full bg-gray-50 text-xs font-medium text-gray-500 border border-gray-100">
              {question.sourceModuleName}
            </span>
          )}
        </div>
        {/* 这里可以放收藏按钮等 */}
      </div>

      {/* 题目内容 */}
      <div className="prose prose-lg max-w-none mb-8">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed tracking-tight">
          {question.text}
        </h3>
        
        {/* 题目图片 */}
        {question.image && (
          <div className="mt-6 relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group">
            <Image 
              src={question.image} 
              alt="题目插图" 
              width={600} 
              height={400} 
              className="w-full h-auto object-contain max-h-[400px]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
              <Maximize2 className="text-white drop-shadow-lg" size={32} />
            </div>
          </div>
        )}
      </div>

      {/* 选项列表 */}
      <div className="space-y-4">
        {question.options.map((option, idx) => {
          const status = getOptionStatus(idx);
          
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={clsx(
                "w-full relative group p-4 pl-16 rounded-2xl text-left border-2 transition-all duration-200",
                status === 'default' && "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 bg-white",
                status === 'selected' && "border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-200",
                status === 'correct' && "border-green-500 bg-green-50/50 shadow-sm ring-1 ring-green-200",
                status === 'incorrect' && "border-red-500 bg-red-50/50 shadow-sm ring-1 ring-red-200"
              )}
            >
              {/* 选项标号 */}
              <div className={clsx(
                "absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                status === 'default' && "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600",
                status === 'selected' && "bg-blue-500 text-white shadow-lg shadow-blue-200",
                status === 'correct' && "bg-green-500 text-white shadow-lg shadow-green-200",
                status === 'incorrect' && "bg-red-500 text-white shadow-lg shadow-red-200"
              )}>
                {['A', 'B', 'C', 'D'][idx]}
              </div>

              {/* 选项文字 */}
              <span className={clsx(
                "block text-base md:text-lg font-medium transition-colors",
                status === 'default' && "text-gray-700 group-hover:text-gray-900",
                status === 'selected' && "text-blue-900",
                status === 'correct' && "text-green-900",
                status === 'incorrect' && "text-red-900"
              )}>
                {option}
              </span>

              {/* 状态图标 */}
              {status === 'correct' && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
              {status === 'incorrect' && (
                <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
              )}
            </button>
          );
        })}
      </div>

      {/* 解析区域 (仅在显示结果时出现) */}
      {showResult && (
        <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="text-blue-500" size={20} />
              <h4 className="font-bold text-blue-900">题目解析</h4>
            </div>
            <p className="text-blue-800/80 leading-relaxed text-sm md:text-base">
              {question.explanation}
            </p>
            {question.explanationImage && (
              <div className="mt-4 rounded-xl overflow-hidden border border-blue-200/50">
                 <Image 
                   src={question.explanationImage} 
                   alt="解析插图" 
                   width={400} 
                   height={300} 
                   className="w-full h-auto object-contain"
                 />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
