import type { VehicleCalcResult } from './types';

function datestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

export async function exportToExcel(result: VehicleCalcResult): Promise<void> {
  const XLSX = await import('xlsx');

  const header = ['차종', '대수', '적재량(CBM)', '적재율(%)', '여유 공간(CBM)'];

  const rows = result.assignments.map(a => [
    a.vehicle.name,
    a.count,
    a.usedCBM,
    a.loadRate,
    a.remainingCBM,
  ]);

  const summary = [
    [],
    ['총 CBM (m³)', result.totalCBM],
    ['총 차량 대수', result.totalVehicles],
    ['미배정 CBM', result.unassignedCBM],
  ];

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows, ...summary]);
  ws['!cols'] = [{ wch: 10 }, { wch: 6 }, { wch: 14 }, { wch: 10 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '배차 결과');
  XLSX.writeFile(wb, `배차결과_${datestamp()}.xlsx`);
}
