/**
 * Motor Determinístico de Cálculo de Médias Académicas Oficiais de Angola
 * 
 * ATENÇÃO: Conforme instrução expressa e regulamento do MED, o cálculo de notas
 * e médias é 100% determinístico e matemático, SEM USO DE INTELIGÊNCIA ARTIFICIAL.
 */

import { RegraCalculoMedia } from '../types/academicModule';

export function calcularMediaTrimestral(
  mac: number,
  npp: number,
  npt: number,
  regra: RegraCalculoMedia
): number {
  let mediaBruta = 0;

  if (regra.formula === 'ponderada_oficial_med') {
    // Fómula oficial do MED Angola: 30% MAC + 30% NPP + 40% NPT
    mediaBruta = mac * regra.pesoMac + npp * regra.pesoNpp + npt * regra.pesoNpt;
  } else if (regra.formula === 'aritmetica_simples') {
    mediaBruta = (mac + npp + npt) / 3;
  } else if (regra.formula === 'duas_provas_e_mac') {
    mediaBruta = (mac + (npp + npt) / 2) / 2;
  } else {
    // Fallback padrão
    mediaBruta = mac * 0.3 + npp * 0.3 + npt * 0.4;
  }

  if (regra.arredondamento === 'truncar') {
    return Math.floor(mediaBruta * 10) / 10;
  } else if (regra.arredondamento === 'para_cima') {
    return Math.ceil(mediaBruta * 10) / 10;
  }

  // Padrão: 1 casa decimal
  return Math.round(mediaBruta * 10) / 10;
}

export function classificarAproveitamento(media: number): {
  classificacao: string;
  corBadge: string;
  aprovado: boolean;
} {
  if (media >= 16) {
    return { classificacao: 'Excelente / Quadro de Honra', corBadge: 'emerald', aprovado: true };
  } else if (media >= 14) {
    return { classificacao: 'Bom Aproveitamento', corBadge: 'blue', aprovado: true };
  } else if (media >= 10) {
    return { classificacao: 'Suficiente / Aprovado', corBadge: 'teal', aprovado: true };
  } else if (media >= 7) {
    return { classificacao: 'Medíocre / Em Risco', corBadge: 'amber', aprovado: false };
  } else {
    return { classificacao: 'Mau / Reprovado', corBadge: 'rose', aprovado: false };
  }
}
