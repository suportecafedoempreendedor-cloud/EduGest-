import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Ban,
  XCircle,
  RotateCcw,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { School, SchoolState, SchoolPlan, ViewMode } from '../../types';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface SchoolsManagementViewProps {
  schools: School[];
  onNavigate: (view: ViewMode) => void;
  onUpdateSchool: (updatedSchool: School) => Promise<boolean> | void;
  onUpdateSchoolState: (
    schoolId: string,
    newState: SchoolState,
    motivo?: string
  ) => Promise<boolean> | void;
  onSelectSchoolTenant: (school: School) => void;
  isSimulatingNetwork?: boolean;
  onToggleSimulatingNetwork?: () => void;
  onTriggerTestError?: (type: 'network' | 'validation') => void;
}

export const SchoolsManagementView: React.FC<SchoolsManagementViewProps> = ({
  schools,
  onNavigate,
  onUpdateSchool,
  onUpdateSchoolState,
  onSelectSchoolTenant,
  isSimulatingNetwork = false,
  onToggleSimulatingNetwork,
  onTriggerTestError,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<'todos' | SchoolState>('todos');
  const [provinceFilter, setProvinceFilter] = useState<string>('todas');
  const [planFilter, setPlanFilter] = useState<string>('todos');

  // Modals state
  const [viewingSchool, setViewingSchool] = useState<School | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    school: School;
    action: 'activar' | 'suspender' | 'cancelar' | 'restaurar';
  } | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Async submission states
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Form edit state
  const [editFormData, setEditFormData] = useState<Partial<School>>({});

  // Filtered schools
  const filteredSchools = schools.filter((school) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      school.nome.toLowerCase().includes(term) ||
      school.nomeComercial.toLowerCase().includes(term) ||
      school.nif.toLowerCase().includes(term) ||
      school.email.toLowerCase().includes(term) ||
      school.municipio.toLowerCase().includes(term) ||
      school.provincia.toLowerCase().includes(term);

    const matchState = stateFilter === 'todos' || school.estado === stateFilter;
    const matchProvince = provinceFilter === 'todas' || school.provincia === provinceFilter;
    const matchPlan = planFilter === 'todos' || school.plano === planFilter;

    return matchSearch && matchState && matchProvince && matchPlan;
  });

  const handleOpenEdit = (school: School) => {
    setEditingSchool(school);
    setEditFormData({ ...school });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool || !editFormData.nome) return;

    setIsSubmittingEdit(true);
    try {
      const updated: School = {
        ...editingSchool,
        nome: editFormData.nome || editingSchool.nome,
        nomeComercial: editFormData.nomeComercial || editingSchool.nomeComercial,
        nif: editFormData.nif || editingSchool.nif,
        provincia: editFormData.provincia || editingSchool.provincia,
        municipio: editFormData.municipio || editingSchool.municipio,
        morada: editFormData.morada || editingSchool.morada,
        telefone: editFormData.telefone || editingSchool.telefone,
        email: editFormData.email || editingSchool.email,
        website: editFormData.website || editingSchool.website,
        plano: (editFormData.plano as SchoolPlan) || editingSchool.plano,
        valorMensalKz: editFormData.valorMensalKz || editingSchool.valorMensalKz,
        adminNome: editFormData.adminNome || editingSchool.adminNome,
        adminEmail: editFormData.adminEmail || editingSchool.adminEmail,
        adminTelefone: editFormData.adminTelefone || editingSchool.adminTelefone,
      };

      const result = await onUpdateSchool(updated);
      // Se não houve erro, fecha o modal
      if (result !== false) {
        setEditingSchool(null);
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!confirmAction) return;

    setIsSubmittingAction(true);
    try {
      let targetState: SchoolState = 'activa';
      if (confirmAction.action === 'activar' || confirmAction.action === 'restaurar') {
        targetState = 'activa';
      } else if (confirmAction.action === 'suspender') {
        targetState = 'suspensa';
      } else if (confirmAction.action === 'cancelar') {
        targetState = 'cancelada';
      }

      const result = await onUpdateSchoolState(
        confirmAction.school.id,
        targetState,
        actionReason || undefined
      );

      // Se executou com sucesso (sem erro capturado), fecha o modal
      if (result !== false) {
        setConfirmAction(null);
        setActionReason('');
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card noPadding>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-lg font-bold text-[#012041]">Gestão de Escolas & Instituições</h2>
            <p className="text-xs text-[#41515D]">
              {schools.length} instituições cadastradas · Controle de subscrições, estados e administradores de tenant
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => onNavigate('saas-onboarding')}
            >
              Criar Nova Escola
            </Button>
          </div>
        </div>

        {/* Network & Processing Resilience Testing Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#41515D] font-medium">Diagnóstico de Rede:</span>
            {isSimulatingNetwork ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold border border-red-200">
                <WifiOff className="w-3.5 h-3.5 text-red-600" /> Falha de Rede Simulada (Offline / HTTP 503)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Conexão Activa (Online)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onToggleSimulatingNetwork && (
              <button
                type="button"
                onClick={onToggleSimulatingNetwork}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                  isSimulatingNetwork
                    ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                    : 'bg-white text-[#012041] border-[#E2E8F0] hover:bg-slate-100'
                }`}
                title="Simula queda de conexão ou timeout de API durante ações administrativas"
              >
                {isSimulatingNetwork ? 'Desactivar Falha de Rede' : 'Simular Queda de Rede'}
              </button>
            )}

            {onTriggerTestError && (
              <>
                <button
                  type="button"
                  onClick={() => onTriggerTestError('network')}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-red-700 border border-red-200 hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  Testar Toast Erro Rede
                </button>
                <button
                  type="button"
                  onClick={() => onTriggerTestError('validation')}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-amber-800 border border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  Testar Toast Erro Dados
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter controls */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/60">
          <Input
            placeholder="Pesquisar por Nome, NIF, Província..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <Select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value as any)}
          >
            <option value="todos">Todos os Estados</option>
            <option value="activa">Activa</option>
            <option value="trial">Trial (Período Experimental)</option>
            <option value="suspensa">Suspensa</option>
            <option value="cancelada">Cancelada</option>
          </Select>

          <Select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
          >
            <option value="todas">Todas as Províncias</option>
            <option value="Luanda">Luanda</option>
            <option value="Benguela">Benguela</option>
            <option value="Huambo">Huambo</option>
            <option value="Cuanza Sul">Cuanza Sul</option>
            <option value="Huíla">Huíla</option>
          </Select>

          <Select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="todos">Todos os Planos</option>
            <option value="Plano Básico">Plano Básico</option>
            <option value="Plano Pro">Plano Pro</option>
            <option value="Plano Enterprise">Plano Enterprise</option>
            <option value="Plano Governamental">Plano Governamental</option>
          </Select>
        </div>
      </Card>

      {/* Schools Table & Responsive Cards */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-[#E2E8F0] text-[#012041]">
                <th className="py-3 px-4 font-semibold">Escola / Nome Comercial</th>
                <th className="py-3 px-4 font-semibold">NIF</th>
                <th className="py-3 px-4 font-semibold">Localização</th>
                <th className="py-3 px-4 font-semibold">Subscrição / Valor</th>
                <th className="py-3 px-4 font-semibold">Admin do Tenant</th>
                <th className="py-3 px-4 font-semibold text-center">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acções Administrativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#41515D]">
                    Nenhuma escola encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredSchools.map((escola) => (
                  <tr key={escola.id} className="hover:bg-slate-50 transition-colors">
                    {/* Nome & Logo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#012041] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {escola.logotipo || escola.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#012041]">{escola.nome}</div>
                          <div className="text-[11px] text-[#41515D]">{escola.nomeComercial}</div>
                        </div>
                      </div>
                    </td>

                    {/* NIF */}
                    <td className="py-3 px-4 font-mono font-medium text-[#41515D]">
                      {escola.nif}
                    </td>

                    {/* Localização */}
                    <td className="py-3 px-4 text-[#012041]">
                      <div className="font-medium">{escola.provincia}</div>
                      <div className="text-[11px] text-[#41515D]">{escola.municipio}</div>
                    </td>

                    {/* Plano & Valor */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#012041]">{escola.plano}</div>
                      <div className="text-[11px] font-mono font-medium text-[#015FC4]">
                        {escola.valorMensalKz.toLocaleString('pt-AO')} Kz/mês
                      </div>
                    </td>

                    {/* Administrador */}
                    <td className="py-3 px-4 text-[#012041]">
                      <div className="font-medium">{escola.adminNome}</div>
                      <div className="text-[11px] text-[#41515D] font-mono">{escola.adminEmail}</div>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4 text-center">
                      {escola.estado === 'activa' && <Badge variant="success">Activa</Badge>}
                      {escola.estado === 'trial' && <Badge variant="primary">Trial</Badge>}
                      {escola.estado === 'suspensa' && <Badge variant="warning">Suspensa</Badge>}
                      {escola.estado === 'cancelada' && <Badge variant="error">Cancelada</Badge>}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Visualizar */}
                        <button
                          onClick={() => setViewingSchool(escola)}
                          className="p-1.5 rounded-lg text-[#015FC4] hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Visualizar Detalhes da Escola"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleOpenEdit(escola)}
                          className="p-1.5 rounded-lg text-[#012041] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Editar Dados da Escola"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Activar (se não estiver activa) */}
                        {escola.estado !== 'activa' && (
                          <button
                            onClick={() => setConfirmAction({ school: escola, action: 'activar' })}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Activar Escola"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Suspender (se activa ou trial) */}
                        {(escola.estado === 'activa' || escola.estado === 'trial') && (
                          <button
                            onClick={() => setConfirmAction({ school: escola, action: 'suspender' })}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Suspender Escola"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {/* Cancelar (se não cancelada) */}
                        {escola.estado !== 'cancelada' && (
                          <button
                            onClick={() => setConfirmAction({ school: escola, action: 'cancelar' })}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Cancelar Subscrição"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Restaurar (se cancelada ou suspensa) */}
                        {(escola.estado === 'cancelada' || escola.estado === 'suspensa') && (
                          <button
                            onClick={() => setConfirmAction({ school: escola, action: 'restaurar' })}
                            className="p-1.5 rounded-lg text-[#015FC4] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Restaurar Escola para Activa"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Visualizar Escola */}
      {viewingSchool && (
        <Modal
          isOpen={!!viewingSchool}
          onClose={() => setViewingSchool(null)}
          title={`Ficha Institucional · ${viewingSchool.nome}`}
          subtitle={`NIF: ${viewingSchool.nif} · Registada em ${viewingSchool.dataCriacao}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#012041] text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {viewingSchool.logotipo || viewingSchool.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#012041]">{viewingSchool.nome}</h3>
                  <p className="text-xs text-[#41515D]">{viewingSchool.nomeComercial}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {viewingSchool.estado === 'activa' && <Badge variant="success">Activa</Badge>}
                    {viewingSchool.estado === 'trial' && <Badge variant="primary">Período de Testes (Trial)</Badge>}
                    {viewingSchool.estado === 'suspensa' && <Badge variant="warning">Suspensa</Badge>}
                    {viewingSchool.estado === 'cancelada' && <Badge variant="error">Cancelada</Badge>}
                    <span className="text-xs font-semibold text-[#015FC4]">{viewingSchool.plano}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#41515D] block">Subscrição Mensal</span>
                <span className="text-base font-bold font-mono text-[#012041] tabular-nums">
                  {viewingSchool.valorMensalKz.toLocaleString('pt-AO')} Kz
                </span>
              </div>
            </div>

            {/* Grid de Dados Institucionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg space-y-1">
                <span className="text-[#41515D] block font-medium">Localização & Morada</span>
                <span className="font-semibold text-[#012041] block">
                  {viewingSchool.municipio}, {viewingSchool.provincia}
                </span>
                <span className="text-[#41515D] block">{viewingSchool.morada}</span>
              </div>

              <div className="p-3 bg-white border border-[#E2E8F0] rounded-lg space-y-1">
                <span className="text-[#41515D] block font-medium">Canais de Comunicação</span>
                <div className="flex items-center gap-1.5 text-[#012041]">
                  <Phone className="w-3.5 h-3.5 text-[#015FC4]" />
                  <span className="font-mono">{viewingSchool.telefone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#012041]">
                  <Mail className="w-3.5 h-3.5 text-[#015FC4]" />
                  <span className="font-mono">{viewingSchool.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#015FC4]">
                  <Globe className="w-3.5 h-3.5" />
                  <a href={viewingSchool.website} target="_blank" rel="noreferrer" className="hover:underline">
                    {viewingSchool.website}
                  </a>
                </div>
              </div>
            </div>

            {/* Administrador do Tenant */}
            <div className="p-4 border border-[#E2E8F0] rounded-xl bg-blue-50/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#012041] uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-[#015FC4]" />
                Administrador Responsável do Tenant
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[#41515D] block">Nome:</span>
                  <span className="font-semibold text-[#012041]">{viewingSchool.adminNome}</span>
                </div>
                <div>
                  <span className="text-[#41515D] block">Email Institucional:</span>
                  <span className="font-mono text-[#012041]">{viewingSchool.adminEmail}</span>
                </div>
                <div>
                  <span className="text-[#41515D] block">Telefone:</span>
                  <span className="font-mono text-[#015FC4]">{viewingSchool.adminTelefone}</span>
                </div>
              </div>
            </div>

            {/* Estatísticas de Utilização */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[#41515D] block">Estudantes no Tenant</span>
                <span className="text-base font-bold text-[#012041] tabular-nums font-mono mt-0.5 block">
                  {viewingSchool.totalAlunos.toLocaleString('pt-AO')}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[#41515D] block">Corpo Docente</span>
                <span className="text-base font-bold text-[#012041] tabular-nums font-mono mt-0.5 block">
                  {viewingSchool.totalProfessores}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[#41515D] block">Ano Lectivo</span>
                <span className="text-base font-bold text-[#015FC4] mt-0.5 block">
                  {viewingSchool.anoLectivoActivo}
                </span>
              </div>
            </div>

            {/* Ações no Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
              <Button
                variant="secondary"
                size="sm"
                icon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => {
                  onSelectSchoolTenant(viewingSchool);
                  setViewingSchool(null);
                }}
              >
                Aceder ao Tenant Desta Escola
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewingSchool(null)}
                >
                  Fechar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const sc = viewingSchool;
                    setViewingSchool(null);
                    handleOpenEdit(sc);
                  }}
                >
                  Editar Dados
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Editar Escola */}
      {editingSchool && (
        <Modal
          isOpen={!!editingSchool}
          onClose={() => setEditingSchool(null)}
          title={`Editar Escola · ${editingSchool.nome}`}
          subtitle="Actualize as informações cadastrais e comerciais da instituição"
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome Oficial da Escola"
                value={editFormData.nome || ''}
                onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                required
              />
              <Input
                label="Nome Comercial / Razão Social"
                value={editFormData.nomeComercial || ''}
                onChange={(e) => setEditFormData({ ...editFormData, nomeComercial: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="NIF"
                value={editFormData.nif || ''}
                onChange={(e) => setEditFormData({ ...editFormData, nif: e.target.value })}
                required
              />
              <Select
                label="Província"
                value={editFormData.provincia || 'Luanda'}
                onChange={(e) => setEditFormData({ ...editFormData, provincia: e.target.value })}
              >
                <option value="Luanda">Luanda</option>
                <option value="Benguela">Benguela</option>
                <option value="Huambo">Huambo</option>
                <option value="Cuanza Sul">Cuanza Sul</option>
                <option value="Huíla">Huíla</option>
                <option value="Cabinda">Cabinda</option>
                <option value="Malanje">Malanje</option>
              </Select>
              <Input
                label="Município"
                value={editFormData.municipio || ''}
                onChange={(e) => setEditFormData({ ...editFormData, municipio: e.target.value })}
              />
            </div>

            <Input
              label="Morada Completa"
              value={editFormData.morada || ''}
              onChange={(e) => setEditFormData({ ...editFormData, morada: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Telefone Institucional"
                value={editFormData.telefone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, telefone: e.target.value })}
              />
              <Input
                label="Email Institucional"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
              <Input
                label="Website"
                value={editFormData.website || ''}
                onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
              />
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#012041] block mb-2 uppercase tracking-wide">
                Subscrição & Plano SaaS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Plano Subscrito"
                  value={editFormData.plano || 'Plano Pro'}
                  onChange={(e) => {
                    const plano = e.target.value as SchoolPlan;
                    let valor = 125000;
                    if (plano === 'Plano Básico') valor = 75000;
                    if (plano === 'Plano Pro') valor = 125000;
                    if (plano === 'Plano Enterprise') valor = 185000;
                    if (plano === 'Plano Governamental') valor = 250000;
                    setEditFormData({ ...editFormData, plano, valorMensalKz: valor });
                  }}
                >
                  <option value="Plano Básico">Plano Básico (75.000 Kz/mês)</option>
                  <option value="Plano Pro">Plano Pro (125.000 Kz/mês)</option>
                  <option value="Plano Enterprise">Plano Enterprise (185.000 Kz/mês)</option>
                  <option value="Plano Governamental">Plano Governamental (250.000 Kz/mês)</option>
                </Select>

                <Input
                  label="Valor Mensal da Subscrição (Kz)"
                  type="number"
                  value={editFormData.valorMensalKz || 0}
                  onChange={(e) => setEditFormData({ ...editFormData, valorMensalKz: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#012041] block mb-2 uppercase tracking-wide">
                Administrador da Escola
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Nome do Administrador"
                  value={editFormData.adminNome || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, adminNome: e.target.value })}
                />
                <Input
                  label="Email"
                  value={editFormData.adminEmail || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, adminEmail: e.target.value })}
                />
                <Input
                  label="Telefone"
                  value={editFormData.adminTelefone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, adminTelefone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditingSchool(null)}
                disabled={isSubmittingEdit}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmittingEdit}
              >
                {isSubmittingEdit ? 'A processar...' : 'Guardar Alterações'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Confirmar Ação Administrativa (Activar, Suspender, Cancelar, Restaurar) */}
      {confirmAction && (
        <Modal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={`Confirmar Ação Administrativa`}
          subtitle={`Escola: ${confirmAction.school.nome}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border bg-slate-50 text-xs text-[#012041] space-y-1.5">
              <p>
                Está prestes a executar a seguinte acção:{' '}
                <strong className="uppercase text-[#015FC4]">{confirmAction.action}</strong>
              </p>
              <p className="text-[#41515D]">
                Esta operação será registada no sistema de auditoria para fins de conformidade legal e administrativa.
              </p>
            </div>

            <Input
              label="Motivo / Justificação da Alteração"
              placeholder="Ex: Regularização de pagamento / Solicitação institucional"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              hint="Opcional. Será anexado aos logs de auditoria."
              disabled={isSubmittingAction}
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmAction(null)}
                disabled={isSubmittingAction}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteAction}
                disabled={isSubmittingAction}
              >
                {isSubmittingAction ? 'A aplicar...' : 'Confirmar e Aplicar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
