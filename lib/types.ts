export interface BoxType {
  id: string;
  name: string;
  length: number; // mm
  width: number;  // mm
  height: number; // mm
  cbm: number;    // m³ (precomputed: L×W×H / 1e9)
}

export interface VehicleType {
  id: string;
  name: string;
  cbm: number; // m³ (총 적재 가능 부피)
}

export interface BoxEntry {
  boxType: BoxType;
  quantity: number;
}

export interface VehicleAssignment {
  vehicle: VehicleType;
  count: number;
  loadRate: number;    // % (0–100)
  usedCBM: number;    // 실제 적재 CBM
  remainingCBM: number; // 이 차종 배정 후 잔여 CBM
}

export interface VehicleCalcResult {
  assignments: VehicleAssignment[];
  totalCBM: number;
  totalVehicles: number;
  unassignedCBM: number; // 최종 미배정 CBM (정상 시 0)
}
