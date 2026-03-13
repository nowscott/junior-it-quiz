import { RotateCcw, Award, AlertTriangle, BookOpen } from 'lucide-react';

interface ResultCardProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  onRestart: () => void;
  onReviewWrong?: () => void;
}

export default function ResultCard({
  score,
  correctCount,
  totalQuestions,
  onRestart,
  onReviewWrong
}: ResultCardProps) {
  const isPass = score >= 60;
  
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

      <div className="grid grid-cols-3 gap-4 mb-8">
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
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
