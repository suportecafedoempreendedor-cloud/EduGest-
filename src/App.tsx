/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ViewMode,
  UserRole,
  Student,
  NotaItem,
  Pagamento,
  School,
  SchoolState,
  AuditLog,
  ToastNotification,
  ToastType,
  Guardian,
  GuardianStudentRelation,
  HistoricoAcademico,
  MatriculaRecord,
  AssiduidadeRecord,
  ContaCorrenteItem,
  DocumentoItem,
  StudentState,
  GrauParentesco,
  AcademicYear,
  SchoolClass,
  Section,
  Subject,
  ClassSubject,
  Teacher,
  TeacherAssignment,
  SectionState,
  StudentAttendanceRecord,
  StaffMember,
  StaffAttendanceRecord,
  AttendanceSettings,
  AttendanceAlert,
  PaymentReference,
  OfficialReceipt,
  SchoolAnnouncement,
  HorarioAula,
  GuardianNotification,
  Lead,
  LeadSourceEntity,
  PipelineStage,
  Campaign,
  Activity,
  FollowUp,
  PipelineStageId,
} from './types';
import {
  ALUNOS_INICIAIS,
  NOTAS_INICIAIS,
  PAGAMENTOS_INICIAIS,
  ESCOLAS_SAAS_INICIAIS,
  AUDIT_LOGS_INICIAIS,
  ENCARREGADOS_INICIAIS,
  GUARDIAN_STUDENTS_INICIAIS,
  HISTORICO_ACADEMICO_MOCK,
  MATRICULAS_MOCK,
  ASSIDUIDADE_MOCK,
  CONTA_CORRENTE_MOCK,
  DOCUMENTOS_MOCK,
  ANOS_LECTIVOS_INICIAIS,
  CLASSES_INICIAIS,
  SECTIONS_INICIAIS,
  DISCIPLINAS_INICIAIS,
  CLASS_SUBJECTS_INICIAIS,
  PROFESSORES_INICIAIS,
  TEACHER_ASSIGNMENTS_INICIAIS,
  FUNCIONARIOS_INICIAIS,
  ASSIDUIDADE_ALUNOS_INICIAIS,
  ASSIDUIDADE_FUNCIONARIOS_INICIAIS,
  ATTENDANCE_SETTINGS_PADRAO,
  ALERTAS_ASSIDUIDADE_INICIAIS,
  REFERENCIAS_PAGAMENTO_INICIAIS,
  RECIBOS_OFICIAIS_INICIAIS,
  COMUNICADOS_INICIAIS,
  HORARIOS_INICIAIS,
  NOTIFICACOES_ENCARREGADOS_INICIAIS,
  PIPELINE_STAGES_PADRAO,
  LEAD_SOURCES_PADRAO,
  CAMPAIGNS_INICIAIS,
  CRM_STAFF_RESPONSAVEIS,
  LEADS_INICIAIS,
  ACTIVITIES_INICIAIS,
  FOLLOW_UPS_INICIAIS,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PedagogicalView } from './components/PedagogicalView';
import { AcademicStructureView } from './components/academic/AcademicStructureView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { GuardianPortalView } from './components/guardian/GuardianPortalView';
import { CrmDashboardView } from './components/crm/CrmDashboardView';
import { StudentsView } from './components/StudentsView';
import { FinancialView } from './components/FinancialView';
import { EduGestAiView } from './components/ai/EduGestAiView';
import { EduGestAiFloatingWidget } from './components/ai/EduGestAiFloatingWidget';
import { DesignSystemView } from './components/DesignSystemView';
import { SaasDashboardView } from './components/saas/SaasDashboardView';
import { SchoolsManagementView } from './components/saas/SchoolsManagementView';
import { SchoolOnboardingView } from './components/saas/SchoolOnboardingView';
import { AuditLogsView } from './components/saas/AuditLogsView';
import { SaasCommercialView } from './components/saas/SaasCommercialView';
import { TenantSubscriptionBanner } from './components/saas/TenantSubscriptionBanner';
import { DocumentsReportsView } from './components/documents/DocumentsReportsView';
import { ScheduledDataExportView } from './components/documents/ScheduledDataExportView';
import { LandingPageView } from './components/auth/LandingPageView';
import { LoginPageView } from './components/auth/LoginPageView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { InstitutionAdminRbacView } from './components/admin/InstitutionAdminRbacView';
import { HumanResourcesView } from './components/hr/HumanResourcesView';
import { AccountingView } from './components/AccountingView';
import { StudentPortalView } from './components/portal/StudentPortalView';
import { TeacherPortalView } from './components/portal/TeacherPortalView';
import {
  AuthUser,
  getStoredSessionUser,
  saveSessionUser,
  clearSessionUser,
  getDefaultViewForRole,
} from './services/authRbacService';
import {
  INITIAL_SAAS_PLANS,
  INITIAL_SAAS_SUBSCRIPTIONS,
  INITIAL_COMMERCIAL_CONFIG,
} from './data/mockCommercialData';
import {
  SaaSPlan,
  SaaSSubscription,
  SaaSCommercialConfig,
} from './types/saasCommercial';
import { NewEnrollmentModal } from './components/NewEnrollmentModal';
import { NewPaymentModal } from './components/NewPaymentModal';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredSessionUser());
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    const session = getStoredSessionUser();
    if (!session) return 'landing';
    return (getDefaultViewForRole(session.role) as ViewMode) || 'dashboard';
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const session = getStoredSessionUser();
    if (session?.role === 'super_admin') return 'super_admin';
    if (session?.role === 'guardian') return 'guardian';
    return 'school_admin';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    saveSessionUser(user);
    if (user.role === 'super_admin') {
      setUserRole('super_admin');
    } else if (user.role === 'guardian') {
      setUserRole('guardian');
    } else {
      setUserRole('school_admin');
    }
    const targetView = (getDefaultViewForRole(user.role) as ViewMode) || 'dashboard';
    setCurrentView(targetView);
    showToast({
      type: 'success',
      title: 'Sessão Iniciada',
      message: `Bem-vindo, ${user.nomeCompleto} (${user.cargo}).`,
    });
  };

  const handleLogout = () => {
    clearSessionUser();
    setCurrentUser(null);
    setCurrentView('landing');
    showToast({
      type: 'info',
      title: 'Sessão Encerrada',
      message: 'A sua sessão foi terminada com segurança.',
    });
  };

  // Network Simulation State for Error Resilience Testing
  const [isSimulatingNetworkFailure, setIsSimulatingNetworkFailure] = useState(false);

  // SaaS Core State
  const [schools, setSchools] = useState<School[]>(ESCOLAS_SAAS_INICIAIS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(AUDIT_LOGS_INICIAIS);
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>(INITIAL_SAAS_PLANS);
  const [saasSubscriptions, setSaasSubscriptions] = useState<SaaSSubscription[]>(
    INITIAL_SAAS_SUBSCRIPTIONS
  );
  const [commercialConfig, setCommercialConfig] = useState<SaaSCommercialConfig>(
    INITIAL_COMMERCIAL_CONFIG
  );
  const [selectedSchool, setSelectedSchool] = useState<string>(
    ESCOLAS_SAAS_INICIAIS[0]?.nome || 'Colégio Welwitschia Mirabilis'
  );

  // Tenant Core Data State (Alunos, Encarregados & Registos Académicos)
  const [students, setStudents] = useState<Student[]>(ALUNOS_INICIAIS);
  const [guardians, setGuardians] = useState<Guardian[]>(ENCARREGADOS_INICIAIS);
  const [guardianStudents, setGuardianStudents] = useState<GuardianStudentRelation[]>(
    GUARDIAN_STUDENTS_INICIAIS
  );
  const [historicoMap, setHistoricoMap] = useState<Record<string, HistoricoAcademico[]>>(
    HISTORICO_ACADEMICO_MOCK
  );
  const [matriculasMap, setMatriculasMap] = useState<Record<string, MatriculaRecord[]>>(
    MATRICULAS_MOCK
  );
  const [assiduidadeMap, setAssiduidadeMap] = useState<Record<string, AssiduidadeRecord[]>>(
    ASSIDUIDADE_MOCK
  );
  const [contaCorrenteMap, setContaCorrenteMap] = useState<Record<string, ContaCorrenteItem[]>>(
    CONTA_CORRENTE_MOCK
  );
  const [documentosMap, setDocumentosMap] = useState<Record<string, DocumentoItem[]>>(
    DOCUMENTOS_MOCK
  );
  const [notas, setNotas] = useState<NotaItem[]>(NOTAS_INICIAIS);
  const [payments, setPayments] = useState<Pagamento[]>(PAGAMENTOS_INICIAIS);

  // Módulo de Estrutura Académica (Multi-Tenant Scoped)
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(ANOS_LECTIVOS_INICIAIS);
  const [academicClasses, setAcademicClasses] = useState<SchoolClass[]>(CLASSES_INICIAIS);
  const [sections, setSections] = useState<Section[]>(SECTIONS_INICIAIS);
  const [subjects, setSubjects] = useState<Subject[]>(DISCIPLINAS_INICIAIS);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>(CLASS_SUBJECTS_INICIAIS);
  const [teachers, setTeachers] = useState<Teacher[]>(PROFESSORES_INICIAIS);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>(
    TEACHER_ASSIGNMENTS_INICIAIS
  );

  // Módulo de Assiduidade (Alunos, Professores & Funcionários)
  const [staffList, setStaffList] = useState<StaffMember[]>(FUNCIONARIOS_INICIAIS);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>(
    ASSIDUIDADE_ALUNOS_INICIAIS
  );
  const [staffAttendanceRecords, setStaffAttendanceRecords] = useState<StaffAttendanceRecord[]>(
    ASSIDUIDADE_FUNCIONARIOS_INICIAIS
  );
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings>(
    ATTENDANCE_SETTINGS_PADRAO
  );
  const [attendanceAlerts, setAttendanceAlerts] = useState<AttendanceAlert[]>(
    ALERTAS_ASSIDUIDADE_INICIAIS
  );

  // Portal do Encarregado de Educação
  const [paymentReferences, setPaymentReferences] = useState<PaymentReference[]>(
    REFERENCIAS_PAGAMENTO_INICIAIS
  );
  const [officialReceipts, setOfficialReceipts] = useState<OfficialReceipt[]>(
    RECIBOS_OFICIAIS_INICIAIS
  );
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(
    COMUNICADOS_INICIAIS
  );
  const [guardianNotifications, setGuardianNotifications] = useState<GuardianNotification[]>(
    NOTIFICACOES_ENCARREGADOS_INICIAIS
  );
  const [timetables, setTimetables] = useState<Record<string, HorarioAula[]>>(
    HORARIOS_INICIAIS
  );

  // CRM Escolar & Funil de Admissões
  const [pipelineStages] = useState<PipelineStage[]>(PIPELINE_STAGES_PADRAO);
  const [leadSources] = useState<LeadSourceEntity[]>(LEAD_SOURCES_PADRAO);
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS_INICIAIS);
  const [leads, setLeads] = useState<Lead[]>(LEADS_INICIAIS);
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES_INICIAIS);
  const [followUps, setFollowUps] = useState<FollowUp[]>(FOLLOW_UPS_INICIAIS);

  // Modals
  const [isNewEnrollmentOpen, setIsNewEnrollmentOpen] = useState(false);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);

  // Toast Notifications Stack (Design System)
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (toastInput: Omit<ToastNotification, 'id'> | string) => {
    const newToast: ToastNotification =
      typeof toastInput === 'string'
        ? {
            id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: 'info',
            message: toastInput,
            duration: 4000,
          }
        : {
            id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            duration: toastInput.duration ?? (toastInput.type === 'error' ? 6500 : 4500),
            ...toastInput,
          };

    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Administrative Actions with Network & Processing Error Capture
  const handleUpdateSchool = async (updatedSchool: School): Promise<boolean> => {
    try {
      // 1. Validar integridade dos dados (Processamento)
      if (!updatedSchool.nome || updatedSchool.nome.trim().length < 3) {
        throw new Error('Falha de validação: O nome da escola deve conter pelo menos 3 caracteres.');
      }
      if (!updatedSchool.nif || updatedSchool.nif.trim().length < 9) {
        throw new Error('Falha fiscal: NIF angolano inválido. O NIF deve conter no mínimo 9 dígitos.');
      }

      // Verificar unicidade de NIF
      const duplicateNif = schools.find(
        (s) =>
          s.id !== updatedSchool.id &&
          s.nif.trim().toLowerCase() === updatedSchool.nif.trim().toLowerCase()
      );
      if (duplicateNif) {
        throw new Error(
          `Conflito cadastral: O NIF ${updatedSchool.nif} já está registado na instituição "${duplicateNif.nome}".`
        );
      }

      if (!updatedSchool.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedSchool.email)) {
        throw new Error('Falha cadastral: O e-mail institucional informado possui formato inválido.');
      }

      // 2. Simulação de Falha de Rede / Conectividade
      if (isSimulatingNetworkFailure) {
        throw new Error(
          'Falha de rede: Não foi possível conectar ao servidor EduGest (HTTP 503 Service Unavailable / Timeout de 15000ms). Verifique a ligação à internet.'
        );
      }

      // Atualização no estado
      setSchools((prev) =>
        prev.map((s) => (s.id === updatedSchool.id ? updatedSchool : s))
      );

      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
        autorNome: userRole === 'super_admin' ? 'Super Admin EduGest (Sistema)' : 'Admin da Escola',
        autorEmail: 'admin@edugest.ao',
        acao: 'Actualização Cadastral',
        escolaId: updatedSchool.id,
        escolaNome: updatedSchool.nome,
        detalhes: `Informações de "${updatedSchool.nome}" atualizadas (Plano: ${updatedSchool.plano}, Telefone: ${updatedSchool.telefone}).`,
        tipo: 'edicao',
        ip: '197.149.20.88',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      showToast({
        type: 'success',
        title: 'Dados Actualizados',
        message: `As informações da instituição "${updatedSchool.nome}" foram gravadas com sucesso.`,
      });
      return true;
    } catch (err: any) {
      // Registo de falha no histórico de auditoria
      const failureLog: AuditLog = {
        id: `log-${Date.now()}`,
        dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
        autorNome: userRole === 'super_admin' ? 'Super Admin EduGest (Sistema)' : 'Admin da Escola',
        autorEmail: 'admin@edugest.ao',
        acao: 'Falha na Actualização Cadastral',
        escolaId: updatedSchool.id,
        escolaNome: updatedSchool.nome,
        detalhes: `Erro capturado: ${err.message || 'Erro inesperado no processamento de dados.'}`,
        tipo: 'seguranca',
        ip: '197.149.20.88',
      };
      setAuditLogs((prev) => [failureLog, ...prev]);

      // Exibir Toast de Erro do Design System
      showToast({
        type: 'error',
        title: isSimulatingNetworkFailure ? 'Falha de Conexão de Rede' : 'Erro no Processamento de Dados',
        message: err.message || 'Ocorreu uma falha no processamento da solicitação administrativa.',
        action: isSimulatingNetworkFailure
          ? {
              label: 'Desactivar Simulação de Erro',
              onClick: () => setIsSimulatingNetworkFailure(false),
            }
          : undefined,
      });
      return false;
    }
  };

  const handleUpdateSchoolState = async (
    schoolId: string,
    newState: SchoolState,
    motivo?: string
  ): Promise<boolean> => {
    try {
      const target = schools.find((s) => s.id === schoolId);
      if (!target) {
        throw new Error(`Instituição com código ${schoolId} não foi encontrada.`);
      }

      // Regras de negócio / validação de transição de estado
      if (target.estado === 'cancelada' && newState === 'suspensa') {
        throw new Error(
          'Transição inválida: Não é permitido suspender uma instituição com subscrição cancelada. Utilize o comando "Restaurar" primeiro.'
        );
      }
      if (target.estado === newState) {
        throw new Error(
          `A escola "${target.nome}" já se encontra com o estado "${newState}".`
        );
      }
      if (newState === 'cancelada' && (!motivo || motivo.trim().length < 5)) {
        throw new Error(
          'Validação obrigatória: É necessário fornecer uma justificação de cancelamento com no mínimo 5 caracteres.'
        );
      }

      // Simulação de falha de rede
      if (isSimulatingNetworkFailure) {
        throw new Error(
          'Falha de rede: A transição de estado foi recusada devido a perda de conexão com o cluster de subscrições (ERR_NETWORK_DISCONNECTED).'
        );
      }

      const stateLabels: Record<SchoolState, string> = {
        activa: 'Activa',
        trial: 'Trial (Período Experimental)',
        suspensa: 'Suspensa',
        cancelada: 'Cancelada',
      };

      setSchools((prev) =>
        prev.map((s) => (s.id === schoolId ? { ...s, estado: newState } : s))
      );

      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
        autorNome: 'Super Admin EduGest (Sistema)',
        autorEmail: 'admin@edugest.ao',
        acao: `Estado Alterado para ${stateLabels[newState]}`,
        escolaId: schoolId,
        escolaNome: target.nome,
        detalhes: motivo
          ? `Motivo especificado: "${motivo}".`
          : `Transição para o estado ${stateLabels[newState]} executada pelo Administrador da Plataforma.`,
        tipo: 'estado',
        ip: '197.149.20.88',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      showToast({
        type: 'success',
        title: 'Estado Actualizado',
        message: `O estado da escola "${target.nome}" foi alterado para ${stateLabels[newState]} com sucesso.`,
      });
      return true;
    } catch (err: any) {
      const target = schools.find((s) => s.id === schoolId);
      const failureLog: AuditLog = {
        id: `log-${Date.now()}`,
        dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
        autorNome: 'Super Admin EduGest (Sistema)',
        autorEmail: 'admin@edugest.ao',
        acao: 'Falha na Transição de Estado',
        escolaId: schoolId,
        escolaNome: target?.nome || 'Escola',
        detalhes: `Tentativa de transição para ${newState} falhou: ${err.message}`,
        tipo: 'seguranca',
        ip: '197.149.20.88',
      };
      setAuditLogs((prev) => [failureLog, ...prev]);

      showToast({
        type: 'error',
        title: isSimulatingNetworkFailure ? 'Falha de Comunicação' : 'Acção Administrativa Não Autorizada',
        message: err.message || 'Falha ao alterar o estado operacional da escola.',
        action: isSimulatingNetworkFailure
          ? {
              label: 'Desactivar Simulação de Erro',
              onClick: () => setIsSimulatingNetworkFailure(false),
            }
          : undefined,
      });
      return false;
    }
  };

  // SaaS Commercial Management Handlers
  const handleUpdatePlan = (updatedPlan: SaaSPlan) => {
    setSaasPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );
  };

  const handleCreatePlan = (newPlan: SaaSPlan) => {
    setSaasPlans((prev) => [...prev, newPlan]);
  };

  const handleUpdateSubscription = (updatedSub: SaaSSubscription) => {
    setSaasSubscriptions((prev) =>
      prev.map((s) => (s.id === updatedSub.id ? updatedSub : s))
    );
    // Sincronizar estado na lista de escolas
    setSchools((prev) =>
      prev.map((sch) => {
        if (sch.id === updatedSub.escolaId) {
          let newSchoolState: School['estado'] = sch.estado;
          if (updatedSub.estado === 'active') newSchoolState = 'activa';
          else if (updatedSub.estado === 'suspended') newSchoolState = 'suspensa';
          else if (updatedSub.estado === 'trial') newSchoolState = 'trial';
          else if (updatedSub.estado === 'cancelled') newSchoolState = 'cancelada';
          return {
            ...sch,
            plano: updatedSub.planoNome as any,
            valorMensalKz: updatedSub.valorKz,
            estado: newSchoolState,
          };
        }
        return sch;
      })
    );
  };

  const handleReactivateSubscription = (subscriptionId: string) => {
    setSaasSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === subscriptionId) {
          const nextRenovacao = new Date();
          nextRenovacao.setDate(nextRenovacao.getDate() + 30);
          const newEvent = {
            id: `ev-${Date.now()}`,
            data: new Date().toISOString().replace('T', ' ').substring(0, 16),
            tipo: 'reactivacao' as const,
            descricao: 'Subscrição reactivada com sucesso. Acesso integral desbloqueado e dados preservados.',
            valorKz: sub.valorKz,
            estado: 'pago' as const,
            autor: 'Administração EduGest',
          };
          return {
            ...sub,
            estado: 'active' as const,
            bloqueioNivel: 'nenhum' as const,
            dataRenovacao: nextRenovacao.toISOString().split('T')[0],
            historico: [newEvent, ...sub.historico],
          };
        }
        return sub;
      })
    );
    const subTarget = saasSubscriptions.find((s) => s.id === subscriptionId);
    if (subTarget) {
      setSchools((prev) =>
        prev.map((sch) =>
          sch.id === subTarget.escolaId ? { ...sch, estado: 'activa' } : sch
        )
      );
    }
    showToast({
      type: 'success',
      title: 'Subscrição Reactivada',
      message: 'O acesso da escola foi reactivado e todos os dados pedagógicos continuam preservados.',
    });
  };

  const handleUpdateCommercialConfig = (newConfig: SaaSCommercialConfig) => {
    setCommercialConfig(newConfig);
    showToast({
      type: 'success',
      title: 'Configurações Comerciais Gravadas',
      message: 'Parâmetros de trial e régua de bloqueio gradual atualizados.',
    });
  };

  const handleAddSchool = async (newSchool: School): Promise<boolean> => {
    try {
      // 1. Validação de dados de onboarding
      if (!newSchool.nome || newSchool.nome.trim().length < 3) {
        throw new Error('Falha no onboarding: Nome da instituição inválido.');
      }
      if (!newSchool.nif || newSchool.nif.trim().length < 9) {
        throw new Error('Falha fiscal: NIF da instituição deve conter pelo menos 9 dígitos.');
      }

      const duplicateNif = schools.find(
        (s) => s.nif.trim().toLowerCase() === newSchool.nif.trim().toLowerCase()
      );
      if (duplicateNif) {
        throw new Error(
          `Conflito cadastral: O NIF ${newSchool.nif} já está registado na plataforma pela instituição "${duplicateNif.nome}".`
        );
      }

      if (!newSchool.adminEmail || !newSchool.adminEmail.includes('@')) {
        throw new Error('Falha no onboarding: E-mail do administrador de tenant inválido.');
      }

      // 2. Simulação de falha de rede
      if (isSimulatingNetworkFailure) {
        throw new Error(
          'Falha de rede: Timeout ao provisionar base de dados e domínio do tenant (API Gateway 504 Gateway Timeout). Tente novamente.'
        );
      }

      setSchools((prev) => [newSchool, ...prev]);

      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
        autorNome: 'Super Admin EduGest (Sistema)',
        autorEmail: 'admin@edugest.ao',
        acao: 'Escola Criada via Onboarding',
        escolaId: newSchool.id,
        escolaNome: newSchool.nome,
        detalhes: `Novo tenant criado com sucesso para "${newSchool.nome}" (${newSchool.provincia}). Administrador ${newSchool.adminNome} configurado.`,
        tipo: 'onboarding',
        ip: '197.149.24.12',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      showToast({
        type: 'success',
        title: 'Tenant Homologado',
        message: `Escola "${newSchool.nome}" provisionada com sucesso no sistema SaaS!`,
      });
      return true;
    } catch (err: any) {
      const failureLog: AuditLog = {
        id: `log-${Date.now()}`,
        dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
        autorNome: 'Super Admin EduGest (Sistema)',
        autorEmail: 'admin@edugest.ao',
        acao: 'Falha no Provisionamento de Escola',
        escolaId: newSchool.id,
        escolaNome: newSchool.nome,
        detalhes: `Erro no onboarding: ${err.message}`,
        tipo: 'onboarding',
        ip: '197.149.24.12',
      };
      setAuditLogs((prev) => [failureLog, ...prev]);

      showToast({
        type: 'error',
        title: isSimulatingNetworkFailure ? 'Falha de Rede no Provisionamento' : 'Inconsistência de Dados no Onboarding',
        message: err.message || 'Falha ao provisionar o novo tenant escolar.',
        action: isSimulatingNetworkFailure
          ? {
              label: 'Desactivar Simulação de Erro',
              onClick: () => setIsSimulatingNetworkFailure(false),
            }
          : undefined,
      });
      return false;
    }
  };

  const handleTriggerTestError = (type: 'network' | 'validation') => {
    if (type === 'network') {
      showToast({
        type: 'error',
        title: 'Erro de Rede (HTTP 503)',
        message:
          'Falha de comunicação com o cluster central do EduGest Angola. O servidor não respondeu no tempo limite (Timeout 15000ms).',
        action: {
          label: 'Tentar Novamente',
          onClick: () => {
            showToast({
              type: 'info',
              title: 'Reconexão de Rede',
              message: 'A restabelecer handshake seguro com o gateway de serviços...',
            });
          },
        },
      });
    } else {
      showToast({
        type: 'error',
        title: 'Erro de Processamento de Dados',
        message:
          'O NIF fiscal informado (5418029412) já se encontra atribuído a outra instituição no cadastro do Ministério das Finanças.',
      });
    }
  };

  const handleSelectSchoolTenant = (school: School) => {
    setSelectedSchool(school.nome);
    setCurrentView('dashboard');
    showToast(`Acesso concedido ao tenant "${school.nome}".`);
  };

  const handleChangeUserRole = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'school_admin') {
      if (currentView.startsWith('saas-')) {
        setCurrentView('dashboard');
      }
      showToast(
        `Modo alternado para Administrador da Escola (${selectedSchool}). Acesso isolado ao seu tenant.`
      );
    } else {
      showToast('Modo alternado para Administrador da Plataforma (Super Admin SaaS).');
    }
  };

  const handleAddStudent = (newStudent: Student, guardianIdToAssociate?: string) => {
    setStudents((prev) => [newStudent, ...prev]);

    // Associar encarregado de educação se indicado (guardian_students)
    if (guardianIdToAssociate) {
      const associatedGuardian = guardians.find((g) => g.id === guardianIdToAssociate);
      const newRelation: GuardianStudentRelation = {
        id: `rel-${Date.now()}`,
        guardianId: guardianIdToAssociate,
        studentId: newStudent.id,
        grauParentesco: associatedGuardian?.grauParentescoPrincipal || 'Pai',
        isPrincipal: true,
        autorizadoBuscarAluno: true,
        contactoEmergencia: true,
      };
      setGuardianStudents((prev) => [newRelation, ...prev]);
    }

    // Criar registo inicial de matrícula homologada
    const newMatricula: MatriculaRecord = {
      id: `mat-${Date.now()}`,
      studentId: newStudent.id,
      numeroMatricula: newStudent.numeroMatricula || newStudent.processo,
      anoLectivo: newStudent.anoLectivo || '2025/2026',
      classe: newStudent.classe,
      turma: newStudent.turmaNome,
      dataMatricula: new Date().toISOString().split('T')[0],
      responsavelRegisto: 'Secretaria Geral EduGest',
      estado: 'Confirmada',
      reciboEmolumentos: `EMOL-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setMatriculasMap((prev) => ({
      ...prev,
      [newStudent.id]: [newMatricula, ...(prev[newStudent.id] || [])],
    }));

    // Registo de auditoria administrativa
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Novo Aluno Matriculado',
      escolaId: newStudent.escolaId,
      escolaNome: newStudent.escolaNome,
      detalhes: `Estudante "${newStudent.nomeCompleto}" matriculado na ${newStudent.turmaNome} com nº de matrícula ${newStudent.numeroMatricula}.`,
      tipo: 'criacao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Matrícula Homologada',
      message: `Aluno(a) "${newStudent.nomeCompleto}" registado com sucesso sob o processo ${newStudent.numeroMatricula}!`,
    });
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Ficha do Aluno Actualizada',
      escolaId: updatedStudent.escolaId,
      escolaNome: updatedStudent.escolaNome,
      detalhes: `Dados cadastrais de "${updatedStudent.nomeCompleto}" foram actualizados.`,
      tipo: 'edicao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Ficha Actualizada',
      message: `Dados do aluno "${updatedStudent.nomeCompleto}" salvos com sucesso.`,
    });
  };

  const handleUpdateStudentState = (studentId: string, newState: StudentState) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;

    const stateLabels: Record<StudentState, string> = {
      activo: 'Activo',
      inscrito: 'Inscrito',
      pre_inscrito: 'Pré inscrito',
      suspenso: 'Suspenso',
      transferido: 'Transferido',
      concluido: 'Concluído',
      inactivo: 'Inactivo',
    };

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, estado: newState } : s))
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Estado do Aluno Alterado',
      escolaId: target.escolaId,
      escolaNome: target.escolaNome,
      detalhes: `Estado operacional de "${target.nomeCompleto}" alterado para ${stateLabels[newState]}.`,
      tipo: 'estado',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Estado Discente Actualizado',
      message: `O aluno "${target.nomeCompleto}" foi alterado para o estado "${stateLabels[newState]}".`,
    });
  };

  const handleAddGuardian = (
    newGuardian: Guardian,
    relations: { studentId: string; grau: GrauParentesco; isPrincipal: boolean }[]
  ) => {
    setGuardians((prev) => [newGuardian, ...prev]);

    const newRelations: GuardianStudentRelation[] = relations.map((r, i) => ({
      id: `rel-${Date.now()}-${i}`,
      guardianId: newGuardian.id,
      studentId: r.studentId,
      grauParentesco: r.grau,
      isPrincipal: r.isPrincipal,
      autorizadoBuscarAluno: true,
      contactoEmergencia: true,
    }));
    setGuardianStudents((prev) => [...newRelations, ...prev]);

    // Actualizar campos desnormalizados nos alunos quando o encarregado é principal
    relations.forEach((r) => {
      if (r.isPrincipal) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === r.studentId
              ? {
                  ...s,
                  encarregadoNome: `${newGuardian.nome} (${r.grau})`,
                  encarregadoContacto: newGuardian.telefone,
                }
              : s
          )
        );
      }
    });

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Novo Encarregado Cadastrado',
      detalhes: `Encarregado "${newGuardian.nome}" registado com ${relations.length} educando(s) associado(s) (tabela guardian_students).`,
      tipo: 'criacao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Encarregado Registado',
      message: `Encarregado "${newGuardian.nome}" cadastrado com sucesso!`,
    });
  };

  const handleUpdateGuardian = (updatedGuardian: Guardian) => {
    setGuardians((prev) =>
      prev.map((g) => (g.id === updatedGuardian.id ? updatedGuardian : g))
    );

    showToast({
      type: 'success',
      title: 'Encarregado Actualizado',
      message: `Dados do tutor "${updatedGuardian.nome}" gravados com sucesso.`,
    });
  };

  const handleAssociateGuardianStudent = (
    relationData: Omit<GuardianStudentRelation, 'id'>
  ) => {
    const existing = guardianStudents.find(
      (r) =>
        r.guardianId === relationData.guardianId &&
        r.studentId === relationData.studentId
    );

    if (existing) {
      setGuardianStudents((prev) =>
        prev.map((r) => (r.id === existing.id ? { ...r, ...relationData } : r))
      );
    } else {
      const newRel: GuardianStudentRelation = {
        id: `rel-${Date.now()}`,
        ...relationData,
      };
      setGuardianStudents((prev) => [newRel, ...prev]);
    }

    const g = guardians.find((x) => x.id === relationData.guardianId);
    const st = students.find((x) => x.id === relationData.studentId);

    if (relationData.isPrincipal && g && st) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === st.id
            ? {
                ...s,
                encarregadoNome: `${g.nome} (${relationData.grauParentesco})`,
                encarregadoContacto: g.telefone,
              }
            : s
        )
      );
    }

    showToast({
      type: 'success',
      title: 'Vínculo Estabelecido',
      message: `Relação guardian_students registada com sucesso!`,
    });
  };

  const handleRemoveGuardianStudentRelation = (relationId: string) => {
    setGuardianStudents((prev) => prev.filter((r) => r.id !== relationId));
    showToast({
      type: 'info',
      title: 'Vínculo Removido',
      message: 'A associação entre encarregado e educando foi desfeita.',
    });
  };

  const handleAddPayment = (newPayment: Pagamento) => {
    setPayments([newPayment, ...payments]);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === newPayment.alunoId ? { ...s, statusPropina: 'em_dia' } : s
      )
    );
    showToast(
      `Recibo ${newPayment.reciboNumero} emitido com sucesso (${newPayment.valorKz.toLocaleString('pt-AO')} Kz)!`
    );
  };

  const handleUpdateNota = (updatedNota: NotaItem) => {
    setNotas((prev) => {
      const idx = prev.findIndex(
        (n) =>
          n.alunoId === updatedNota.alunoId &&
          n.disciplina === updatedNota.disciplina &&
          n.trimestre === updatedNota.trimestre
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedNota;
        return copy;
      }
      return [...prev, updatedNota];
    });
  };

  // ==========================================
  // GESTÃO DA ESTRUTURA ACADÉMICA (MULTI-TENANT)
  // ==========================================
  const handleSaveAcademicYear = (year: AcademicYear) => {
    setAcademicYears((prev) => {
      const exists = prev.some((y) => y.id === year.id);
      if (exists) {
        return prev.map((y) => (y.id === year.id ? year : y));
      }
      return [year, ...prev];
    });

    if (year.estado === 'activo') {
      setAcademicYears((prev) =>
        prev.map((y) =>
          y.escolaId === year.escolaId
            ? {
                ...y,
                estado: y.id === year.id ? 'activo' : y.estado === 'activo' ? 'encerrado' : y.estado,
              }
            : y
        )
      );
      setSchools((prev) =>
        prev.map((s) => (s.id === year.escolaId ? { ...s, anoLectivoActivo: year.nome } : s))
      );
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Ano Lectivo Configurado',
      escolaId: year.escolaId,
      detalhes: `Ano lectivo "${year.nome}" (${year.estado}) com calendário e trimestres configurados.`,
      tipo: 'edicao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Ano Lectivo Salvo',
      message: `Ano lectivo ${year.nome} configurado com sucesso!`,
    });
  };

  const handleActivateAcademicYear = (yearId: string) => {
    const targetYear = academicYears.find((y) => y.id === yearId);
    if (!targetYear) return;

    setAcademicYears((prev) =>
      prev.map((y) =>
        y.escolaId === targetYear.escolaId
          ? {
              ...y,
              estado: y.id === yearId ? 'activo' : y.estado === 'activo' ? 'encerrado' : y.estado,
            }
          : y
      )
    );

    setSchools((prev) =>
      prev.map((s) => (s.id === targetYear.escolaId ? { ...s, anoLectivoActivo: targetYear.nome } : s))
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Ano Lectivo Activado',
      escolaId: targetYear.escolaId,
      detalhes: `Ano lectivo "${targetYear.nome}" foi definido como o ano activo da instituição.`,
      tipo: 'estado',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Ano Lectivo Activado',
      message: `Ano lectivo ${targetYear.nome} activado com sucesso!`,
    });
  };

  const handleCloseAcademicYear = (yearId: string) => {
    const targetYear = academicYears.find((y) => y.id === yearId);
    if (!targetYear) return;

    setAcademicYears((prev) =>
      prev.map((y) => (y.id === yearId ? { ...y, estado: 'encerrado' } : y))
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Ano Lectivo Encerrado',
      escolaId: targetYear.escolaId,
      detalhes: `Ano lectivo "${targetYear.nome}" foi oficialmente encerrado e arquivado.`,
      tipo: 'estado',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'warning',
      title: 'Ano Lectivo Encerrado',
      message: `Ano lectivo ${targetYear.nome} foi encerrado.`,
    });
  };

  const handleSaveClass = (classe: SchoolClass) => {
    setAcademicClasses((prev) => {
      const exists = prev.some((c) => c.id === classe.id);
      if (exists) {
        return prev.map((c) => (c.id === classe.id ? classe : c));
      }
      return [...prev, classe];
    });

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Classe Curricular Configurada',
      escolaId: classe.escolaId,
      detalhes: `Classe "${classe.nome}" (${classe.ciclo}) adicionada/actualizada.`,
      tipo: 'criacao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Classe Guardada',
      message: `Classe "${classe.nome}" configurada com sucesso.`,
    });
  };

  const handleToggleClassStatus = (classId: string) => {
    setAcademicClasses((prev) =>
      prev.map((c) =>
        c.id === classId
          ? { ...c, estado: c.estado === 'activa' ? 'inactiva' : 'activa' }
          : c
      )
    );
    showToast('Estado da classe curricular actualizado.');
  };

  const handleSaveSection = (section: Section) => {
    setSections((prev) => {
      const exists = prev.some((s) => s.id === section.id);
      if (exists) {
        return prev.map((s) => (s.id === section.id ? section : s));
      }
      return [section, ...prev];
    });

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Turma Criada/Actualizada',
      escolaId: section.escolaId,
      detalhes: `Turma "${section.nome}" (${section.turno}, ${section.sala}) registada com Director ${section.directorTurma}.`,
      tipo: 'criacao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Turma Salva',
      message: `Turma "${section.nome}" gravada com sucesso!`,
    });
  };

  const handleUpdateSectionState = (sectionId: string, newState: SectionState) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, estado: newState } : s))
    );
    showToast(`Estado da turma alterado para "${newState}".`);
  };

  const handleSaveSubject = (subject: Subject) => {
    setSubjects((prev) => {
      const exists = prev.some((s) => s.id === subject.id);
      if (exists) {
        return prev.map((s) => (s.id === subject.id ? subject : s));
      }
      return [subject, ...prev];
    });

    showToast({
      type: 'success',
      title: 'Disciplina Registada',
      message: `Disciplina "${subject.nome}" [${subject.codigo}] configurada com ${subject.cargaHorariaSemanal} tempos.`,
    });
  };

  const handleSaveClassSubject = (classSubject: ClassSubject) => {
    setClassSubjects((prev) => [classSubject, ...prev]);
    showToast({
      type: 'success',
      title: 'Matriz Curricular Actualizada',
      message: `${classSubject.subjectNome} vinculada a ${classSubject.classeNome} (${classSubject.cargaHorariaSemanal} tempos).`,
    });
  };

  const handleRemoveClassSubject = (id: string) => {
    setClassSubjects((prev) => prev.filter((cs) => cs.id !== id));
    showToast({
      type: 'info',
      title: 'Disciplina Removida',
      message: 'Disciplina desvinculada da matriz curricular da classe.',
    });
  };

  const handleSaveTeacherAssignment = (assignment: TeacherAssignment) => {
    setTeacherAssignments((prev) => [assignment, ...prev]);

    if (assignment.isDirectorTurma) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === assignment.turmaId
            ? { ...s, directorTurma: assignment.professorNome }
            : s
        )
      );
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Admin da Escola',
      autorEmail: 'admin@edugest.ao',
      acao: 'Atribuição Docente Efectuada',
      escolaId: assignment.escolaId,
      detalhes: `Docente ${assignment.professorNome} associado a ${assignment.subjectNome} na turma ${assignment.turmaNome}.`,
      tipo: 'criacao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Atribuição Concluída',
      message: `${assignment.professorNome} associado a ${assignment.turmaNome}.`,
    });
  };

  const handleRemoveTeacherAssignment = (id: string) => {
    setTeacherAssignments((prev) => prev.filter((ta) => ta.id !== id));
    showToast({
      type: 'info',
      title: 'Atribuição Removida',
      message: 'A atribuição docente foi cancelada.',
    });
  };

  const handleSeedTemplateStructure = (schoolId: string) => {
    const targetSchool = schools.find((s) => s.id === schoolId);
    const schoolName = targetSchool ? targetSchool.nome : 'Escola';

    const newYear: AcademicYear = {
      id: `ay-${schoolId}-2025`,
      escolaId: schoolId,
      nome: '2025/2026',
      dataInicio: '2025-09-01',
      dataFim: '2026-07-31',
      estado: 'activo',
      descricao: 'Estrutura padrão homologada pelo Ministério da Educação (MED).',
      periodos: [
        { id: `per-${schoolId}-1`, nome: '1º Trimestre', dataInicio: '2025-09-01', dataFim: '2025-12-19', estado: 'concluido' },
        { id: `per-${schoolId}-2`, nome: '2º Trimestre', dataInicio: '2026-01-05', dataFim: '2026-04-10', estado: 'decorrente' },
        { id: `per-${schoolId}-3`, nome: '3º Trimestre', dataInicio: '2026-04-20', dataFim: '2026-07-31', estado: 'futuro' },
      ],
    };

    const newClasses: SchoolClass[] = [
      { id: `cla-${schoolId}-7`, escolaId: schoolId, nome: '7ª Classe', codigo: '7ª', ciclo: 'Iº Ciclo Secundário', curso: 'Ensino Geral Secundário', ordem: 1, estado: 'activa' },
      { id: `cla-${schoolId}-8`, escolaId: schoolId, nome: '8ª Classe', codigo: '8ª', ciclo: 'Iº Ciclo Secundário', curso: 'Ensino Geral Secundário', ordem: 2, estado: 'activa' },
      { id: `cla-${schoolId}-9`, escolaId: schoolId, nome: '9ª Classe', codigo: '9ª', ciclo: 'Iº Ciclo Secundário', curso: 'Ensino Geral Secundário', ordem: 3, estado: 'activa' },
      { id: `cla-${schoolId}-10`, escolaId: schoolId, nome: '10ª Classe', codigo: '10ª', ciclo: 'IIº Ciclo Geral', curso: 'Ciências Físicas e Biológicas', ordem: 4, estado: 'activa' },
      { id: `cla-${schoolId}-11`, escolaId: schoolId, nome: '11ª Classe', codigo: '11ª', ciclo: 'IIº Ciclo Geral', curso: 'Ciências Físicas e Biológicas', ordem: 5, estado: 'activa' },
      { id: `cla-${schoolId}-12`, escolaId: schoolId, nome: '12ª Classe', codigo: '12ª', ciclo: 'IIº Ciclo Geral', curso: 'Ciências Físicas e Biológicas', ordem: 6, estado: 'activa' },
    ];

    const newSubjects: Subject[] = [
      { id: `sub-${schoolId}-mat`, escolaId: schoolId, nome: 'Matemática', codigo: 'MAT', cargaHorariaSemanal: 5, estado: 'activa', areaCientifica: 'Ciências Exactas' },
      { id: `sub-${schoolId}-lp`, escolaId: schoolId, nome: 'Língua Portuguesa', codigo: 'LP', cargaHorariaSemanal: 5, estado: 'activa', areaCientifica: 'Línguas e Comunicação' },
      { id: `sub-${schoolId}-fis`, escolaId: schoolId, nome: 'Física', codigo: 'FIS', cargaHorariaSemanal: 4, estado: 'activa', areaCientifica: 'Ciências Exactas' },
      { id: `sub-${schoolId}-qui`, escolaId: schoolId, nome: 'Química', codigo: 'QUI', cargaHorariaSemanal: 4, estado: 'activa', areaCientifica: 'Ciências Naturais' },
      { id: `sub-${schoolId}-bio`, escolaId: schoolId, nome: 'Biologia', codigo: 'BIO', cargaHorariaSemanal: 3, estado: 'activa', areaCientifica: 'Ciências Naturais' },
      { id: `sub-${schoolId}-ing`, escolaId: schoolId, nome: 'Língua Inglesa', codigo: 'ING', cargaHorariaSemanal: 3, estado: 'activa', areaCientifica: 'Línguas e Comunicação' },
    ];

    const newTeachers: Teacher[] = [
      { id: `prof-${schoolId}-1`, escolaId: schoolId, nome: 'Prof. Bento Kassoma', email: `bento@${schoolId}.ao`, telefone: '+244 923 000 111', especialidade: 'Matemática e Física', estado: 'activo' },
      { id: `prof-${schoolId}-2`, escolaId: schoolId, nome: 'Prof.ª Alda dos Santos', email: `alda@${schoolId}.ao`, telefone: '+244 924 000 222', especialidade: 'Língua Portuguesa', estado: 'activo' },
    ];

    const newSections: Section[] = [
      { id: `sec-${schoolId}-7a`, escolaId: schoolId, classeId: newClasses[0].id, classeNome: '7ª Classe', nome: '7ª Classe A', anoLectivoId: newYear.id, anoLectivoNome: '2025/2026', sala: 'Sala 01', turno: 'Manhã', directorTurma: newTeachers[0].nome, capacidade: 40, totalAlunos: 32, estado: 'Activa' },
      { id: `sec-${schoolId}-10a`, escolaId: schoolId, classeId: newClasses[3].id, classeNome: '10ª Classe', nome: '10ª Classe A', anoLectivoId: newYear.id, anoLectivoNome: '2025/2026', sala: 'Sala 05', turno: 'Tarde', directorTurma: newTeachers[1].nome, capacidade: 40, totalAlunos: 35, estado: 'Activa' },
    ];

    setAcademicYears((prev) => [newYear, ...prev]);
    setAcademicClasses((prev) => [...prev, ...newClasses]);
    setSubjects((prev) => [...prev, ...newSubjects]);
    setTeachers((prev) => [...prev, ...newTeachers]);
    setSections((prev) => [...prev, ...newSections]);

    setSchools((prev) =>
      prev.map((s) => (s.id === schoolId ? { ...s, anoLectivoActivo: '2025/2026' } : s))
    );

    showToast({
      type: 'success',
      title: 'Estrutura Inicializada',
      message: `Plano padrão do MED provisionado para ${schoolName}!`,
    });
  };

  // ==========================================
  // GESTÃO DE ASSIDUIDADE (ALUNOS & COLABORADORES)
  // ==========================================
  const handleSaveBatchAttendance = (records: StudentAttendanceRecord[]) => {
    setAttendanceRecords((prev) => [...records, ...prev]);

    // Recalcular ou gerar alertas de assiduidade
    records.forEach((rec) => {
      if (rec.status === 'falta') {
        const studentAllAbsences = [
          ...attendanceRecords.filter((r) => r.studentId === rec.studentId && r.status === 'falta'),
          rec,
        ].length;

        if (studentAllAbsences >= attendanceSettings.limiteFaltasAlerta) {
          const isCritical = studentAllAbsences >= attendanceSettings.limiteFaltasCritico;
          const newAlert: AttendanceAlert = {
            id: `alt-${rec.studentId}-${Date.now()}`,
            escolaId: rec.escolaId,
            studentId: rec.studentId,
            studentNome: rec.studentNome,
            turmaNome: rec.turmaNome,
            totalFaltas: studentAllAbsences,
            totalFaltasInjustificadas: studentAllAbsences,
            percentagemPresenca: Math.max(65, 100 - studentAllAbsences * 3),
            nivelAlerta: isCritical ? 'critico' : 'atencao',
            dataGeracao: rec.data,
            notificouEncarregado: false,
          };

          setAttendanceAlerts((prevAlerts) => [
            newAlert,
            ...prevAlerts.filter((a) => a.studentId !== rec.studentId),
          ]);

          showToast({
            type: isCritical ? 'error' : 'warning',
            title: isCritical ? 'Alerta Crítico de Faltas!' : 'Aviso de Assiduidade',
            message: `O aluno ${rec.studentNome} atingiu ${studentAllAbsences} faltas (limite: ${attendanceSettings.limiteFaltasAlerta}).`,
          });
        }
      }
    });

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Docente / Coordenação',
      autorEmail: 'admin@edugest.ao',
      acao: 'Chamada de Turma Registada',
      escolaId: records[0]?.escolaId,
      detalhes: `Caderneta de chamada com ${records.length} registos gravada para ${records[0]?.turmaNome}.`,
      tipo: 'criacao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Chamada Gravada',
      message: `Presenças de ${records.length} alunos gravadas com sucesso!`,
    });
  };

  const handleSaveStaffAttendance = (record: StaffAttendanceRecord) => {
    setStaffAttendanceRecords((prev) => [record, ...prev]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Secretaria / Ponto',
      autorEmail: 'admin@edugest.ao',
      acao: 'Ponto de Colaborador Registado',
      escolaId: record.escolaId,
      detalhes: `Ponto de ${record.staffNome} (${record.cargo}) registado como ${record.status} às ${record.horaEntrada || record.horaSaida || '--:--'}.`,
      tipo: 'criacao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Ponto Registado',
      message: `Registo de assiduidade de ${record.staffNome} gravado com sucesso!`,
    });
  };

  const handleJustifyStudentAbsence = (recordId: string, justificacao: string, documento?: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'falta_justificada',
              justificacao,
              documentoJustificativo: documento,
            }
          : r
      )
    );

    // Ajustar alertas
    const targetRecord = attendanceRecords.find((r) => r.id === recordId);
    if (targetRecord) {
      setAttendanceAlerts((prev) =>
        prev
          .map((a): AttendanceAlert => {
            if (a.studentId !== targetRecord.studentId) return a;
            const updatedInjust = Math.max(0, a.totalFaltasInjustificadas - 1);
            const updatedNivel: 'atencao' | 'critico' =
              updatedInjust >= attendanceSettings.limiteFaltasCritico ? 'critico' : 'atencao';
            return {
              ...a,
              totalFaltasInjustificadas: updatedInjust,
              nivelAlerta: updatedNivel,
            };
          })
          .filter((a) => a.totalFaltasInjustificadas >= attendanceSettings.limiteFaltasAlerta)
      );
    }

    showToast({
      type: 'success',
      title: 'Falta Justificada',
      message: 'Ausência regularizada e homologada com sucesso.',
    });
  };

  const handleSaveAttendanceSettings = (newSettings: AttendanceSettings) => {
    setAttendanceSettings(newSettings);
    showToast({
      type: 'success',
      title: 'Limites Actualizados',
      message: `Parâmetros de assiduidade e alertas atualizados para a instituição.`,
    });
  };

  const handleSendAlertNotification = (alertId: string) => {
    setAttendanceAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, notificouEncarregado: true } : a))
    );

    const alertItem = attendanceAlerts.find((a) => a.id === alertId);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: userRole === 'super_admin' ? 'Super Admin EduGest' : 'Coordenação Pedagógica',
      autorEmail: 'admin@edugest.ao',
      acao: 'Notificação de Faltas Enviada',
      escolaId: alertItem?.escolaId,
      detalhes: `Alerta formal de faltas enviado ao encarregado do aluno ${alertItem?.studentNome} (${alertItem?.totalFaltasInjustificadas} faltas).`,
      tipo: 'seguranca',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'info',
      title: 'Encarregado Notificado',
      message: `Mensagem formal enviada com sucesso para o encarregado de ${alertItem?.studentNome}.`,
    });
  };

  // ==========================================
  // PORTAL DO ENCARREGADO DE EDUCAÇÃO HANDLERS
  // ==========================================
  const handleSavePaymentReference = (ref: PaymentReference) => {
    setPaymentReferences((prev) => [ref, ...prev]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: 'Portal do Encarregado',
      autorEmail: 'encarregado@edugest.ao',
      acao: 'Referência Multicaixa Emitida',
      escolaId: currentSchoolObj.id,
      detalhes: `Referência ${ref.referencia} de ${ref.valorKz} Kz gerada para o educando ${ref.studentNome} (${ref.tipo}).`,
      tipo: 'criacao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'info',
      title: 'Referência Multicaixa Gerada',
      message: `Entidade: ${ref.entidade} | Ref: ${ref.referencia} | ${ref.valorKz.toLocaleString('pt-AO')} Kz`,
    });
  };

  const handlePayReference = (receipt: OfficialReceipt, referenceId?: string) => {
    setOfficialReceipts((prev) => [receipt, ...prev]);

    if (referenceId) {
      setPaymentReferences((prev) =>
        prev.map((r) =>
          r.id === referenceId ? { ...r, estado: 'pago', reciboId: receipt.id } : r
        )
      );
    }

    if (receipt.tipoItem === 'propina') {
      setStudents((prev) =>
        prev.map((s) => (s.id === receipt.studentId ? { ...s, statusPropina: 'em_dia' } : s))
      );

      const novoPagamento: Pagamento = {
        id: `pag-${Date.now()}`,
        reciboNumero: receipt.numeroRecibo,
        alunoId: receipt.studentId,
        alunoNome: receipt.studentNome,
        turmaNome: receipt.studentTurma,
        mesReferencia: receipt.mesReferencia || 'Março 2026',
        valorKz: receipt.valorKz,
        metodo: 'Multicaixa Express',
        referencia: receipt.referenciaOperacao,
        dataPagamento: receipt.dataEmissao.substring(0, 10),
        status: 'confirmado',
      };
      setPayments((prev) => [novoPagamento, ...prev]);
    }

    // Registar movimento de crédito na conta corrente
    setContaCorrenteMap((prev) => {
      const studentCc = prev[receipt.studentId] || [];
      const novoMovimento: ContaCorrenteItem = {
        id: `cc-${Date.now()}`,
        studentId: receipt.studentId,
        data: receipt.dataEmissao.substring(0, 10),
        descricao: receipt.descricao,
        tipo: 'credito',
        valorKz: receipt.valorKz,
        saldoAposKz: 0,
        referenciaDoc: receipt.numeroRecibo,
        metodo: receipt.metodoPagamento,
        status: 'pago',
      };
      return {
        ...prev,
        [receipt.studentId]: [novoMovimento, ...studentCc],
      };
    });

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: receipt.guardianNome,
      autorEmail: 'encarregado@edugest.ao',
      acao: 'Liquidação de Pagamento via Portal',
      escolaId: receipt.escolaId,
      detalhes: `Recibo oficial ${receipt.numeroRecibo} emitido para ${receipt.studentNome}. Montante: ${receipt.valorKz} Kz.`,
      tipo: 'edicao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Pagamento Concluído com Sucesso',
      message: `Recibo oficial ${receipt.numeroRecibo} gerado com certificação AGT.`,
    });
  };

  const handleRequestDocument = (doc: DocumentoItem) => {
    setDocumentosMap((prev) => ({
      ...prev,
      [doc.studentId]: [doc, ...(prev[doc.studentId] || [])],
    }));

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
      autorNome: 'Portal do Encarregado',
      autorEmail: 'encarregado@edugest.ao',
      acao: 'Documento Académico Solicitado',
      escolaId: currentSchoolObj.id,
      detalhes: `Documento "${doc.titulo}" emitido digitalmente para o educando ID ${doc.studentId}.`,
      tipo: 'criacao',
      ip: '197.149.20.88',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast({
      type: 'success',
      title: 'Documento Emitido',
      message: `${doc.titulo} disponibilizado com código ${doc.codigoVerificacao}.`,
    });
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setGuardianNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, lida: true } : n))
    );
  };

  const handleConfirmRenewal = (studentId: string) => {
    const targetStudent = students.find((s) => s.id === studentId);
    showToast({
      type: 'success',
      title: 'Confirmação de Matrícula Registada',
      message: `A vaga de ${targetStudent?.nomeCompleto || 'educando'} para 2026/2027 foi reservada!`,
    });
  };

  // CRM Escolar & Funil de Admissões Handlers
  const handleSaveLead = (leadData: Lead) => {
    setLeads((prev) => {
      const exists = prev.some((l) => l.id === leadData.id);
      if (exists) {
        return prev.map((l) => (l.id === leadData.id ? leadData : l));
      }
      return [leadData, ...prev];
    });
    showToast({
      type: 'success',
      title: 'Lead Registado',
      message: `O candidato "${leadData.nomeCandidato}" foi guardado com sucesso no CRM.`,
    });
  };

  const handleUpdateLeadStage = (leadId: string, newStage: PipelineStageId) => {
    const target = leads.find((l) => l.id === leadId);
    if (!target) return;
    const stageName = pipelineStages.find((s) => s.id === newStage)?.nome || newStage;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              estagio: newStage,
              ultimaInteracao: new Date().toISOString().substring(0, 10),
              ...(newStage === 'aluno' && !l.dataConversao
                ? { dataConversao: new Date().toISOString().substring(0, 10) }
                : {}),
            }
          : l
      )
    );

    const autoActivity: Activity = {
      id: `act-${Date.now()}`,
      leadId,
      tipo: 'mudanca_estagio',
      titulo: `Estágio alterado para "${stageName}"`,
      descricao: `O candidato avançou no funil de admissão escolar.`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      responsavelNome: target.responsavelNome || 'Secretaria de Admissões',
      resultado: `Novo estágio: ${stageName}`,
    };
    setActivities((prev) => [autoActivity, ...prev]);

    showToast({
      type: 'info',
      title: 'Estágio Actualizado',
      message: `${target.nomeCandidato} avançou para "${stageName}".`,
    });
  };

  const handleUpdateLeadResponsible = (leadId: string, staffName: string) => {
    const target = leads.find((l) => l.id === leadId);
    if (!target) return;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, responsavelNome: staffName } : l
      )
    );

    const autoActivity: Activity = {
      id: `act-${Date.now()}`,
      leadId,
      tipo: 'nota_interna',
      titulo: `Responsável atribuído: ${staffName}`,
      descricao: `Atribuição de acompanhamento comercial e pedagógico.`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      responsavelNome: staffName,
    };
    setActivities((prev) => [autoActivity, ...prev]);

    showToast({
      type: 'success',
      title: 'Responsável Atribuído',
      message: `${staffName} agora é responsável pelo acompanhamento de ${target.nomeCandidato}.`,
    });
  };

  const handleSaveActivity = (activity: Activity) => {
    setActivities((prev) => [activity, ...prev]);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === activity.leadId
          ? {
              ...l,
              ultimaInteracao: activity.dataHora.substring(0, 10),
            }
          : l
      )
    );
    showToast({
      type: 'success',
      title: 'Actividade Registada',
      message: activity.titulo,
    });
  };

  const handleScheduleFollowUp = (followUp: FollowUp) => {
    setFollowUps((prev) => [followUp, ...prev]);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === followUp.leadId
          ? {
              ...l,
              proximoFollowUp: followUp.dataPrevista,
            }
          : l
      )
    );
    showToast({
      type: 'success',
      title: 'Follow-up Agendado',
      message: `${followUp.titulo} agendado para ${followUp.dataPrevista} às ${followUp.horaPrevista}.`,
    });
  };

  const handleToggleFollowUpComplete = (followUpId: string) => {
    setFollowUps((prev) =>
      prev.map((fu) =>
        fu.id === followUpId
          ? {
              ...fu,
              concluido: !fu.concluido,
              dataConclusao: !fu.concluido
                ? new Date().toISOString().substring(0, 10)
                : undefined,
            }
          : fu
      )
    );
    showToast({
      type: 'info',
      title: 'Estado do Follow-up',
      message: 'O estado do follow-up foi actualizado.',
    });
  };

  const handleConvertLeadToStudent = (
    leadId: string,
    newStudent: Student,
    turmaId: string
  ) => {
    const targetLead = leads.find((l) => l.id === leadId);

    setStudents((prev) => [newStudent, ...prev]);

    const today = new Date().toISOString().substring(0, 10);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              estagio: 'aluno',
              probabilidade: 100,
              dataConversao: today,
              convertidoAlunoId: newStudent.id,
              ultimaInteracao: today,
            }
          : l
      )
    );

    const conversionActivity: Activity = {
      id: `act-${Date.now()}`,
      leadId,
      tipo: 'conversao',
      titulo: `Conversão formalizada: Aluno Matriculado!`,
      descricao: `Lead convertido com sucesso em aluno oficial. Processo: ${newStudent.processo}, Matrícula: ${newStudent.numeroMatricula}, Turma: ${newStudent.turmaNome}.`,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      responsavelNome: targetLead?.responsavelNome || 'Secretaria de Admissões',
      resultado: 'Matrícula Efectivada',
    };
    setActivities((prev) => [conversionActivity, ...prev]);

    showToast({
      type: 'success',
      title: 'Parabéns! Novo Aluno Matriculado',
      message: `${newStudent.nomeCompleto} foi convertido com sucesso e integrado na turma ${newStudent.turmaNome}!`,
      duration: 6000,
    });
  };

  const viewTitles: Record<ViewMode, { title: string; subtitle: string }> = {
    'saas-dashboard': {
      title: 'Consola SaaS · Administrador da Plataforma',
      subtitle: 'Visão executiva global, métricas multi-tenant e receita mensal recorrente',
    },
    'saas-commercial': {
      title: 'Gestão Comercial do SaaS · Planos & Subscrições',
      subtitle: 'Planos Start, Pro e Enterprise, ciclo de vida das subscrições e bloqueio gradual',
    },
    'saas-schools': {
      title: 'Gestão de Escolas & Instituições',
      subtitle: 'Catálogo de tenants, planos de subscrição e controle de estados operacionais',
    },
    'saas-onboarding': {
      title: 'Onboarding Guiado de Nova Escola',
      subtitle: 'Fluxo em 6 passos para cadastramento e homologação de novo tenant escolar',
    },
    'saas-audit-logs': {
      title: 'Logs de Auditoria Administrativa',
      subtitle: 'Histórico imutável de todas as acções e alterações no ambiente SaaS',
    },
    dashboard: {
      title: 'Painel Executivo da Escola',
      subtitle: `${selectedSchool} · Luanda`,
    },
    'edugest-ai': {
      title: 'EduGest AI · Inteligência Artificial & Governança Escolar',
      subtitle: `Assistente da Direcção, Financeiro e Académico · Isolamento estrito de ${selectedSchool}`,
    },
    'academic-structure': {
      title: 'Estrutura Académica & Organização Escolar',
      subtitle: `Anos lectivos, classes curriculares, turmas, disciplinas e docentes · ${selectedSchool}`,
    },
    attendance: {
      title: 'Controlo de Assiduidade & Ponto',
      subtitle: `Frequência de alunos, assiduidade docente, alertas e controlo de acesso · ${selectedSchool}`,
    },
    pedagogical: {
      title: 'Gestão Pedagógica & Pautas',
      subtitle: 'Lançamento de notas trimestrais segundo o subsistema oficial do MED',
    },
    students: {
      title: 'Alunos & Matrículas',
      subtitle: 'Gestão de processos, dados do BI angolano e emissão de declarações',
    },
    financial: {
      title: 'Gestão Financeira & Propinas',
      subtitle: 'Controlo de mensalidades em Kwanzas (Kz), Multicaixa e emissão de recibos',
    },
    'documents-reports': {
      title: 'Documentos Oficiais & Relatórios de Gestão',
      subtitle: `Emissão de declarações, boletins, pautas, certificados e relatórios analíticos · ${selectedSchool}`,
    },
    'data-export-security': {
      title: 'Exportação Agendada Diária & Protecção de Dados',
      subtitle: `Cópia de segurança cifrada (AES-256), integridade SHA-256 e conformidade com a Lei nº 22/11 (APD Angola) · ${selectedSchool}`,
    },
    crm: {
      title: 'CRM Escolar & Funil de Admissões',
      subtitle: `Captação de leads, conversão em alunos e campanhas · ${selectedSchool}`,
    },
    'guardian-portal': {
      title: 'Portal da Família & Encarregados de Educação',
      subtitle: `Boletim de notas, assiduidade, propinas por Multicaixa e comunicados · ${selectedSchool}`,
    },
    'design-system': {
      title: 'Manual de Identidade Visual & Design System',
      subtitle: 'Especificação das cores oficiais, variáveis CSS, tipografia e biblioteca',
    },
    landing: {
      title: 'EduGest Angola · Gestão Escolar Integrada',
      subtitle: 'Plataforma SaaS para Instituições de Ensino da República de Angola',
    },
    login: {
      title: 'Iniciar Sessão · EduGest Angola',
      subtitle: 'Autenticação segura institucional',
    },
    'forgot-password': {
      title: 'Recuperação de Acesso · EduGest Angola',
      subtitle: 'Redefinição segura de credenciais',
    },
    'institution-admin-rbac': {
      title: 'Administração & Controlo de Acesso RBAC',
      subtitle: `Gestão de colaboradores, funções, permissões e departamentos · ${selectedSchool}`,
    },
    'recursos-humanos': {
      title: 'Recursos Humanos & Colaboradores',
      subtitle: `Corpo docente e funcionários, contratos e assiduidade · ${selectedSchool}`,
    },
    accounting: {
      title: 'Contabilidade & Finanças · PGC Angola',
      subtitle: `Partidas dobradas, diários, balanços, SAF-T AO e reconciliação bancária · ${selectedSchool}`,
    },
    'portal-aluno': {
      title: 'Portal do Estudante',
      subtitle: `Notas, horários de aulas e avisos institucionais · ${selectedSchool}`,
    },
    'portal-professor': {
      title: 'Portal do Corpo Docente',
      subtitle: `Turmas curriculares, lançamento de notas e pautas · ${selectedSchool}`,
    },
  };

  const currentSchoolObj =
    schools.find((s) => s.nome === selectedSchool) || schools[0];

  const currentSchoolSubscription = saasSubscriptions.find(
    (sub) => sub.escolaId === currentSchoolObj?.id || sub.escolaNome === currentSchoolObj?.nome
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#012041] flex flex-col lg:flex-row antialiased selection:bg-[#015FC4] selection:text-white">
      {/* Toast Notifications Stack (Official Design System) */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Official Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        selectedSchoolName={selectedSchool}
        onSelectSchool={setSelectedSchool}
        userRole={userRole}
        onChangeUserRole={handleChangeUserRole}
      />

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          selectedSchoolName={selectedSchool}
          onSelectSchool={setSelectedSchool}
          schools={schools}
          userRole={userRole}
          currentView={currentView}
          onOpenNewEnrollment={() => setIsNewEnrollmentOpen(true)}
          onOpenNewPayment={() => setIsNewPaymentOpen(true)}
          onOpenNewSchool={() => setCurrentView('saas-onboarding')}
          onNavigate={setCurrentView}
          title={viewTitles[currentView].title}
          subtitle={viewTitles[currentView].subtitle}
        />

        {/* Banner de Regularização / Suspensão com Preservação de Dados da Escola */}
        {currentView !== 'saas-dashboard' &&
          currentView !== 'saas-commercial' &&
          currentView !== 'saas-schools' &&
          currentView !== 'saas-onboarding' &&
          currentView !== 'saas-audit-logs' && (
            <TenantSubscriptionBanner
              subscription={currentSchoolSubscription}
              onReactivate={handleReactivateSubscription}
              isSuperAdmin={userRole === 'super_admin'}
            />
          )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* SaaS Super Admin Views */}
          {currentView === 'saas-dashboard' && (
            <SaasDashboardView
              schools={schools}
              onNavigate={setCurrentView}
              onSelectSchoolToView={handleSelectSchoolTenant}
            />
          )}

          {currentView === 'saas-commercial' && (
            <SaasCommercialView
              plans={saasPlans}
              subscriptions={saasSubscriptions}
              schools={schools}
              commercialConfig={commercialConfig}
              onUpdatePlan={handleUpdatePlan}
              onCreatePlan={handleCreatePlan}
              onUpdateSubscription={handleUpdateSubscription}
              onUpdateCommercialConfig={handleUpdateCommercialConfig}
              onNavigate={setCurrentView}
              onNotify={showToast}
            />
          )}

          {currentView === 'saas-schools' && (
            <SchoolsManagementView
              schools={schools}
              onNavigate={setCurrentView}
              onUpdateSchool={handleUpdateSchool}
              onUpdateSchoolState={handleUpdateSchoolState}
              onSelectSchoolTenant={handleSelectSchoolTenant}
              isSimulatingNetwork={isSimulatingNetworkFailure}
              onToggleSimulatingNetwork={() =>
                setIsSimulatingNetworkFailure(!isSimulatingNetworkFailure)
              }
              onTriggerTestError={handleTriggerTestError}
            />
          )}

          {currentView === 'saas-onboarding' && (
            <SchoolOnboardingView
              onNavigate={setCurrentView}
              onAddSchool={handleAddSchool}
              onSelectSchoolTenant={handleSelectSchoolTenant}
              isSimulatingNetwork={isSimulatingNetworkFailure}
            />
          )}

          {currentView === 'saas-audit-logs' && (
            <AuditLogsView logs={auditLogs} onNavigate={setCurrentView} />
          )}

          {/* School Tenant Views */}
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentView}
              students={students}
              notas={notas}
              payments={payments}
              sections={sections}
              attendanceRecords={attendanceRecords}
              currentSchool={currentSchoolObj}
              onOpenNewEnrollment={() => setIsNewEnrollmentOpen(true)}
              onOpenNewPayment={() => setIsNewPaymentOpen(true)}
            />
          )}

          {currentView === 'edugest-ai' && (
            <EduGestAiView
              currentSchool={currentSchoolObj}
              students={students}
              payments={payments}
              notas={notas}
              sections={sections}
              attendanceRecords={attendanceRecords}
              userRole={userRole}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'academic-structure' && (
            <AcademicStructureView
              currentSchool={currentSchoolObj}
              userRole={userRole}
              academicYears={academicYears}
              classes={academicClasses}
              sections={sections}
              subjects={subjects}
              classSubjects={classSubjects}
              teachers={teachers}
              teacherAssignments={teacherAssignments}
              onSaveAcademicYear={handleSaveAcademicYear}
              onActivateAcademicYear={handleActivateAcademicYear}
              onCloseAcademicYear={handleCloseAcademicYear}
              onSaveClass={handleSaveClass}
              onToggleClassStatus={handleToggleClassStatus}
              onSaveSection={handleSaveSection}
              onUpdateSectionState={handleUpdateSectionState}
              onSaveSubject={handleSaveSubject}
              onSaveClassSubject={handleSaveClassSubject}
              onRemoveClassSubject={handleRemoveClassSubject}
              onSaveTeacherAssignment={handleSaveTeacherAssignment}
              onRemoveTeacherAssignment={handleRemoveTeacherAssignment}
              onSeedTemplateStructure={handleSeedTemplateStructure}
              onNotify={(msg) => showToast(msg)}
            />
          )}

          {currentView === 'pedagogical' && (
            <PedagogicalView
              students={students}
              notas={notas}
              onUpdateNota={handleUpdateNota}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceView
              currentSchool={currentSchoolObj}
              userRole={userRole}
              students={students}
              sections={sections}
              subjects={subjects}
              staffList={staffList}
              attendanceRecords={attendanceRecords}
              staffAttendanceRecords={staffAttendanceRecords}
              settings={attendanceSettings}
              alerts={attendanceAlerts}
              onSaveBatchAttendance={handleSaveBatchAttendance}
              onSaveStaffAttendance={handleSaveStaffAttendance}
              onJustifyStudentAbsence={handleJustifyStudentAbsence}
              onSaveSettings={handleSaveAttendanceSettings}
              onSendAlertNotification={handleSendAlertNotification}
              onNotify={(msg) => showToast(msg)}
            />
          )}

          {currentView === 'students' && (
            <StudentsView
              students={students}
              guardians={guardians}
              guardianStudents={guardianStudents}
              notas={notas}
              historicoMap={historicoMap}
              matriculasMap={matriculasMap}
              assiduidadeMap={assiduidadeMap}
              contaCorrenteMap={contaCorrenteMap}
              documentosMap={documentosMap}
              selectedSchoolName={selectedSchool}
              userRole={userRole}
              schools={schools}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onUpdateStudentState={handleUpdateStudentState}
              onAddGuardian={handleAddGuardian}
              onUpdateGuardian={handleUpdateGuardian}
              onAssociateGuardianStudent={handleAssociateGuardianStudent}
              onRemoveGuardianStudentRelation={handleRemoveGuardianStudentRelation}
              onOpenNewPaymentModal={(st) => setIsNewPaymentOpen(true)}
              onNotify={showToast}
            />
          )}

          {currentView === 'financial' && (
            <FinancialView
              payments={payments}
              students={students}
              onOpenNewPayment={() => setIsNewPaymentOpen(true)}
              selectedSchoolName={selectedSchool}
              onNavigateToAccounting={() => setCurrentView('accounting')}
            />
          )}

          {currentView === 'accounting' && (
            <AccountingView
              selectedSchoolName={selectedSchool}
            />
          )}

          {currentView === 'documents-reports' && (
            <DocumentsReportsView
              currentSchool={currentSchoolObj}
              students={students}
              notas={notas}
              payments={payments}
              sections={sections}
              attendanceRecords={attendanceRecords}
              leads={leads}
              campaigns={campaigns}
              teachers={teachers}
              onNotify={(notif) =>
                showToast({
                  type: notif.type,
                  title: notif.title || 'Documentos & Relatórios',
                  message: notif.message,
                })
              }
            />
          )}

          {currentView === 'data-export-security' && (
            <ScheduledDataExportView
              currentSchool={currentSchoolObj}
              students={students}
              notas={notas}
              sections={sections}
              attendanceRecords={attendanceRecords}
              userRole={userRole}
              onNotify={(notif) =>
                showToast({
                  type: notif.type,
                  title: notif.title || 'Exportação & Protecção de Dados',
                  message: notif.message,
                })
              }
            />
          )}

          {currentView === 'crm' && (
            <CrmDashboardView
              currentSchool={currentSchoolObj}
              pipelineStages={pipelineStages}
              leadSources={leadSources}
              campaigns={campaigns}
              leads={leads}
              activities={activities}
              followUps={followUps}
              staffList={CRM_STAFF_RESPONSAVEIS}
              sections={sections}
              onSaveLead={handleSaveLead}
              onUpdateLeadStage={handleUpdateLeadStage}
              onUpdateLeadResponsible={handleUpdateLeadResponsible}
              onSaveActivity={handleSaveActivity}
              onScheduleFollowUp={handleScheduleFollowUp}
              onToggleFollowUpComplete={handleToggleFollowUpComplete}
              onConvertLeadToStudent={handleConvertLeadToStudent}
              onNotify={(msg) =>
                showToast({
                  type: 'info',
                  title: 'CRM Escolar',
                  message: msg,
                })
              }
            />
          )}

          {currentView === 'guardian-portal' && (
            <GuardianPortalView
              currentSchool={currentSchoolObj}
              guardians={guardians}
              guardianStudentRelations={guardianStudents}
              students={students}
              notas={notas}
              sections={sections}
              contaCorrenteMock={contaCorrenteMap}
              documentosMock={documentosMap}
              matriculasMock={matriculasMap}
              assiduidadeMock={assiduidadeMap}
              paymentReferences={paymentReferences}
              receipts={officialReceipts}
              announcements={announcements}
              timetables={timetables}
              notifications={guardianNotifications}
              onSavePaymentReference={handleSavePaymentReference}
              onPayReference={handlePayReference}
              onRequestDocument={handleRequestDocument}
              onMarkNotificationRead={handleMarkNotificationRead}
              onConfirmRenewal={handleConfirmRenewal}
              onNotify={showToast}
            />
          )}

          {currentView === 'institution-admin-rbac' && (
            <InstitutionAdminRbacView
              currentSchoolName={selectedSchool}
              onNotify={(notif) =>
                showToast({
                  type: notif.type,
                  title: 'Administração & RBAC',
                  message: notif.message,
                })
              }
            />
          )}

          {currentView === 'recursos-humanos' && (
            <HumanResourcesView
              currentSchoolName={selectedSchool}
              teachers={teachers}
              currentSchool={currentSchoolObj}
              teacherAssignments={teacherAssignments}
              sections={sections}
              subjects={subjects}
              userRole={userRole}
              currentUser={currentUser}
              onNotify={(notif) => showToast(notif)}
            />
          )}

          {currentView === 'portal-aluno' && (
            <StudentPortalView
              currentStudent={students[0]}
              notas={notas}
              schoolName={selectedSchool}
            />
          )}

          {currentView === 'portal-professor' && (
            <TeacherPortalView
              teacherName={teachers[0]?.nome || 'Prof. Manuel Gonçalves'}
              students={students}
              notas={notas}
              schoolName={selectedSchool}
              onNavigateToPedagogical={() => setCurrentView('pedagogical')}
            />
          )}

          {currentView === 'landing' && (
            <LandingPageView
              onGoToLogin={() => setCurrentView('login')}
              onOpenRegisterSchool={() => setCurrentView('saas-onboarding')}
            />
          )}

          {currentView === 'login' && (
            <LoginPageView
              onLoginSuccess={(user) => {
                showToast({
                  type: 'success',
                  title: 'Sessão Iniciada com Sucesso',
                  message: `Bem-vindo, ${user.nomeCompleto}! (${user.cargo})`,
                });
                const defaultView = getDefaultViewForRole(user.role);
                setCurrentView(defaultView as ViewMode);
              }}
              onGoToForgotPassword={() => setCurrentView('forgot-password')}
              onBackToLanding={() => setCurrentView('landing')}
              onOpenRegisterSchool={() => setCurrentView('saas-onboarding')}
            />
          )}

          {currentView === 'forgot-password' && (
            <ForgotPasswordView
              onBackToLogin={() => setCurrentView('login')}
            />
          )}

          {currentView === 'design-system' && (
            <DesignSystemView onTriggerToast={showToast} />
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <NewEnrollmentModal
        isOpen={isNewEnrollmentOpen}
        onClose={() => setIsNewEnrollmentOpen(false)}
        onAddStudent={handleAddStudent}
      />

      <NewPaymentModal
        isOpen={isNewPaymentOpen}
        onClose={() => setIsNewPaymentOpen(false)}
        students={students}
        onAddPayment={handleAddPayment}
      />

      {/* Camada Global de IA: Floating Widget Copilot */}
      <EduGestAiFloatingWidget
        currentSchool={currentSchoolObj}
        students={students}
        payments={payments}
        notas={notas}
        sections={sections}
        attendanceRecords={attendanceRecords}
        userRole={userRole}
        onNavigate={setCurrentView}
      />
    </div>
  );
}
