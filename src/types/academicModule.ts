/**
 * Tipos e Interfaces do Módulo Académico & Pedagógico Oficial EduGest Angola
 * 
 * Em estrita consonância com o Sistema de Avaliação das Aprendizagens do
 * Ministério da Educação da República de Angola (MED).
 * 
 * Abrange:
 * - Períodos lectivos e estados de bloqueio (aberto, submetido, em revisão, bloqueado)
 * - Tipos de avaliação oficiais (MAC, NPP, NPT, Exame Final, Recurso)
 * - Estados de fluxo de notas (Rascunho, Submetida, Aprovada, Rejeitada, Bloqueada)
 * - Regra rigorosa: Professor não pode alterar nota aprovada sem autorização formal
 * - Histórico completo de auditoria de alterações de notas
 * - Fórmulas de cálculo de médias determinísticas e configuráveis (sem IA)
 * - Pautas por turma, boletins digitais e relatórios de aproveitamento
 */

export type TipoAvaliacao = 'MAC' | 'NPP' | 'NPT' | 'EXAME' | 'RECURSO';

export type EstadoPeriodo = 'aberto' | 'em_revisao' | 'bloqueado' | 'encerrado';

export type EstadoAprovacaoNota =
  | 'rascunho'
  | 'submetida'
  | 'aprovada'
  | 'rejeitada';

export interface PeriodoLectivoConfig {
  id: string;
  escolaId: string;
  anoLectivo: string; // Ex: '2025/2026'
  trimestre: 1 | 2 | 3;
  nome: string; // Ex: '1º Trimestre Lectivo'
  dataInicio: string;
  dataFim: string;
  dataLimiteLancamentoProfessor: string; // Data limite para o docente submeter
  estado: EstadoPeriodo;
  bloqueadoPor?: string; // Nome do coordenador que bloqueou
  dataBloqueio?: string;
  observacoes?: string;
}

export type FormulaMediaTrimestral =
  | 'aritmetica_simples' // (MAC + NPP + NPT) / 3
  | 'ponderada_oficial_med' // (MAC * 0.3) + (NPP * 0.3) + (NPT * 0.4)
  | 'duas_provas_e_mac'; // (MAC + ((NPP + NPT) / 2)) / 2

export interface RegraCalculoMedia {
  id: string;
  escolaId: string;
  nome: string;
  formula: FormulaMediaTrimestral;
  pesoMac: number; // Ex: 0.3 ou 33.3%
  pesoNpp: number; // Ex: 0.3 ou 33.3%
  pesoNpt: number; // Ex: 0.4 ou 33.3%
  notaMinimaAprovacao: number; // Ex: 10 valores (escala 0 a 20)
  notaExcelente: number; // Ex: 16 valores
  arredondamento: 'padrao' | 'truncar' | 'para_cima';
  descricao: string;
}

export interface HistoricoAlteracaoNota {
  id: string;
  notaId: string;
  alunoId: string;
  alunoNome: string;
  disciplina: string;
  trimestre: 1 | 2 | 3;
  campoAlterado: 'mac' | 'npp' | 'npt' | 'mt' | 'estado';
  valorAnterior: number | string;
  valorNovo: number | string;
  autorId: string;
  autorNome: string;
  autorPapel: 'professor' | 'coordenador' | 'director_pedagogico';
  motivoJustificacao: string;
  autorizacaoCoordenacaoId?: string;
  autorizadoPor?: string;
  dataHora: string;
}

export interface NotaAcademicaCompleta {
  id: string;
  escolaId: string;
  alunoId: string;
  alunoNome: string;
  alunoProcesso: string;
  turmaId: string;
  turmaNome: string;
  classe: string;
  disciplinaId: string;
  disciplinaNome: string;
  professorId: string;
  professorNome: string;
  trimestre: 1 | 2 | 3;
  anoLectivo: string;

  // Avaliações elementares (0 a 20)
  mac: number; // Média de Avaliação Contínua
  npp: number; // Nota da Prova do Professor
  npt: number; // Nota da Prova Trimestral
  mt: number; // Média Trimestral calculada deterministicamente

  // Fluxo de Coordenação
  estado: EstadoAprovacaoNota;
  dataLancamento: string;
  dataSubmissao?: string;
  dataAprovacao?: string;
  aprovadoPor?: string;
  motivoRejeicao?: string;
  bloqueadaParaEdicao: boolean;

  // Auditoria
  quantidadeAlteracoes: number;
  ultimaAlteracao?: string;
}

export interface TurmaAtribuidaProfessor {
  turmaId: string;
  turmaNome: string;
  classe: string;
  curso: string;
  disciplinaId: string;
  disciplinaNome: string;
  totalAlunos: number;
}
