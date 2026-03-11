'use client';

import { useState } from 'react';
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

  // 파생값 — 실시간 계산
  const entries: BoxEntry[] = BOX_TYPES.map(b => ({
    boxType: b,
    quantity: quantities[b.id] ?? 0,
  }));
  const totalQuantity = BOX_TYPES.reduce((s, b) => s + (quantities[b.id] ?? 0), 0);
  const totalCBM = calcTotalCBM(entries);
  const canCalculate = totalCBM > 0 && selectedVehicleIds.size > 0;

  const handleQuantityChange = (id: string, raw: string) => {
    const parsed = parseInt(raw, 10);
    setQuantities(prev => ({
      ...prev,
      [id]: isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
  };

  const toggleVehicle = (id: string, checked: boolean) => {
    setSelectedVehicleIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleCalculate = () => {
    const selectedVehicles = VEHICLE_TYPES.filter(v => selectedVehicleIds.has(v.id));
    onCalculate(calcVehicles(totalCBM, selectedVehicles));
  };

  return (
    <div className="space-y-8">
      {/* 섹션 1: 박스 수량 입력 */}
      <section>
        <h2 className="text-base font-semibold mb-3">박스 수량 입력</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground">
              <th className="border border-border px-4 py-2 text-left font-medium">박스 종류</th>
              <th className="border border-border px-4 py-2 text-right font-medium">수량 (개)</th>
              <th className="border border-border px-4 py-2 text-right font-medium">CBM (m³)</th>
            </tr>
          </thead>
          <tbody>
            {BOX_TYPES.map(box => {
              const qty = quantities[box.id] ?? 0;
              const rowCBM = (box.cbm * qty).toFixed(3);
              return (
                <tr key={box.id} className="hover:bg-muted/40">
                  <td className="border border-border px-4 py-2">{box.name}</td>
                  <td className="border border-border px-4 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      max={99999}
                      step={1}
                      value={qty === 0 ? '' : qty}
                      placeholder="0"
                      onChange={e => handleQuantityChange(box.id, e.target.value)}
                      className="w-24 text-right bg-transparent outline-none focus:ring-1 focus:ring-ring rounded px-1"
                    />
                  </td>
                  <td className="border border-border px-4 py-2 text-right tabular-nums">
                    {rowCBM}
                  </td>
                </tr>
              );
            })}
            {/* 합계 행 */}
            <tr className="bg-muted font-semibold">
              <td className="border border-border px-4 py-2">합계</td>
              <td className="border border-border px-4 py-2 text-right tabular-nums">{totalQuantity}</td>
              <td className="border border-border px-4 py-2 text-right tabular-nums">{totalCBM.toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 섹션 2: 차량 선택 */}
      <section>
        <h2 className="text-base font-semibold mb-3">차량 선택</h2>
        <div className="flex flex-wrap gap-3">
          {VEHICLE_TYPES.map(v => (
            <label key={v.id} className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={selectedVehicleIds.has(v.id)}
                onCheckedChange={(checked) => toggleVehicle(v.id, Boolean(checked))}
              />
              <span className="text-sm">
                {v.name}
                <span className="text-muted-foreground ml-1">({v.cbm} m³)</span>
              </span>
            </label>
          ))}
        </div>
        {selectedVehicleIds.size === 0 && (
          <p className="mt-2 text-xs text-destructive">차량을 하나 이상 선택하세요.</p>
        )}
      </section>

      {/* 섹션 3: 계산 버튼 */}
      <div>
        <Button onClick={handleCalculate} disabled={!canCalculate} size="lg" className="w-full">
          배차 계산
        </Button>
      </div>
    </div>
  );
}
