/**
 * Tipos e Interfaces do Módulo Financeiro Escolar EduGest Angola
 * 
 * Cobre:
 * - 12 Tipos de cobrança oficiais (Propina, Matrícula, Confirmação, Folha de prova, Exame,
 *   Uniforme, Cartão, Transporte, Alimentação, Multa, Actividade, Outros)
 * - Tabela de preços configurável por escola / classe / curso
 * - Regras de cobrança, multas automáticas e juros de mora (tolerâncias angolanas)
 * - Descontos, Bolsas de estudo (INAGBE, Mérito, Família numerosa) e Isenções
 * - Planos de pagamento flexíveis (Mensal, Trimestral, Anual, Fraccionado)
 * - Conta corrente do aluno (Débitos, Créditos, Pagamentos, Saldo cumulativo, Vencimentos,
 *   Estados: Pendente, Parcialmente pago, Pago, Vencido, Cancelado)
 * - Relatórios financeiros analíticos
 */

export type TipoCobranca =
  | 'propina'
  | 'matricula'
  | 'confirmacao_matricula'
  | 'folha_prova'
  | 'exame'
  | 'uniforme'
  | 'cartao'
  | 'transporte'
  | 'alimentacao'
  | 'multa'
  | 'actividade'
  | 'outros';

export type EstadoLancamentoConta =
  | 'pendente'
  | 'parcialmente_pago'
  | 'pago'
  | 'vencido'
  | 'cancelado';

export type PeriodicidadeCobranca = 'unica' | 'mensal' | 'trimestral' | 'anual' | 'por_evento';

export interface ItemTabelaPreco {
  id: string;
  escolaId: string;
  tipoCobranca: TipoCobranca;
  nome: string;
  descricao?: string;
  valorBaseKz: number;
  periodicidade: PeriodicidadeCobranca;
  classesAplicaveis: string[]; // ex: ['Todas'] ou ['10ª Classe', '11ª Classe']
  cursosAplicaveis?: string[];
  mesesVigencia?: number[]; // [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7] (calendário MED Angola)
  diaVencimentoPadrao: number; // ex: 10 de cada mês
  activo: boolean;
}

export type TipoRegraMulta = 'percentagem_fixa' | 'valor_fixo' | 'juros_diarios_pos_tolerancia';

export interface RegraCobrancaMulta {
  id: string;
  escolaId: string;
  nome: string;
  diasTolerancia: number; // ex: 5 dias após o vencimento (dia 10 -> até dia 15 sem multa)
  tipoMulta: TipoRegraMulta;
  valorPercentualMulta: number; // ex: 10%
  valorFixoMultaKz: number; // ex: 2500 Kz
  jurosDiariosPercentual?: number; // ex: 0.2% ao dia após tolerância
  limiteMaximoMultaPercentual?: number; // ex: 30% do valor base
  descricao: string;
  activa: boolean;
}

export type TipoBeneficio = 'desconto' | 'bolsa' | 'isencao';
export type CategoriaBeneficio =
  | 'irmaos_familia'
  | 'merito_academico'
  | 'bolsa_inagbe'
  | 'filho_funcionario'
  | 'pagamento_antecipado'
  | 'vulnerabilidade_social'
  | 'outros';

export interface BeneficioRegra {
  id: string;
  escolaId: string;
  nome: string;
  tipo: TipoBeneficio;
  categoria: CategoriaBeneficio;
  descricao: string;
  percentualDesconto?: number; // ex: 15% para 2º irmão, 100% para bolsa integral
  valorFixoDescontoKz?: number;
  tiposCobrancaAplicaveis: TipoCobranca[]; // normalmente ['propina']
  requisitoMinimoMedia?: number; // ex: >= 14 valores para mérito
  entidadeFinanciadora?: string; // ex: 'INAGBE', 'Empresa Patrocinadora', 'Fundo Interno'
  activa: boolean;
}

export interface PlanoPagamento {
  id: string;
  escolaId: string;
  nome: string;
  descricao: string;
  numeroParcelas: number; // ex: 10 parcelas (Setembro a Junho)
  descontoAplicavelPercentual?: number; // ex: 5% pagamento adiantado do ano lectivo
  diaVencimento: number;
  activo: boolean;
}

/**
 * Lançamento individual na Conta Corrente do Aluno
 */
export interface LancamentoContaCorrente {
  id: string;
  escolaId: string;
  studentId: string;
  studentNome: string;
  studentProcesso: string;
  turmaNome: string;
  anoLectivo: string;
  
  tipoCobranca: TipoCobranca;
  titulo: string;
  mesReferencia?: string; // ex: 'Outubro 2026'
  
  dataEmissao: string; // YYYY-MM-DD
  dataVencimento: string; // YYYY-MM-DD
  
  // Valores em Kwanzas (Kz)
  valorOriginalKz: number;
  valorDescontoBolsaKz: number;
  beneficioAplicadoNome?: string;
  valorMultaKz: number;
  valorTotalDevidoKz: number;
  valorPagoKz: number;
  saldoDevedorKz: number; // valorTotalDevidoKz - valorPagoKz
  
  estado: EstadoLancamentoConta;
  
  // Histórico de liquidações vinculadas
  recibosVinculados?: {
    pagamentoId: string;
    reciboNumero: string;
    dataPagamento: string;
    valorLiquidadoKz: number;
    metodo: string;
  }[];
  
  observacoes?: string;
}

/**
 * Resumo Consolidado da Conta Corrente de um Aluno
 */
export interface ResumoContaCorrenteAluno {
  studentId: string;
  studentNome: string;
  studentProcesso: string;
  turmaNome: string;
  classe: string;
  totalDebitosKz: number;
  totalCreditosPagosKz: number;
  totalMultasKz: number;
  totalDescontosKz: number;
  saldoActualKz: number; // Saldo devedor total pendente
  totalItensPendentes: number;
  totalItensVencidos: number;
  totalItensPagos: number;
  estadoGeral: 'regularizada' | 'com_pendencias' | 'em_atraso_critico';
  lancamentos: LancamentoContaCorrente[];
}

/**
 * Filtros para os Relatórios Financeiros
 */
export interface FiltrosRelatorioFinanceiro {
  anoLectivo: string;
  tipoCobranca: TipoCobranca | 'todos';
  estado: EstadoLancamentoConta | 'todos';
  turmaId: string | 'todas';
  periodoInicio?: string;
  periodoFim?: string;
  searchTerm?: string;
}
