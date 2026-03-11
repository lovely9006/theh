import type { BoxType, VehicleType } from './types';

// 적재 효율 (실제 사용 가능 부피 = CBM × 이 값)
export const LOAD_EFFICIENCY = 0.85;

// ─── 박스 종류 (CBM = L×W×H mm → m³) ─────────────────────────
export const BOX_TYPES: BoxType[] = [
  {
    id: 'subscription',
    name: '구독박스',
    length: 380,
    width: 190,
    height: 200,
    cbm: (380 * 190 * 200) / 1e9, // 0.01444
  },
  {
    id: 'bunch',
    name: '번치박스',
    length: 310,
    width: 140,
    height: 200,
    cbm: (310 * 140 * 200) / 1e9, // 0.00868
  },
  {
    id: 'cube',
    name: '큐브박스',
    length: 400,
    width: 360,
    height: 200,
    cbm: (400 * 360 * 200) / 1e9, // 0.02880
  },
  {
    id: 'block',
    name: '블록박스',
    length: 465,
    width: 300,
    height: 300,
    cbm: (465 * 300 * 300) / 1e9, // 0.04185
  },
];

// ─── 차량 종류 (가로×세로×높이 mm → CBM, 효율 적용 전) ─────────
// | ID | 이름    | 가로 | 세로 | 높이 | CBM   |
// |  1 | 다마스  | 1100 | 1600 | 1100 | 1.936 |
// |  2 | 라보    | 1400 | 2200 | 1000 | 3.080 |
// |  3 | 스타리아| 1600 | 2600 | 1400 | 5.824 |
// |  4 | 1톤 탑  | 1600 | 2700 | 1700 | 7.344 |
// |  5 | 1.4톤  | 1600 | 3100 | 1800 | 8.928 |
export const VEHICLE_TYPES: VehicleType[] = [
  {
    id: 'damas',
    name: '다마스',
    width: 1100, length: 1600, height: 1100,
    cbm: (1100 * 1600 * 1100) / 1e9, // 1.936
  },
  {
    id: 'labo',
    name: '라보',
    width: 1400, length: 2200, height: 1000,
    cbm: (1400 * 2200 * 1000) / 1e9, // 3.080
  },
  {
    id: 'starria',
    name: '스타리아',
    width: 1600, length: 2600, height: 1400,
    cbm: (1600 * 2600 * 1400) / 1e9, // 5.824
  },
  {
    id: 'truck_1t',
    name: '1톤 탑',
    width: 1600, length: 2700, height: 1700,
    cbm: (1600 * 2700 * 1700) / 1e9, // 7.344
  },
  {
    id: 'truck_1_4t',
    name: '1.4톤',
    width: 1600, length: 3100, height: 1800,
    cbm: (1600 * 3100 * 1800) / 1e9, // 8.928
  },
];
