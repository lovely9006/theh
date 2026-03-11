import type { BoxType, VehicleType } from './types';

// 적재 효율 (실제 사용 가능 부피 = CBM × 이 값)
export const LOAD_EFFICIENCY = 0.85;

// ─── 박스 종류 (CBM = L×W×H mm → m³) ─────────────────────────
// 케이스 검증:
//   구독박스 200개  = 200 × 0.01444 = 2.888 CBM  (케이스 A)
//   번치박스  50개  =  50 × 0.00868 = 0.434 CBM  (케이스 B)
//   큐브박스  30개  =  30 × 0.02880 = 0.864 CBM  (케이스 B)
//   블록박스  20개  =  20 × 0.04185 = 0.837 CBM  (케이스 B)
//   블록박스 500개  = 500 × 0.04185 = 20.925 CBM (케이스 C)
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

// ─── 차량 종류 (총 적재 가능 부피, 효율 적용 전) ──────────────
// 라보  2.21 CBM → 유효 1.879 → 케이스 A: ceil(2.888/1.879) = 2대
// 2톤  12.65 CBM → 유효 10.753 → 케이스 C: ceil(20.925/10.753) = 2대
export const VEHICLE_TYPES: VehicleType[] = [
  { id: 'damas',     name: '다마스', cbm: 0.7   },
  { id: 'labo',      name: '라보',   cbm: 2.21  },
  { id: 'truck_1t',  name: '1톤',    cbm: 4.5   },
  { id: 'truck_2t',  name: '2톤',    cbm: 12.65 },
  { id: 'truck_5t',  name: '5톤',    cbm: 20.0  },
  { id: 'truck_11t', name: '11톤',   cbm: 42.0  },
];
