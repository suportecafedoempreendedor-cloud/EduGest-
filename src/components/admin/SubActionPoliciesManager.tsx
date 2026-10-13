import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Sliders,
  RotateCcw,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  HelpCircle,
  Copy,
  Lock,
  Unlock,
  Check,
  Building2,
  UserCheck,
  ArrowRight,
  Shield,
  FileCheck,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  AuthUser,
  DepartmentInfo,
  AppUserRole,
  RbacSubActionKey,
  SubActionDefinition,
  DepartmentRolePolicy,
  SubActionRiskLevel,
} from '../../types/authRbac';
import {
  SUB_ACTION_DEFINITIONS,
  INITIAL_DEPARTMENT_POLICIES,
  INITIAL_ROLE_POLICIES,
} from '../../data/mockSubActionPolicies';
import {
  getStoredDepartmentPolicies,
  saveDepartmentPolicies,
  getStoredRolePolicies,
  saveRolePolicies,
  explainPermissionResolution,
  PermissionExplanation,
} from '../../services/authRbacService';

interface SubActionPoliciesManagerProps {
  currentSchoolName: string;
  departamentos: DepartmentInfo[];
  utilizadores: AuthUser[];
  onNotify?: (msg: { type: 'success' | 'error' | 'info'; message: string }) => void;
  onUpdateUsers?: React.Dispatch<React.SetStateAction<AuthUser[]>>;
}

export const SubActionPoliciesManager: React.FC<SubActionPoliciesManagerProps> = ({
  currentSchoolName,
  departamentos,
  utilizadores,
  onNotify,
  onUpdateUsers,
}) => {
  // Modo de configuração: 'departamento' | 'cargo'
  const [targetType, setTargetType] = useState<'departamento' | 'cargo'>('departamento');

  // Estado das políticas em memória e sincronizadas com localStorage
  const [deptPolicies, setDeptPolicies] = useState<DepartmentRolePolicy[]>(() =>
    getStoredDepartmentPolicies()
  );
  const [rolePolicies, setRolePolicies] = useState<DepartmentRolePolicy[]>(() =>
    getStoredRolePolicies()
  );

  // Alvo selecionado
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    departamentos[0]?.id || 'dep-dg'
  );
  const [selectedRoleId, setSelectedRoleId] = useState<AppUserRole>('professor');

  // Filtros de sub-acções
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedRisk, setSelectedRisk] = useState<string>('todos');

  // Estado do simulador de permissões
  const [simUserId, setSimUserId] = useState<string>(utilizadores[0]?.id || '');
  const [simSubAction, setSimSubAction] = useState<RbacSubActionKey>('editar_nota');

  // Modal para clonar regras
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState<string>('');

  // Identificar a política activa de acordo com a selecção
  const currentPolicy: DepartmentRolePolicy = useMemo(() => {
    if (targetType === 'departamento') {
      const found = deptPolicies.find((p) => p.alvoId === selectedDeptId);
      if (found) return found;
      const dept = departamentos.find((d) => d.id === selectedDeptId);
      return {
        id: `pol-dept-${selectedDeptId}`,
        tipoAlvo: 'departamento' as const,
        alvoId: selectedDeptId,
        alvoNome: dept?.nome || 'Departamento',
        descricao: dept?.descricao || 'Política institucional do departamento.',
        subActionsPermitidas: [] as RbacSubActionKey[],
        dataActualizacao: new Date().toISOString().replace('T', ' ').slice(0, 16),
        actualizadoPor: 'Direcção Geral',
      };
    } else {
      const found = rolePolicies.find((p) => p.alvoId === selectedRoleId);
      if (found) return found;
      return {
        id: `pol-role-${selectedRoleId}`,
        tipoAlvo: 'role' as const,
        alvoId: selectedRoleId,
        alvoNome: selectedRoleId,
        descricao: 'Política institucional para o cargo/função.',
        subActionsPermitidas: [] as RbacSubActionKey[],
        dataActualizacao: new Date().toISOString().replace('T', ' ').slice(0, 16),
        actualizadoPor: 'Direcção Geral',
      };
    }
  }, [targetType, selectedDeptId, selectedRoleId, deptPolicies, rolePolicies, departamentos]);

  // Colaboradores abrangidos pelo alvo seleccionado
  const impactedUsers = useMemo(() => {
    if (targetType === 'departamento') {
      return utilizadores.filter((u) => u.departamentoId === selectedDeptId);
    } else {
      return utilizadores.filter((u) => u.role === selectedRoleId);
    }
  }, [targetType, selectedDeptId, selectedRoleId, utilizadores]);

  // Sub-acções filtradas
  const filteredSubActions = useMemo(() => {
    return SUB_ACTION_DEFINITIONS.filter((sa) => {
      const matchSearch =
        sa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sa.key.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'todas' || sa.categoria === selectedCategory;

      const matchRisk = selectedRisk === 'todos' || sa.nivelRisco === selectedRisk;

      return matchSearch && matchCategory && matchRisk;
    });
  }, [searchTerm, selectedCategory, selectedRisk]);

  // Estatísticas da política activa
  const policyStats = useMemo(() => {
    const permitidas = currentPolicy.subActionsPermitidas;
    const defs = SUB_ACTION_DEFINITIONS.filter((d) => permitidas.includes(d.key));

    const criticas = defs.filter((d) => d.nivelRisco === 'critico').length;
    const altas = defs.filter((d) => d.nivelRisco === 'alto').length;
    const medias = defs.filter((d) => d.nivelRisco === 'medio').length;
    const baixas = defs.filter((d) => d.nivelRisco === 'baixo').length;

    return {
      total: permitidas.length,
      totalGeral: SUB_ACTION_DEFINITIONS.length,
      criticas,
      altas,
      medias,
      baixas,
    };
  }, [currentPolicy]);

  // Toggle de uma sub-acção na política activa
  const handleToggleSubAction = (key: RbacSubActionKey) => {
    const isCurrentlyAllowed = currentPolicy.subActionsPermitidas.includes(key);
    const updatedKeys = isCurrentlyAllowed
      ? currentPolicy.subActionsPermitidas.filter((k) => k !== key)
      : [...currentPolicy.subActionsPermitidas, key];

    const updatedPolicy: DepartmentRolePolicy = {
      ...currentPolicy,
      subActionsPermitidas: updatedKeys,
      dataActualizacao: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actualizadoPor: 'Administrador da Instituição',
    };

    if (targetType === 'departamento') {
      const newPolicies = deptPolicies.some((p) => p.alvoId === currentPolicy.alvoId)
        ? deptPolicies.map((p) => (p.alvoId === currentPolicy.alvoId ? updatedPolicy : p))
        : [...deptPolicies, updatedPolicy];

      setDeptPolicies(newPolicies);
      saveDepartmentPolicies(newPolicies);
    } else {
      const newPolicies = rolePolicies.some((p) => p.alvoId === currentPolicy.alvoId)
        ? rolePolicies.map((p) => (p.alvoId === currentPolicy.alvoId ? updatedPolicy : p))
        : [...rolePolicies, updatedPolicy];

      setRolePolicies(newPolicies);
      saveRolePolicies(newPolicies);
    }

    const subDef = SUB_ACTION_DEFINITIONS.find((s) => s.key === key);
    onNotify?.({
      type: 'info',
      message: `${isCurrentlyAllowed ? 'Revogada' : 'Autorizada'} sub-acção "${subDef?.nome || key}" para ${currentPolicy.alvoNome}.`,
    });
  };

  // Conceder todas da categoria filtrada
  const handleAutorizarCategoriaActual = () => {
    const keysToAdd = filteredSubActions.map((s) => s.key);
    const updatedKeys = Array.from(
      new Set([...currentPolicy.subActionsPermitidas, ...keysToAdd])
    );

    const updatedPolicy: DepartmentRolePolicy = {
      ...currentPolicy,
      subActionsPermitidas: updatedKeys,
      dataActualizacao: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actualizadoPor: 'Administrador da Instituição',
    };

    if (targetType === 'departamento') {
      const newPolicies = deptPolicies.map((p) =>
        p.alvoId === currentPolicy.alvoId ? updatedPolicy : p
      );
      setDeptPolicies(newPolicies);
      saveDepartmentPolicies(newPolicies);
    } else {
      const newPolicies = rolePolicies.map((p) =>
        p.alvoId === currentPolicy.alvoId ? updatedPolicy : p
      );
      setRolePolicies(newPolicies);
      saveRolePolicies(newPolicies);
    }

    onNotify?.({
      type: 'success',
      message: `Todas as ${keysToAdd.length} sub-acções filtradas foram autorizadas para ${currentPolicy.alvoNome}.`,
    });
  };

  // Revogar todas da categoria filtrada
  const handleRevogarCategoriaActual = () => {
    const keysToRemove = new Set(filteredSubActions.map((s) => s.key));
    const updatedKeys = currentPolicy.subActionsPermitidas.filter(
      (k) => !keysToRemove.has(k)
    );

    const updatedPolicy: DepartmentRolePolicy = {
      ...currentPolicy,
      subActionsPermitidas: updatedKeys,
      dataActualizacao: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actualizadoPor: 'Administrador da Instituição',
    };

    if (targetType === 'departamento') {
      const newPolicies = deptPolicies.map((p) =>
        p.alvoId === currentPolicy.alvoId ? updatedPolicy : p
      );
      setDeptPolicies(newPolicies);
      saveDepartmentPolicies(newPolicies);
    } else {
      const newPolicies = rolePolicies.map((p) =>
        p.alvoId === currentPolicy.alvoId ? updatedPolicy : p
      );
      setRolePolicies(newPolicies);
      saveRolePolicies(newPolicies);
    }

    onNotify?.({
      type: 'info',
      message: `Sub-acções filtradas revogadas de ${currentPolicy.alvoNome}.`,
    });
  };

  // Restaurar padrão seguro
  const handleRestaurarPadrao = () => {
    if (targetType === 'departamento') {
      const defaultPolicy = INITIAL_DEPARTMENT_POLICIES.find(
        (p) => p.alvoId === currentPolicy.alvoId
      );
      if (defaultPolicy) {
        const newPolicies = deptPolicies.map((p) =>
          p.alvoId === currentPolicy.alvoId ? { ...defaultPolicy } : p
        );
        setDeptPolicies(newPolicies);
        saveDepartmentPolicies(newPolicies);
      }
    } else {
      const defaultPolicy = INITIAL_ROLE_POLICIES.find(
        (p) => p.alvoId === currentPolicy.alvoId
      );
      if (defaultPolicy) {
        const newPolicies = rolePolicies.map((p) =>
          p.alvoId === currentPolicy.alvoId ? { ...defaultPolicy } : p
        );
        setRolePolicies(newPolicies);
        saveRolePolicies(newPolicies);
      }
    }

    onNotify?.({
      type: 'success',
      message: `Predefinições oficiais restauradas com sucesso para ${currentPolicy.alvoNome}.`,
    });
  };

  // Clonar regras de outro alvo
  const handleExecutarClonagem = () => {
    if (!cloneSourceId) return;

    let sourcePolicy: DepartmentRolePolicy | undefined;
    if (targetType === 'departamento') {
      sourcePolicy = deptPolicies.find((p) => p.alvoId === cloneSourceId);
    } else {
      sourcePolicy = rolePolicies.find((p) => p.alvoId === cloneSourceId);
    }

    if (!sourcePolicy) {
      onNotify?.({
        type: 'error',
        message: 'Origem de política não encontrada.',
      });
      return;
    }

    const updatedPolicy: DepartmentRolePolicy = {
      ...currentPolicy,
      subActionsPermitidas: [...sourcePolicy.subActionsPermitidas],
      dataActualizacao: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actualizadoPor: 'Administrador da Instituição',
    };

    if (targetType === 'departamento') {
      const newPolicies = deptPolicies.map((p) =>
        p.alvoId === currentPolicy.alvoId ? updatedPolicy : p
      );
      setDeptPolicies(newPolicies);
      saveDepartmentPolicies(newPolicies);
    } else {
      const newPolicies = rolePolicies.map((p) =>
        p.alvoId === currentPolicy.alvoId ? updatedPolicy : p
      );
      setRolePolicies(newPolicies);
      saveRolePolicies(newPolicies);
    }

    setIsCloneModalOpen(false);
    onNotify?.({
      type: 'success',
      message: `Regras de "${sourcePolicy.alvoNome}" copiadas com sucesso para "${currentPolicy.alvoNome}".`,
    });
  };

  // Execução do simulador
  const simSelectedUser = utilizadores.find((u) => u.id === simUserId) || null;
  const simResolution: PermissionExplanation = useMemo(() => {
    return explainPermissionResolution(simSelectedUser, simSubAction);
  }, [simSelectedUser, simSubAction, deptPolicies, rolePolicies]);

  const simSelectedSubActionDef = SUB_ACTION_DEFINITIONS.find(
    (s) => s.key === simSubAction
  );

  // Render do badge de risco
  const renderRiskBadge = (risk: SubActionRiskLevel) => {
    switch (risk) {
      case 'critico':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            Crítico
          </span>
        );
      case 'alto':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Alto Risco
          </span>
        );
      case 'medio':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" />
            Médio
          </span>
        );
      case 'baixo':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Baixo Risco
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Explicativo de Governança RBAC */}
      <div className="bg-gradient-to-r from-[#012041] via-[#013873] to-[#015FC4] rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
            <Shield className="w-4 h-4 text-blue-300" />
            <span>Matriz de Governança & Segurança Institucional</span>
            <span aria-hidden="true">·</span>
            <span>EduGest Angola</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Políticas Granulares de Sub-Acções por Departamento & Cargo
          </h2>
          <p className="text-xs text-blue-100 leading-relaxed">
            Controle permissões cirúrgicas como <strong>'editar nota'</strong>, <strong>'aprovar pagamento'</strong>,{' '}
            <strong>'bloquear período'</strong> e <strong>'exportar relatório'</strong>. As alterações aplicam-se
            imediatamente a todos os colaboradores vinculados, garantindo isolamento e auditoria permanente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setTargetType('departamento')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              targetType === 'departamento'
                ? 'bg-white text-[#012041] shadow-md font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Configurar por Departamento</span>
          </button>

          <button
            onClick={() => setTargetType('cargo')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              targetType === 'cargo'
                ? 'bg-white text-[#012041] shadow-md font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Configurar por Cargo / Papel</span>
          </button>
        </div>
      </div>

      {/* Selector de Alvo (Departamento ou Cargo) */}
      <Card>
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#015FC4]">
                {targetType === 'departamento' ? '1. Seleccione o Departamento' : '1. Seleccione o Cargo / Papel'}
              </span>
              <h3 className="text-sm font-extrabold text-[#012041]">
                Entidade Institucional sob Configuração
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={() => setIsCloneModalOpen(true)}
              >
                Clonar Regras de Outro Perfil
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleRestaurarPadrao}
              >
                Restaurar Padrão Oficial
              </Button>
            </div>
          </div>

          {/* Grid de Selecção Rápida */}
          {targetType === 'departamento' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {departamentos.map((dept) => {
                const isSelected = selectedDeptId === dept.id;
                const policy = deptPolicies.find((p) => p.alvoId === dept.id);
                const allowedCount = policy?.subActionsPermitidas.length || 0;

                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#015FC4] bg-blue-50/70 shadow-sm ring-1 ring-[#015FC4]'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-[#015FC4] text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {dept.sigla}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {dept.totalColaboradores} colab.
                        </span>
                      </div>
                      <strong className="text-xs text-gray-900 block truncate">
                        {dept.nome}
                      </strong>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] flex items-center justify-between">
                      <span className="text-gray-500">Sub-acções:</span>
                      <strong
                        className={`font-semibold ${
                          allowedCount > 0 ? 'text-[#015FC4]' : 'text-gray-400'
                        }`}
                      >
                        {allowedCount}
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { role: 'school_admin' as AppUserRole, label: 'Director Geral', sigla: 'DG' },
                { role: 'coordenacao' as AppUserRole, label: 'Coordenação Pedagógica', sigla: 'CP' },
                { role: 'professor' as AppUserRole, label: 'Professor Titular', sigla: 'DOC' },
                { role: 'financeiro' as AppUserRole, label: 'Tesouraria & Finanças', sigla: 'FIN' },
                { role: 'secretaria' as AppUserRole, label: 'Secretaria Geral', sigla: 'SEC' },
                { role: 'rh' as AppUserRole, label: 'Recursos Humanos', sigla: 'RH' },
                { role: 'crm' as AppUserRole, label: 'Admissões & CRM', sigla: 'CRM' },
              ].map((r) => {
                const isSelected = selectedRoleId === r.role;
                const policy = rolePolicies.find((p) => p.alvoId === r.role);
                const allowedCount = policy?.subActionsPermitidas.length || 0;
                const userCount = utilizadores.filter((u) => u.role === r.role).length;

                return (
                  <button
                    key={r.role}
                    onClick={() => setSelectedRoleId(r.role)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#015FC4] bg-blue-50/70 shadow-sm ring-1 ring-[#015FC4]'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-[#015FC4] text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {r.sigla}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {userCount} colab.
                        </span>
                      </div>
                      <strong className="text-xs text-gray-900 block truncate">
                        {r.label}
                      </strong>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] flex items-center justify-between">
                      <span className="text-gray-500">Sub-acções:</span>
                      <strong
                        className={`font-semibold ${
                          allowedCount > 0 ? 'text-[#015FC4]' : 'text-gray-400'
                        }`}
                      >
                        {allowedCount}
                      </strong>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Resumo do Alvo Activo & Métricas de Segurança */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {targetType === 'departamento' ? 'Departamento Activo:' : 'Cargo / Função Activa:'}
                </span>
                <strong className="text-sm font-bold text-[#012041]">
                  {currentPolicy.alvoNome}
                </strong>
                <span className="text-xs text-gray-400 font-mono">
                  (ID: {currentPolicy.alvoId})
                </span>
              </div>
              <p className="text-xs text-gray-600">{currentPolicy.descricao}</p>
              <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1">
                <span>
                  Colaboradores vinculados neste momento:{' '}
                  <strong className="text-gray-900 font-semibold">{impactedUsers.length}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Última actualização:{' '}
                  <span className="font-mono text-gray-700">{currentPolicy.dataActualizacao}</span>
                </span>
              </div>
            </div>

            {/* Painel de Contadores de Risco */}
            <div className="flex flex-wrap items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-2xs">
              <div className="text-center px-2">
                <span className="block text-xs font-extrabold text-[#015FC4]">
                  {policyStats.total} / {policyStats.totalGeral}
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  Autorizadas
                </span>
              </div>
              <div className="w-px h-7 bg-gray-200" />
              <div className="text-center px-2">
                <span className="block text-xs font-extrabold text-rose-600">
                  {policyStats.criticas}
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  Críticas
                </span>
              </div>
              <div className="w-px h-7 bg-gray-200" />
              <div className="text-center px-2">
                <span className="block text-xs font-extrabold text-amber-600">
                  {policyStats.altas}
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  Altas
                </span>
              </div>
              <div className="w-px h-7 bg-gray-200" />
              <div className="text-center px-2">
                <span className="block text-xs font-extrabold text-emerald-600">
                  {policyStats.baixas + policyStats.medias}
                </span>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">
                  Padrão
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista e Gestor de Sub-Acções Granulares */}
      <Card>
        <div className="p-5 space-y-4">
          {/* Barra de Filtros e Acções em Massa */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Pesquisa */}
              <div className="relative min-w-[220px] flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar sub-acção (ex: nota, recibo, relatório)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                />
              </div>

              {/* Filtro por Categoria */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] bg-white text-gray-700"
              >
                <option value="todas">Todas as Categorias</option>
                <option value="Académico">Académico (Notas & Pautas)</option>
                <option value="Financeiro">Financeiro (Pagamentos & Recibos)</option>
                <option value="Documentos">Documentos & Relatórios</option>
                <option value="Secretaria">Secretaria & Alunos</option>
                <option value="RH">Recursos Humanos & Salários</option>
                <option value="CRM">CRM & Admissões</option>
              </select>

              {/* Filtro por Risco */}
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] bg-white text-gray-700"
              >
                <option value="todos">Todos os Riscos</option>
                <option value="critico">Crítico (Vermelho)</option>
                <option value="alto">Alto (Laranja)</option>
                <option value="medio">Médio (Azul)</option>
                <option value="baixo">Baixo (Verde)</option>
              </select>
            </div>

            {/* Acções em Massa na Vista */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAutorizarCategoriaActual}
                className="text-xs"
              >
                Autorizar Visíveis ({filteredSubActions.length})
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleRevogarCategoriaActual}
                className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
              >
                Revogar Visíveis
              </Button>
            </div>
          </div>

          {/* Grid de Sub-Acções com Switches Granulares */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSubActions.map((subAction) => {
              const isAllowed = currentPolicy.subActionsPermitidas.includes(subAction.key);

              return (
                <div
                  key={subAction.key}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isAllowed
                      ? 'border-[#015FC4]/40 bg-blue-50/20 shadow-2xs'
                      : 'border-gray-200 bg-white hover:border-gray-300 opacity-80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {subAction.categoria}
                          </span>
                          {renderRiskBadge(subAction.nivelRisco)}
                          {subAction.requerJustificativo && (
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              Exige Justificativo
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-[#012041] flex items-center gap-1.5">
                          {subAction.nome}
                          <span className="text-[10px] font-mono font-normal text-gray-400">
                            ({subAction.key})
                          </span>
                        </h4>
                      </div>

                      {/* Switch de Ativação */}
                      <button
                        type="button"
                        onClick={() => handleToggleSubAction(subAction.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#015FC4] focus:ring-offset-2 ${
                          isAllowed ? 'bg-[#015FC4]' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={isAllowed}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isAllowed ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {subAction.descricao}
                    </p>
                  </div>

                  {/* Rodapé com Regra de Auditoria */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                    <span className="flex items-center gap-1 truncate max-w-[80%] text-[10px]">
                      <FileCheck className="w-3 h-3 text-[#015FC4] shrink-0" />
                      <span className="truncate">{subAction.regraAuditoria}</span>
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isAllowed ? 'text-emerald-700' : 'text-gray-400'
                      }`}
                    >
                      {isAllowed ? 'Autorizado' : 'Bloqueado'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSubActions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold">Nenhuma sub-acção encontrada com os filtros actuais.</p>
              <p className="text-xs text-gray-400 mt-1">Experimente alterar os termos de pesquisa ou remover os filtros de categoria/risco.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Simulador de Acesso & Auditoria em Tempo Real */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Sliders className="w-4 h-4 text-[#015FC4]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#012041]">
                Simulador de Resolução de Permissão em Tempo Real
              </h3>
              <p className="text-xs text-gray-500">
                Seleccione qualquer colaborador da instituição e uma sub-acção para inspecionar o resultado exato de segurança e a cadeia de decisão RBAC.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Colaborador para Teste:
              </label>
              <select
                value={simUserId}
                onChange={(e) => setSimUserId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] bg-white font-medium"
              >
                {utilizadores.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nomeCompleto} ({u.cargo} · {u.departamentoNome || u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Sub-Acção a Testar:
              </label>
              <select
                value={simSubAction}
                onChange={(e) => setSimSubAction(e.target.value as RbacSubActionKey)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] bg-white font-medium"
              >
                {SUB_ACTION_DEFINITIONS.map((sa) => (
                  <option key={sa.key} value={sa.key}>
                    [{sa.categoria}] {sa.nome} ({sa.key})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resultado do Teste no Simulador */}
          {simSelectedUser && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                simResolution.allowed
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/70 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      simResolution.allowed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {simResolution.allowed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Decisão do Motor RBAC:
                      </span>
                      <span
                        className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded ${
                          simResolution.allowed
                            ? 'bg-emerald-200 text-emerald-950'
                            : 'bg-rose-200 text-rose-950'
                        }`}
                      >
                        {simResolution.allowed ? 'Autorizado (Permitido)' : 'Acesso Negado (Bloqueado)'}
                      </span>
                    </div>

                    <p className="text-xs font-medium mt-0.5">
                      {simResolution.reason}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs shrink-0 bg-white/70 px-3 py-1.5 rounded-lg border border-black/5">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">
                    Origem da Regra:
                  </span>
                  <span className="font-mono font-semibold text-gray-900">
                    {simResolution.source}
                  </span>
                </div>
              </div>

              {/* Rastreabilidade e Auditoria */}
              <div className="mt-3 pt-3 border-t border-black/5 text-[11px] flex flex-wrap items-center justify-between gap-2 text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Perfil Testado:</span>
                  <span>{simSelectedUser.nomeCompleto}</span>
                  <span className="text-gray-400">·</span>
                  <span>{simSelectedUser.cargo}</span>
                  <span className="text-gray-400">·</span>
                  <span className="font-mono text-[10px]">{simSelectedUser.email}</span>
                </div>

                {simSelectedSubActionDef && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">Nível de Risco:</span>
                    {renderRiskBadge(simSelectedSubActionDef.nivelRisco)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modal para Clonar Regras */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#012041] flex items-center gap-2">
                <Copy className="w-4 h-4 text-[#015FC4]" />
                Clonar Regras de Outro Perfil
              </h3>
              <button
                onClick={() => setIsCloneModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Copiar todas as permissões de sub-acções de uma entidade de origem directamente para{' '}
              <strong className="text-[#012041]">{currentPolicy.alvoNome}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Entidade de Origem (Modelo):
              </label>
              <select
                value={cloneSourceId}
                onChange={(e) => setCloneSourceId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] bg-white font-medium"
              >
                <option value="">-- Seleccione a Origem --</option>
                {targetType === 'departamento'
                  ? departamentos
                      .filter((d) => d.id !== currentPolicy.alvoId)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nome} ({d.sigla})
                        </option>
                      ))
                  : [
                      { role: 'school_admin' as AppUserRole, label: 'Director Geral' },
                      { role: 'coordenacao' as AppUserRole, label: 'Coordenação Pedagógica' },
                      { role: 'professor' as AppUserRole, label: 'Professor Titular' },
                      { role: 'financeiro' as AppUserRole, label: 'Tesouraria & Finanças' },
                      { role: 'secretaria' as AppUserRole, label: 'Secretaria Geral' },
                      { role: 'rh' as AppUserRole, label: 'Recursos Humanos' },
                      { role: 'crm' as AppUserRole, label: 'Admissões & CRM' },
                    ]
                      .filter((r) => r.role !== currentPolicy.alvoId)
                      .map((r) => (
                        <option key={r.role} value={r.role}>
                          {r.label}
                        </option>
                      ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCloneModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecutarClonagem}
                disabled={!cloneSourceId}
              >
                Confirmar & Aplicar Regras
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
