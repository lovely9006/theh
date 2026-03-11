import { calcTotalCBM, calcVehicles } from '../lib/calculations';
import { BOX_TYPES, VEHICLE_TYPES } from '../lib/constants';

const subscriptionBox = BOX_TYPES.find(b => b.id === 'subscription')!; // 0.01444 m³
const bunchBox        = BOX_TYPES.find(b => b.id === 'bunch')!;        // 0.00868 m³
const cubeBox         = BOX_TYPES.find(b => b.id === 'cube')!;         // 0.02880 m³
const blockBox        = BOX_TYPES.find(b => b.id === 'block')!;        // 0.04185 m³

const damas    = VEHICLE_TYPES.find(v => v.id === 'damas')!;           // 0.7 CBM
const labo     = VEHICLE_TYPES.find(v => v.id === 'labo')!;            // 2.21 CBM
const truck1t  = VEHICLE_TYPES.find(v => v.id === 'truck_1t')!;        // 4.5 CBM
const truck2t  = VEHICLE_TYPES.find(v => v.id === 'truck_2t')!;        // 12.65 CBM
const truck5t  = VEHICLE_TYPES.find(v => v.id === 'truck_5t')!;        // 20.0 CBM

// ─────────────────────────────────────────────────────────────────────
// calcTotalCBM — 박스 CBM 합산
// ─────────────────────────────────────────────────────────────────────
describe('calcTotalCBM', () => {
  it('구독박스 100개 + 큐브박스 50개 → 2.884 CBM', () => {
    // 구독박스: 380×190×200mm = 0.01444 m³ × 100 = 1.444
    // 큐브박스: 400×360×200mm = 0.02880 m³ × 50 = 1.440
    // 합계: 2.884 CBM
    const result = calcTotalCBM([
      { boxType: subscriptionBox, quantity: 100 },
      { boxType: cubeBox,         quantity: 50  },
    ]);
    expect(result).toBe(2.884);
  });

  it('단일 박스 → 정확한 CBM (round3 적용)', () => {
    expect(calcTotalCBM([{ boxType: subscriptionBox, quantity: 1 }])).toBe(0.014); // 0.01444 → round3
    expect(calcTotalCBM([{ boxType: bunchBox,        quantity: 1 }])).toBe(0.009); // 0.00868 → round3
    expect(calcTotalCBM([{ boxType: cubeBox,         quantity: 1 }])).toBe(0.029); // 0.02880 → round3
    expect(calcTotalCBM([{ boxType: blockBox,        quantity: 1 }])).toBe(0.042); // 0.04185 → round3
  });

  it('빈 배열 → 0', () => {
    expect(calcTotalCBM([])).toBe(0);
  });

  // ── 3가지 검증 케이스 ──────────────────────────────────────────────

  it('[케이스 A] 구독박스 200개 → 2.888 CBM', () => {
    // 200 × 0.01444 = 2.888
    const result = calcTotalCBM([{ boxType: subscriptionBox, quantity: 200 }]);
    expect(result).toBe(2.888);
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
    const result = calcTotalCBM([{ boxType: blockBox, quantity: 500 }]);
    expect(result).toBe(20.925);
  });
});

// ─────────────────────────────────────────────────────────────────────
// calcVehicles — 배차 계산
// ─────────────────────────────────────────────────────────────────────
describe('calcVehicles', () => {
  it('[케이스 A] 2.888 CBM → 라보 2대', () => {
    // 라보 유효CBM = 2.21 × 0.85 = 1.8785
    // ceil(2.888 / 1.8785) = ceil(1.537) = 2대
    const result = calcVehicles(2.888, [labo]);
    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].vehicle.id).toBe('labo');
    expect(result.assignments[0].count).toBe(2);
    expect(result.unassignedCBM).toBe(0);
  });

  it('[케이스 C] 20.925 CBM → 2톤 2대', () => {
    // 2톤 유효CBM = 12.65 × 0.85 = 10.7525
    // ceil(20.925 / 10.7525) = ceil(1.946) = 2대
    const result = calcVehicles(20.925, [truck2t]);
    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].vehicle.id).toBe('truck_2t');
    expect(result.assignments[0].count).toBe(2);
    expect(result.unassignedCBM).toBe(0);
  });

  it('단일 차종(1톤): ceil(2.884 / 3.825) = 1대', () => {
    // 1톤 유효CBM = 4.5 × 0.85 = 3.825
    const result = calcVehicles(2.884, [truck1t]);
    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].vehicle.id).toBe('truck_1t');
    expect(result.assignments[0].count).toBe(1);
    expect(result.unassignedCBM).toBe(0);
  });

  it('혼합 배차: 5톤 우선 → 나머지 다마스로 보완', () => {
    // totalCBM = 10
    // 5톤 유효CBM = 17  → floor(10/17) = 0 → 건너뜀
    // 다마스 물리CBM = 0.7 → ceil(10/0.7) = 15대 (물리 용량 기준)
    const result = calcVehicles(10, [truck5t, damas]);
    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].vehicle.id).toBe('damas');
    expect(result.assignments[0].count).toBe(15);
    expect(result.unassignedCBM).toBe(0);
  });

  it('혼합 배차: 1톤 + 다마스 → 대형 먼저, 소형 보완', () => {
    // totalCBM = 5
    // 1톤 유효CBM = 3.825  → floor(5/3.825) = 1대, 잔여 1.175
    // 다마스 유효CBM = 0.595 → ceil(1.175/0.595) = 2대
    const result = calcVehicles(5, [truck1t, damas]);
    expect(result.assignments[0].vehicle.id).toBe('truck_1t');
    expect(result.assignments[0].count).toBe(1);
    expect(result.assignments[1].vehicle.id).toBe('damas');
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
