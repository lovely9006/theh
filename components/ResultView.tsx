'use client';

import type { VehicleCalcResult } from '@/lib/types';
import { exportToExcel } from '@/lib/excel';
import { Button } from '@/components/ui/button';

interface ResultViewProps {
  result: VehicleCalcResult;
}

function getLoadRateClass(rate: number): string {
  if (rate >= 80) return 'text-green-600 font-semibold';
  if (rate >= 50) return 'text-yellow-600 font-semibold';
  return 'text-red-600 font-semibold';
}

export default function ResultView({ result }: ResultViewProps) {
  return (
    <div className="space-y-8">
      {/* 배차 결과 테이블 */}
      <section>
        <h2 className="text-base font-semibold mb-3">배차 결과</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="border border-border px-4 py-2 text-left font-medium">차종</th>
              <th className="border border-border px-4 py-2 text-right font-medium">대수</th>
              <th className="border border-border px-4 py-2 text-right font-medium">적재량 (CBM)</th>
              <th className="border border-border px-4 py-2 text-right font-medium">적재율</th>
              <th className="border border-border px-4 py-2 text-right font-medium">여유 공간 (CBM)</th>
            </tr>
          </thead>
          <tbody>
            {result.assignments.map(a => (
              <tr key={a.vehicle.id} className="hover:bg-muted/40">
                <td className="border border-border px-4 py-2">{a.vehicle.name}</td>
                <td className="border border-border px-4 py-2 text-right tabular-nums">{a.count}대</td>
                <td className="border border-border px-4 py-2 text-right tabular-nums">{a.usedCBM.toFixed(3)}</td>
                <td className="border border-border px-4 py-2 text-right">
                  <span className={getLoadRateClass(a.loadRate)}>{a.loadRate}%</span>
                </td>
                <td className="border border-border px-4 py-2 text-right tabular-nums">{a.remainingCBM.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 요약 */}
        <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
          <span>총 CBM: <strong className="text-foreground">{result.totalCBM.toFixed(3)} m³</strong></span>
          <span>총 차량 대수: <strong className="text-foreground">{result.totalVehicles}대</strong></span>
          {result.unassignedCBM > 0 && (
            <span className="text-destructive font-semibold">
              ⚠ 미배정 CBM: {result.unassignedCBM.toFixed(3)} m³ (차량 추가 필요)
            </span>
          )}
        </div>
      </section>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => void exportToExcel(result)}>
          엑셀 저장
        </Button>
      </div>
    </div>
  );
}
