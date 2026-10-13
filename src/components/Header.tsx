import React from 'react';
import {
  Menu,
  Bell,
  Search,
  Calendar,
  Plus,
  School as SchoolIcon,
  CheckCircle2,
  Lock,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/Button';
import { School, UserRole, ViewMode } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  selectedSchoolName: string;
  onSelectSchool: (name: string) => void;
  schools: School[];
  userRole: UserRole;
  currentView: ViewMode;
  onOpenNewEnrollment: () => void;
  onOpenNewPayment: () => void;
  onOpenNewSchool: () => void;
  onNavigate?: (view: ViewMode) => void;
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  selectedSchoolName,
  onSelectSchool,
  schools,
  userRole,
  currentView,
  onOpenNewEnrollment,
  onOpenNewPayment,
  onOpenNewSchool,
  onNavigate,
  title,
  subtitle,
}) => {
  const [showSchoolDropdown, setShowSchoolDropdown] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const isSuperAdmin = userRole === 'super_admin';
  const isSaasView = currentView.startsWith('saas-');

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#E2E8F0] px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#012041] hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg lg:text-xl font-bold text-[#012041] leading-tight">
              {title}
            </h1>
            {isSaasView && (
              <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#015FC4] border border-blue-200">
                Plataforma SaaS
              </span>
            )}
          </div>
          <p className="text-xs text-[#41515D] hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Middle/Right: Context & Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* School Selector Dropdown (Accessible to Super Admin; locked to single tenant for School Admin) */}
        <div className="relative hidden md:block">
          {isSuperAdmin ? (
            <>
              <button
                onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-slate-300 bg-slate-50 text-xs font-medium text-[#012041] transition-colors cursor-pointer"
                title="Mudar instituição em foco"
              >
                <SchoolIcon className="w-3.5 h-3.5 text-[#015FC4]" />
                <span className="max-w-[180px] truncate">{selectedSchoolName}</span>
              </button>

              {showSchoolDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1.5 text-[11px] font-semibold text-[#41515D] uppercase border-b border-slate-100 flex items-center justify-between">
                    <span>Instituições ({schools.length})</span>
                    <span className="text-[10px] text-[#015FC4]">Super Admin</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {schools.map((escola) => (
                      <button
                        key={escola.id}
                        onClick={() => {
                          onSelectSchool(escola.nome);
                          setShowSchoolDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-blue-50/50 flex items-center justify-between text-[#012041] cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-[#012041] truncate">{escola.nome}</div>
                          <div className="text-[11px] text-[#41515D] truncate">
                            {escola.municipio}, {escola.provincia} · <span className="capitalize">{escola.estado}</span>
                          </div>
                        </div>
                        {selectedSchoolName === escola.nome && (
                          <CheckCircle2 className="w-4 h-4 text-[#015FC4] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Locked Single-Tenant Badge for School Admin */
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-xs font-medium text-[#012041]"
              title="Acesso restrito ao seu tenant escolar"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span className="max-w-[180px] truncate font-semibold">{selectedSchoolName}</span>
            </div>
          )}
        </div>

        {/* Academic Calendar Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-xs text-[#012041] font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#015FC4]" />
          <span>Ano Lectivo 2025/2026</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-[#41515D] hover:text-[#012041] hover:bg-slate-100 transition-colors relative cursor-pointer"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-semibold text-[#012041]">Avisos & Alertas da Plataforma</span>
                <span className="text-[10px] text-[#015FC4] font-medium cursor-pointer">Marcar lidas</span>
              </div>
              <div className="space-y-2 text-xs">
                {isSuperAdmin ? (
                  <>
                    <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-[#012041]">
                      <p className="font-semibold text-[#015FC4]">Nova Escola em Trial</p>
                      <p className="text-[11px] text-[#41515D] mt-0.5">
                        Academia Sol do Kwanza registada no Cuanza Sul há 5 dias.
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100 text-[#012041]">
                      <p className="font-semibold text-amber-800">1 Escola Suspensa</p>
                      <p className="text-[11px] text-[#41515D] mt-0.5">
                        Complexo Esperança Viva com pendência de regularização.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-[#012041]">
                      <p className="font-semibold text-[#015FC4]">Lançamento de Pautas</p>
                      <p className="text-[11px] text-[#41515D] mt-0.5">Prazo do 2º Trimestre encerra em 5 dias.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100 text-[#012041]">
                      <p className="font-semibold text-amber-800">Propinas de Fevereiro</p>
                      <p className="text-[11px] text-[#41515D] mt-0.5">14 alunos com propinas sob reconciliação.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA Quick Actions */}
        <div className="flex items-center gap-2">
          {isSaasView ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenNewSchool}
            >
              Criar Escola
            </Button>
          ) : (
            <>
              {onNavigate && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Sparkles className="w-4 h-4 text-[#015FC4]" />}
                  onClick={() => onNavigate('edugest-ai')}
                  className="hidden md:inline-flex border border-[#015FC4]/30 text-[#015FC4] hover:bg-blue-50/80 cursor-pointer"
                >
                  EduGest AI
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenNewPayment}
                className="hidden sm:inline-flex"
              >
                Lançar Pagamento
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={onOpenNewEnrollment}
              >
                Nova Matrícula
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
