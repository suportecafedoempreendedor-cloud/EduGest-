/**
 * Tipos e Estruturas de Dados do Módulo de Recursos Humanos (HR)
 * EduGest Angola - SaaS Multi-Tenant de Gestão Escolar
 * Em estrita conformidade com a Lei Geral do Trabalho (LGT) e Legislação Fiscal Angolana (IRT / INSS)
 */

export type EmployeeType = 'docente' | 'administrativo' | 'direccao' | 'apoio' | 'tecnico' | 'motorista';

export type EmploymentContractType =
  | 'tempo_indeterminado'   // Efectivo
  | 'termo_certo'           // Contrato a termo resolutivo certo
  | 'tempo_parcial'         // Part-time docente
  | 'prestacao_servicos'    // Prestador independente / Avença
  | 'estagio_profissional'  // Estagiário
  | 'comissao_servico';     // Cargo directivo / nomeação

export type EmployeeStatus =
  | 'activo'
  | 'periodo_experimental'
  | 'ferias'
  | 'licenca_medica'
  | 'licenca_maternidade_paternidade'
  | 'suspenso'
  | 'cessado';

export interface EmergencyContact {
  nome: string;
  parentesco: string;
  telefone: string;
  morada?: string;
}

export interface AcademicQualification {
  grau: 'Doutoramento' | 'Mestrado' | 'Licenciatura' | 'Bacharelato' | 'Ensino Médio Técnico' | 'Ensino Secundário';
  curso: string;
  instituicao: string;
  anoConclusao: number;
  pais: string;
  certificadosAnexados?: string[];
}

export interface OffboardingRecord {
  dataSaida: string;
  motivo: 'Fim de Contrato' | 'Rescisão por Mútuo Acordo' | 'Demissão Voluntária' | 'Despedimento com Justa Causa' | 'Reforma' | 'Outro';
  responsavelSaida: string;
  checklistDevolucao: {
    equipamentosInformaticos: boolean;
    chavesEInstalacoes: boolean;
    crachaIdentificacao: boolean;
    passesETelefones: boolean;
    pautasEDocumentacaoPedagogica: boolean;
  };
  observacoes?: string;
  documentoTermoQuitacao?: string;
}

export interface Employee {
  id: string;
  escolaId: string;
  numeroMecanografico: string; // Ex: 'RH-2024-001'
  nomeCompleto: string;
  fotografiaUrl?: string;
  genero: 'Masculino' | 'Feminino' | 'Outro';
  dataNascimento: string; // YYYY-MM-DD
  nacionalidade: string; // Padrão: 'Angolana'
  naturalidade?: string;
  provinciaNaturalidade?: string;
  
  // Documentos de Identificação
  tipoDocumento: 'BI' | 'Passaporte' | 'Cartão de Residente';
  numeroDocumento: string; // Ex: '003418902LA041'
  dataEmissaoDocumento?: string;
  dataValidadeDocumento: string;
  nif: string; // Ex: '5418029412'
  numeroINSS: string; // Ex: 'INSS-882104'

  // Contactos & Morada
  telefone: string;
  telefoneAlternativo?: string;
  emailInstitucional: string;
  emailPessoal?: string;
  morada: string;
  provincia: string;
  municipio: string;
  bairro?: string;
  contactosEmergencia: EmergencyContact[];

  // Dados Profissionais
  departamentoId: string;
  departamentoNome: string;
  cargoId: string;
  cargoNome: string;
  categoriaProfissional?: string;
  tipoColaborador: EmployeeType;
  tipoVinculo: EmploymentContractType;
  dataAdmissao: string; // YYYY-MM-DD
  dataInicioFuncoes: string;
  dataFimContrato?: string; // Se termo certo
  estadoProfissional: EmployeeStatus;
  responsavelDirectoId?: string;
  responsavelDirectoNome?: string;
  localTrabalho: string; // Ex: 'Campus Central - Maianga'
  horarioTrabalho: string; // Ex: '07:30 - 15:30 (40h semanais)'
  
  // Integração com Módulo Académico (Se for docente)
  professorId?: string; // ID correspondente em Teacher

  // Habilitações & Formação
  qualificacoes: AcademicQualification[];
  competenciasPrincipais: string[];

  // Condições Remuneratórias (Confidenciais - RH & Finanças)
  salarioBaseKz: number;
  subsidioAlimentacaoKz: number;
  subsidioTransporteKz: number;
  subsidioAlojamentoKz?: number;
  outrosAbonosKz?: number;
  isencaoIrt?: boolean;
  metodoPagamento: 'Transferência Bancária BAI' | 'Transferência BFA' | 'Transferência BPC' | 'Transferência Banco BIC' | 'Cheque' | 'Dinheiro';
  iban?: string;

  // Cessação / Offboarding
  processoSaida?: OffboardingRecord;

  // Saldos e Indicadores
  saldoDiasFeriasAno: number; // Padrão: 22 dias úteis pela LGT de Angola
  taxaAssiduidadeMesPercent: number;
  totalFaltasInjustificadasAno: number;

  dataCriacao: string;
  ultimaActualizacao: string;
}

export interface HrDepartment {
  id: string;
  escolaId: string;
  codigo: string;
  nome: string;
  sigla: string;
  descricao: string;
  responsavelId?: string;
  responsavelNome: string;
  totalColaboradores: number;
  orcamentoAnualKz?: number;
  activo: boolean;
}

export interface HrJobPosition {
  id: string;
  escolaId: string;
  departamentoId: string;
  departamentoNome: string;
  titulo: string;
  nivelHierarquico: 'Direcção' | 'Coordenação' | 'Docência' | 'Técnico Especialista' | 'Operacional & Apoio';
  descricaoFuncoes: string;
  requisitosMinimos: string;
  faixaSalarialMinKz: number;
  faixaSalarialMaxKz: number;
  totalOcupantes: number;
  activo: boolean;
}

export interface EmploymentContract {
  id: string;
  escolaId: string;
  colaboradorId: string;
  colaboradorNome: string;
  numeroContrato: string; // Ex: 'CTR-2025/014'
  tipo: EmploymentContractType;
  dataInicio: string;
  dataTermo?: string;
  dataRenovacao?: string;
  cargoNome: string;
  departamentoNome: string;
  salarioMensalKz: number;
  duracaoMeses?: number;
  estado: 'activo' | 'a_renovar' | 'renovado' | 'cessado' | 'cancelado';
  adendas: Array<{
    id: string;
    dataAdenda: string;
    descricao: string;
    registadoPor: string;
  }>;
  documentoAssinadoUrl?: string;
  registadoPor: string;
}

export type HrAttendanceStatus = 'presente' | 'falta' | 'falta_justificada' | 'atraso' | 'saida_antecipada' | 'em_servico_externo';

export interface HrAttendanceRecord {
  id: string;
  escolaId: string;
  colaboradorId: string;
  colaboradorNome: string;
  cargo: string;
  departamento: string;
  tipoColaborador: EmployeeType;
  data: string; // YYYY-MM-DD
  horaEntrada?: string; // HH:mm
  horaSaida?: string; // HH:mm
  status: HrAttendanceStatus;
  minutosAtraso?: number;
  metodoRegisto: 'terminal_biometrico' | 'qrcode' | 'pin' | 'manual_rh';
  justificacao?: string;
  documentoComprovativoUrl?: string;
  registadoPor: string;
  auditadoPor?: string;
}

export type LeaveType =
  | 'ferias'
  | 'doenca'
  | 'maternidade_paternidade'
  | 'luto_nojo'
  | 'casamento'
  | 'dispensa_autorizada'
  | 'outro';

export interface LeaveRequest {
  id: string;
  escolaId: string;
  colaboradorId: string;
  colaboradorNome: string;
  departamentoNome: string;
  cargoNome: string;
  tipo: LeaveType;
  dataInicio: string;
  dataFim: string;
  totalDiasUteis: number;
  motivo?: string;
  documentoComprovativoUrl?: string;
  estado: 'pendente' | 'aprovado_chefia' | 'aprovado_rh' | 'rejeitado' | 'concluido';
  submetidoEm: string;
  decididoEm?: string;
  decididoPor?: string;
  parecerChefia?: string;
  parecerRh?: string;
}

export interface DisciplinaryCase {
  id: string;
  escolaId: string;
  numeroProcesso: string; // Ex: 'PD-2025/003'
  colaboradorId: string;
  colaboradorNome: string;
  departamentoNome: string;
  cargoNome: string;
  dataOcorrencia: string;
  dataAbertura: string;
  gravidade: 'Leve' | 'Grave' | 'Muito Grave';
  motivoInfracao: string;
  descricaoDetalhada: string;
  instrutorProcesso: string;
  estado: 'abertura' | 'instrucao' | 'audiencia_previa' | 'decisao' | 'arquivado' | 'concluido';
  defesaApresentada?: string;
  decisaoFinal?: 'Arquivamento' | 'Admoestação Verbal' | 'Censura Registada' | 'Desconto Salarial' | 'Suspensão Temporária' | 'Despedimento Disciplinar';
  dataDecisao?: string;
  responsavelDecisao?: string;
  confidencial: boolean;
}

export interface PerformanceReview {
  id: string;
  escolaId: string;
  ciclo: string; // Ex: 'Ciclo Anual 2024/2025'
  ano: string;
  colaboradorId: string;
  colaboradorNome: string;
  departamentoNome: string;
  cargoNome: string;
  avaliadorId: string;
  avaliadorNome: string;
  dataAvaliacao: string;
  
  // Notas de 1 a 10
  pontuacaoCompetenciaTecnica: number;
  pontuacaoAssiduidadePontualidade: number;
  pontuacaoTrabalhoEquipa: number;
  pontuacaoIniciativaCriatividade: number;
  pontuacaoCumprimentoObjectivos: number;
  mediaFinal: number; // Escala 0-10
  classificacao: 'Excelente' | 'Bom' | 'Satisfatório' | 'Insuficiente';

  comentariosAvaliador: string;
  autoavaliacaoColaborador?: string;
  planoMelhoria?: string;
  estado: 'rascunho' | 'concluida' | 'homologada';
}

export interface TrainingRecord {
  id: string;
  escolaId: string;
  tema: string;
  entidadeFormadora: string;
  formadorNome: string;
  cargaHorariaHoras: number;
  dataInicio: string;
  dataFim: string;
  local: string;
  descricao: string;
  estado: 'agendada' | 'em_curso' | 'concluida' | 'cancelada';
  participantes: Array<{
    colaboradorId: string;
    colaboradorNome: string;
    departamentoNome: string;
    presencaConfirmada: boolean;
    aproveitamento?: 'Apto' | 'Não Apto' | 'Excelente';
    certificadoEmitido: boolean;
  }>;
}

export interface PayrollPayslip {
  id: string;
  escolaId: string;
  folhaId: string;
  colaboradorId: string;
  colaboradorNome: string;
  cargoNome: string;
  departamentoNome: string;
  numeroMecanografico: string;
  numeroINSS: string;
  nif: string;
  iban?: string;
  mes: string;
  ano: number;
  
  // Vencimentos Brutos em Kz
  salarioBaseKz: number;
  subsidioAlimentacaoKz: number;
  subsidioTransporteKz: number;
  outrosAbonosKz: number;
  totalVencimentoBrutoKz: number;

  // Descontos Legais em Kz
  inssTrabalhador3PercentKz: number; // 3% pago pelo trabalhador
  inssPatronal8PercentKz: number;    // 8% pago pela escola
  irtRetidoKz: number;              // Imposto de Rendimento do Trabalho (Tabela oficial Angola)
  descontoFaltasKz: number;
  outrosDescontosKz: number;
  totalDescontosKz: number;

  // Vencimento Líquido
  salarioLiquidoKz: number;
  
  reciboNumero: string; // Ex: 'REC-VENC-2025/10-042'
  dataProcessamento: string;
  estadoPagamento: 'pendente' | 'pago' | 'transferido_financeiro';
}

export interface PayrollPeriod {
  id: string;
  escolaId: string;
  mes: string; // Ex: 'Outubro'
  mesNumero: number;
  ano: number; // Ex: 2026
  dataProcessamento: string;
  totalColaboradores: number;
  totalBrutoGeralKz: number;
  totalInss3GeralKz: number;
  totalInss8GeralKz: number;
  totalIrtGeralKz: number;
  totalLiquidoGeralKz: number;
  estado: 'rascunho' | 'aprovado' | 'pago';
  aprovadoPor?: string;
  dataAprovacao?: string;
  recibos: PayrollPayslip[];
}

export interface JobVacancy {
  id: string;
  escolaId: string;
  codigoVaga: string; // Ex: 'VAG-2025-004'
  titulo: string;
  departamentoId: string;
  departamentoNome: string;
  cargoId: string;
  cargoNome: string;
  tipoVinculo: EmploymentContractType;
  vagasDisponiveis: number;
  descricaoFuncoes: string;
  requisitosObrigatorios: string;
  dataAbertura: string;
  dataEncerramento: string;
  estado: 'aberta' | 'em_triagem' | 'entrevistas' | 'preenchida' | 'cancelada';
  totalCandidaturas: number;
}

export interface JobApplication {
  id: string;
  escolaId: string;
  vagaId: string;
  vagaTitulo: string;
  candidatoNome: string;
  email: string;
  telefone: string;
  biNumero: string;
  habilitacoes: string;
  experienciaAnos: number;
  curriculoUrl?: string;
  etapaProcesso: 'triagem' | 'entrevista' | 'teste_pratico' | 'finalista' | 'aprovado' | 'rejeitado';
  pontuacaoEntrevista?: number; // 0-100
  observacoesEntrevista?: string;
  dataCandidatura: string;
  convertidoEmColaborador: boolean;
  colaboradorCriadoId?: string;
}

export interface EmployeeDocument {
  id: string;
  escolaId: string;
  colaboradorId: string;
  colaboradorNome: string;
  titulo: string;
  tipo: 'BI' | 'Curriculum' | 'Contrato Assinado' | 'Certificado Habilitações' | 'Registo Criminal' | 'Atestado Médico' | 'Comprovativo Bancário' | 'Outro';
  numeroDocumento?: string;
  dataEmissao?: string;
  dataValidade?: string;
  estado: 'valido' | 'a_expirar' | 'caducado';
  tamanho: string;
  ficheiroUrl?: string;
  confidencial: boolean;
  dataUpload: string;
}

export interface HrAlert {
  id: string;
  escolaId: string;
  tipo: 'contrato_termo' | 'documento_caducado' | 'ferias_pendentes' | 'ausencia_injustificada' | 'avaliacao_pendente';
  titulo: string;
  mensagem: string;
  colaboradorId?: string;
  colaboradorNome?: string;
  prioridade: 'normal' | 'alta' | 'urgente';
  dataAlerta: string;
  resolvido: boolean;
}

export interface HrSettingsConfig {
  escolaId: string;
  diasFeriasAnuaisPadrao: number; // 22 dias
  limiteToleranciaAtrasoMinutos: number; // 15 minutos
  taxaInssTrabalhadorPercent: number; // 3%
  taxaInssPatronalPercent: number; // 8%
  moduloSalariosConfidencial: boolean;
  moduloDisciplinarConfidencial: boolean;
  notificarContratosVencimentoDias: number; // 30 dias
}
