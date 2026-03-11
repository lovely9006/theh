'use client';

import { useState } from 'react';
import type { VehicleCalcResult } from '@/lib/types';
import OrderInput from '@/components/OrderInput';
import ResultView from '@/components/ResultView';

export default function Page() {
  const [calcResult, setCalcResult] = useState<VehicleCalcResult | null>(null);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">박스 배차 계산기</h1>

        <OrderInput onCalculate={setCalcResult} />

        {calcResult && (
          <div className="mt-10">
            <ResultView result={calcResult} />
          </div>
        )}
      </div>
    </main>
  );
}
