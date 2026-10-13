export type ViewMode =
  | 'landing'
  | 'login'
  | 'forgot-password'
  | 'dashboard'
  | 'institution-admin-rbac'
  | 'recursos-humanos'
  | 'accounting'
  | 'portal-aluno'
  | 'portal-professor'
  | 'edugest-ai'
  | 'academic-structure'
  | 'attendance'
  | 'pedagogical'
  | 'students'
  | 'financial'
  | 'documents-reports'
  | 'data-export-security'
  | 'crm'
  | 'guardian-portal'
  | 'design-system'
  | 'saas-dashboard'
  | 'saas-schools'
  | 'saas-commercial'
  | 'saas-onboarding'
  | 'saas-audit-logs';

export * from './ai';
export * from './saasCommercial';
export * from './documentsReports';
export * from './dataExportSecurity';
export * from './accountingFinance';
export * from './financialBilling';
export * from './academicModule';
export * from './authRbac';
export * from './humanResources';
export type { SystemModuleKey } from './saasCommercial';
export type { RbacModuleKey } from './authRbac';

export type UserRole = 'super_admin' | 'school_admin' | 'guardian';

export type SchoolState = 'trial' | 'activa' | 'suspensa' | 'cancelada';

export type SchoolPlan = 'Plano Básico' | 'Plano Pro' | 'Plano Enterprise' | 'Plano Governamental';

export interface School {
  id: string;
  nome: string;
  nomeComercial: string;
  nif: string; // Ex: '5418029412'
  logotipo?: string;
  provincia: string;
  municipio: string;
  morada: string;
  telefone: string;
  email: string;
  website: string;
  estado: SchoolState;
  plano: SchoolPlan;
  valorMensalKz: number;
  dataCriacao: string; // YYYY-MM-DD
  dataFimTrial?: string;
  // Administrador da Escola (Tenant Admin)
  adminNome: string;
  adminEmail: string;
  adminTelefone: string;
  // Estatísticas do Tenant
  totalAlunos: number;
  totalProfessores: number;
  anoLectivoActivo: string;
}

export interface AuditLog {
  id: string;
  dataHora: string;
  autorNome: string;
  autorEmail: string;
  acao: string;
  escolaId?: string;
  escolaNome?: string;
  detalhes: string;
  tipo: 'criacao' | 'edicao' | 'estado' | 'onboarding' | 'seguranca';
  ip?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface OnboardingFormState {
  // Passo 1: Dados da escola
  nome: string;
  nomeComercial: string;
  nif: string;
  provincia: string;
  municipio: string;
  morada: string;
  telefone: string;
  email: string;
  website: string;
  logotipo: string;

  // Passo 2: Administrador
  adminNome: string;
  adminEmail: string;
  adminTelefone: string;
  adminCargo: string;

  // Passo 3: Ano lectivo
  anoLectivo: string;
  dataInicio: string;
  dataFim: string;
  modeloTrimestral: boolean;

  // Passo 4: Classes e Ciclos
  ciclosSelecionados: string[];
  cursosOferecidos: string[];

  // Passo 5: Configurações
  plano: SchoolPlan;
  periodoTrialDias: number;
  limiteAlunos: number;
  notificacoesSms: boolean;
}

export type StudentState =
  | 'pre_inscrito'
  | 'inscrito'
  | 'activo'
  | 'suspenso'
  | 'transferido'
  | 'concluido'
  | 'inactivo';

export interface Student {
  id: string;
  numeroMatricula: string; // Ex: 'MAT-2025/1042'
  processo: string; // Ex: 'EG-2025/1042'
  nomeCompleto: string;
  fotografia?: string;
  dataNascimento: string; // YYYY-MM-DD
  sexo: 'M' | 'F';
  documentoIdentificacao: string; // Ex: '006458921LA042'
  tipoDocumento: 'BI' | 'Cédula' | 'Passaporte' | 'Outro';
  nacionalidade: string; // Ex: 'Angolana'
  morada: string;
  municipio?: string;
  provincia: string;
  contactos: {
    telefone: string;
    email?: string;
    whatsapp?: string;
  };
  telefone: string; // Alias de compatibilidade
  email?: string;
  estado: StudentState;
  escolaId: string;
  escolaNome: string;
  anoLectivo: string; // Ex: '2025/2026'
  classe: string; // Ex: '10ª Classe'
  turmaId: string;
  turmaNome: string;
  curso?: string;
  // Encarregado de educação principal (desnormalizado para consultas rápidas)
  encarregadoNome?: string;
  encarregadoContacto?: string;
  statusPropina?: 'em_dia' | 'pendente' | 'atrasado';
  mediaGeral?: number;
  dataCadastro?: string;
  observacoes?: string;
  bi: string; // Alias de compatibilidade com 'documentoIdentificacao'
  genero: 'M' | 'F'; // Alias de compatibilidade com 'sexo'
  foto?: string; // Alias de compatibilidade com 'fotografia'
}

export type GrauParentesco =
  | 'Pai'
  | 'Mãe'
  | 'Tio(a)'
  | 'Avô(ó)'
  | 'Irmão/ã'
  | 'Tutor Legal'
  | 'Outro';

export interface Guardian {
  id: string;
  nome: string;
  documento: string; // BI angolano ou Passaporte
  tipoDocumento: 'BI' | 'Passaporte' | 'Outro';
  telefone: string;
  telefoneAlternativo?: string;
  email: string;
  morada: string;
  profissao: string;
  grauParentescoPrincipal: GrauParentesco;
  escolaId?: string; // Escola de referência ou multiescola
  dataCadastro: string;
}

export interface GuardianStudentRelation {
  id: string;
  guardianId: string;
  studentId: string;
  grauParentesco: GrauParentesco;
  isPrincipal: boolean;
  autorizadoBuscarAluno: boolean;
  contactoEmergencia: boolean;
}

export interface HistoricoAcademico {
  id: string;
  studentId: string;
  anoLectivo: string;
  classe: string;
  escola: string;
  mediaFinal: number;
  resultado: 'Aprovado' | 'Transitou' | 'Retido' | 'Transferido';
  observacoes?: string;
}

export interface MatriculaRecord {
  id: string;
  studentId: string;
  numeroMatricula: string;
  anoLectivo: string;
  classe: string;
  turma: string;
  dataMatricula: string;
  responsavelRegisto: string;
  estado: 'Confirmada' | 'Pendente' | 'Anulada';
  reciboEmolumentos?: string;
}

export interface AssiduidadeRecord {
  id: string;
  studentId: string;
  mes: string;
  totalAulas: number;
  presencas: number;
  faltasJustificadas: number;
  faltasInjustificadas: number;
  percentagemFrequencia: number;
}

export interface ContaCorrenteItem {
  id: string;
  studentId: string;
  data: string;
  descricao: string;
  tipo: 'debito' | 'credito'; // debito = propina facturada, credito = pagamento efectuado
  valorKz: number;
  saldoAposKz: number;
  referenciaDoc?: string;
  metodo?: string;
  status: 'pago' | 'pendente' | 'em_atraso';
}

export interface DocumentoItem {
  id: string;
  studentId: string;
  titulo: string;
  tipo: 'BI' | 'Certificado' | 'Atestado Médico' | 'Fotografia' | 'Declaracao_Matricula' | 'Outro';
  dataEmissao: string;
  estado: 'Valido' | 'Pendente' | 'Caducado';
  tamanho: string;
  codigoVerificacao?: string;
}

export interface Turma {
  id: string;
  nome: string;
  ciclo: 'Primário' | 'Iº Ciclo' | 'IIº Ciclo';
  curso: string;
  sala: string;
  periodo: 'Manhã' | 'Tarde' | 'Noite';
  directorTurma: string;
  totalAlunos: number;
  capacidade: number;
}

export interface NotaItem {
  id: string;
  alunoId: string;
  alunoNome: string;
  disciplina: string;
  turmaId: string;
  trimestre: 1 | 2 | 3;
  mac: number; // Média de Avaliação Contínua (0 - 20)
  npp: number; // Nota de Prova do Professor (0 - 20)
  npt: number; // Nota de Prova Trimestral (0 - 20)
  mt: number;  // Média Trimestral
}

export interface Pagamento {
  id: string;
  reciboNumero: string;
  alunoId: string;
  alunoNome: string;
  turmaNome: string;
  mesReferencia: string;
  valorKz: number;
  metodo: 'Multicaixa Express' | 'TPA Balcão' | 'Transferência BAI' | 'Transferência BFA' | 'RUPE';
  referencia: string;
  dataPagamento: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
}

export interface StatKpi {
  label: string;
  value: string;
  subtext: string;
  trend?: string;
  isPositive?: boolean;
}

// ==========================================
// MÓDULO DE ESTRUTURA ACADÉMICA (MULTI-TENANT)
// ==========================================

export type AcademicYearState = 'planeamento' | 'activo' | 'encerrado';

export interface AcademicPeriod {
  id: string;
  nome: string; // Ex: '1º Trimestre', '2º Trimestre', '3º Trimestre'
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  estado: 'futuro' | 'decorrente' | 'concluido';
}

export interface AcademicYear {
  id: string;
  escolaId: string;
  nome: string; // Ex: '2025/2026'
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  estado: AcademicYearState;
  periodos: AcademicPeriod[];
  descricao?: string;
}

export type CicloEnsino =
  | 'Ensino Primário'
  | 'Iº Ciclo Secundário'
  | 'IIº Ciclo Geral'
  | 'IIº Ciclo Técnico Profissional'
  | 'Outro';

export interface SchoolClass {
  id: string;
  escolaId: string;
  nome: string; // Ex: '7ª Classe', '8ª Classe', '9ª Classe', '10ª Classe', '11ª Classe', '12ª Classe'
  codigo: string; // Ex: '7ª', '8ª', '10ª'
  ciclo: CicloEnsino;
  curso?: string; // Ex: 'Ensino Geral', 'Ciências Físicas e Biológicas', 'Informática de Gestão'
  ordem: number; // Para ordenação sequencial
  estado: 'activa' | 'inactiva';
  descricao?: string;
}

export type TurnoType = 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
export type SectionState = 'Activa' | 'Inactiva' | 'Lotada' | 'Encerrada';

export interface Section {
  id: string;
  escolaId: string;
  classeId: string;
  classeNome: string;
  nome: string; // Ex: '10ª Classe A'
  anoLectivoId: string;
  anoLectivoNome: string;
  sala: string; // Ex: 'Sala 14 - Bloco B'
  turno: TurnoType;
  directorTurma: string; // Ex: 'Prof. Dr. Afonso Muandumba'
  directorId?: string;
  capacidade: number;
  totalAlunos: number;
  estado: SectionState;
}

export interface Subject {
  id: string;
  escolaId: string;
  nome: string; // Ex: 'Matemática'
  codigo: string; // Ex: 'MAT'
  cargaHorariaSemanal: number; // Em tempos semanais (ex: 4 tempos)
  estado: 'activa' | 'inactiva';
  areaCientifica?: string; // Ex: 'Ciências Exactas', 'Línguas e Comunicação', 'Ciências Sociais', etc.
  descricao?: string;
}

export interface ClassSubject {
  id: string;
  escolaId: string;
  classeId: string;
  classeNome: string;
  subjectId: string;
  subjectNome: string;
  subjectCodigo: string;
  cargaHorariaSemanal: number; // Tempos semanais nesta classe
  coeficiente?: number;
  obrigatoria: boolean;
  estado: 'activa' | 'inactiva';
}

export interface Teacher {
  id: string;
  escolaId: string;
  nome: string;
  email: string;
  telefone: string;
  bi?: string;
  especialidade: string; // Ex: 'Matemática & Física'
  grauAcademico?: string; // Ex: 'Licenciatura', 'Mestrado'
  estado: 'activo' | 'inactivo';
}

export interface TeacherAssignment {
  id: string;
  escolaId: string;
  professorId: string;
  professorNome: string;
  turmaId: string;
  turmaNome: string;
  subjectId: string;
  subjectNome: string;
  anoLectivoId: string;
  anoLectivoNome: string;
  cargaHorariaSemanal: number;
  isDirectorTurma?: boolean;
}

// ==========================================
// MÓDULO DE ASSIDUIDADE (ALUNOS & FUNCIONÁRIOS)
// ==========================================

export type StudentAttendanceStatus =
  | 'presenca'
  | 'falta'
  | 'falta_justificada'
  | 'atraso'
  | 'saida_antecipada';

export interface StudentAttendanceRecord {
  id: string;
  escolaId: string;
  studentId: string;
  studentNome: string;
  turmaId: string;
  turmaNome: string;
  disciplinaNome?: string;
  data: string; // YYYY-MM-DD
  status: StudentAttendanceStatus;
  minutosAtraso?: number;
  horaRegisto?: string; // HH:mm
  justificacao?: string;
  documentoJustificativo?: string;
  registadoPor: string; // Ex: 'Prof. Dr. Afonso Muandumba'
  metodoRegisto: 'manual_professor' | 'qrcode' | 'pin' | 'biometria';
}

export type StaffType = 'professor' | 'administrativo' | 'direccao' | 'apoio';
export type StaffAttendanceStatus = 'presente' | 'falta' | 'falta_justificada' | 'atraso';

export interface StaffMember {
  id: string;
  escolaId: string;
  nome: string;
  cargo: string;
  tipo: StaffType;
  email: string;
  telefone: string;
  bi?: string;
  codigoPin?: string;
  codigoQr?: string;
  idBiometrico?: string;
  horarioEntradaPrevisto: string; // Ex: '07:30'
  horarioSaidaPrevisto: string; // Ex: '15:30'
  estado: 'activo' | 'inactivo';
}

export interface StaffAttendanceRecord {
  id: string;
  escolaId: string;
  staffId: string;
  staffNome: string;
  cargo: string;
  tipo: StaffType;
  data: string; // YYYY-MM-DD
  horaEntrada?: string; // HH:mm
  horaSaida?: string; // HH:mm
  status: StaffAttendanceStatus;
  minutosAtraso?: number;
  justificacao?: string;
  documentoJustificativo?: string;
  registadoPor?: string;
  metodoRegisto: 'terminal_biometrico' | 'qrcode' | 'pin' | 'manual_secretaria';
}

export interface AttendanceSettings {
  escolaId: string;
  limiteFaltasAlerta: number; // Ex: 5 faltas injustificadas
  limiteFaltasCritico: number; // Ex: 10 faltas (risco de anulação do ano pelo regulamento escolar)
  toleranciaMinutosAtraso: number; // Ex: 15 minutos
  notificarEncarregadosSms: boolean;
  integracaoQrCodeAtiva: boolean;
  integracaoBiometriaAtiva: boolean;
  integracaoPinAtiva: boolean;
}

export interface AttendanceAlert {
  id: string;
  escolaId: string;
  studentId: string;
  studentNome: string;
  turmaNome: string;
  totalFaltas: number;
  totalFaltasInjustificadas: number;
  percentagemPresenca: number;
  nivelAlerta: 'atencao' | 'critico' | 'risco_anulacao';
  dataGeracao: string;
  notificouEncarregado: boolean;
}

// ==========================================
// PORTAL DO ENCARREGADO DE EDUCAÇÃO
// ==========================================

export type PaymentItemType = 'propina' | 'matricula' | 'emolumentos' | 'multas' | 'outros';

export interface PaymentReference {
  id: string;
  entidade: string; // Ex: '00192' (EduGest / MED)
  referencia: string; // Ex: '923 881 042'
  valorKz: number;
  tipo: PaymentItemType;
  descricao: string;
  studentId: string;
  studentNome: string;
  dataGeracao: string;
  dataValidade: string;
  estado: 'pendente' | 'pago' | 'expirado';
  reciboId?: string;
}

export interface OfficialReceipt {
  id: string;
  numeroRecibo: string; // Ex: 'RC-2025/08941'
  escolaId: string;
  escolaNome: string;
  escolaNif: string;
  studentId: string;
  studentNome: string;
  studentProcesso: string;
  studentTurma: string;
  guardianNome: string;
  guardianBi: string;
  dataEmissao: string;
  tipoItem: PaymentItemType;
  descricao: string;
  mesReferencia?: string;
  valorKz: number;
  metodoPagamento: string;
  referenciaOperacao: string;
  hashCertificacao: string;
  operadorSecretaria: string;
}

export interface SchoolAnnouncement {
  id: string;
  escolaId: string;
  titulo: string;
  conteudo: string;
  categoria: 'Geral' | 'Pedagógico' | 'Financeiro' | 'Reunião de Pais' | 'Urgente';
  dataPublicacao: string;
  autor: string;
  prioridade: 'normal' | 'alta' | 'urgente';
  lido?: boolean;
  anexoNome?: string;
}

export interface HorarioAula {
  id: string;
  turmaId: string;
  diaSemana: 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira';
  tempo: number;
  horaInicio: string;
  horaFim: string;
  disciplina: string;
  professor: string;
  sala: string;
}

export interface GuardianNotification {
  id: string;
  guardianId: string;
  studentId: string;
  studentNome: string;
  tipo: 'nota' | 'falta' | 'pagamento' | 'comunicado' | 'matricula';
  titulo: string;
  mensagem: string;
  dataHora: string;
  lida: boolean;
  tabDestino?: string;
}

// ==========================================
// MÓDULO CRM ESCOLAR & FUNIL DE ADMISSÕES
// ==========================================

export type PipelineStageId =
  | 'novo_lead'
  | 'contactado'
  | 'interessado'
  | 'visita'
  | 'documentacao'
  | 'pre_matricula'
  | 'pagamento'
  | 'matricula'
  | 'aluno'
  | 'perdido';

export type LeadSource =
  | 'Website'
  | 'Facebook'
  | 'Instagram'
  | 'WhatsApp'
  | 'Telefone'
  | 'Indicação'
  | 'Evento'
  | 'Campanha'
  | 'Outro';

export interface PipelineStage {
  id: PipelineStageId;
  nome: string;
  ordem: number;
  cor: string;
  descricao: string;
}

export interface LeadSourceEntity {
  id: string;
  nome: LeadSource;
  descricao: string;
  activo: boolean;
  totalLeads: number;
}

export interface Campaign {
  id: string;
  escolaId: string;
  nome: string;
  descricao: string;
  anoLectivo: string;
  dataInicio: string;
  dataFim: string;
  orcamentoKz?: number;
  metaMatriculas: number;
  totalLeads: number;
  totalMatriculas: number;
  estado: 'activa' | 'pausada' | 'concluida';
}

export type ActivityType =
  | 'chamada'
  | 'whatsapp'
  | 'email'
  | 'reuniao'
  | 'visita_escola'
  | 'mudanca_estagio'
  | 'nota_interna'
  | 'pagamento'
  | 'conversao';

export interface Activity {
  id: string;
  leadId: string;
  tipo: ActivityType;
  titulo: string;
  descricao: string;
  dataHora: string;
  responsavelNome: string;
  responsavelId?: string;
  resultado?: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadNome: string;
  titulo: string;
  tipo: 'chamada' | 'whatsapp' | 'visita' | 'email' | 'reuniao';
  dataPrevista: string;
  horaPrevista: string;
  responsavelNome: string;
  observacoes?: string;
  concluido: boolean;
  dataConclusao?: string;
}

export interface Lead {
  id: string;
  escolaId: string;
  nomeCandidato: string;
  nomeEncarregado: string;
  parentesco: string;
  telefone: string;
  telefoneAlternativo?: string;
  email: string;
  origem: LeadSource;
  campanhaId?: string;
  campanhaNome?: string;
  classeInteresse: string;
  cursoInteresse?: string;
  turnoPretendido?: 'Manhã' | 'Tarde' | 'Noite' | 'Indiferente';
  anoLectivo: string;
  estagio: PipelineStageId;
  responsavelNome: string;
  responsavelEmail?: string;
  responsavelId?: string;
  probabilidade: number;
  valorEstimadoKz: number;
  dataCriacao: string;
  ultimaInteracao: string;
  proximoFollowUp?: string;
  notas?: string;
  motivoPerda?: string;
  convertidoAlunoId?: string;
  dataConversao?: string;
}



