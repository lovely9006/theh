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
 *   1) 각 차종별로 독립적으로 필요 대수 계산
 *      - totalCBM이 물리 용량 이하 → 1대로 충분
 *      - 그 외 → ceil(totalCBM ÷ 유효CBM)
 *   2) 적재율 내림차순 → 대수 오름차순으로 정렬
 *   3) 가장 앞(최적 차종)이 추천 배차
 */
export function calcVehicles(
  totalCBM: number,
  selectedVehicles: VehicleType[],
): VehicleCalcResult {
  if (selectedVehicles.length === 0 || totalCBM <= 0) {
    return { assignments: [], totalCBM, totalVehicles: 0, unassignedCBM: round3(totalCBM) };
  }

  const candidates: VehicleAssignment[] = selectedVehicles.map(vehicle => {
    const effectiveCBM = vehicle.cbm * LOAD_EFFICIENCY;
    // 물리 용량에 들어오면 1대, 아니면 유효 용량 기준 ceil
    const count = totalCBM <= vehicle.cbm ? 1 : Math.ceil(totalCBM / effectiveCBM);
    const loadRate = Math.min(round2((totalCBM / (count * effectiveCBM)) * 100), 100);
    const remainingCBM = round3(count * vehicle.cbm - totalCBM);
    return { vehicle, count, loadRate, usedCBM: round3(totalCBM), remainingCBM };
  });

  // 적재율 내림차순, 동률이면 대수 오름차순
  candidates.sort((a, b) =>
    b.loadRate !== a.loadRate ? b.loadRate - a.loadRate : a.count - b.count
  );

  return {
    assignments: candidates,
    totalCBM,
    totalVehicles: candidates[0].count,
    unassignedCBM: 0,
  };
}
