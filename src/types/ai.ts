import { Student, Pagamento, NotaItem, Section, StudentAttendanceRecord, UserRole } from './index';

export type AssistantRole =
  | 'direcao'
  | 'financeiro'
  | 'academico'
  | 'aproveitamento'
  | 'assiduidade'
  | 'analise_financeira'
  | 'relatorios'
  | 'pesquisa';

export interface AssistantMetadata {
  id: AssistantRole;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  permissoesMinimas: UserRole[];
  sugestoesRapidas: string[];
}

export type AuthorizationStatus = 'pendente' | 'autorizado' | 'rejeitado' | 'executado';

export interface ActionAuthorizationProposal {
  id: string;
  tipo: 'alterar_nota' | 'confirmar_pagamento' | 'estornar_pagamento' | 'anular_matricula';
  descricao: string;
  detalhes: Record<string, any>;
  solicitante: string;
  dataHora: string;
  estado: AuthorizationStatus;
  requerPapel: UserRole[];
  motivoProposta: string;
  justificativaAutorizador?: string;
  autorizadoPor?: string;
  dataAutorizacao?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  role?: AssistantRole;
  text: string;
  timestamp: string;
  escolaId: string;
  escolaNome: string;
  
  // Security & Audit verification
  funcaoSeguraExecutada?: string;
  dadosRetornadosCount?: number;
  permissaoVerificada?: boolean;
  tempoProcessamentoMs?: number;

  // Rich UI payload
  tabelaDados?: {
    colunas: string[];
    linhas: Record<string, any>[];
    resumo?: string;
  };
  metricasChave?: {
    rotulo: string;
    valor: string | number;
    subtexto?: string;
    cor?: 'blue' | 'emerald' | 'amber' | 'red';
  }[];
  propostaAcao?: ActionAuthorizationProposal;
  avisoLegal?: string;
}

export interface SafeQueryFilters {
  escolaId: string;
  userRole: UserRole;
  anoLectivo?: string;
  termoBusca?: string;
  maxGrade?: number;
  minGrade?: number;
  minAbsencePct?: number;
  statusPropina?: 'em_dia' | 'pendente' | 'atrasado';
  turmaId?: string;
  disciplina?: string;
  categoriaDespesa?: string;
  mes?: string;
}

export interface OperationalExpense {
  id: string;
  escolaId: string;
  categoria: 'Salários & Remunerações' | 'Serviços Públicos (ENDE/EPAL)' | 'Manutenção & Infraestruturas' | 'Material Didáctico & Consumíveis' | 'Telecomunicações & TI' | 'Higiene & Segurança';
  descricao: string;
  valorKz: number;
  mesReferencia: string;
  dataVencimento: string;
  status: 'liquidado' | 'previsto';
}
