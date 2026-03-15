import React from 'react';
import { RotateCcw, Award, AlertTriangle, BookOpen, Copy, Check } from 'lucide-react';

interface ResultCardProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  onRestart: () => void;
  onReviewWrong?: () => void;
  timeUsed?: string;
  examSeed?: string; // 更新：支持字符串格式的种子
}

export default function ResultCard({
  score,
  correctCount,
  totalQuestions,
  onRestart,
  onReviewWrong,
  timeUsed,
  examSeed
}: ResultCardProps) {
  const isPass = score >= 60;
  const [copied, setCopied] = React.useState(false);

  const copySeed = () => {
    if (examSeed) {
      navigator.clipboard.writeText(examSeed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12 text-center max-w-2xl mx-auto mt-10">
      <div className="mb-8">
        {isPass ? (
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-600 mb-4 animate-bounce">
            <Award size={48} />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 text-red-600 mb-4">
            <AlertTriangle size={48} />
          </div>
        )}
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isPass ? '考试通过！' : '还需努力！'}
        </h2>
        <p className="text-gray-500">
          {isPass ? '恭喜你完成了本次测试，成绩优异。' : '不要气馁，继续练习，下次一定行。'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-2xl">
          <div className="text-sm text-gray-500 mb-1">得分</div>
          <div className={`text-2xl font-bold ${isPass ? 'text-green-600' : 'text-red-600'}`}>
            {score}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl">
          <div className="text-sm text-gray-500 mb-1">正确</div>
          <div className="text-2xl font-bold text-gray-900">{correctCount}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl">
          <div className="text-sm text-gray-500 mb-1">总题数</div>
          <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl">
          <div className="text-sm text-gray-500 mb-1">用时</div>
          <div className="text-2xl font-bold text-gray-900">{timeUsed || '--:--'}</div>
        </div>
      </div>

      {examSeed && (
        <div className="mb-8 p-3 bg-gray-50 rounded-xl flex flex-col md:flex-row items-center justify-center gap-2 text-sm text-gray-500">
          <span className="whitespace-nowrap">考试种子:</span>
          <div className="flex items-center gap-2 max-w-full overflow-hidden">
             <span className="font-mono font-bold text-gray-700 truncate max-w-[200px] md:max-w-none">{examSeed}</span>
             <button 
               onClick={copySeed}
               className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
               title="复制种子"
             >
               {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
             </button>
             {copied && <span className="text-xs text-green-600 animate-in fade-in whitespace-nowrap">已复制</span>}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onRestart}
          className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
        >
          <RotateCcw size={20} className="mr-2" />
          重新考试
        </button>
        {onReviewWrong && correctCount < totalQuestions && (
          <button
            onClick={onReviewWrong}
            className="px-8 py-3 rounded-xl font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center"
          >
            <BookOpen size={20} className="mr-2" />
            查看错题
          </button>
        )}
      </div>
    </div>
  );
}
