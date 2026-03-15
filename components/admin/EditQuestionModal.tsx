import React, { useState } from 'react';
import { Question } from '@/data/types';
import { Loader2, Sparkles, X, Check, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface Props {
  isOpen: boolean;
  displayIndex: number | null;
  question: Question | null;
  reasoningText?: string;
  onChange: (q: Question) => void;
  onClose: () => void;
  onConfirm: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generateStatus: 'idle' | 'success' | 'error';
}

export default function EditQuestionModal({
  isOpen,
  displayIndex,
  question,
  reasoningText,
  onChange,
  onClose,
  onConfirm,
  onGenerate,
  isGenerating,
  generateStatus
}: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true);

  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg">
            编辑题目 #{displayIndex ?? ''}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目内容</label>
                <textarea
                  value={question.text}
                  onChange={e => onChange({ ...question, text: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目图片 URL（可选）</label>
                <input
                  type="text"
                  value={question.image || ''}
                  onChange={e => onChange({ ...question, image: e.target.value })}
                  placeholder="例如：/images/module1/xxx.png 或 https://..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {question.image && (
                  <div className="mt-2">
                    <img
                      src={question.image}
                      alt="题目图片预览"
                      className="max-h-48 rounded-lg border border-gray-200 object-contain bg-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选项</label>
                <div className="space-y-3">
                  {question.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-8 text-center font-bold text-gray-500 bg-gray-100 rounded py-1">{String.fromCharCode(65 + idx)}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const newOpts = [...question.options];
                          newOpts[idx] = e.target.value;
                          onChange({ ...question, options: newOpts });
                        }}
                        className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          question.correctAnswer === idx ? 'border-green-500 bg-green-50' : 'border-gray-300'
                        }`}
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={question.correctAnswer === idx}
                        onChange={() => onChange({ ...question, correctAnswer: idx })}
                        className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                        title="设为正确答案"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col h-full">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">解析内容</label>
                <div className="flex gap-2">
                   <button
                    onClick={onGenerate}
                    disabled={isGenerating || !question.text}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all font-medium border
                      ${generateStatus === 'success' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : generateStatus === 'error' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}
                  >
                    {isGenerating && <Loader2 className="animate-spin" size={14} />}
                    {!isGenerating && generateStatus === 'success' && <Check size={14} />}
                    {!isGenerating && generateStatus === 'error' && <XCircle size={14} />}
                    {!isGenerating && generateStatus === 'idle' && <Sparkles size={14} />}
                    {isGenerating ? 'AI 生成中…' : generateStatus === 'success' ? '已生成' : generateStatus === 'error' ? '生成失败' : 'AI 生成解析'}
                  </button>
                  <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                    <button
                      onClick={() => setShowPreview(false)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!showPreview ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => setShowPreview(true)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${showPreview ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      预览
                    </button>
                  </div>
                </div>
              </div>

              {reasoningText && (
                <div className="border border-indigo-100 rounded-lg overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                    className="w-full flex items-center justify-between p-2.5 bg-indigo-50/50 hover:bg-indigo-50 text-xs text-indigo-700 font-medium transition-colors group"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Sparkles size={14} className="text-indigo-500 shrink-0" />
                      <span className="shrink-0">AI 思考过程</span>
                      {!isReasoningExpanded && (
                        <span className="ml-2 text-indigo-400 font-mono truncate opacity-70 group-hover:opacity-100 transition-opacity">
                          {reasoningText.split('\n').filter(l => l.trim()).pop() || '...'}
                        </span>
                      )}
                    </div>
                    {isReasoningExpanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
                  </button>
                  
                  {isReasoningExpanded && (
                    <div className="p-3 bg-slate-50 border-t border-indigo-100 max-h-48 overflow-y-auto text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                      {reasoningText}
                      {isGenerating && <span className="animate-pulse inline-block w-1.5 h-3 ml-1 bg-indigo-400 align-middle"></span>}
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 min-h-[300px] flex flex-col">
                {!showPreview ? (
                  <textarea
                    value={question.explanation}
                    onChange={e => onChange({ ...question, explanation: e.target.value })}
                    className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed resize-none"
                    placeholder="在此输入解析内容..."
                  />
                ) : (
                  <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-y-auto prose prose-sm max-w-none">
                    <MarkdownRenderer content={question.explanation || ''} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">解析图片 URL（可选）</label>
                <input
                  type="text"
                  value={question.explanationImage || ''}
                  onChange={e => onChange({ ...question, explanationImage: e.target.value })}
                  placeholder="例如：/images/module2/2-103.png 或 https://..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {question.explanationImage && (
                  <div className="mt-2">
                    <img
                      src={question.explanationImage}
                      alt="解析图片预览"
                      className="max-h-32 rounded-lg border border-gray-200 object-contain bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-200"
          >
            确认修改
          </button>
        </div>
      </div>
    </div>
  );
}
