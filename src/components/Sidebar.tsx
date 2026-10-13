import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  Palette,
  School as SchoolIcon,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X,
  Building2,
  PlusCircle,
  FileText,
  ShieldAlert,
  ArrowRightLeft,
  Lock,
  Layers,
  CalendarCheck,
  HeartHandshake,
  Target,
  Sparkles,
  HardDrive,
  Briefcase,
  UserCheck,
  BookOpen,
  Calculator,
} from 'lucide-react';
import { ViewMode, UserRole } from '../types';
import { EduGestLogo } from './EduGestLogo';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  selectedSchoolName: string;
  onSelectSchool: (name: string) => void;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isMobileOpen,
  onMobileClose,
  selectedSchoolName,
  userRole,
  onChangeUserRole,
  onLogout,
}) => {
  // Navigation for Platform Super Admin
  const saasAdminMenuItems = [
    {
      id: 'saas-dashboard' as ViewMode,
      label: 'Dashboard SaaS',
      description: 'Métricas globais e receita mensal',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: 'saas-commercial' as ViewMode,
      label: 'Gestão Comercial',
      description: 'Planos, subscrições e bloqueio gradual',
      icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'saas-schools' as ViewMode,
      label: 'Gestão de Escolas',
      description: 'Catálogo, estados e subscrições',
      icon: <SchoolIcon className="w-5 h-5" />,
    },
    {
      id: 'saas-onboarding' as ViewMode,
      label: 'Onboarding de Escola',
      description: 'Provisionamento guiado de tenant',
      icon: <PlusCircle className="w-5 h-5" />,
    },
    {
      id: 'saas-audit-logs' as ViewMode,
      label: 'Logs de Auditoria',
      description: 'Rastreio de acções administrativas',
      icon: <ShieldAlert className="w-5 h-5" />,
    },
  ];

  // Navigation for School Tenant (Accessible to school admin and super admin viewing tenant)
  const tenantMenuItems = [
    {
      id: 'dashboard' as ViewMode,
      label: 'Painel da Escola',
      description: 'Visão executiva do tenant activo',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'edugest-ai' as ViewMode,
      label: 'EduGest AI',
      description: 'Assistentes de Direcção, Finanças e Alunos',
      icon: <Sparkles className="w-5 h-5 text-blue-300" />,
    },
    {
      id: 'academic-structure' as ViewMode,
      label: 'Estrutura Académica',
      description: 'Anos, classes, turmas, matriz e docentes',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'pedagogical' as ViewMode,
      label: 'Gestão Pedagógica',
      description: 'Pautas, turmas e notas do MED',
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      id: 'attendance' as ViewMode,
      label: 'Assiduidade & Presenças',
      description: 'Alunos, docentes, alertas e ponto',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      id: 'students' as ViewMode,
      label: 'Alunos & Matrículas',
      description: 'Processos, BI e declarações',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'financial' as ViewMode,
      label: 'Propinas & Finanças',
      description: 'Multicaixa, recibos e mensalidades',
      icon: <CreditCard className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'accounting' as ViewMode,
      label: 'Contabilidade & Finanças',
      description: 'PGC Angola, diários, SAF-T e balanços',
      icon: <Calculator className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'documents-reports' as ViewMode,
      label: 'Documentos & Relatórios',
      description: 'Declarações, boletins, pautas e mapas',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'data-export-security' as ViewMode,
      label: 'Exportação & Protecção de Dados',
      description: 'Backup diário agendado, AES-256 e Lei 22/11',
      icon: <HardDrive className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'crm' as ViewMode,
      label: 'CRM & Admissões',
      description: 'Funil, leads, campanhas e conversão',
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: 'guardian-portal' as ViewMode,
      label: 'Portal do Encarregado',
      description: 'Educandos, boletim, propinas e faltas',
      icon: <HeartHandshake className="w-5 h-5" />,
    },
    {
      id: 'portal-aluno' as ViewMode,
      label: 'Portal do Aluno',
      description: 'Aulas, horário e boletim individual',
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'portal-professor' as ViewMode,
      label: 'Portal do Professor',
      description: 'Turmas atribuídas e lançamento docente',
      icon: <GraduationCap className="w-5 h-5 text-teal-400" />,
    },
    {
      id: 'recursos-humanos' as ViewMode,
      label: 'Recursos Humanos',
      description: 'Colaboradores, contratos e assiduidade',
      icon: <Briefcase className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'institution-admin-rbac' as ViewMode,
      label: 'Administração & Permissões',
      description: 'Utilizadores internos e matriz RBAC',
      icon: <UserCheck className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'design-system' as ViewMode,
      label: 'Design System & Guia',
      description: 'Paleta oficial, tipografia e regras',
      icon: <Palette className="w-5 h-5" />,
    },
  ];

  const isSuperAdmin = userRole === 'super_admin';
  const isGuardian = userRole === 'guardian';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#012041] text-white select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <EduGestLogo variant="light" />
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Context Simulator Switcher */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
          <div className="min-w-0 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                isSuperAdmin
                  ? 'bg-blue-400'
                  : isGuardian
                  ? 'bg-purple-400'
                  : 'bg-emerald-400'
              }`}
            />
            <div className="truncate">
              <span className="text-[10px] uppercase font-semibold text-[#8EA5B8] block leading-none">
                Papel Activo
              </span>
              <span className="text-xs font-semibold text-white truncate block mt-0.5">
                {isSuperAdmin
                  ? 'Admin da Plataforma (SaaS)'
                  : isGuardian
                  ? 'Encarregado de Educação'
                  : 'Admin da Escola (Tenant)'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              const nextRole: UserRole =
                userRole === 'super_admin'
                  ? 'school_admin'
                  : userRole === 'school_admin'
                  ? 'guardian'
                  : 'super_admin';

              onChangeUserRole(nextRole);
              if (nextRole === 'guardian') {
                onNavigate('guardian-portal');
              } else if (nextRole === 'school_admin' && currentView.startsWith('saas-')) {
                onNavigate('dashboard');
              } else if (nextRole === 'super_admin' && (currentView === 'dashboard' || currentView === 'guardian-portal')) {
                onNavigate('saas-dashboard');
              }
            }}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Alternar Papel (Admin SaaS · Admin Escola · Encarregado)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Institutional School Badge (Only for Tenant View or Tenant Context) */}
      <div className="px-4 py-2.5 mx-4 mt-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-[#015FC4]/30 border border-[#015FC4]/50 flex items-center justify-center shrink-0 text-[#0263CB]">
          <SchoolIcon className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-[#8EA5B8] font-medium flex items-center justify-between">
            <span>Escola em Foco</span>
            {!isSuperAdmin && (
              <span className="flex items-center gap-1 text-[9px] text-amber-400">
                <Lock className="w-2.5 h-2.5" /> Isolado
              </span>
            )}
          </div>
          <div className="text-xs font-semibold text-white truncate" title={selectedSchoolName}>
            {selectedSchoolName}
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* 1. MÓDULO SAAS (APENAS PARA ADMINISTRADOR DA PLATAFORMA) */}
        {isSuperAdmin && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-[#0263CB] uppercase flex items-center justify-between">
              <span>Gestão SaaS Global</span>
              <span className="text-[9px] bg-[#015FC4]/30 text-blue-200 px-1.5 py-0.5 rounded font-mono">
                Multi-Tenant
              </span>
            </div>

            {saasAdminMenuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onMobileClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#015FC4] text-white font-medium shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-[#8EA5B8] group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium leading-tight truncate">{item.label}</div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isActive ? 'text-blue-100' : 'text-[#8EA5B8]'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. MÓDULOS ESCOLARES (TENANT ACTIVO) */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-[#8EA5B8] uppercase flex items-center justify-between">
            <span>{isSuperAdmin ? 'Módulos da Escola Seleccionada' : 'Módulos da Sua Instituição'}</span>
            {!isSuperAdmin && <span className="text-[9px] text-emerald-400 font-semibold">Tenant Único</span>}
          </div>

          {tenantMenuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onMobileClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#015FC4] text-white font-medium shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[#8EA5B8] group-hover:text-white'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium leading-tight truncate">{item.label}</div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      isActive ? 'text-blue-100' : 'text-[#8EA5B8]'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Security credentials badge */}
      <div className="p-3 mx-3 mb-2 rounded-lg bg-white/5 border border-white/10 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold text-white text-[11px]">
            {isSuperAdmin ? 'Consola Global Homologada' : 'Tenant Escolar Isolado'}
          </span>
        </div>
        <p className="text-[10px] text-[#8EA5B8] leading-relaxed">
          {isSuperAdmin
            ? 'Acesso irrestrito a auditoria e gestão multi-escolas.'
            : 'Permissões limitadas estritamente a este estabelecimento.'}
        </p>
      </div>

      {/* User Profile Footer */}
      <div className="p-3.5 border-t border-white/10 flex items-center justify-between bg-black/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#015FC4] flex items-center justify-center font-bold text-xs text-white shrink-0 border border-white/20">
            {isSuperAdmin ? 'SA' : 'AD'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {isSuperAdmin ? 'Super Admin EduGest' : 'Admin da Escola'}
            </div>
            <div className="text-[10px] text-[#8EA5B8] truncate">
              {isSuperAdmin ? 'Administrador da Plataforma' : selectedSchoolName}
            </div>
          </div>
        </div>
        <button
          className="p-1.5 rounded-lg text-[#8EA5B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Terminar Sessão"
          onClick={onLogout || (() => onNavigate('landing'))}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 260px) */}
      <aside className="hidden lg:block w-68 shrink-0 h-screen sticky top-0 border-r border-[#012041]/20 z-30 shadow-md">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#012041]/70 backdrop-blur-xs z-40 transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 transform transition-transform duration-200 ease-in-out shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
