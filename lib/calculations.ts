import type { BoxEntry, VehicleType, VehicleAssignment, VehicleCalcResult } from './types';
import { LOAD_EFFICIENCY } from './constants';

const round3 = (n: number) => Math.round(n * 1000) / 1000;
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * 함수 1: 박스 목록 → 총 CBM (m³)
 * 소수점 3자리로 반올림
 */
export function calcTotalCBM(entries: BoxEntry[]): number {
  const raw = entries.reduce((sum, { boxType, quantity }) => {
    return sum + boxType.cbm * quantity;
  }, 0);
  return round3(raw);
}

/**
 * 함수 2: 총 CBM + 선택 차종 → 배차 결과
 *
 * 알고리즘:
 *   1) 차종을 CBM 내림차순 정렬 (대형 우선)
 *   2) 각 차종 유효 적재 부피 = CBM × 0.85
 *   3) 대형 차종: floor(잔여CBM ÷ 유효CBM) → 과잉 배정 방지
 *      마지막 차종: ceil(잔여CBM ÷ 유효CBM) → 전량 커버
 *   4) 차종별 { 대수, 적재율%, 잔여CBM } 반환
 */
export function calcVehicles(
  totalCBM: number,
  selectedVehicles: VehicleType[],
): VehicleCalcResult {
  if (selectedVehicles.length === 0 || totalCBM <= 0) {
    return { assignments: [], totalCBM, totalVehicles: 0, unassignedCBM: round3(totalCBM) };
  }

  const sorted = [...selectedVehicles].sort((a, b) => b.cbm - a.cbm);
  const assignments: VehicleAssignment[] = [];
  let remainingCBM = totalCBM;

  for (let i = 0; i < sorted.length; i++) {
    const vehicle = sorted[i];
    const effectiveCBM = vehicle.cbm * LOAD_EFFICIENCY; // 유효 적재 부피
    const isLast = i === sorted.length - 1;

    if (remainingCBM <= 0) break;

    const count = isLast
      ? Math.ceil(remainingCBM / effectiveCBM)
      : Math.floor(remainingCBM / effectiveCBM);

    if (count === 0) continue;

    const totalCapacity = count * effectiveCBM;
    const usedCBM = Math.min(remainingCBM, totalCapacity);
    const loadRate = round2((usedCBM / totalCapacity) * 100); // 적재율%

    remainingCBM = Math.max(0, remainingCBM - usedCBM);

    assignments.push({
      vehicle,
      count,
      loadRate,
      usedCBM: round3(usedCBM),
      remainingCBM: round3(remainingCBM),
    });
  }

  return {
    assignments,
    totalCBM,
    totalVehicles: assignments.reduce((sum, a) => sum + a.count, 0),
    unassignedCBM: round3(remainingCBM),
  };
}
