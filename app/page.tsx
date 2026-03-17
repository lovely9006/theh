'use client';

import { useState } from 'react';
import type { VehicleCalcResult } from '@/lib/types';
import OrderInput from '@/components/OrderInput';
import ResultView from '@/components/ResultView';

export default function Page() {
  const [calcResult, setCalcResult] = useState<VehicleCalcResult | null>(null);

  const handleCalculate = (result: VehicleCalcResult) => {
    setCalcResult(result);
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base">박스 배차 계산기</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 단계 표시 */}
        <nav aria-label="진행 단계">
          <ol className="flex items-center gap-2 text-xs text-gray-500">
            <li className="flex items-center gap-1.5 font-semibold text-blue-600">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              박스 수량 입력
            </li>
            <li className="w-6 h-px bg-gray-300 shrink-0" aria-hidden="true" />
            <li className="flex items-center gap-1.5 font-semibold text-blue-600">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              차량 선택
            </li>
            <li className="w-6 h-px bg-gray-300 shrink-0" aria-hidden="true" />
            <li className={`flex items-center gap-1.5 ${calcResult ? 'font-semibold text-green-600' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${calcResult ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>3</span>
              결과 확인
            </li>
          </ol>
        </nav>

        {/* 입력 카드 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <OrderInput onCalculate={handleCalculate} />
        </div>

        {/* 결과 */}
        <div id="result-section">
          <ResultView result={calcResult} />
        </div>
      </main>
    </div>
  );
}
