import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Building2,
  Edit2,
  Trash2,
  KeyRound,
  RotateCcw,
  Sliders,
  Eye,
  Check,
  Briefcase,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import {
  AuthUser,
  DepartmentInfo,
  AppUserRole,
  SystemModuleKey,
  PermissionAction,
  RbacSubActionKey,
} from '../../types/authRbac';
import {
  DEPARTAMENTOS_INSTITUICAO,
  UTILIZADORES_AUTENTICACAO_INICIAIS,
} from '../../data/mockAuthRbacData';
import { SUB_ACTION_DEFINITIONS } from '../../data/mockSubActionPolicies';
import { SubActionPoliciesManager } from './SubActionPoliciesManager';
import {
  explainPermissionResolution,
  hasSubActionPermission,
} from '../../services/authRbacService';

interface InstitutionAdminRbacViewProps {
  currentSchoolName: string;
  onNotify?: (msg: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

export const InstitutionAdminRbacView: React.FC<InstitutionAdminRbacViewProps> = ({
  currentSchoolName,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'utilizadores' | 'departamentos' | 'subaccoes'>('utilizadores');
  const [modalSubTab, setModalSubTab] = useState<'modulos' | 'subaccoes'>('modulos');
  const [utilizadores, setUtilizadores] = useState<AuthUser[]>(UTILIZADORES_AUTENTICACAO_INICIAIS);
  const [departamentos, setDepartamentos] = useState<DepartmentInfo[]>(DEPARTAMENTOS_INSTITUICAO);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  // Modais
  const [isNovoUserOpen, setIsNovoUserOpen] = useState(false);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<AuthUser | null>(null);

  // Form states de Novo Utilizador
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoRole, setNovoRole] = useState<AppUserRole>('secretaria');
  const [novoDepartamentoId, setNovoDepartamentoId] = useState('dep-sec');
  const [novoCargo, setNovoCargo] = useState('Assistente de Secretaria');

  const filteredUsers = utilizadores.filter((u) => {
    // Apenas utilizadores da instituição (escondendo o Super Admin SaaS puro desta vista)
    const isSchoolUser = u.role !== 'super_admin';
    const matchSearch =
      u.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'todos' || u.role === roleFilter;

    return isSchoolUser && matchSearch && matchRole;
  });

  // Alternar Bloqueio / Desativação de conta
  const handleToggleBloqueio = (userId: string) => {
    setUtilizadores((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const novoEstado = !u.bloqueado;
          onNotify?.({
            type: novoEstado ? 'info' : 'success',
            message: `Conta de ${u.nomeCompleto} ${novoEstado ? 'bloqueada' : 'desbloqueada e activada'}.`,
          });
          return {
            ...u,
            bloqueado: novoEstado,
            activo: !novoEstado,
            motivoBloqueio: novoEstado ? 'Suspenso pela Direcção da Escola' : undefined,
          };
        }
        return u;
      })
    );
  };

  // Criar novo utilizador interno
  const handleCriarUtilizador = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departamentos.find((d) => d.id === novoDepartamentoId);

    const novoUser: AuthUser = {
      id: `usr-${Date.now()}`,
      nomeCompleto: novoNome,
      email: novoEmail,
      telefone: novoTelefone,
      role: novoRole,
      cargo: novoCargo,
      departamentoId: novoDepartamentoId,
      departamentoNome: dept?.nome,
      escolaId: 'esc-001',
      escolaNome: currentSchoolName,
      activo: true,
      bloqueado: false,
      dataCriacao: new Date().toISOString().split('T')[0],
      ultimoAcesso: 'Pendente primeiro login',
      modulosAutorizados: (dept?.modulosPermitidosPadrao as SystemModuleKey[]) || ['dashboard_escola'],
      permissoes: [
        {
          module: 'dashboard_escola',
          actions: ['consultar'],
        },
      ],
    };

    setUtilizadores((prev) => [novoUser, ...prev]);
    setIsNovoUserOpen(false);
    onNotify?.({
      type: 'success',
      message: `Utilizador ${novoNome} criado e convite de acesso enviado para ${novoEmail}.`,
    });

    // Reset form
    setNovoNome('');
    setNovoEmail('');
    setNovoTelefone('');
  };

  // Alternar acção em permissão granular
  const handleTogglePermissionAction = (
    moduleKey: SystemModuleKey,
    action: PermissionAction
  ) => {
    if (!selectedUserForPerms) return;

    setSelectedUserForPerms((prev) => {
      if (!prev) return null;
      const currentPerms = [...prev.permissoes];
      const modIndex = currentPerms.findIndex((p) => p.module === moduleKey);

      if (modIndex >= 0) {
        const actions = [...currentPerms[modIndex].actions];
        if (actions.includes(action)) {
          currentPerms[modIndex].actions = actions.filter((a) => a !== action);
        } else {
          currentPerms[modIndex].actions.push(action);
        }
      } else {
        currentPerms.push({
          module: moduleKey,
          actions: [action],
        });
      }

      return {
        ...prev,
        permissoes: currentPerms,
      };
    });
  };

  const handleSalvarPermissoes = () => {
    if (!selectedUserForPerms) return;
    setUtilizadores((prev) =>
      prev.map((u) => (u.id === selectedUserForPerms.id ? selectedUserForPerms : u))
    );
    setSelectedUserForPerms(null);
    onNotify?.({
      type: 'success',
      message: `Matriz de permissões e sub-acções de ${selectedUserForPerms.nomeCompleto} gravadas com sucesso.`,
    });
  };

  // Handlers de excepções de sub-acções para utilizador individual
  const handleToggleUserCustomSubAction = (key: RbacSubActionKey) => {
    if (!selectedUserForPerms) return;
    const currentCustom = selectedUserForPerms.subActionsCustomizadas || [];
    const currentRevoked = selectedUserForPerms.subActionsRevogadas || [];

    let newCustom: RbacSubActionKey[];
    if (currentCustom.includes(key)) {
      newCustom = currentCustom.filter((k) => k !== key);
    } else {
      newCustom = [...currentCustom, key];
    }
    const newRevoked = currentRevoked.filter((k) => k !== key);

    setSelectedUserForPerms({
      ...selectedUserForPerms,
      subActionsCustomizadas: newCustom,
      subActionsRevogadas: newRevoked,
    });
  };

  const handleToggleUserRevokeSubAction = (key: RbacSubActionKey) => {
    if (!selectedUserForPerms) return;
    const currentCustom = selectedUserForPerms.subActionsCustomizadas || [];
    const currentRevoked = selectedUserForPerms.subActionsRevogadas || [];

    let newRevoked: RbacSubActionKey[];
    if (currentRevoked.includes(key)) {
      newRevoked = currentRevoked.filter((k) => k !== key);
    } else {
      newRevoked = [...currentRevoked, key];
    }
    const newCustom = currentCustom.filter((k) => k !== key);

    setSelectedUserForPerms({
      ...selectedUserForPerms,
      subActionsCustomizadas: newCustom,
      subActionsRevogadas: newRevoked,
    });
  };

  const handleResetUserSubActionToDefault = (key: RbacSubActionKey) => {
    if (!selectedUserForPerms) return;
    setSelectedUserForPerms({
      ...selectedUserForPerms,
      subActionsCustomizadas: (selectedUserForPerms.subActionsCustomizadas || []).filter((k) => k !== key),
      subActionsRevogadas: (selectedUserForPerms.subActionsRevogadas || []).filter((k) => k !== key),
    });
  };

  const allModulesList: { key: SystemModuleKey; label: string }[] = [
    { key: 'dashboard_escola', label: 'Dashboard & Indicadores' },
    { key: 'secretaria', label: 'Secretaria & Matrículas' },
    { key: 'financeiro', label: 'Finanças & Propinas' },
    { key: 'academico', label: 'Académico & Notas do MED' },
    { key: 'recursos_humanos', label: 'Recursos Humanos' },
    { key: 'crm', label: 'CRM & Funil de Admissões' },
    { key: 'documentos_relatorios', label: 'Documentos & Mapas' },
    { key: 'comunicacao', label: 'Comunicação & Mensagens' },
  ];

  const actionsList: { key: PermissionAction; label: string }[] = [
    { key: 'consultar', label: 'Consultar' },
    { key: 'criar', label: 'Criar' },
    { key: 'editar', label: 'Editar' },
    { key: 'aprovar', label: 'Aprovar' },
    { key: 'anular', label: 'Anular' },
    { key: 'exportar', label: 'Exportar' },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho Oficial do Módulo */}
      <div className="bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] rounded-xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
            <span>{currentSchoolName}</span>
            <span aria-hidden="true">·</span>
            <span>Administração Interna & Controlo de Acesso RBAC</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestão de Utilizadores, Departamentos & Permissões
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed max-w-3xl">
            Defina perfis departamentais, conceda permissões granulares por ação (consultar, criar,
            editar, aprovar, anular e exportar) e bloqueie acessos em tempo real com auditoria completa.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('utilizadores')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'utilizadores'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Colaboradores & Utilizadores ({filteredUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('departamentos')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'departamentos'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Departamentos Institucionais ({departamentos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('subaccoes')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'subaccoes'
                  ? 'bg-white text-[#012041] shadow-sm font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Políticas de Sub-Acções (RBAC Fino)</span>
              <span className="text-[10px] bg-amber-400 text-[#012041] font-extrabold px-1.5 py-0.5 rounded uppercase">
                Detalhado
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ABA 1: UTILIZADORES */}
      {activeTab === 'utilizadores' && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, email ou cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                >
                  <option value="todos">Todos os Papéis</option>
                  <option value="school_admin">Director / Admin Escola</option>
                  <option value="rh">Recursos Humanos</option>
                  <option value="secretaria">Secretaria</option>
                  <option value="financeiro">Finanças</option>
                  <option value="coordenacao">Coordenação</option>
                  <option value="professor">Professor</option>
                  <option value="crm">CRM / Admissões</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsNovoUserOpen(true)}
              >
                Convidar / Criar Utilizador
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Nome Completo & Email</th>
                    <th className="py-3 px-4">Função / Papel</th>
                    <th className="py-3 px-4">Departamento</th>
                    <th className="py-3 px-4">Último Acesso</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Permissões & Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-gray-900 block">{user.nomeCompleto}</strong>
                        <span className="text-[11px] text-gray-500 font-mono">{user.email}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800">{user.cargo}</span>
                        <span className="block text-[10px] text-gray-400 uppercase font-mono mt-0.5">
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-700">
                        {user.departamentoNome || 'Direcção Geral'}
                      </td>

                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {user.ultimoAcesso || 'Nunca acedeu'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            !user.bloqueado && user.activo
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {!user.bloqueado && user.activo ? 'Activo' : 'Bloqueado'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedUserForPerms(user)}
                          className="text-[#015FC4] hover:underline font-semibold"
                        >
                          Matriz RBAC
                        </button>
                        <span className="text-gray-300">·</span>
                        <button
                          onClick={() => handleToggleBloqueio(user.id)}
                          className={`font-semibold hover:underline ${
                            user.bloqueado ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {user.bloqueado ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ABA 2: DEPARTAMENTOS */}
      {activeTab === 'departamentos' && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#012041]">
                Departamentos da Instituição & Âmbitos de Segurança
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Organização estrutural com isolamento de dados e módulos padrão autorizados.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departamentos.map((dep) => (
                <div
                  key={dep.id}
                  className="p-5 rounded-xl border border-gray-200 bg-white hover:border-[#015FC4] transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#015FC4]">
                        {dep.sigla}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dep.totalColaboradores} colaboradores
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#012041]">{dep.nome}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{dep.descricao}</p>

                    <div className="pt-3 border-t border-gray-100 mt-3 text-xs">
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                        Responsável Titular:
                      </span>
                      <strong className="text-gray-900">{dep.responsavelNome}</strong>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                    <span className="font-bold block text-gray-700 mb-1">Módulos Acessíveis:</span>
                    <span className="text-gray-500">{dep.modulosPermitidosPadrao.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ABA 3: POLÍTICAS DE SUB-ACÇÕES (RBAC FINO) */}
      {activeTab === 'subaccoes' && (
        <SubActionPoliciesManager
          currentSchoolName={currentSchoolName}
          departamentos={departamentos}
          utilizadores={utilizadores}
          onNotify={onNotify}
          onUpdateUsers={setUtilizadores}
        />
      )}

      {/* MODAL: CRIAR UTILIZADOR */}
      <Modal
        isOpen={isNovoUserOpen}
        onClose={() => setIsNovoUserOpen(false)}
        title="Criar Novo Utilizador Institucional"
        maxWidth="md"
      >
        <form onSubmit={handleCriarUtilizador} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: João Baptista"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Institucional</label>
            <input
              type="email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              placeholder="joao.baptista@esperanca.edu.ao"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Telefone de Contacto</label>
            <input
              type="tel"
              value={novoTelefone}
              onChange={(e) => setNovoTelefone(e.target.value)}
              placeholder="+244 923 000 000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Departamento</label>
              <select
                value={novoDepartamentoId}
                onChange={(e) => setNovoDepartamentoId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              >
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Papel / Função</label>
              <select
                value={novoRole}
                onChange={(e) => setNovoRole(e.target.value as AppUserRole)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              >
                <option value="secretaria">Secretaria</option>
                <option value="financeiro">Tesouraria / Finanças</option>
                <option value="coordenacao">Coordenação Pedagógica</option>
                <option value="rh">Recursos Humanos</option>
                <option value="professor">Professor</option>
                <option value="crm">CRM / Admissões</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Cargo Designado</label>
            <input
              type="text"
              value={novoCargo}
              onChange={(e) => setNovoCargo(e.target.value)}
              placeholder="Ex: Assistente de Tesouraria"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsNovoUserOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Criar & Convidar Utilizador
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: MATRIZ DE PERMISSÕES RBAC POR AÇÃO & SUB-ACÇÕES */}
      {selectedUserForPerms && (
        <Modal
          isOpen={!!selectedUserForPerms}
          onClose={() => setSelectedUserForPerms(null)}
          title={`Gestão de Acesso RBAC · ${selectedUserForPerms.nomeCompleto}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Cabeçalho do Utilizador */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong className="text-[#012041] block text-sm">{selectedUserForPerms.nomeCompleto}</strong>
                <span className="text-[11px] text-blue-700">
                  {selectedUserForPerms.cargo} · {selectedUserForPerms.departamentoNome || 'Direcção'} · {selectedUserForPerms.email}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded border border-blue-200 text-[#015FC4]">
                  {selectedUserForPerms.role}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedUserForPerms.activo && !selectedUserForPerms.bloqueado
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedUserForPerms.activo && !selectedUserForPerms.bloqueado ? 'Activo' : 'Bloqueado'}
                </span>
              </div>
            </div>

            {/* Alternador de Abas do Modal */}
            <div className="flex border-b border-gray-200 gap-4">
              <button
                type="button"
                onClick={() => setModalSubTab('modulos')}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                  modalSubTab === 'modulos'
                    ? 'border-[#015FC4] text-[#015FC4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                1. Matriz Módulos Gerais (6 Ações)
              </button>

              <button
                type="button"
                onClick={() => setModalSubTab('subaccoes')}
                className={`pb-2 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
                  modalSubTab === 'subaccoes'
                    ? 'border-[#015FC4] text-[#015FC4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Sub-Acções & Excepções Cirúrgicas</span>
                {((selectedUserForPerms.subActionsCustomizadas?.length || 0) > 0 ||
                  (selectedUserForPerms.subActionsRevogadas?.length || 0) > 0) && (
                  <span className="bg-[#015FC4] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    {(selectedUserForPerms.subActionsCustomizadas?.length || 0) +
                      (selectedUserForPerms.subActionsRevogadas?.length || 0)}
                  </span>
                )}
              </button>
            </div>

            {/* CONTEÚDO 1: MATRIZ DE MÓDULOS GERAIS */}
            {modalSubTab === 'modulos' && (
              <div className="space-y-3">
                <p className="text-gray-600 text-[11px]">
                  Assinale as permissões operacionais estritas por módulo. Uma permissão de <strong>consultar</strong> não
                  concede autorização para criar, editar ou anular registos.
                </p>

                <div className="border border-gray-200 rounded-lg overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                      <tr className="border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Módulo Funcional</th>
                        {actionsList.map((a) => (
                          <th key={a.key} className="py-2.5 px-2 text-center">
                            {a.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allModulesList.map((mod) => {
                        const modPerm = selectedUserForPerms.permissoes.find((p) => p.module === mod.key);
                        return (
                          <tr key={mod.key} className="hover:bg-gray-50/50">
                            <td className="py-2 px-3 font-semibold text-gray-900">{mod.label}</td>
                            {actionsList.map((act) => {
                              const isChecked = modPerm?.actions.includes(act.key) || false;
                              return (
                                <td key={act.key} className="py-2 px-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleTogglePermissionAction(mod.key, act.key)}
                                    className="rounded text-[#015FC4] focus:ring-[#015FC4] w-3.5 h-3.5 cursor-pointer"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTEÚDO 2: SUB-ACÇÕES CIRÚRGICAS & EXCEPÇÕES INDIVIDUAIS */}
            {modalSubTab === 'subaccoes' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 flex items-start gap-2">
                  <Sliders className="w-4 h-4 text-[#015FC4] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Hierarquia de Resolução de Permissões:</strong>
                    <span className="block mt-0.5 text-gray-500 leading-relaxed">
                      O utilizador herda automaticamente as sub-acções do seu <strong>cargo ({selectedUserForPerms.role})</strong> e{' '}
                      <strong>departamento ({selectedUserForPerms.departamentoNome || 'Geral'})</strong>. Utilize os botões abaixo
                      para criar uma <em>excepção individual autorizada (+)</em> ou uma <em>revogação expressa (-)</em> exclusiva
                      para esta pessoa.
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-[380px] divide-y divide-gray-100">
                  {SUB_ACTION_DEFINITIONS.map((sa) => {
                    const isCustom = selectedUserForPerms.subActionsCustomizadas?.includes(sa.key) || false;
                    const isRevoked = selectedUserForPerms.subActionsRevogadas?.includes(sa.key) || false;
                    const resolution = explainPermissionResolution(selectedUserForPerms, sa.key);

                    return (
                      <div
                        key={sa.key}
                        className={`p-3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCustom
                            ? 'bg-blue-50/40'
                            : isRevoked
                            ? 'bg-rose-50/30'
                            : 'hover:bg-gray-50/60'
                        }`}
                      >
                        <div className="space-y-1 max-w-lg">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                              {sa.categoria}
                            </span>
                            <span className="font-bold text-xs text-gray-900">{sa.nome}</span>
                            <span className="text-[10px] font-mono text-gray-400 font-normal">
                              ({sa.key})
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-500 leading-snug">
                            {sa.descricao}
                          </p>

                          <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                            <span
                              className={`font-semibold inline-flex items-center gap-1 ${
                                resolution.allowed ? 'text-emerald-700' : 'text-gray-500'
                              }`}
                            >
                              {resolution.allowed ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <XCircle className="w-3 h-3 text-gray-400" />
                              )}
                              {resolution.allowed ? 'Efetivo: Permitido' : 'Efetivo: Bloqueado'}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-500 truncate max-w-[280px]">
                              {resolution.reason}
                            </span>
                          </div>
                        </div>

                        {/* Controlos de Excepção */}
                        <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                          {/* Botão de Excepção Positiva (+ Autorizar) */}
                          <button
                            type="button"
                            onClick={() => handleToggleUserCustomSubAction(sa.key)}
                            title="Conceder excepção autorizada individual"
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                              isCustom
                                ? 'bg-[#015FC4] text-white shadow-xs'
                                : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-[#015FC4]'
                            }`}
                          >
                            {isCustom ? '✓ Excepção (+)' : '+ Excepção'}
                          </button>

                          {/* Botão de Revogação Expressa (-) */}
                          <button
                            type="button"
                            onClick={() => handleToggleUserRevokeSubAction(sa.key)}
                            title="Revogar expressamente para este utilizador"
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                              isRevoked
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-700 hover:bg-rose-100 hover:text-rose-700'
                            }`}
                          >
                            {isRevoked ? '✕ Revogado (-)' : '- Revogar'}
                          </button>

                          {/* Restaurar para Padrão (se houver excepção) */}
                          {(isCustom || isRevoked) && (
                            <button
                              type="button"
                              onClick={() => handleResetUserSubActionToDefault(sa.key)}
                              title="Remover excepção e seguir padrão do departamento"
                              className="px-1.5 py-1 text-gray-400 hover:text-gray-700 text-[10px]"
                            >
                              Restaurar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                Alterações sincronizadas em tempo real com as directrizes de segurança institucional.
              </span>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedUserForPerms(null)}
                >
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={handleSalvarPermissoes}>
                  Gravar Alterações de Acesso
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
