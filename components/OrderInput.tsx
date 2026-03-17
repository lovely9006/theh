'use client';

import { useState, useMemo } from 'react';
import { BOX_TYPES, VEHICLE_TYPES } from '@/lib/constants';
import { calcTotalCBM, calcVehicles } from '@/lib/calculations';
import type { BoxEntry, VehicleCalcResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface OrderInputProps {
  onCalculate: (result: VehicleCalcResult) => void;
}

export default function OrderInput({ onCalculate }: OrderInputProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(BOX_TYPES.map(b => [b.id, 0]))
  );
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(
    new Set(VEHICLE_TYPES.map(v => v.id))
  );
  const [efficiency, setEfficiency] = useState<number>(85);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 파생값 — quantities 변경 시에만 재계산
  const entries: BoxEntry[] = useMemo(
    () => BOX_TYPES.map(b => ({ boxType: b, quantity: quantities[b.id] ?? 0 })),
    [quantities],
  );
  const totalQuantity = useMemo(
    () => BOX_TYPES.reduce((s, b) => s + (quantities[b.id] ?? 0), 0),
    [quantities],
  );
  const totalCBM = useMemo(() => calcTotalCBM(entries), [entries]);

  const handleQuantityChange = (id: string, raw: string) => {
    const parsed = parseInt(raw, 10);
    setQuantities(prev => ({
      ...prev,
      [id]: isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
    setError(null);
  };

  const toggleVehicle = (id: string, checked: boolean) => {
    setSelectedVehicleIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    setError(null);
  };

  const toggleAll = () => {
    if (selectedVehicleIds.size === VEHICLE_TYPES.length) {
      setSelectedVehicleIds(new Set());
    } else {
      setSelectedVehicleIds(new Set(VEHICLE_TYPES.map(v => v.id)));
    }
    setError(null);
  };

  const handleCalculate = () => {
    if (totalCBM === 0) {
      setError('박스 수량을 1개 이상 입력해 주세요.');
      return;
    }
    if (selectedVehicleIds.size === 0) {
      setError('배차에 사용할 차량을 1종류 이상 선택해 주세요.');
      return;
    }
    setError(null);
    setIsCalculating(true);
    const selectedVehicles = VEHICLE_TYPES.filter(v => selectedVehicleIds.has(v.id));
    onCalculate(calcVehicles(totalCBM, selectedVehicles, efficiency));
    setIsCalculating(false);
  };

  return (
    <div className="space-y-7">
      {/* 섹션 1: 박스 수량 입력 */}
      <section aria-labelledby="box-input-title">
        <div className="flex items-center justify-between mb-3">
          <h2 id="box-input-title" className="text-sm font-semibold text-gray-800">박스 수량 입력</h2>
          {totalQuantity > 0 && (
            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full tabular-nums">
              {totalQuantity.toLocaleString()}개 / {totalCBM.toFixed(3)} CBM
            </span>
          )}
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th scope="col" className="border border-gray-200 px-4 py-2 text-left font-medium text-xs">박스 종류</th>
              <th scope="col" className="border border-gray-200 px-4 py-2 text-right font-medium text-xs">수량</th>
              <th scope="col" className="border border-gray-200 px-4 py-2 text-right font-medium text-xs">소계 CBM</th>
            </tr>
          </thead>
          <tbody>
            {BOX_TYPES.map(box => {
              const qty = quantities[box.id] ?? 0;
              const rowCBM = (box.cbm * qty).toFixed(3);
              const hasQty = qty > 0;
              return (
                <tr key={box.id} className={`hover:bg-gray-50 transition-colors ${hasQty ? 'bg-blue-50/40' : ''}`}>
                  <td className="border border-gray-200 px-4 py-2 text-gray-800">{box.name}</td>
                  <td className="border border-gray-200 px-3 py-1.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={99999}
                        step={1}
                        value={qty === 0 ? '' : qty}
                        placeholder="0"
                        aria-label={`${box.name} 수량`}
                        onChange={e => handleQuantityChange(box.id, e.target.value)}
                        className="w-20 text-right bg-transparent outline-none focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5 tabular-nums"
                      />
                      <span className="text-xs text-gray-400 w-3">개</span>
                      {hasQty && (
                        <button
                          type="button"
                          aria-label={`${box.name} 수량 초기화`}
                          onClick={() => handleQuantityChange(box.id, '0')}
                          className="text-gray-300 hover:text-gray-500 transition-colors ml-0.5"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-right tabular-nums text-gray-600">
                    {hasQty ? rowCBM : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              );
            })}
            {/* 합계 행 */}
            <tr className="bg-gray-100 font-semibold">
              <td className="border border-gray-200 px-4 py-2 text-xs text-gray-700">합계</td>
              <td className="border border-gray-200 px-4 py-2 text-right tabular-nums text-xs text-gray-700">{totalQuantity.toLocaleString()}개</td>
              <td className="border border-gray-200 px-4 py-2 text-right tabular-nums text-xs text-gray-700">{totalCBM.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 섹션 2: 차량 선택 */}
      <section aria-labelledby="vehicle-select-title">
        <div className="flex items-center justify-between mb-3">
          <h2 id="vehicle-select-title" className="text-sm font-semibold text-gray-800">차량 선택</h2>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
          >
            {selectedVehicleIds.size === VEHICLE_TYPES.length ? '전체 해제' : '전체 선택'}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {VEHICLE_TYPES.map(v => (
            <label key={v.id} className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={selectedVehicleIds.has(v.id)}
                onCheckedChange={(checked) => toggleVehicle(v.id, Boolean(checked))}
              />
              <span className="text-sm text-gray-800">
                {v.name}
                <span className="text-gray-400 ml-1">({v.cbm} m³)</span>
              </span>
            </label>
          ))}
        </div>
        {selectedVehicleIds.size > 0 && (
          <p className="mt-2 text-xs text-gray-400">{selectedVehicleIds.size}종 선택됨</p>
        )}
      </section>

      {/* 적재율 기준 */}
      <section aria-labelledby="efficiency-title">
        <div className="flex items-center gap-3">
          <label id="efficiency-title" htmlFor="efficiency-input" className="text-sm font-semibold text-gray-800 shrink-0">
            적재율 기준 (%)
          </label>
          <div className="flex items-center gap-1.5">
            <input
              id="efficiency-input"
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              step={1}
              value={efficiency}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= 100) setEfficiency(v);
              }}
              className="w-16 text-right border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              aria-label="적재율 기준 퍼센트"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-400">
            차량 1대의 유효 적재 용량을 물리 용량의 {efficiency}%로 계산합니다.
          </p>
        </div>
      </section>

      {/* 에러 메시지 */}
      {error && (
        <div role="alert" className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* 계산 버튼 */}
      <Button
        onClick={handleCalculate}
        disabled={isCalculating}
        size="lg"
        className="w-full"
        aria-busy={isCalculating}
      >
        {isCalculating ? (
          <>
            <svg className="animate-spin mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            계산 중...
          </>
        ) : (
          '배차 계산하기'
        )}
      </Button>
    </div>
  );
}
