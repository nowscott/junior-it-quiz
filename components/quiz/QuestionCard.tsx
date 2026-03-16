'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckCircle, XCircle, Info, Maximize2, Copy, Check } from 'lucide-react';
import clsx from 'clsx';
import { type Question } from '@/data/questions';
import Image from 'next/image';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface QuestionCardProps {
  question: Question;
  userAnswer: number | null;
  onSelectAnswer: (answer: number) => void;
  showResult: boolean; // 是否显示正确/错误状态
  mode: 'practice' | 'exam' | 'infinite';
  sessionId?: number; // 考试场次 ID，用于生成动态随机种子
  questionNumber?: number; // 新增：用于显示当前题目在列表中的序号
}

export default function QuestionCard({
  question,
  userAnswer,
  onSelectAnswer,
  showResult,
  mode,
  sessionId = 0, // 默认为 0
  questionNumber
}: QuestionCardProps) {
  // 维护一个打乱后的选项索引数组
  // 使用基于 question.id 的伪随机数生成器，确保服务端和客户端渲染一致，解决 Hydration Mismatch
  const shuffledIndices = useMemo(() => {
    const indices = question.options.map((_, i) => i);
    
    // 混合随机策略：
    // 1. 如果有 sessionId (考试模式)，使用 sessionId + question.id 作为基准种子
    // 2. 为了保证重温考试时“题目相同但选项不同”，我们需要引入一个本地随机因子
    // 3. 但这会引发 SSR Hydration Mismatch，因为服务端没有这个本地因子
    // 
    // 解决方案：
    // 我们只在客户端组件挂载后进行二次打乱（如果需要的话）。
    // 或者，我们可以约定：sessionId 只控制“题目抽取”，而不控制“选项顺序”。
    // 也就是说，选项顺序应该始终是基于 question.id + 一个完全随机数（在客户端生成）。
    
    // 简单的线性同余生成器 (LCG)
    // 种子基于 question.id，确保同一道题的随机顺序是固定的 (SSR 兼容)
    
    // Convert string UUID to numeric seed hash
    let idHash = 0;
    const idStr = String(question.id);
    for (let i = 0; i < idStr.length; i++) {
      idHash = ((idHash << 5) - idHash) + idStr.charCodeAt(i);
      idHash |= 0; // Convert to 32bit integer
    }
    
    let seed = Math.abs(idHash) + (sessionId || 0); 
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Fisher-Yates shuffle (基于确定性种子)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, question.options.length, sessionId]); 
  
  // 客户端二次打乱（实现“重温时选项不同”）
  const [clientShuffledIndices, setClientShuffledIndices] = useState<number[] | null>(null);

  // 预选答案状态（本地状态，未提交）
  const [selectedOption, setSelectedOption] = useState<number | null>(userAnswer);

  // 当外部 userAnswer 更新时，同步到本地 selectedOption
  // (例如：切题回来，或者提交后状态更新)
  useEffect(() => {
    setSelectedOption(userAnswer);
  }, [userAnswer, question.id]);

  useEffect(() => {
    // 仅在重温模式（有 sessionId）下启用二次随机，或者始终启用？
    // 用户需求是：重温考试时，题目一样，但选项顺序要变。
    // 这意味着选项顺序不能依赖 sessionId。
    
    // 使用 setTimeout 避免在 Effect 中同步调用 setState，虽然在这个场景下通常不会导致严重问题
    // 但为了遵循 React 规则，可以使用 requestAnimationFrame 或 setTimeout
    const timeoutId = setTimeout(() => {
      const indices = question.options.map((_, i) => i);
      // 使用真随机 (Math.random)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      setClientShuffledIndices(indices);
    }, 0);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, sessionId]); // 依赖 sessionId 变化（例如重新开始考试）时重新打乱

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyExplanation = async () => {
    const rawText = `✅ 正确答案：${question.options[question.correctAnswer]}\n\n${question.explanation || ''}`;
    
    // Remove markdown
    const text = rawText
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/`{3}[\s\S]*?`{3}/g, (match) => match.replace(/`/g, '')) // Code blocks
      .replace(/`/g, '') // Inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/^#+\s+/gm, '') // Headers
      .replace(/^\s*[-+*]\s+/gm, '') // List items
      .replace(/^\s*>\s+/gm, '') // Blockquotes
      .trim();

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  // 最终使用的索引：优先使用客户端随机后的，否则使用确定性的（SSR/首次渲染）
  const finalIndices = clientShuffledIndices || shuffledIndices;

  // 用户点击选项（只是预选，不提交）
  const handleSelect = useCallback((shuffledIdx: number) => {
    // 只有考试模式下，显示结果（交卷后）不能再选
    if (mode === 'exam' && showResult) return;
    
    // 练习模式下，如果做对了，不能再选
    if (mode !== 'exam' && showResult && userAnswer === question.correctAnswer) return;

    const originalIndex = finalIndices[shuffledIdx];
    setSelectedOption(originalIndex);
  }, [mode, showResult, userAnswer, question.correctAnswer, finalIndices]);

  // 确认提交答案
  const handleConfirm = useCallback(() => {
    if (selectedOption !== null && selectedOption !== userAnswer) {
      onSelectAnswer(selectedOption);
    }
  }, [selectedOption, userAnswer, onSelectAnswer]);

  const getOptionStatus = (shuffledIdx: number) => {
    const originalIndex = finalIndices[shuffledIdx];

    // 本地预选状态
    const isSelected = selectedOption === originalIndex;
    
    // 如果还没展示结果（或者还在做题中），只显示选中状态
    if (!showResult) {
      if (isSelected) return 'selected';
      return 'default';
    }
    
    // 如果是考试模式，且已交卷，显示正确答案和用户选择（如果选错）
    if (mode === 'exam') {
      if (originalIndex === question.correctAnswer) return 'correct';
      // 注意：这里用 userAnswer 而不是 selectedOption，因为考试回顾看的是提交的答案
      if (userAnswer === originalIndex && originalIndex !== question.correctAnswer) return 'incorrect';
      return 'default';
    }

    // 练习模式：
    // 如果用户提交了答案，且当前选项是正确答案，显示绿色
    if (userAnswer === question.correctAnswer) {
      if (originalIndex === question.correctAnswer) return 'correct';
    } else {
      // 答错了，且当前选项是用户刚才提交的错误答案，显示红色
      // 如果用户正在重选（selectedOption !== userAnswer），则显示新选中的为蓝色（selected）
      if (isSelected && selectedOption !== userAnswer) return 'selected';
      
      if (userAnswer === originalIndex) return 'incorrect';
    }
    
    return 'default';
  };

  // 键盘快捷键支持：数字键 1-4 选择选项，回车键确认
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免在输入框中触发
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
        return;
      }

      const keyMap: { [key: string]: number } = {
        '1': 0, '2': 1, '3': 2, '4': 3,
        'NumPad1': 0, 'NumPad2': 1, 'NumPad3': 2, 'NumPad4': 3
      };

      if (keyMap[e.key] !== undefined) {
        const index = keyMap[e.key];
        // 确保选项存在（有些题目可能只有 2 或 3 个选项）
        if (index < question.options.length) {
          handleSelect(index);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelect, handleConfirm, question.options.length]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-3 md:p-10 transition-all duration-300 hover:shadow-md">
      {/* 题号与标签 */}
      <div className="flex items-center justify-between mb-3 md:mb-8">
        <div className="flex items-center space-x-2 md:space-x-3">
          <span className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base md:text-lg shadow-sm">
            {mode === 'infinite' ? '∞' : (question.examQuestionId || questionNumber || 'Q')}
          </span>
          {question.sourceModuleName && (
            <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-gray-50 text-[10px] md:text-xs font-medium text-gray-500 border border-gray-100">
              {question.sourceModuleName}
            </span>
          )}
        </div>
        {/* 这里可以放收藏按钮等 */}
      </div>

      {/* 题目内容 */}
      <div className="prose prose-sm md:prose-lg max-w-none mb-3 md:mb-8">
        <h3 className="text-sm md:text-2xl font-semibold text-gray-900 leading-relaxed tracking-tight break-words">
          {question.text}
        </h3>
        
        {/* 题目图片 */}
        {question.image && (
          <div className="mt-4 md:mt-6 relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group">
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
      <div className="space-y-2 md:space-y-4">
        {(clientShuffledIndices || shuffledIndices).map((originalIdx, shuffledIdx) => {
          const option = question.options.map(o => o.replace(/^\s*[A-D][\.\、]\s*/, ''))[originalIdx]; // 临时处理：移除选项可能自带的 A. B. 前缀，因为我们有自己的 A-D 标签
          const status = getOptionStatus(shuffledIdx);
          
          return (
            <button
              key={originalIdx} // 使用原始索引作为 key，保持 React 渲染稳定
              onClick={() => handleSelect(shuffledIdx)}
              className={clsx(
                "w-full relative group p-2.5 pl-10 md:p-4 md:pl-16 rounded-2xl text-left border-2 transition-all duration-200",
                status === 'default' && "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 bg-white",
                status === 'selected' && "border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-200",
                status === 'correct' && "border-green-500 bg-green-50/50 shadow-sm ring-1 ring-green-200",
                status === 'incorrect' && "border-red-500 bg-red-50/50 shadow-sm ring-1 ring-red-200"
              )}
            >
              {/* 选项标号 - 始终显示 A, B, C, D (对应打乱后的顺序) */}
              <div className={clsx(
                "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-colors",
                status === 'default' && "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600",
                status === 'selected' && "bg-blue-500 text-white shadow-lg shadow-blue-200",
                status === 'correct' && "bg-green-500 text-white shadow-lg shadow-green-200",
                status === 'incorrect' && "bg-red-500 text-white shadow-lg shadow-red-200"
              )}>
                {['A', 'B', 'C', 'D'][shuffledIdx]}
              </div>

              {/* 选项文字 */}
              <span className={clsx(
                "block text-sm md:text-lg font-medium transition-colors break-words leading-tight",
                status === 'default' && "text-gray-700 group-hover:text-gray-900",
                status === 'selected' && "text-blue-900",
                status === 'correct' && "text-green-900",
                status === 'incorrect' && "text-red-900"
              )}>
                {option}
              </span>

              {/* 状态图标 */}
              {status === 'correct' && (
                <CheckCircle className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-green-500" size={16} />
              )}
              {status === 'incorrect' && (
                <XCircle className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-red-500" size={16} />
              )}
            </button>
          );
        })}
      </div>

      {/* 确认提交按钮 - 当有未提交的选中项时显示 */}
      {selectedOption !== null && selectedOption !== userAnswer && (!showResult || mode !== 'exam') && (
        <div className="mt-6 flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            确认提交 <span className="text-blue-200 text-xs font-normal ml-1">(Enter)</span>
          </button>
        </div>
      )}

      {/* 解析区域 (仅在显示结果时出现) */}
      {showResult && (
        <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Info className="text-blue-500" size={20} />
                <h4 className="font-bold text-blue-900">题目解析</h4>
              </div>
              <button
                onClick={handleCopyExplanation}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors"
                title="复制纯文本解析"
              >
                {isCopied ? (
                  <>
                    <Check size={14} className="text-green-500" />
                    <span className="text-green-600">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>复制</span>
                  </>
                )}
              </button>
            </div>
            <MarkdownRenderer
              className="prose prose-sm md:prose-base max-w-none text-blue-800/80"
              content={`**正确答案：** ${question.options[question.correctAnswer]}\n\n${question.explanation || ''}`}
            />
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
