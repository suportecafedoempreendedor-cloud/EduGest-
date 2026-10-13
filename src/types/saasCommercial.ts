import { SchoolPlan } from './index';

export type SubscriptionState =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'suspended'
  | 'cancelled';

export type BillingPeriod = 'mensal' | 'trimestral' | 'anual';

export type SystemModuleKey =
  | 'academic-structure'
  | 'pedagogical'
  | 'attendance'
  | 'students'
  | 'financial'
  | 'crm'
  | 'guardian-portal'
  | 'edugest-ai'
  | 'relatorios_avancados'
  | 'api_multicaixa'
  | 'auditoria_avancada';

export interface SaaSPlan {
  id: string;
  nome: 'Start' | 'Professional' | 'Enterprise' | string;
  codigo: string;
  precoKz: number;
  periodicidade: BillingPeriod;
  limiteAlunos: number; // -1 = ilimitado
  limiteUtilizadores: number; // -1 = ilimitado
  modulosDisponiveis: SystemModuleKey[];
  recursos: string[];
  ativo: boolean;
  descricao?: string;
  badge?: string;
  destaque?: boolean;
}

export type SubscriptionEventType =
  | 'criacao'
  | 'trial_iniciado'
  | 'trial_estendido'
  | 'fatura_emitida'
  | 'pagamento_confirmado'
  | 'mudanca_plano'
  | 'aviso_vencimento'
  | 'past_due'
  | 'bloqueio_nivel_1'
  | 'suspensao'
  | 'reactivacao'
  | 'cancelamento';

export interface SubscriptionHistoryEvent {
  id: string;
  data: string; // YYYY-MM-DD HH:mm
  tipo: SubscriptionEventType;
  descricao: string;
  valorKz?: number;
  estado?: 'pago' | 'pendente' | 'anulado';
  referenciaMulticaixa?: string;
  autor?: string;
}

export interface SaaSSubscription {
  id: string;
  escolaId: string;
  escolaNome: string;
  escolaNif?: string;
  escolaProvincia?: string;
  escolaEmail?: string;
  planoId: string;
  planoNome: string;
  estado: SubscriptionState;
  dataInicial: string; // YYYY-MM-DD
  dataRenovacao: string; // YYYY-MM-DD
  valorKz: number;
  periodicidade: BillingPeriod;
  diasTrialConfigurados?: number;
  dataFimTrial?: string;
  historico: SubscriptionHistoryEvent[];
  bloqueioNivel: 'nenhum' | 'aviso' | 'restrito_nivel_1' | 'bloqueio_total';
  ultimaReferenciaMulticaixa?: string;
  entidadeMulticaixa?: string;
  motivoCancelamento?: string;
}

export interface SaaSCommercialConfig {
  diasTrialPadrao: number; // Ex: 14 dias
  permitirExtensaoTrial: boolean;
  diasToleranciaPastDue: number; // Ex: 7 dias de aviso suave
  diasParaBloqueioNivel1: number; // Ex: 8-15 dias (restrição de novos alunos)
  diasParaSuspensaoTotal: number; // Ex: >15 dias (suspensão temporária)
  protegerDadosEscolares: boolean; // Sempre true (garantia de não exclusão)
  notificarPorEmail: boolean;
  permitirAutoReactivacao: boolean;
}
