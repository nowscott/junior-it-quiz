import React, { useState } from 'react';
import { Question } from '@/data/types';
import { Loader2, Sparkles, X } from 'lucide-react';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface Props {
  isOpen: boolean;
  displayIndex: number | null;
  question: Question | null;
  onChange: (q: Question) => void;
  onClose: () => void;
  onConfirm: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function EditQuestionModal({
  isOpen,
  displayIndex,
  question,
  onChange,
  onClose,
  onConfirm,
  onGenerate,
  isGenerating
}: Props) {
  const [showPreview, setShowPreview] = useState(false);
  if (!isOpen || !question) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg">
            编辑题目 #{displayIndex ?? ''}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">题目内容</label>
            <textarea
              value={question.text}
              onChange={e => onChange({ ...question, text: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">题目图片 URL（可选）</label>
            <input
              type="text"
              value={question.image || ''}
              onChange={e => onChange({ ...question, image: e.target.value })}
              placeholder="例如：/images/1-162.png 或 https://..."
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
            <div className="space-y-2">
              {question.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-center font-bold text-gray-400">{String.fromCharCode(65 + idx)}</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => {
                      const newOpts = [...question.options];
                      newOpts[idx] = e.target.value;
                      onChange({ ...question, options: newOpts });
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={question.correctAnswer === idx}
                    onChange={() => onChange({ ...question, correctAnswer: idx })}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    title="设为正确答案"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">解析</label>
              <button
                onClick={onGenerate}
                disabled={isGenerating || !question.text}
                className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                AI 生成解析
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setShowPreview(false)}
                className={`px-2 py-1 rounded text-sm ${!showPreview ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                编辑
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`px-2 py-1 rounded text-sm ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                预览
              </button>
            </div>
            {!showPreview ? (
              <textarea
                value={question.explanation}
                onChange={e => onChange({ ...question, explanation: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={6}
              />
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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
              placeholder="例如：/images/2-103.png 或 https://..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {question.explanationImage && (
              <div className="mt-2">
                <img
                  src={question.explanationImage}
                  alt="解析图片预览"
                  className="max-h-48 rounded-lg border border-gray-200 object-contain bg-white"
                />
              </div>
            )}
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
