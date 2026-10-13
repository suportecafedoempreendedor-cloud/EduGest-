import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Layers,
  FileText,
  Clock,
  Calendar,
  ShieldAlert,
  Award,
  GraduationCap,
  CreditCard,
  FolderOpen,
  Sliders,
  Lock,
  Plus,
  AlertTriangle,
  Palmtree,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { School, Teacher, TeacherAssignment, Section, Subject, UserRole, AuthUser } from '../../types';
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
  JobVacancy,
  JobApplication,
  EmployeeDocument,
  HrAlert,
  HrSettingsConfig,
  OffboardingRecord,
} from '../../types/humanResources';
import {
  getStoredEmployees,
  saveEmployees,
  getStoredHrDepartments,
  saveHrDepartments,
  getStoredJobPositions,
  saveJobPositions,
  getStoredContracts,
  saveContracts,
  getStoredHrAttendance,
  saveHrAttendance,
  getStoredLeaves,
  saveLeaves,
  getStoredDisciplinary,
  saveDisciplinary,
  getStoredPerformance,
  savePerformance,
  getStoredTraining,
  saveTraining,
  getStoredPayroll,
  savePayroll,
  getStoredVacancies,
  saveVacancies,
  getStoredApplications,
  saveApplications,
  getStoredEmployeeDocuments,
  saveEmployeeDocuments,
  getStoredHrAlerts,
  saveHrAlerts,
  getStoredHrSettings,
  saveHrSettings,
  addEmployee,
  updateEmployee,
  terminateEmployee,
  convertApplicationToEmployee,
  registerClockInOut,
  generateMonthlyPayroll,
} from '../../services/humanResourcesService';

import { HrDashboardTab } from './tabs/HrDashboardTab';
import { HrEmployeesTab } from './tabs/HrEmployeesTab';
import { HrEmployeeDetailModal } from './HrEmployeeDetailModal';
import { HrNewEmployeeModal } from './HrNewEmployeeModal';
import { HrRecruitmentTab } from './tabs/HrRecruitmentTab';
import { HrDepartmentsJobsTab } from './tabs/HrDepartmentsJobsTab';
import { HrContractsTab } from './tabs/HrContractsTab';
import { HrAttendanceTab } from './tabs/HrAttendanceTab';
import { HrLeavesTab } from './tabs/HrLeavesTab';
import { HrDisciplinaryTab } from './tabs/HrDisciplinaryTab';
import { HrPerformanceTab } from './tabs/HrPerformanceTab';
import { HrTrainingTab } from './tabs/HrTrainingTab';
import { HrPayrollTab } from './tabs/HrPayrollTab';
import { HrDocumentsTab } from './tabs/HrDocumentsTab';
import { HrReportsTab } from './tabs/HrReportsTab';
import { HrSettingsTab } from './tabs/HrSettingsTab';

export type HrSubmenuKey =
  | 'dashboard'
  | 'colaboradores'
  | 'recrutamento'
  | 'departamentos'
  | 'cargos'
  | 'contratos'
  | 'assiduidade'
  | 'ferias'
  | 'disciplinar'
  | 'desempenho'
  | 'formacao'
  | 'remuneracoes'
  | 'documentos'
  | 'relatorios'
  | 'configuracoes';

export interface HumanResourcesViewProps {
  currentSchoolName: string;
  teachers: Teacher[];
  currentSchool?: School;
  teacherAssignments?: TeacherAssignment[];
  sections?: Section[];
  subjects?: Subject[];
  userRole?: UserRole;
  currentUser?: AuthUser | null;
  onNotify?: (notif: { type: 'success' | 'info' | 'warning' | 'error'; message: string; title?: string }) => void;
}

export const HumanResourcesView: React.FC<HumanResourcesViewProps> = ({
  currentSchoolName,
  teachers = [],
  currentSchool,
  teacherAssignments = [],
  sections = [],
  subjects = [],
  userRole = 'school_admin',
  currentUser,
  onNotify,
}) => {
  const tenantId = currentSchool?.id || 'esc-001';

  const [activeSubmenu, setActiveSubmenu] = useState<HrSubmenuKey>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredEmployees(tenantId));
  const [departments, setDepartments] = useState<HrDepartment[]>(() => getStoredHrDepartments(tenantId));
  const [jobPositions, setJobPositions] = useState<HrJobPosition[]>(() => getStoredJobPositions(tenantId));
  const [contracts, setContracts] = useState<EmploymentContract[]>(() => getStoredContracts(tenantId));
  const [attendance, setAttendance] = useState<HrAttendanceRecord[]>(() => getStoredHrAttendance(tenantId));
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => getStoredLeaves(tenantId));
  const [disciplinary, setDisciplinary] = useState<DisciplinaryCase[]>(() => getStoredDisciplinary(tenantId));
  const [performance, setPerformance] = useState<PerformanceReview[]>(() => getStoredPerformance(tenantId));
  const [training, setTraining] = useState<TrainingRecord[]>(() => getStoredTraining(tenantId));
  const [payroll, setPayroll] = useState<PayrollPeriod[]>(() => getStoredPayroll(tenantId));
  const [vacancies, setVacancies] = useState<JobVacancy[]>(() => getStoredVacancies(tenantId));
  const [applications, setApplications] = useState<JobApplication[]>(() => getStoredApplications(tenantId));
  const [documents, setDocuments] = useState<EmployeeDocument[]>(() => getStoredEmployeeDocuments(tenantId));
  const [alerts, setAlerts] = useState<HrAlert[]>(() => getStoredHrAlerts(tenantId));
  const [settings, setSettings] = useState<HrSettingsConfig>(() => getStoredHrSettings(tenantId));

  // Modais
  const [selectedEmpForDetail, setSelectedEmpForDetail] = useState<Employee | null>(null);
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);

  // Recarregar dados se mudar de escola
  useEffect(() => {
    setEmployees(getStoredEmployees(tenantId));
    setDepartments(getStoredHrDepartments(tenantId));
    setJobPositions(getStoredJobPositions(tenantId));
    setContracts(getStoredContracts(tenantId));
    setAttendance(getStoredHrAttendance(tenantId));
    setLeaves(getStoredLeaves(tenantId));
    setDisciplinary(getStoredDisciplinary(tenantId));
    setPerformance(getStoredPerformance(tenantId));
    setTraining(getStoredTraining(tenantId));
    setPayroll(getStoredPayroll(tenantId));
    setVacancies(getStoredVacancies(tenantId));
    setApplications(getStoredApplications(tenantId));
    setDocuments(getStoredEmployeeDocuments(tenantId));
    setAlerts(getStoredHrAlerts(tenantId));
    setSettings(getStoredHrSettings(tenantId));
  }, [tenantId]);

  const notify = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', title = 'Recursos Humanos') => {
    if (onNotify) {
      onNotify({ type, message: msg, title });
    }
  };

  // Handlers
  const handleAddEmployee = (newEmpData: Omit<Employee, 'id' | 'dataCriacao' | 'ultimaActualizacao'>) => {
    const created = addEmployee(tenantId, newEmpData);
    setEmployees(getStoredEmployees(tenantId));
    setContracts(getStoredContracts(tenantId));
    notify(`Colaborador ${created.nomeCompleto} admitido com sucesso. Ficha e contrato inicial gerados.`);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    updateEmployee(tenantId, updatedEmp);
    setEmployees(getStoredEmployees(tenantId));
    setSelectedEmpForDetail(updatedEmp);
    notify(`Ficha de ${updatedEmp.nomeCompleto} actualizada.`);
  };

  const handleTerminateEmployee = (offboarding: OffboardingRecord) => {
    if (!selectedEmpForDetail) return;
    terminateEmployee(tenantId, selectedEmpForDetail.id, offboarding);
    setEmployees(getStoredEmployees(tenantId));
    setContracts(getStoredContracts(tenantId));
    setSelectedEmpForDetail(null);
    notify(`Processo de cessação de funções registado para ${selectedEmpForDetail.nomeCompleto}. Acessos revogados.`);
  };

  const handleClockInOut = (colaboradorId: string, tipo: 'entrada' | 'saida', metodo: HrAttendanceRecord['metodoRegisto'], horaCustom?: string) => {
    const emp = employees.find((e) => e.id === colaboradorId);
    if (!emp) return;
    registerClockInOut(tenantId, colaboradorId, emp.nomeCompleto, emp.cargoNome, emp.departamentoNome, emp.tipoColaborador, tipo, metodo, horaCustom);
    setAttendance(getStoredHrAttendance(tenantId));
    notify(`Marcação de ponto (${tipo}) registada para ${emp.nomeCompleto}.`);
  };

  const handleJustifyAbsence = (recordId: string, justificacao: string) => {
    const updated = attendance.map((a) =>
      a.id === recordId
        ? { ...a, status: 'falta_justificada' as const, justificacao }
        : a
    );
    saveHrAttendance(tenantId, updated);
    setAttendance(updated);
    notify('Justificativo de falta homologado pelo RH.');
  };

  const handleRequestLeave = (leaveData: Omit<LeaveRequest, 'id' | 'submetidoEm' | 'estado'>) => {
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: `lvr-${Date.now().toString().slice(-6)}`,
      submetidoEm: new Date().toISOString().split('T')[0],
      estado: 'pendente',
    };
    const updated = [newLeave, ...leaves];
    saveLeaves(tenantId, updated);
    setLeaves(updated);
    notify(`Pedido de férias de ${leaveData.colaboradorNome} submetido para aprovação.`);
  };

  const handleDecideLeave = (leaveId: string, decision: 'aprovado_rh' | 'rejeitado', parecer: string) => {
    const targetLeave = leaves.find((l) => l.id === leaveId);
    const updated = leaves.map((l) => {
      if (l.id === leaveId) {
        return {
          ...l,
          estado: decision,
          decididoEm: new Date().toISOString().split('T')[0],
          decididoPor: currentUser?.nomeCompleto || 'Direcção de RH',
          parecerRh: parecer,
        };
      }
      return l;
    });
    saveLeaves(tenantId, updated);
    setLeaves(updated);

    // Se aprovado, abater no saldo de férias do colaborador
    if (decision === 'aprovado_rh' && targetLeave && targetLeave.tipo === 'ferias') {
      const updatedEmps = employees.map((e) => {
        if (e.id === targetLeave.colaboradorId) {
          const novoSaldo = Math.max(0, e.saldoDiasFeriasAno - targetLeave.totalDiasUteis);
          return { ...e, saldoDiasFeriasAno: novoSaldo };
        }
        return e;
      });
      saveEmployees(tenantId, updatedEmps);
      setEmployees(updatedEmps);
    }

    notify(`Pedido de férias ${decision === 'aprovado_rh' ? 'aprovado' : 'rejeitado'} com sucesso.`);
  };

  const handleGeneratePayroll = (mesNome: string, mesNumero: number, ano: number) => {
    const period = generateMonthlyPayroll(
      tenantId,
      mesNome,
      mesNumero,
      ano,
      currentUser?.nomeCompleto || 'Direcção de Recursos Humanos'
    );
    setPayroll(getStoredPayroll(tenantId));
    notify(`Folha de remunerações de ${mesNome}/${ano} gerada com sucesso (${period.totalColaboradores} colaboradores processados).`);
  };

  const handleConvertApplication = (appId: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return;

    const newEmp = convertApplicationToEmployee(
      tenantId,
      appId,
      departments[0]?.id || 'hr-dep-doc',
      departments[0]?.nome || 'Geral',
      jobPositions[0]?.id || 'job-003',
      jobPositions[0]?.titulo || 'Colaborador',
      'docente',
      320000
    );

    if (newEmp) {
      setEmployees(getStoredEmployees(tenantId));
      setApplications(getStoredApplications(tenantId));
      notify(`Candidato ${targetApp.candidatoNome} admitido directamente no quadro de colaboradores.`);
    }
  };

  const handleAddContractAdenda = (contractId: string, descricao: string) => {
    const updated = contracts.map((c) => {
      if (c.id === contractId) {
        return {
          ...c,
          adendas: [
            ...c.adendas,
            {
              id: `ad-${Date.now().toString().slice(-4)}`,
              dataAdenda: new Date().toISOString().split('T')[0],
              descricao,
              registadoPor: currentUser?.nomeCompleto || 'Técnico de RH',
            },
          ],
        };
      }
      return c;
    });
    saveContracts(tenantId, updated);
    setContracts(updated);
    notify('Adenda contratual registada com sucesso.');
  };

  const handleRenewContract = (contractId: string, novaDataTermo: string) => {
    const updated = contracts.map((c) => {
      if (c.id === contractId) {
        return {
          ...c,
          dataTermo: novaDataTermo,
          estado: 'renovado' as const,
        };
      }
      return c;
    });
    saveContracts(tenantId, updated);
    setContracts(updated);
    notify('Contrato a termo renovado com sucesso.');
  };

  // Submenus com badges e indicadores
  const menuItems: Array<{
    id: HrSubmenuKey;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    confidential?: boolean;
  }> = [
    { id: 'dashboard', label: '1. Dashboard RH', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'colaboradores', label: '2. Colaboradores', icon: <Users className="w-4 h-4" />, badge: employees.length },
    { id: 'recrutamento', label: '3. Recrutamento', icon: <Briefcase className="w-4 h-4" />, badge: vacancies.length },
    { id: 'departamentos', label: '4. Departamentos & Organograma', icon: <Building2 className="w-4 h-4" /> },
    { id: 'cargos', label: '5. Cargos & Funções', icon: <Layers className="w-4 h-4" /> },
    {
      id: 'contratos',
      label: '6. Contratos',
      icon: <FileText className="w-4 h-4" />,
      badge: contracts.filter((c) => c.estado === 'a_renovar').length || undefined,
    },
    { id: 'assiduidade', label: '7. Assiduidade & Ponto', icon: <Clock className="w-4 h-4" /> },
    {
      id: 'ferias',
      label: '8. Férias & Ausências',
      icon: <Palmtree className="w-4 h-4" />,
      badge: leaves.filter((l) => l.estado === 'pendente').length || undefined,
    },
    {
      id: 'disciplinar',
      label: '9. Processos Disciplinares',
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
      confidential: true,
      badge: disciplinary.length,
    },
    { id: 'desempenho', label: '10. Avaliação de Desempenho', icon: <Award className="w-4 h-4" /> },
    { id: 'formacao', label: '11. Formação Contínua', icon: <GraduationCap className="w-4 h-4" /> },
    {
      id: 'remuneracoes',
      label: '12. Remunerações & Salários',
      icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
      confidential: true,
    },
    { id: 'documentos', label: '13. Gestão Documental', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'relatorios', label: '14. Relatórios & Mapas', icon: <FileText className="w-4 h-4" /> },
    { id: 'configuracoes', label: '15. Configurações de RH', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho Oficial do Módulo de Recursos Humanos */}
      <div className="bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] rounded-2xl p-6 sm:p-7 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-1.5">
              <span>{currentSchoolName}</span>
              <span aria-hidden="true">·</span>
              <span>Gestão Integrada de Recursos Humanos</span>
              <span aria-hidden="true">·</span>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                LGT Angola
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Recursos Humanos & Corpo Docente
            </h1>
            <p className="mt-1.5 text-xs text-blue-100 leading-relaxed max-w-2xl">
              Gestão centralizada de colaboradores, professores, assiduidade, contratos de trabalho, férias regulamentares (22 dias), remunerações com IRT e processos disciplinares em estrito cumprimento da Lei nº 22/11 de Protecção de Dados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setIsNewEmployeeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white text-[#012041] hover:bg-blue-50 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 text-[#015FC4]" />
              <span>Admitir Colaborador</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido de Topo */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-blue-300 block text-[11px]">Quadro Total</span>
            <strong className="font-bold text-lg text-white font-mono mt-0.5 block">
              {employees.filter((e) => e.estadoProfissional !== 'cessado').length}
            </strong>
          </div>
          <div>
            <span className="text-blue-300 block text-[11px]">Docentes (Professores)</span>
            <strong className="font-bold text-lg text-teal-300 font-mono mt-0.5 block">
              {employees.filter((e) => e.tipoColaborador === 'docente' && e.estadoProfissional !== 'cessado').length}
            </strong>
          </div>
          <div>
            <span className="text-blue-300 block text-[11px]">Não Docentes</span>
            <strong className="font-bold text-lg text-white font-mono mt-0.5 block">
              {employees.filter((e) => e.tipoColaborador !== 'docente' && e.estadoProfissional !== 'cessado').length}
            </strong>
          </div>
          <div>
            <span className="text-blue-300 block text-[11px]">Contratos a Vencer</span>
            <strong className="font-bold text-lg text-amber-300 font-mono mt-0.5 block">
              {contracts.filter((c) => c.estado === 'a_renovar').length}
            </strong>
          </div>
          <div>
            <span className="text-blue-300 block text-[11px]">Férias Pendentes</span>
            <strong className="font-bold text-lg text-blue-200 font-mono mt-0.5 block">
              {leaves.filter((l) => l.estado === 'pendente').length}
            </strong>
          </div>
          <div>
            <span className="text-blue-300 block text-[11px]">Assiduidade Global</span>
            <strong className="font-bold text-lg text-emerald-300 font-mono mt-0.5 block">
              98.2%
            </strong>
          </div>
        </div>
      </div>

      {/* Barra de Submenus com os 15 Itens */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 shadow-2xs">
        {/* Visualização Mobile: Select Dropdown */}
        <div className="lg:hidden p-1">
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Módulo Seleccionado:</label>
          <div className="relative">
            <select
              value={activeSubmenu}
              onChange={(e) => setActiveSubmenu(e.target.value as HrSubmenuKey)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-gray-50 appearance-none pr-8 text-gray-900"
            >
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} {item.badge ? `(${item.badge})` : ''} {item.confidential ? '🔒' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Visualização Desktop: Barra Horizontal com Separadores Estilizados */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto text-xs font-semibold py-0.5">
          {menuItems.map((item) => {
            const isActive = activeSubmenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubmenu(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 select-none ${
                  isActive
                    ? 'bg-[#015FC4] text-white shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.confidential && (
                  <span title="Dado Confidencial">
                    <Lock className={`w-3 h-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Renderização do Conteúdo do Submenu Activo */}
      <div className="transition-all">
        {activeSubmenu === 'dashboard' && (
          <HrDashboardTab
            employees={employees}
            departments={departments}
            contracts={contracts}
            leaves={leaves}
            disciplinaryCases={disciplinary}
            alerts={alerts}
            onNavigateTab={setActiveSubmenu}
          />
        )}

        {activeSubmenu === 'colaboradores' && (
          <HrEmployeesTab
            employees={employees}
            departments={departments}
            jobPositions={jobPositions}
            onSelectEmployee={setSelectedEmpForDetail}
            onOpenNewModal={() => setIsNewEmployeeModalOpen(true)}
            onQuickClock={(colaboradorId, tipo) => handleClockInOut(colaboradorId, tipo, 'terminal_biometrico')}
            onQuickTerminate={(colaboradorId, offboarding) => {
              const emp = employees.find((e) => e.id === colaboradorId);
              if (emp) {
                terminateEmployee(tenantId, colaboradorId, offboarding);
                setEmployees(getStoredEmployees(tenantId));
                setContracts(getStoredContracts(tenantId));
                notify(`Processo de cessação de funções registado para ${emp.nomeCompleto}.`);
              }
            }}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'recrutamento' && (
          <HrRecruitmentTab
            vacancies={vacancies}
            applications={applications}
            departments={departments}
            jobPositions={jobPositions}
            onConvertApplication={handleConvertApplication}
            onAddVacancy={(v) => {
              const updated = [
                { ...v, id: `vag-${Date.now()}`, totalCandidaturas: 0 },
                ...vacancies,
              ];
              saveVacancies(tenantId, updated);
              setVacancies(updated);
              notify(`Vaga '${v.titulo}' publicada com sucesso.`);
            }}
            onUpdateApplication={(updatedApp) => {
              const updated = applications.map((a) => (a.id === updatedApp.id ? updatedApp : a));
              saveApplications(tenantId, updated);
              setApplications(updated);
              notify(`Candidatura de ${updatedApp.candidatoNome} actualizada.`);
            }}
            onAddApplication={(newApp) => {
              const fullApp: JobApplication = {
                ...newApp,
                id: `app-${Date.now()}`,
                convertidoEmColaborador: false,
              };
              const updated = [fullApp, ...applications];
              saveApplications(tenantId, updated);
              setApplications(updated);

              // Actualizar contador da vaga
              const updatedVacancies = vacancies.map((v) =>
                v.id === fullApp.vagaId ? { ...v, totalCandidaturas: v.totalCandidaturas + 1 } : v
              );
              saveVacancies(tenantId, updatedVacancies);
              setVacancies(updatedVacancies);

              notify(`Candidatura de ${fullApp.candidatoNome} registada com sucesso.`);
            }}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'departamentos' && (
          <HrDepartmentsJobsTab
            departments={departments}
            jobPositions={jobPositions}
            employees={employees}
            onAddDepartment={(d) => {
              const updated = [
                { ...d, id: `dep-${Date.now()}`, totalColaboradores: 0 },
                ...departments,
              ];
              saveHrDepartments(tenantId, updated);
              setDepartments(updated);
              notify(`Departamento '${d.nome}' criado.`);
            }}
            onAddJobPosition={(j) => {
              const updated = [
                { ...j, id: `job-${Date.now()}`, totalOcupantes: 0 },
                ...jobPositions,
              ];
              saveJobPositions(tenantId, updated);
              setJobPositions(updated);
              notify(`Cargo '${j.titulo}' adicionado ao catálogo.`);
            }}
          />
        )}

        {activeSubmenu === 'cargos' && (
          <HrDepartmentsJobsTab
            departments={departments}
            jobPositions={jobPositions}
            employees={employees}
            onAddDepartment={(d) => {
              const updated = [{ ...d, id: `dep-${Date.now()}`, totalColaboradores: 0 }, ...departments];
              saveHrDepartments(tenantId, updated);
              setDepartments(updated);
            }}
            onAddJobPosition={(j) => {
              const updated = [{ ...j, id: `job-${Date.now()}`, totalOcupantes: 0 }, ...jobPositions];
              saveJobPositions(tenantId, updated);
              setJobPositions(updated);
            }}
          />
        )}

        {activeSubmenu === 'contratos' && (
          <HrContractsTab
            contracts={contracts}
            employees={employees}
            onAddContractAdenda={handleAddContractAdenda}
            onRenewContract={handleRenewContract}
            onAddContract={(newCtr) => {
              const fullCtr: EmploymentContract = {
                ...newCtr,
                id: `ctr-${Date.now()}`,
                adendas: [],
              };
              const updated = [fullCtr, ...contracts];
              saveContracts(tenantId, updated);
              setContracts(updated);
              notify(`Contrato ${fullCtr.numeroContrato} emitido para ${fullCtr.colaboradorNome}.`);
            }}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'assiduidade' && (
          <HrAttendanceTab
            attendanceRecords={attendance}
            employees={employees}
            onClockInOut={handleClockInOut}
            onJustifyAbsence={handleJustifyAbsence}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'ferias' && (
          <HrLeavesTab
            leaves={leaves}
            employees={employees}
            onRequestLeave={handleRequestLeave}
            onDecideLeave={handleDecideLeave}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'disciplinar' && (
          <HrDisciplinaryTab
            disciplinaryCases={disciplinary}
            employees={employees}
            onAddCase={(c) => {
              const newCase: DisciplinaryCase = {
                ...c,
                id: `pd-${Date.now().toString().slice(-4)}`,
                numeroProcesso: `PD-${new Date().getFullYear()}/${disciplinary.length + 1}`,
                dataAbertura: new Date().toISOString().split('T')[0],
              };
              const updated = [newCase, ...disciplinary];
              saveDisciplinary(tenantId, updated);
              setDisciplinary(updated);
              notify(`Processo disciplinar ${newCase.numeroProcesso} instaurado formalmente.`);
            }}
            onUpdateCase={(uc) => {
              const updated = disciplinary.map((c) => (c.id === uc.id ? uc : c));
              saveDisciplinary(tenantId, updated);
              setDisciplinary(updated);
              notify(`Autos do processo ${uc.numeroProcesso} actualizados com decisão.`);
            }}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'desempenho' && (
          <HrPerformanceTab
            performanceReviews={performance}
            employees={employees}
            onAddReview={(rev) => {
              const updated = [{ ...rev, id: `pr-${Date.now()}` }, ...performance];
              savePerformance(tenantId, updated);
              setPerformance(updated);
              notify(`Avaliação de desempenho de ${rev.colaboradorNome} homologada.`);
            }}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'formacao' && (
          <HrTrainingTab
            trainings={training}
            employees={employees}
            onAddTraining={(tr) => {
              const updated = [{ ...tr, id: `trn-${Date.now()}` }, ...training];
              saveTraining(tenantId, updated);
              setTraining(updated);
              notify(`Acção de formação '${tr.tema}' agendada com sucesso.`);
            }}
            onToggleAttendance={(trainingId, colabId) => {
              const updated = training.map((tr) => {
                if (tr.id === trainingId) {
                  return {
                    ...tr,
                    participantes: tr.participantes.map((p) =>
                      p.colaboradorId === colabId
                        ? { ...p, presencaConfirmada: !p.presencaConfirmada }
                        : p
                    ),
                  };
                }
                return tr;
              });
              saveTraining(tenantId, updated);
              setTraining(updated);
            }}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'remuneracoes' && (
          <HrPayrollTab
            payrollPeriods={payroll}
            employees={employees}
            onGeneratePayroll={handleGeneratePayroll}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'documentos' && (
          <HrDocumentsTab
            documents={documents}
            employees={employees}
            onUploadDocument={(doc) => {
              const updated = [
                { ...doc, id: `doc-${Date.now()}`, dataUpload: new Date().toISOString().split('T')[0] },
                ...documents,
              ];
              saveEmployeeDocuments(tenantId, updated);
              setDocuments(updated);
              notify(`Documento '${doc.titulo}' anexado ao processo de ${doc.colaboradorNome}.`);
            }}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'relatorios' && (
          <HrReportsTab
            employees={employees}
            contracts={contracts}
            payrollPeriods={payroll}
            leaves={leaves}
            schoolName={currentSchoolName}
          />
        )}

        {activeSubmenu === 'configuracoes' && (
          <HrSettingsTab
            settings={settings}
            onSaveSettings={(s) => {
              saveHrSettings(tenantId, s);
              setSettings(s);
              notify('Parâmetros de configuração de RH actualizados.');
            }}
          />
        )}
      </div>

      {/* Modal: Ficha Completa do Colaborador (Separadores A a F) */}
      {selectedEmpForDetail && (
        <HrEmployeeDetailModal
          employee={selectedEmpForDetail}
          isOpen={!!selectedEmpForDetail}
          onClose={() => setSelectedEmpForDetail(null)}
          onUpdate={handleUpdateEmployee}
          onTerminate={handleTerminateEmployee}
          teacherAssignments={teacherAssignments}
          sections={sections}
          subjects={subjects}
        />
      )}

      {/* Modal: Novo Colaborador */}
      <HrNewEmployeeModal
        isOpen={isNewEmployeeModalOpen}
        onClose={() => setIsNewEmployeeModalOpen(false)}
        onSave={handleAddEmployee}
        departments={departments}
        jobPositions={jobPositions}
      />
    </div>
  );
};
