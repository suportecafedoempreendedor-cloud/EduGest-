/**
 * Utilitários para Exportação de Relatórios (Excel/CSV, PDF/Print) e Interpolação de Templates
 * Compatível com Microsoft Excel (UTF-8 BOM) e Normas da República de Angola
 */

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  // UTF-8 BOM para garantir acentos perfeitos no Microsoft Excel
  const BOM = '\uFEFF';

  const formatCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(formatCell).join(';'),
    ...rows.map((row) => row.map(formatCell).join(';')),
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrint(): void {
  window.print();
}

export function interpolateTemplateText(
  text: string,
  variables: Record<string, string | number | undefined | null>
): string {
  let result = text;
  Object.entries(variables).forEach(([key, val]) => {
    const placeholder = `{${key}}`;
    const replacement = val !== undefined && val !== null ? String(val) : '---';
    result = result.split(placeholder).join(replacement);
  });
  return result;
}

export function generateVerificationCode(prefix: string = 'EG-AUTH'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${part1}-AO-${part2}`;
}

export function formatarDataExtenso(dataStr: string): string {
  try {
    const data = new Date(dataStr);
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const dia = data.getDate();
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();
    return `${dia} de ${mes} de ${ano}`;
  } catch {
    return dataStr;
  }
}

export function formatarKz(valor: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(valor)
    .replace('AOA', 'Kz');
}
