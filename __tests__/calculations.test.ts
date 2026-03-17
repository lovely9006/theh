import { calcTotalCBM, calcVehicles } from '../lib/calculations';
import { BOX_TYPES, VEHICLE_TYPES } from '../lib/constants';

// 박스
const subscriptionBox = BOX_TYPES.find(b => b.id === 'subscription')!; // 0.01444 m³
const bunchBox        = BOX_TYPES.find(b => b.id === 'bunch')!;        // 0.00868 m³
const cubeBox         = BOX_TYPES.find(b => b.id === 'cube')!;         // 0.02880 m³
const blockBox        = BOX_TYPES.find(b => b.id === 'block')!;        // 0.04185 m³

// 차량 (새 규격)
// 다마스  1100×1600×1100mm = 1.936 m³
// 라보    1400×2200×1000mm = 3.080 m³
// 스타리아 1600×2600×1400mm = 5.824 m³
// 1톤 탑  1600×2700×1700mm = 7.344 m³
// 1.4톤   1600×3100×1800mm = 8.928 m³
const damas      = VEHICLE_TYPES.find(v => v.id === 'damas')!;
const labo       = VEHICLE_TYPES.find(v => v.id === 'labo')!;
const starria    = VEHICLE_TYPES.find(v => v.id === 'starria')!;
const truck1t    = VEHICLE_TYPES.find(v => v.id === 'truck_1t')!;
const truck1_4t  = VEHICLE_TYPES.find(v => v.id === 'truck_1_4t')!;

// ─────────────────────────────────────────────────────────────────────
// calcTotalCBM
// ─────────────────────────────────────────────────────────────────────
describe('calcTotalCBM', () => {
  it('구독박스 100개 + 큐브박스 50개 → 2.884 CBM', () => {
    // 0.01444×100 + 0.02880×50 = 1.444 + 1.440 = 2.884
    const result = calcTotalCBM([
      { boxType: subscriptionBox, quantity: 100 },
      { boxType: cubeBox,         quantity: 50  },
    ]);
    expect(result).toBe(2.884);
  });

  it('빈 배열 → 0', () => {
    expect(calcTotalCBM([])).toBe(0);
  });

  it('[케이스 A] 구독박스 200개 → 2.888 CBM', () => {
    // 200 × 0.01444 = 2.888
    expect(calcTotalCBM([{ boxType: subscriptionBox, quantity: 200 }])).toBe(2.888);
  });

  it('[케이스 B] 구독박스 100 + 번치박스 50 + 큐브박스 30 + 블록박스 20 → 3.579 CBM', () => {
    // 1.444 + 0.434 + 0.864 + 0.837 = 3.579
    const result = calcTotalCBM([
      { boxType: subscriptionBox, quantity: 100 },
      { boxType: bunchBox,        quantity: 50  },
      { boxType: cubeBox,         quantity: 30  },
      { boxType: blockBox,        quantity: 20  },
    ]);
    expect(result).toBe(3.579);
  });

  it('[케이스 C] 블록박스 500개 → 20.925 CBM', () => {
    // 500 × 0.04185 = 20.925
    expect(calcTotalCBM([{ boxType: blockBox, quantity: 500 }])).toBe(20.925);
  });
});

// ─────────────────────────────────────────────────────────────────────
// calcVehicles
// ─────────────────────────────────────────────────────────────────────
describe('calcVehicles', () => {
  it('[케이스 A] 2.888 CBM → 라보 1대 (물리 3.080 CBM ≥ 2.888)', () => {
    // 라보 물리 = 3.080 > 2.888 → ceil(2.888/3.080) = 1대
    const result = calcVehicles(2.888, [labo]);
    expect(result.assignments[0].vehicle.id).toBe('labo');
    expect(result.assignments[0].count).toBe(1);
    expect(result.unassignedCBM).toBe(0);
  });

  it('[케이스 C] 20.925 CBM → 1.4톤 3대', () => {
    // 1.4톤 물리 = 8.928 → ceil(20.925/8.928) = ceil(2.344) = 3대
    const result = calcVehicles(20.925, [truck1_4t]);
    expect(result.assignments[0].vehicle.id).toBe('truck_1_4t');
    expect(result.assignments[0].count).toBe(3);
    expect(result.unassignedCBM).toBe(0);
  });

  it('번치박스 80개(0.694 CBM) → 다마스 1대', () => {
    // 다마스 물리 1.936 > 0.694 → 1대로 충분
    const cbm = calcTotalCBM([{ boxType: bunchBox, quantity: 80 }]);
    const result = calcVehicles(cbm, [damas]);
    expect(result.assignments[0].count).toBe(1);
    expect(result.unassignedCBM).toBe(0);
  });

  it('단일 차종(1톤 탑): ceil(2.884 / 7.344) = 1대', () => {
    // 1톤 탑 물리 = 7.344 > 2.884 → 1대
    const result = calcVehicles(2.884, [truck1t]);
    expect(result.assignments[0].vehicle.id).toBe('truck_1t');
    expect(result.assignments[0].count).toBe(1);
    expect(result.unassignedCBM).toBe(0);
  });

  it('최적 차종 선택: 스타리아+다마스 10 CBM → 다마스가 적재율 높아 1순위', () => {
    // 다마스 유효 = 1.6456 → ceil(10/1.6456) = 7대, loadRate ≈ 86.81%
    // 스타리아 유효 = 4.9504 → ceil(10/4.9504) = 3대, loadRate ≈ 67.33%
    // → 다마스가 적재율 높으므로 assignments[0]
    const result = calcVehicles(10, [starria, damas]);
    expect(result.assignments[0].vehicle.id).toBe('damas');
    expect(result.assignments[0].count).toBe(7);
    expect(result.assignments[1].vehicle.id).toBe('starria');
    expect(result.assignments[1].count).toBe(3);
    expect(result.unassignedCBM).toBe(0);
  });

  it('최적 차종 선택: 1톤탑+다마스 8 CBM → 다마스가 적재율 높아 1순위', () => {
    // 다마스 유효 = 1.6456 → ceil(8/1.6456) = 5대, loadRate ≈ 97.23%
    // 1톤 탑 유효 = 6.2424 → ceil(8/6.2424) = 2대, loadRate ≈ 64.08%
    // → 다마스가 적재율 높으므로 assignments[0]
    const result = calcVehicles(8, [truck1t, damas]);
    expect(result.assignments[0].vehicle.id).toBe('damas');
    expect(result.assignments[0].count).toBe(5);
    expect(result.assignments[1].vehicle.id).toBe('truck_1t');
    expect(result.assignments[1].count).toBe(2);
    expect(result.unassignedCBM).toBe(0);
  });

  it('적재율: 0 < loadRate ≤ 100', () => {
    const result = calcVehicles(2.888, [labo]);
    result.assignments.forEach(a => {
      expect(a.loadRate).toBeGreaterThan(0);
      expect(a.loadRate).toBeLessThanOrEqual(100);
    });
  });

  it('차량 미선택 → 빈 결과', () => {
    const result = calcVehicles(2.884, []);
    expect(result.assignments).toHaveLength(0);
    expect(result.totalVehicles).toBe(0);
  });

  it('totalCBM = 0 → 빈 결과', () => {
    const result = calcVehicles(0, [truck1t]);
    expect(result.assignments).toHaveLength(0);
  });
});
