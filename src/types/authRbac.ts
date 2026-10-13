/**
 * Sistema Completo de Autenticação, Perfis RBAC, Departamentos e Permissões
 * EduGest Angola - SaaS Multi-Tenant para Instituições de Ensino
 */

export type AppUserRole =
  | 'super_admin'        // Administrador Global do SaaS
  | 'school_admin'       // Director Geral / Administrador da Instituição
  | 'rh'                 // Recursos Humanos
  | 'secretaria'         // Secretaria Geral e Matrículas
  | 'financeiro'         // Tesouraria e Finanças
  | 'coordenacao'        // Coordenação Pedagógica / Direcção Académica
  | 'professor'          // Corpo Docente
  | 'guardian'           // Encarregado de Educação
  | 'student'            // Aluno
  | 'crm';               // Gestor Comercial / Admissões

export type DepartmentCode =
  | 'direccao_geral'
  | 'recursos_humanos'
  | 'secretaria_academica'
  | 'administracao_financeira'
  | 'coordenacao_pedagogica'
  | 'corpo_docente'
  | 'admissoes_crm'
  | 'servicos_gerais'
  | 'tecnologia_informacao';

export interface DepartmentInfo {
  id: string;
  code: DepartmentCode;
  nome: string;
  sigla: string;
  descricao: string;
  responsavelNome: string;
  totalColaboradores: number;
  cor: string;
  modulosPermitidosPadrao: string[];
}

export type PermissionAction =
  | 'consultar'
  | 'criar'
  | 'editar'
  | 'aprovar'
  | 'anular'
  | 'exportar'
  | 'gerir_utilizadores'
  | 'gerir_configuracoes';

export type RbacModuleKey =
  | 'saas_global'
  | 'dashboard_escola'
  | 'recursos_humanos'
  | 'secretaria'
  | 'financeiro'
  | 'academico'
  | 'crm'
  | 'portal_encarregado'
  | 'portal_aluno'
  | 'portal_professor'
  | 'comunicacao'
  | 'documentos_relatorios'
  | 'seguranca_auditoria';

export type SystemModuleKey = RbacModuleKey;

export interface ModulePermission {
  module: RbacModuleKey;
  actions: PermissionAction[];
}

/**
 * Sub-acções operacionais granulares do sistema
 */
export type RbacSubActionKey =
  // Académico & Pedagógico
  | 'lancar_nota'
  | 'editar_nota'
  | 'aprovar_nota'
  | 'rejeitar_nota'
  | 'bloquear_periodo'
  | 'alterar_nota_aprovada'
  | 'publicar_pauta'
  // Financeiro & Tesouraria
  | 'aprovar_pagamento'
  | 'emitir_recibo'
  | 'aplicar_desconto'
  | 'anular_cobranca'
  | 'renegociar_propina'
  | 'fechar_caixa'
  // Documentos & Relatórios
  | 'exportar_relatorio'
  | 'emitir_declaracao'
  | 'emitir_certificado'
  | 'configurar_templates'
  | 'exportar_backup_seguranca'
  // Secretaria & Alunos
  | 'matricular_aluno'
  | 'transferir_turma'
  | 'suspender_aluno'
  | 'aceder_dados_sensiveis'
  // Recursos Humanos
  | 'admitir_colaborador'
  | 'processar_salario'
  | 'validar_assiduidade'
  | 'aprovar_ferias'
  | 'registar_processo_disciplinar'
  | 'exportar_relatorio_rh'
  // CRM & Comunicações
  | 'converter_lead'
  | 'enviar_comunicado_massa';

export type SubActionRiskLevel = 'baixo' | 'medio' | 'alto' | 'critico';

export interface SubActionDefinition {
  key: RbacSubActionKey;
  nome: string;
  descricao: string;
  modulo: RbacModuleKey;
  categoria: 'Académico' | 'Financeiro' | 'Documentos' | 'Secretaria' | 'RH' | 'CRM';
  nivelRisco: SubActionRiskLevel;
  requerJustificativo?: boolean;
  regraAuditoria?: string;
}

export interface DepartmentRolePolicy {
  id: string;
  tipoAlvo: 'departamento' | 'cargo' | 'role';
  alvoId: string;
  alvoNome: string;
  descricao?: string;
  subActionsPermitidas: RbacSubActionKey[];
  dataActualizacao: string;
  actualizadoPor: string;
}

export interface AuthUser {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  bi?: string;
  foto?: string;
  role: AppUserRole;
  cargo: string;
  departamentoId?: string;
  departamentoNome?: string;
  
  // Multi-Tenant Isolation
  escolaId?: string;        // null apenas se for super_admin puro
  escolaNome?: string;
  escolasAutorizadas?: { id: string; nome: string; role: AppUserRole }[]; // Para utilizadores com acesso a múltiplas escolas
  
  // Estado da Conta
  activo: boolean;
  bloqueado: boolean;
  motivoBloqueio?: string;
  ultimoAcesso?: string;
  dataCriacao: string;
  
  // Matriz de Permissões Granulares
  modulosAutorizados: SystemModuleKey[];
  permissoes: ModulePermission[];

  // Sub-acções operacionais específicas atribuídas directamente ao utilizador
  subActionsCustomizadas?: RbacSubActionKey[];
  subActionsRevogadas?: RbacSubActionKey[];
  
  // Vinculações específicas
  alunoId?: string;         // Se role === 'student'
  alunoProcesso?: string;
  guardianId?: string;      // Se role === 'guardian'
  educandosIds?: string[];  // IDs dos alunos associados ao encarregado
  professorId?: string;     // Se role === 'professor'
  turmasAtribuidasIds?: string[]; // IDs das turmas que lecciona
}

export interface PasswordResetRequest {
  id: string;
  email: string;
  token: string;
  expiraEm: string;
  utilizado: boolean;
  dataPedido: string;
}

export interface InstitutionUserInvite {
  id: string;
  escolaId: string;
  escolaNome: string;
  nome: string;
  email: string;
  role: AppUserRole;
  departamentoId: string;
  cargo: string;
  convidadoPor: string;
  dataEnvio: string;
  estado: 'pendente' | 'aceite' | 'expirado';
}
