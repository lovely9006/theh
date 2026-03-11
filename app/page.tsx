'use client';

import { useState } from 'react';
import type { VehicleCalcResult } from '@/lib/types';
import OrderInput from '@/components/OrderInput';
import ResultView from '@/components/ResultView';

type Step = 'input' | 'result';

export default function Page() {
  const [step, setStep] = useState<Step>('input');
  const [calcResult, setCalcResult] = useState<VehicleCalcResult | null>(null);

  const handleCalculate = (result: VehicleCalcResult) => {
    setCalcResult(result);
    setStep('result');
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">박스 배차 계산기</h1>

        {step === 'input' && (
          <OrderInput onCalculate={handleCalculate} />
        )}

        {step === 'result' && calcResult && (
          <ResultView
            result={calcResult}
            onReset={() => setStep('input')}
          />
        )}
      </div>
    </main>
  );
}
