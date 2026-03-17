'use client';

import type { VehicleCalcResult } from '@/lib/types';
import { exportToExcel } from '@/lib/excel';
import { Button } from '@/components/ui/button';

interface ResultViewProps {
  result: VehicleCalcResult | null;
}

function getLoadRateStyle(rate: number) {
  if (rate >= 80) return { bar: 'bg-green-500', text: 'text-green-700', label: '효율적', card: 'border-green-200 bg-green-50' };
  if (rate >= 50) return { bar: 'bg-yellow-400', text: 'text-yellow-700', label: '보통', card: 'border-yellow-200 bg-yellow-50' };
  return { bar: 'bg-red-400', text: 'text-red-700', label: '비효율', card: 'border-red-200 bg-red-50' };
}

export default function ResultView({ result }: ResultViewProps) {
  // 빈 상태
  if (!result) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1">배차 결과가 여기에 표시됩니다</p>
          <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
            박스 수량과 차량을 선택한 뒤 <strong className="text-gray-500">배차 계산하기</strong> 버튼을 눌러주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-enter bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 헤더 + 내보내기 버튼 */}
      <div className="px-5 py-4 border-b border-gray-100 bg-green-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">배차 계산 결과</h2>
            <p className="text-xs text-gray-500">총 {result.totalCBM.toFixed(3)} CBM / {result.totalVehicles}대</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void exportToExcel(result)}
          className="text-xs h-8 border-green-300 text-green-700 hover:bg-green-100 shrink-0"
          aria-label="배차 결과를 엑셀 파일로 저장"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          엑셀 저장
        </Button>
      </div>

      <div className="p-5 space-y-5">
        {/* 미배정 경고 */}
        {result.unassignedCBM > 0 && (
          <div role="alert" className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            미배정 CBM: <strong>{result.unassignedCBM.toFixed(3)} m³</strong> — 차량을 추가해 주세요.
          </div>
        )}

        {/* 배차 결과 테이블 */}
        <section aria-label="차종별 배차 결과">
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm" aria-label="배차 결과">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600">차종</th>
                  <th scope="col" className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600">대수</th>
                  <th scope="col" className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 hidden sm:table-cell">적재량 (CBM)</th>
                  <th scope="col" className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600">적재율</th>
                  <th scope="col" className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 hidden sm:table-cell">여유 (CBM)</th>
                </tr>
              </thead>
              <tbody>
                {result.assignments.map((a, idx) => {
                  const s = getLoadRateStyle(a.loadRate);
                  return (
                    <tr key={a.vehicle.id} className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">{a.vehicle.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">{a.count}대</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600 hidden sm:table-cell">{a.usedCBM.toFixed(3)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-semibold ${s.text}`}>{a.loadRate}%</span>
                          <div
                            className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"
                            role="progressbar"
                            aria-valuenow={a.loadRate}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${a.vehicle.name} 적재율 ${a.loadRate}%`}
                          >
                            <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${a.loadRate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-500 hidden sm:table-cell">{a.remainingCBM.toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 border-t border-gray-200">
                  <td className="px-4 py-2.5 text-xs font-bold text-gray-700">합계</td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700 tabular-nums">{result.totalVehicles}대</td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700 tabular-nums hidden sm:table-cell">{result.totalCBM.toFixed(3)}</td>
                  <td className="px-4 py-2.5" />
                  <td className="hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <p className="text-xs text-gray-400 text-center pt-1 border-t border-gray-100">
          계산 결과는 CBM 기준 이론값이며, 실제 적재 시 박스 형태나 차량 구조에 따라 달라질 수 있습니다.
        </p>
      </div>
    </div>
  );
}
