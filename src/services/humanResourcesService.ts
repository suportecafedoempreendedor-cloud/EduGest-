import {
  Employee,
  HrDepartment,
  HrJobPosition,
  EmploymentContract,
  HrAttendanceRecord,
  LeaveRequest,
  DisciplinaryCase,
  PerformanceReview,
  TrainingRecord,
  PayrollPeriod,
  PayrollPayslip,
  JobVacancy,
  JobApplication,
  EmployeeDocument,
  HrAlert,
  HrSettingsConfig,
  OffboardingRecord,
} from '../types/humanResources';

import {
  INITIAL_HR_SETTINGS,
  INITIAL_HR_DEPARTMENTS,
  INITIAL_HR_JOB_POSITIONS,
  INITIAL_EMPLOYEES,
  INITIAL_EMPLOYMENT_CONTRACTS,
  INITIAL_HR_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_DISCIPLINARY_CASES,
  INITIAL_PERFORMANCE_REVIEWS,
  INITIAL_TRAINING_RECORDS,
  INITIAL_PAYROLL_PERIODS,
  INITIAL_JOB_VACANCIES,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_EMPLOYEE_DOCUMENTS,
  INITIAL_HR_ALERTS,
} from '../data/mockHumanResourcesData';

const PREFIX = 'edugest_hr_v2_';

function getKey(escolaId: string, item: string): string {
  return `${PREFIX}${escolaId || 'esc-001'}_${item}`;
}

// ==========================================
// CÁLCULOS LEGAIS FISCAIS DE ANGOLA (IRT / INSS)
// Em estrita conformidade com a Lei nº 28/20 (IRT) e Decreto Presidencial (INSS)
// ==========================================

/**
 * Calcula a contribuição da Segurança Social de Angola (INSS)
 * - Trabalhador: 3% sobre a remuneração ilíquida
 * - Entidade Empregadora (Escola): 8%
 */
export function calculateAngolanInss(salarioBaseKz: number): { inssTrabalhador3Percent: number; inssPatronal8Percent: number } {
  const base = Math.max(0, salarioBaseKz);
  const inssTrabalhador3Percent = Math.round(base * 0.03);
  const inssPatronal8Percent = Math.round(base * 0.08);
  return { inssTrabalhador3Percent, inssPatronal8Percent };
}

/**
 * Calcula a retenção na fonte do Imposto sobre o Rendimento do Trabalho (IRT)
 * Tabela oficial de Angola (Grupo A - Trabalho por Conta de Outrem - Lei nº 28/20):
 * - Subsídio de alimentação e transporte isentos até 30.000 Kz cada.
 * - Desconto prévio de 3% de INSS do trabalhador.
 */
export function calculateAngolanIrt(
  salarioBaseKz: number,
  subsidioAlimentacaoKz = 0,
  subsidioTransporteKz = 0,
  outrosAbonosTributaveisKz = 0,
  isento = false
): number {
  if (isento) return 0;

  // Parcela tributável dos subsídios (o que exceder 30.000 Kz é sujeito a IRT)
  const tributavelAlimentacao = Math.max(0, subsidioAlimentacaoKz - 30000);
  const tributavelTransporte = Math.max(0, subsidioTransporteKz - 30000);

  // Rendimento bruto tributável
  const rendimentoBrutoTributavel =
    salarioBaseKz + outrosAbonosTributaveisKz + tributavelAlimentacao + tributavelTransporte;

  // Dedução da contribuição de 3% para o INSS
  const inssTrabalhador = Math.round(salarioBaseKz * 0.03);
  const materiaColectavel = Math.max(0, rendimentoBrutoTributavel - inssTrabalhador);

  // Escalões do IRT de Angola (Lei nº 28/20):
  if (materiaColectavel <= 100000) {
    return 0; // Até 100.000 Kz: Isento
  } else if (materiaColectavel <= 150000) {
    // 100.001 a 150.000: 13% sobre o excesso de 100.000
    return Math.round((materiaColectavel - 100000) * 0.13);
  } else if (materiaColectavel <= 200000) {
    // 150.001 a 200.000: Parcela fixa 6.500 + 16% sobre excesso de 150.000
    return Math.round(6500 + (materiaColectavel - 150000) * 0.16);
  } else if (materiaColectavel <= 300000) {
    // 200.001 a 300.000: Parcela fixa 14.500 + 18% sobre excesso de 200.000
    return Math.round(14500 + (materiaColectavel - 200000) * 0.18);
  } else if (materiaColectavel <= 500000) {
    // 300.001 a 500.000: Parcela fixa 32.500 + 19% sobre excesso de 300.000
    return Math.round(32500 + (materiaColectavel - 300000) * 0.19);
  } else if (materiaColectavel <= 1000000) {
    // 500.001 a 1.000.000: Parcela fixa 70.500 + 20% sobre excesso de 500.000
    return Math.round(70500 + (materiaColectavel - 500000) * 0.2);
  } else if (materiaColectavel <= 1500000) {
    // 1.000.001 a 1.500.000: Parcela fixa 170.500 + 21% sobre excesso de 1.000.000
    return Math.round(170500 + (materiaColectavel - 1000000) * 0.21);
  } else if (materiaColectavel <= 2000000) {
    // 1.500.001 a 2.000.000: Parcela fixa 275.500 + 22% sobre excesso de 1.500.000
    return Math.round(275500 + (materiaColectavel - 1500000) * 0.22);
  } else if (materiaColectavel <= 2500000) {
    // 2.000.001 a 2.500.000: Parcela fixa 385.500 + 23% sobre excesso de 2.000.000
    return Math.round(385500 + (materiaColectavel - 2000000) * 0.23);
  } else if (materiaColectavel <= 5000000) {
    // 2.500.001 a 5.000.000: Parcela fixa 500.500 + 24% sobre excesso de 2.500.000
    return Math.round(500500 + (materiaColectavel - 2500000) * 0.24);
  } else {
    // Superior a 5.000.000: Parcela fixa 1.100.500 + 25% sobre excesso de 5.000.000
    return Math.round(1100500 + (materiaColectavel - 5000000) * 0.25);
  }
}

// ==========================================
// GETTERS & PERSISTÊNCIA LOCAL ISOLADA POR ESCOLA
// ==========================================

export function getStoredEmployees(escolaId: string): Employee[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'employees'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler colaboradores:', e);
  }
  return INITIAL_EMPLOYEES;
}

export function saveEmployees(escolaId: string, employees: Employee[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'employees'), JSON.stringify(employees));
  } catch (e) {
    console.error('Erro ao salvar colaboradores:', e);
  }
}

export function getStoredHrDepartments(escolaId: string): HrDepartment[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'departments'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler departamentos:', e);
  }
  return INITIAL_HR_DEPARTMENTS;
}

export function saveHrDepartments(escolaId: string, depts: HrDepartment[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'departments'), JSON.stringify(depts));
  } catch (e) {
    console.error('Erro ao salvar departamentos:', e);
  }
}

export function getStoredJobPositions(escolaId: string): HrJobPosition[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'job_positions'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler cargos:', e);
  }
  return INITIAL_HR_JOB_POSITIONS;
}

export function saveJobPositions(escolaId: string, jobs: HrJobPosition[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'job_positions'), JSON.stringify(jobs));
  } catch (e) {
    console.error('Erro ao salvar cargos:', e);
  }
}

export function getStoredContracts(escolaId: string): EmploymentContract[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'contracts'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler contratos:', e);
  }
  return INITIAL_EMPLOYMENT_CONTRACTS;
}

export function saveContracts(escolaId: string, contracts: EmploymentContract[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'contracts'), JSON.stringify(contracts));
  } catch (e) {
    console.error('Erro ao salvar contratos:', e);
  }
}

export function getStoredHrAttendance(escolaId: string): HrAttendanceRecord[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'attendance'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler assiduidade:', e);
  }
  return INITIAL_HR_ATTENDANCE;
}

export function saveHrAttendance(escolaId: string, records: HrAttendanceRecord[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'attendance'), JSON.stringify(records));
  } catch (e) {
    console.error('Erro ao salvar assiduidade:', e);
  }
}

export function getStoredLeaves(escolaId: string): LeaveRequest[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'leaves'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler férias:', e);
  }
  return INITIAL_LEAVE_REQUESTS;
}

export function saveLeaves(escolaId: string, leaves: LeaveRequest[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'leaves'), JSON.stringify(leaves));
  } catch (e) {
    console.error('Erro ao salvar férias:', e);
  }
}

export function getStoredDisciplinary(escolaId: string): DisciplinaryCase[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'disciplinary'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler processos disciplinares:', e);
  }
  return INITIAL_DISCIPLINARY_CASES;
}

export function saveDisciplinary(escolaId: string, cases: DisciplinaryCase[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'disciplinary'), JSON.stringify(cases));
  } catch (e) {
    console.error('Erro ao salvar processos disciplinares:', e);
  }
}

export function getStoredPerformance(escolaId: string): PerformanceReview[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'performance'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler avaliações de desempenho:', e);
  }
  return INITIAL_PERFORMANCE_REVIEWS;
}

export function savePerformance(escolaId: string, reviews: PerformanceReview[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'performance'), JSON.stringify(reviews));
  } catch (e) {
    console.error('Erro ao salvar avaliações de desempenho:', e);
  }
}

export function getStoredTraining(escolaId: string): TrainingRecord[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'training'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler formações:', e);
  }
  return INITIAL_TRAINING_RECORDS;
}

export function saveTraining(escolaId: string, trainings: TrainingRecord[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'training'), JSON.stringify(trainings));
  } catch (e) {
    console.error('Erro ao salvar formações:', e);
  }
}

export function getStoredPayroll(escolaId: string): PayrollPeriod[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'payroll'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler folhas salariais:', e);
  }
  return INITIAL_PAYROLL_PERIODS;
}

export function savePayroll(escolaId: string, periods: PayrollPeriod[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'payroll'), JSON.stringify(periods));
  } catch (e) {
    console.error('Erro ao salvar folhas salariais:', e);
  }
}

export function getStoredVacancies(escolaId: string): JobVacancy[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'vacancies'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler vagas:', e);
  }
  return INITIAL_JOB_VACANCIES;
}

export function saveVacancies(escolaId: string, vacancies: JobVacancy[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'vacancies'), JSON.stringify(vacancies));
  } catch (e) {
    console.error('Erro ao salvar vagas:', e);
  }
}

export function getStoredApplications(escolaId: string): JobApplication[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'applications'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler candidaturas:', e);
  }
  return INITIAL_JOB_APPLICATIONS;
}

export function saveApplications(escolaId: string, applications: JobApplication[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'applications'), JSON.stringify(applications));
  } catch (e) {
    console.error('Erro ao salvar candidaturas:', e);
  }
}

export function getStoredEmployeeDocuments(escolaId: string): EmployeeDocument[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'employee_documents'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler documentos:', e);
  }
  return INITIAL_EMPLOYEE_DOCUMENTS;
}

export function saveEmployeeDocuments(escolaId: string, docs: EmployeeDocument[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'employee_documents'), JSON.stringify(docs));
  } catch (e) {
    console.error('Erro ao salvar documentos:', e);
  }
}

export function getStoredHrAlerts(escolaId: string): HrAlert[] {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'alerts'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler alertas de RH:', e);
  }
  return INITIAL_HR_ALERTS;
}

export function saveHrAlerts(escolaId: string, alerts: HrAlert[]): void {
  try {
    localStorage.setItem(getKey(escolaId, 'alerts'), JSON.stringify(alerts));
  } catch (e) {
    console.error('Erro ao salvar alertas de RH:', e);
  }
}

export function getStoredHrSettings(escolaId: string): HrSettingsConfig {
  try {
    const raw = localStorage.getItem(getKey(escolaId, 'settings'));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler configurações de RH:', e);
  }
  return INITIAL_HR_SETTINGS;
}

export function saveHrSettings(escolaId: string, settings: HrSettingsConfig): void {
  try {
    localStorage.setItem(getKey(escolaId, 'settings'), JSON.stringify(settings));
  } catch (e) {
    console.error('Erro ao salvar configurações de RH:', e);
  }
}

// ==========================================
// OPERAÇÕES E AÇÕES DE GESTÃO DE RH
// ==========================================

export function addEmployee(
  escolaId: string,
  data: Omit<Employee, 'id' | 'dataCriacao' | 'ultimaActualizacao'>
): Employee {
  const list = getStoredEmployees(escolaId);
  const now = new Date().toISOString().split('T')[0];
  const newId = `emp-${Date.now().toString().slice(-6)}`;

  const newEmployee: Employee = {
    ...data,
    id: newId,
    dataCriacao: now,
    ultimaActualizacao: now,
  };

  const updatedList = [newEmployee, ...list];
  saveEmployees(escolaId, updatedList);

  // Criar contrato inicial automaticamente
  const contracts = getStoredContracts(escolaId);
  const newContract: EmploymentContract = {
    id: `ctr-${Date.now().toString().slice(-6)}`,
    escolaId,
    colaboradorId: newId,
    colaboradorNome: newEmployee.nomeCompleto,
    numeroContrato: `CTR-${new Date().getFullYear()}/${contracts.length + 1}`,
    tipo: newEmployee.tipoVinculo,
    dataInicio: newEmployee.dataAdmissao,
    dataTermo: newEmployee.dataFimContrato,
    cargoNome: newEmployee.cargoNome,
    departamentoNome: newEmployee.departamentoNome,
    salarioMensalKz: newEmployee.salarioBaseKz,
    estado: 'activo',
    adendas: [],
    registadoPor: 'Administrador de RH',
  };
  saveContracts(escolaId, [newContract, ...contracts]);

  return newEmployee;
}

export function updateEmployee(escolaId: string, employee: Employee): void {
  const list = getStoredEmployees(escolaId);
  const updated = list.map((item) =>
    item.id === employee.id
      ? { ...employee, ultimaActualizacao: new Date().toISOString().split('T')[0] }
      : item
  );
  saveEmployees(escolaId, updated);
}

export function terminateEmployee(
  escolaId: string,
  employeeId: string,
  offboarding: OffboardingRecord
): void {
  const list = getStoredEmployees(escolaId);
  const updated = list.map((emp) => {
    if (emp.id === employeeId) {
      return {
        ...emp,
        estadoProfissional: 'cessado' as const,
        processoSaida: offboarding,
        dataFimContrato: offboarding.dataSaida,
        ultimaActualizacao: new Date().toISOString().split('T')[0],
      };
    }
    return emp;
  });
  saveEmployees(escolaId, updated);

  // Actualizar estado do contrato
  const contracts = getStoredContracts(escolaId);
  const updatedContracts = contracts.map((c) =>
    c.colaboradorId === employeeId ? { ...c, estado: 'cessado' as const } : c
  );
  saveContracts(escolaId, updatedContracts);
}

export function convertApplicationToEmployee(
  escolaId: string,
  applicationId: string,
  departamentoId: string,
  departamentoNome: string,
  cargoId: string,
  cargoNome: string,
  tipoColaborador: Employee['tipoColaborador'],
  salarioBaseKz: number
): Employee | null {
  const apps = getStoredApplications(escolaId);
  const targetApp = apps.find((a) => a.id === applicationId);
  if (!targetApp) return null;

  const now = new Date().toISOString().split('T')[0];
  const mecanografico = `RH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const newEmp = addEmployee(escolaId, {
    escolaId,
    numeroMecanografico: mecanografico,
    nomeCompleto: targetApp.candidatoNome,
    genero: 'Outro',
    dataNascimento: '1995-01-01',
    nacionalidade: 'Angolana',
    tipoDocumento: 'BI',
    numeroDocumento: targetApp.biNumero || '000000000LA000',
    dataValidadeDocumento: '2034-01-01',
    nif: '5400000000',
    numeroINSS: `INSS-${Math.floor(100000 + Math.random() * 900000)}-AO`,
    telefone: targetApp.telefone,
    emailInstitucional: targetApp.email,
    morada: 'Luanda, Angola',
    provincia: 'Luanda',
    municipio: 'Maianga',
    contactosEmergencia: [],
    departamentoId,
    departamentoNome,
    cargoId,
    cargoNome,
    tipoColaborador,
    tipoVinculo: 'tempo_indeterminado',
    dataAdmissao: now,
    dataInicioFuncoes: now,
    estadoProfissional: 'periodo_experimental',
    localTrabalho: 'Campus Central',
    horarioTrabalho: '08:00 - 16:30',
    qualificacoes: [
      {
        grau: 'Licenciatura',
        curso: targetApp.habilitacoes || 'Ensino Geral',
        instituicao: 'Instituição de Ensino Superior',
        anoConclusao: 2020,
        pais: 'Angola',
      },
    ],
    competenciasPrincipais: ['Experiência profissional comprovada'],
    salarioBaseKz,
    subsidioAlimentacaoKz: 30000,
    subsidioTransporteKz: 30000,
    metodoPagamento: 'Transferência Bancária BAI',
    saldoDiasFeriasAno: 22,
    taxaAssiduidadeMesPercent: 100,
    totalFaltasInjustificadasAno: 0,
  });

  // Marcar candidatura como convertida
  const updatedApps = apps.map((a) =>
    a.id === applicationId
      ? { ...a, convertidoEmColaborador: true, colaboradorCriadoId: newEmp.id, etapaProcesso: 'aprovado' as const }
      : a
  );
  saveApplications(escolaId, updatedApps);

  return newEmp;
}

export function registerClockInOut(
  escolaId: string,
  colaboradorId: string,
  colaboradorNome: string,
  cargo: string,
  departamento: string,
  tipoColaborador: Employee['tipoColaborador'],
  tipoRegisto: 'entrada' | 'saida',
  metodo: HrAttendanceRecord['metodoRegisto'] = 'manual_rh',
  horaCustom?: string
): HrAttendanceRecord {
  const attendance = getStoredHrAttendance(escolaId);
  const now = new Date();
  const hoje = now.toISOString().split('T')[0];
  const horaStr = horaCustom || now.toTimeString().slice(0, 5);

  const existingIndex = attendance.findIndex(
    (a) => a.colaboradorId === colaboradorId && a.data === hoje
  );

  if (existingIndex >= 0) {
    const existing = attendance[existingIndex];
    if (tipoRegisto === 'saida') {
      existing.horaSaida = horaStr;
    } else {
      existing.horaEntrada = horaStr;
    }
    attendance[existingIndex] = existing;
    saveHrAttendance(escolaId, [...attendance]);
    return existing;
  } else {
    // Novo registo do dia
    const isAtraso = tipoRegisto === 'entrada' && horaStr > '07:45';
    const newRecord: HrAttendanceRecord = {
      id: `att-${Date.now().toString().slice(-6)}`,
      escolaId,
      colaboradorId,
      colaboradorNome,
      cargo,
      departamento,
      tipoColaborador,
      data: hoje,
      horaEntrada: tipoRegisto === 'entrada' ? horaStr : undefined,
      horaSaida: tipoRegisto === 'saida' ? horaStr : undefined,
      status: isAtraso ? 'atraso' : 'presente',
      minutosAtraso: isAtraso ? 15 : undefined,
      metodoRegisto: metodo,
      registadoPor: 'Ponto Digital Escolar',
    };
    saveHrAttendance(escolaId, [newRecord, ...attendance]);
    return newRecord;
  }
}

export function generateMonthlyPayroll(
  escolaId: string,
  mesNome: string,
  mesNumero: number,
  ano: number,
  processadoPor: string
): PayrollPeriod {
  const employees = getStoredEmployees(escolaId).filter(
    (e) => e.estadoProfissional !== 'cessado'
  );

  const payslips: PayrollPayslip[] = employees.map((emp, idx) => {
    const base = emp.salarioBaseKz || 0;
    const alim = emp.subsidioAlimentacaoKz || 0;
    const transp = emp.subsidioTransporteKz || 0;
    const outros = emp.outrosAbonosKz || 0;
    const bruto = base + alim + transp + outros;

    const inss = calculateAngolanInss(base);
    const irt = calculateAngolanIrt(base, alim, transp, outros, emp.isencaoIrt);
    const totalDescontos = inss.inssTrabalhador3Percent + irt;
    const liquido = Math.max(0, bruto - totalDescontos);

    return {
      id: `payslip-${Date.now()}-${idx}`,
      escolaId,
      folhaId: `pay-${ano}-${mesNumero.toString().padStart(2, '0')}`,
      colaboradorId: emp.id,
      colaboradorNome: emp.nomeCompleto,
      cargoNome: emp.cargoNome,
      departamentoNome: emp.departamentoNome,
      numeroMecanografico: emp.numeroMecanografico,
      numeroINSS: emp.numeroINSS,
      nif: emp.nif,
      iban: emp.iban,
      mes: mesNome,
      ano,
      salarioBaseKz: base,
      subsidioAlimentacaoKz: alim,
      subsidioTransporteKz: transp,
      outrosAbonosKz: outros,
      totalVencimentoBrutoKz: bruto,
      inssTrabalhador3PercentKz: inss.inssTrabalhador3Percent,
      inssPatronal8PercentKz: inss.inssPatronal8Percent,
      irtRetidoKz: irt,
      descontoFaltasKz: 0,
      outrosDescontosKz: 0,
      totalDescontosKz: totalDescontos,
      salarioLiquidoKz: liquido,
      reciboNumero: `REC-VENC-${ano}/${mesNumero.toString().padStart(2, '0')}-${(idx + 1).toString().padStart(3, '0')}`,
      dataProcessamento: new Date().toISOString().split('T')[0],
      estadoPagamento: 'pago',
    };
  });

  const totalBrutoGeralKz = payslips.reduce((s, p) => s + p.totalVencimentoBrutoKz, 0);
  const totalInss3GeralKz = payslips.reduce((s, p) => s + p.inssTrabalhador3PercentKz, 0);
  const totalInss8GeralKz = payslips.reduce((s, p) => s + p.inssPatronal8PercentKz, 0);
  const totalIrtGeralKz = payslips.reduce((s, p) => s + p.irtRetidoKz, 0);
  const totalLiquidoGeralKz = payslips.reduce((s, p) => s + p.salarioLiquidoKz, 0);

  const newPeriod: PayrollPeriod = {
    id: `pay-${ano}-${mesNumero.toString().padStart(2, '0')}`,
    escolaId,
    mes: mesNome,
    mesNumero,
    ano,
    dataProcessamento: new Date().toISOString().split('T')[0],
    totalColaboradores: payslips.length,
    totalBrutoGeralKz,
    totalInss3GeralKz,
    totalInss8GeralKz,
    totalIrtGeralKz,
    totalLiquidoGeralKz,
    estado: 'aprovado',
    aprovadoPor: processadoPor,
    dataAprovacao: new Date().toISOString().split('T')[0],
    recibos: payslips,
  };

  const existingPeriods = getStoredPayroll(escolaId);
  const filtered = existingPeriods.filter((p) => p.id !== newPeriod.id);
  savePayroll(escolaId, [newPeriod, ...filtered]);

  return newPeriod;
}
