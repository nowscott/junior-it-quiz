'use client';

import dynamic from 'next/dynamic';

const QuizApp = dynamic(() => import('@/components/QuizApp'), { ssr: false });

export default function HomeClient() {
  return <QuizApp />;
}
