import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Edit2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  Layers,
  Users,
  Check,
  X,
  Lock,
  FileText,
  DollarSign,
  TrendingUp,
  History,
  Sliders,
  HelpCircle,
  Award,
  Zap,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import {
  SaaSPlan,
  SaaSSubscription,
  SaaSCommercialConfig,
  SubscriptionState,
  BillingPeriod,
  SystemModuleKey,
  SubscriptionHistoryEvent,
} from '../../types/saasCommercial';
import { School, ViewMode } from '../../types';

interface SaasCommercialViewProps {
  plans: SaaSPlan[];
  subscriptions: SaaSSubscription[];
  schools: School[];
  commercialConfig: SaaSCommercialConfig;
  onUpdatePlan: (updatedPlan: SaaSPlan) => void;
  onCreatePlan: (newPlan: SaaSPlan) => void;
  onUpdateSubscription: (updatedSub: SaaSSubscription) => void;
  onUpdateCommercialConfig: (newConfig: SaaSCommercialConfig) => void;
  onNavigate: (view: ViewMode) => void;
  onNotify?: (message: { type: 'success' | 'error' | 'info'; title?: string; message: string }) => void;
}

const AVAILABLE_MODULES: { key: SystemModuleKey; label: string; description: string }[] = [
  { key: 'academic-structure', label: 'Estrutura Académica', description: 'Anos lectivos, turmas, salas e docentes' },
  { key: 'pedagogical', label: 'Gestão Pedagógica', description: 'Pautas, notas trimestrais e boletins do MED' },
  { key: 'attendance', label: 'Assiduidade & Presenças', description: 'Controle biométrico/manual de presenças e faltas' },
  { key: 'students', label: 'Alunos & Matrículas', description: 'Processos de admissão, BI e cadastro discente' },
  { key: 'financial', label: 'Propinas & Finanças', description: 'Multicaixa, recibos oficiais e contas correntes' },
  { key: 'crm', label: 'CRM & Admissões', description: 'Funil de captação de novos alunos e campanhas' },
  { key: 'guardian-portal', label: 'Portal do Encarregado', description: 'Acesso web para pais e encarregados' },
  { key: 'edugest-ai', label: 'EduGest AI Copilot', description: 'Assistentes de Direcção, Financeiro e Académico' },
  { key: 'relatorios_avancados', label: 'Relatórios Executivos PDF', description: 'Exportação em alta definição de métricas' },
  { key: 'api_multicaixa', label: 'API GPO Multicaixa', description: 'Conciliação automática via EMIS/Bancos' },
  { key: 'auditoria_avancada', label: 'Auditoria & Logs SaaS', description: 'Rastreio forense de operações e segurança' },
];

export const SaasCommercialView: React.FC<SaasCommercialViewProps> = ({
  plans,
  subscriptions,
  schools,
  commercialConfig,
  onUpdatePlan,
  onCreatePlan,
  onUpdateSubscription,
  onUpdateCommercialConfig,
  onNavigate,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'subscricoes' | 'planos' | 'regras' | 'historico'>('subscricoes');

  // Filtros de Subscrições
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<'todos' | SubscriptionState>('todos');
  const [planFilter, setPlanFilter] = useState<string>('todos');

  // Modais de Subscrições
  const [selectedSubForHistory, setSelectedSubForHistory] = useState<SaaSSubscription | null>(null);
  const [selectedSubForPlanChange, setSelectedSubForPlanChange] = useState<SaaSSubscription | null>(null);
  const [selectedSubForStateChange, setSelectedSubForStateChange] = useState<SaaSSubscription | null>(null);
  const [selectedSubForTrialExtension, setSelectedSubForTrialExtension] = useState<SaaSSubscription | null>(null);
  const [trialExtensionDays, setTrialExtensionDays] = useState(14);

  // Modais de Planos
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlanResourceInput, setNewPlanResourceInput] = useState('');

  // Formulário de Plano (criação / edição)
  const [planForm, setPlanForm] = useState<{
    id?: string;
    nome: string;
    codigo: string;
    precoKz: number;
    periodicidade: BillingPeriod;
    limiteAlunos: number;
    limiteUtilizadores: number;
    isAlunosUnlimited: boolean;
    isUsersUnlimited: boolean;
    modulosDisponiveis: SystemModuleKey[];
    recursos: string[];
    descricao: string;
    badge: string;
  }>({
    nome: '',
    codigo: '',
    precoKz: 50000,
    periodicidade: 'mensal',
    limiteAlunos: 500,
    limiteUtilizadores: 10,
    isAlunosUnlimited: false,
    isUsersUnlimited: false,
    modulosDisponiveis: ['academic-structure', 'pedagogical', 'students', 'financial'],
    recursos: ['Gestão de turmas e salas', 'Emissão de boletins do MED', 'Lançamento de propinas'],
    descricao: '',
    badge: '',
  });

  // Métricas do SaaS Commercial
  const metrics = useMemo(() => {
    const totalSubs = subscriptions.length;
    const activeSubs = subscriptions.filter((s) => s.estado === 'active').length;
    const trialSubs = subscriptions.filter((s) => s.estado === 'trial').length;
    const pastDueSubs = subscriptions.filter((s) => s.estado === 'past_due').length;
    const suspendedSubs = subscriptions.filter((s) => s.estado === 'suspended').length;
    const cancelledSubs = subscriptions.filter((s) => s.estado === 'cancelled').length;

    const mrrLiquidadoKz = subscriptions
      .filter((s) => s.estado === 'active')
      .reduce((acc, curr) => acc + curr.valorKz, 0);

    const mrrEmRiscoKz = subscriptions
      .filter((s) => s.estado === 'past_due')
      .reduce((acc, curr) => acc + curr.valorKz, 0);

    return {
      totalSubs,
      activeSubs,
      trialSubs,
      pastDueSubs,
      suspendedSubs,
      cancelledSubs,
      mrrLiquidadoKz,
      mrrEmRiscoKz,
    };
  }, [subscriptions]);

  // Lista de subscrições filtradas
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchSearch =
        sub.escolaNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.planoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.escolaNif && sub.escolaNif.includes(searchTerm));

      const matchState = stateFilter === 'todos' || sub.estado === stateFilter;
      const matchPlan = planFilter === 'todos' || sub.planoId === planFilter;

      return matchSearch && matchState && matchPlan;
    });
  }, [subscriptions, searchTerm, stateFilter, planFilter]);

  // Helper de badges para o Estado da Subscrição
  const getSubStateBadge = (state: SubscriptionState) => {
    switch (state) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Active
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Trial
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Past Due
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <Lock className="w-3.5 h-3.5 text-red-600" />
            Suspended
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            Cancelled
          </span>
        );
    }
  };

  // Helper para nível de bloqueio gradual
  const getBloqueioNivelLabel = (nivel: SaaSSubscription['bloqueioNivel']) => {
    switch (nivel) {
      case 'nenhum':
        return <span className="text-xs text-emerald-600 font-medium">Acesso Pleno</span>;
      case 'aviso':
        return <span className="text-xs text-amber-600 font-medium">Aviso de Tolerância</span>;
      case 'restrito_nivel_1':
        return <span className="text-xs text-orange-600 font-medium">Restrição Nível 1</span>;
      case 'bloqueio_total':
        return <span className="text-xs text-red-600 font-semibold">Suspenso Temporário</span>;
    }
  };

  // Abrir modal de criação de plano
  const handleOpenCreatePlan = () => {
    setPlanForm({
      nome: '',
      codigo: '',
      precoKz: 60000,
      periodicidade: 'mensal',
      limiteAlunos: 300,
      limiteUtilizadores: 10,
      isAlunosUnlimited: false,
      isUsersUnlimited: false,
      modulosDisponiveis: ['academic-structure', 'pedagogical', 'students', 'financial', 'crm'],
      recursos: [
        'Acesso aos módulos fundamentais do colégio',
        'Emissão de recibos e pautas oficiais',
        'Suporte técnico via WhatsApp',
      ],
      descricao: '',
      badge: '',
    });
    setEditingPlan(null);
    setIsCreatingPlan(true);
  };

  // Abrir modal de edição de plano
  const handleOpenEditPlan = (plan: SaaSPlan) => {
    setPlanForm({
      id: plan.id,
      nome: plan.nome,
      codigo: plan.codigo,
      precoKz: plan.precoKz,
      periodicidade: plan.periodicidade,
      limiteAlunos: plan.limiteAlunos === -1 ? 1000 : plan.limiteAlunos,
      limiteUtilizadores: plan.limiteUtilizadores === -1 ? 50 : plan.limiteUtilizadores,
      isAlunosUnlimited: plan.limiteAlunos === -1,
      isUsersUnlimited: plan.limiteUtilizadores === -1,
      modulosDisponiveis: [...plan.modulosDisponiveis],
      recursos: [...plan.recursos],
      descricao: plan.descricao || '',
      badge: plan.badge || '',
    });
    setEditingPlan(plan);
    setIsCreatingPlan(true);
  };

  // Salvar plano criado ou editado
  const handleSavePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.nome) return;

    const finalPlan: SaaSPlan = {
      id: editingPlan ? editingPlan.id : `plan-${Date.now()}`,
      nome: planForm.nome,
      codigo: planForm.codigo || planForm.nome.toUpperCase().replace(/\s+/g, '-'),
      precoKz: Number(planForm.precoKz),
      periodicidade: planForm.periodicidade,
      limiteAlunos: planForm.isAlunosUnlimited ? -1 : Number(planForm.limiteAlunos),
      limiteUtilizadores: planForm.isUsersUnlimited ? -1 : Number(planForm.limiteUtilizadores),
      modulosDisponiveis: planForm.modulosDisponiveis,
      recursos: planForm.recursos,
      ativo: true,
      descricao: planForm.descricao,
      badge: planForm.badge,
    };

    if (editingPlan) {
      onUpdatePlan(finalPlan);
      onNotify?.({
        type: 'success',
        title: 'Plano Atualizado',
        message: `O plano "${finalPlan.nome}" foi atualizado com sucesso.`,
      });
    } else {
      onCreatePlan(finalPlan);
      onNotify?.({
        type: 'success',
        title: 'Novo Plano Criado',
        message: `O plano "${finalPlan.nome}" foi adicionado ao catálogo comercial.`,
      });
    }

    setIsCreatingPlan(false);
  };

  // Toggle módulo na seleção do formulário do plano
  const handleToggleModule = (moduleKey: SystemModuleKey) => {
    if (planForm.modulosDisponiveis.includes(moduleKey)) {
      setPlanForm({
        ...planForm,
        modulosDisponiveis: planForm.modulosDisponiveis.filter((k) => k !== moduleKey),
      });
    } else {
      setPlanForm({
        ...planForm,
        modulosDisponiveis: [...planForm.modulosDisponiveis, moduleKey],
      });
    }
  };

  // Adicionar recurso à lista
  const handleAddResource = () => {
    if (!newPlanResourceInput.trim()) return;
    setPlanForm({
      ...planForm,
      recursos: [...planForm.recursos, newPlanResourceInput.trim()],
    });
    setNewPlanResourceInput('');
  };

  // Remover recurso
  const handleRemoveResource = (index: number) => {
    setPlanForm({
      ...planForm,
      recursos: planForm.recursos.filter((_, i) => i !== index),
    });
  };

  // Mudar estado da subscrição com log de histórico
  const handleExecuteStateChange = (
    newState: SubscriptionState,
    motivo: string = ''
  ) => {
    if (!selectedSubForStateChange) return;

    let bloqueio: SaaSSubscription['bloqueioNivel'] = 'nenhum';
    let tipoEvento: SubscriptionHistoryEvent['tipo'] = 'mudanca_plano';

    if (newState === 'active') {
      bloqueio = 'nenhum';
      tipoEvento = selectedSubForStateChange.estado === 'suspended' ? 'reactivacao' : 'pagamento_confirmado';
    } else if (newState === 'past_due') {
      bloqueio = 'aviso';
      tipoEvento = 'past_due';
    } else if (newState === 'suspended') {
      bloqueio = 'bloqueio_total';
      tipoEvento = 'suspensao';
    } else if (newState === 'cancelled') {
      bloqueio = 'bloqueio_total';
      tipoEvento = 'cancelamento';
    } else if (newState === 'trial') {
      bloqueio = 'nenhum';
      tipoEvento = 'trial_iniciado';
    }

    const newHistoryEvent: SubscriptionHistoryEvent = {
      id: `ev-${Date.now()}`,
      data: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tipo: tipoEvento,
      descricao:
        motivo ||
        (newState === 'active'
          ? 'Subscrição activada / regularizada. Acesso pleno restabelecido sem perda de dados.'
          : newState === 'suspended'
          ? 'Suspensão temporária aplicada. Dados da escola 100% preservados e salvaguardados.'
          : newState === 'past_due'
          ? 'Subscrição em atraso (Past Due) com período de carência de 7 dias.'
          : `Estado alterado para ${newState}.`),
      autor: 'Super Admin',
    };

    const updatedSub: SaaSSubscription = {
      ...selectedSubForStateChange,
      estado: newState,
      bloqueioNivel: bloqueio,
      historico: [newHistoryEvent, ...selectedSubForStateChange.historico],
    };

    onUpdateSubscription(updatedSub);
    setSelectedSubForStateChange(null);

    onNotify?.({
      type: 'success',
      title: 'Estado da Subscrição Atualizado',
      message: `A subscrição de ${updatedSub.escolaNome} foi alterada para "${newState}".`,
    });
  };

  // Mudar Plano da Subscrição (Upgrade / Downgrade)
  const handleExecutePlanChange = (targetPlanId: string) => {
    if (!selectedSubForPlanChange) return;
    const targetPlan = plans.find((p) => p.id === targetPlanId);
    if (!targetPlan) return;

    const newHistoryEvent: SubscriptionHistoryEvent = {
      id: `ev-${Date.now()}`,
      data: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tipo: 'mudanca_plano',
      descricao: `Plano alterado de ${selectedSubForPlanChange.planoNome} para ${targetPlan.nome}. Novo valor mensal: ${targetPlan.precoKz.toLocaleString('pt-AO')} Kz.`,
      valorKz: targetPlan.precoKz,
      autor: 'Super Admin',
    };

    const updatedSub: SaaSSubscription = {
      ...selectedSubForPlanChange,
      planoId: targetPlan.id,
      planoNome: targetPlan.nome,
      valorKz: targetPlan.precoKz,
      periodicidade: targetPlan.periodicidade,
      historico: [newHistoryEvent, ...selectedSubForPlanChange.historico],
    };

    onUpdateSubscription(updatedSub);
    setSelectedSubForPlanChange(null);

    onNotify?.({
      type: 'success',
      title: 'Plano Alterado com Sucesso',
      message: `${updatedSub.escolaNome} agora utiliza o plano "${targetPlan.nome}".`,
    });
  };

  // Estender período de Trial
  const handleExecuteTrialExtension = () => {
    if (!selectedSubForTrialExtension) return;

    const currentFim = new Date(selectedSubForTrialExtension.dataFimTrial || new Date());
    currentFim.setDate(currentFim.getDate() + trialExtensionDays);
    const newFimDateStr = currentFim.toISOString().split('T')[0];

    const newHistoryEvent: SubscriptionHistoryEvent = {
      id: `ev-${Date.now()}`,
      data: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tipo: 'trial_estendido',
      descricao: `Período experimental estendido em +${trialExtensionDays} dias até ${newFimDateStr}.`,
      autor: 'Super Admin',
    };

    const updatedSub: SaaSSubscription = {
      ...selectedSubForTrialExtension,
      dataFimTrial: newFimDateStr,
      dataRenovacao: newFimDateStr,
      historico: [newHistoryEvent, ...selectedSubForTrialExtension.historico],
    };

    onUpdateSubscription(updatedSub);
    setSelectedSubForTrialExtension(null);

    onNotify?.({
      type: 'success',
      title: 'Trial Estendido',
      message: `Período experimental de ${updatedSub.escolaNome} estendido até ${newFimDateStr}.`,
    });
  };

  // Reactivar Subscrição Instantânea
  const handleInstantReactivation = (sub: SaaSSubscription) => {
    const newHistoryEvent: SubscriptionHistoryEvent = {
      id: `ev-${Date.now()}`,
      data: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tipo: 'reactivacao',
      descricao:
        'Reativação instantânea executada com sucesso. Acesso integral desbloqueado e dados preservados.',
      valorKz: sub.valorKz,
      estado: 'pago',
      autor: 'Super Admin',
    };

    const nextRenovacao = new Date();
    nextRenovacao.setDate(nextRenovacao.getDate() + 30);

    const updatedSub: SaaSSubscription = {
      ...sub,
      estado: 'active',
      bloqueioNivel: 'nenhum',
      dataRenovacao: nextRenovacao.toISOString().split('T')[0],
      historico: [newHistoryEvent, ...sub.historico],
    };

    onUpdateSubscription(updatedSub);

    onNotify?.({
      type: 'success',
      title: 'Subscrição Reactivada',
      message: `A subscrição de ${sub.escolaNome} foi reactivada e o acesso restaurado com sucesso!`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#012041] via-[#01356A] to-[#015FC4] rounded-xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-2 text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Gestão Comercial do SaaS
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Planos, Subscrições & Bloqueio Gradual
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-2xl">
              Configure os planos <strong>Start</strong>, <strong>Professional</strong> e <strong>Enterprise</strong>, controle o ciclo de vida das subscrições e garanta a preservação incondicional dos dados dos alunos.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
              onClick={() => setActiveTab('regras')}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-300" />}
            >
              Regras & Bloqueio Gradual
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
              onClick={handleOpenCreatePlan}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Novo Plano Comercial
            </Button>
          </div>
        </div>

        {/* Global Key KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-[11px] text-blue-200 uppercase font-medium">Subscrições</div>
            <div className="text-xl font-bold text-white mt-0.5">{metrics.totalSubs}</div>
            <div className="text-[10px] text-white/70">Tenants cadastrados</div>
          </div>
          <div className="bg-emerald-500/20 backdrop-blur-sm rounded-lg p-3 border border-emerald-500/30">
            <div className="text-[11px] text-emerald-200 uppercase font-medium">Activas</div>
            <div className="text-xl font-bold text-emerald-300 mt-0.5">{metrics.activeSubs}</div>
            <div className="text-[10px] text-emerald-100/70">Acesso pleno e em dia</div>
          </div>
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
            <div className="text-[11px] text-blue-200 uppercase font-medium">Em Trial</div>
            <div className="text-xl font-bold text-blue-300 mt-0.5">{metrics.trialSubs}</div>
            <div className="text-[10px] text-blue-100/70">Testes configurados</div>
          </div>
          <div className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30">
            <div className="text-[11px] text-amber-200 uppercase font-medium">Past Due</div>
            <div className="text-xl font-bold text-amber-300 mt-0.5">{metrics.pastDueSubs}</div>
            <div className="text-[10px] text-amber-100/70">Em tolerância</div>
          </div>
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 border border-red-500/30">
            <div className="text-[11px] text-red-200 uppercase font-medium">Suspensas</div>
            <div className="text-xl font-bold text-red-300 mt-0.5">{metrics.suspendedSubs}</div>
            <div className="text-[10px] text-red-100/70">Dados 100% seguros</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-[11px] text-blue-200 uppercase font-medium">MRR Activo</div>
            <div className="text-base font-bold text-white mt-1 truncate">
              {metrics.mrrLiquidadoKz.toLocaleString('pt-AO')} Kz
            </div>
            <div className="text-[10px] text-white/70">Receita mensal activa</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#E2E8F0] flex gap-2">
        <button
          onClick={() => setActiveTab('subscricoes')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'subscricoes'
              ? 'border-[#015FC4] text-[#015FC4]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Subscrições das Escolas ({subscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('planos')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'planos'
              ? 'border-[#015FC4] text-[#015FC4]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Planos & Preçário ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('regras')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'regras'
              ? 'border-[#015FC4] text-[#015FC4]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Trial & Bloqueio Gradual
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'historico'
              ? 'border-[#015FC4] text-[#015FC4]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Histórico Global de Transações
        </button>
      </div>

      {/* TAB 1: SUBSCRICOES */}
      {activeTab === 'subscricoes' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por escola, NIF ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value as any)}
                className="text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#015FC4]"
              >
                <option value="todos">Todos os Estados</option>
                <option value="active">Active (Activa)</option>
                <option value="trial">Trial (Experimental)</option>
                <option value="past_due">Past Due (Em Atraso)</option>
                <option value="suspended">Suspended (Suspensa)</option>
                <option value="cancelled">Cancelled (Cancelada)</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#015FC4]"
              >
                <option value="todos">Todos os Planos</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela de Subscrições */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Escola / Instituição</th>
                    <th className="py-3.5 px-4 font-semibold">Plano</th>
                    <th className="py-3.5 px-4 font-semibold">Estado</th>
                    <th className="py-3.5 px-4 font-semibold">Fase do Bloqueio</th>
                    <th className="py-3.5 px-4 font-semibold">Data Inicial</th>
                    <th className="py-3.5 px-4 font-semibold">Renovação</th>
                    <th className="py-3.5 px-4 font-semibold">Valor Mensal</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{sub.escolaNome}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          {sub.escolaNif && <span>NIF: {sub.escolaNif}</span>}
                          {sub.escolaProvincia && <span>• {sub.escolaProvincia}</span>}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-[#015FC4]">{sub.planoNome}</span>
                        <div className="text-[11px] text-slate-500 capitalize">{sub.periodicidade}</div>
                      </td>

                      <td className="py-3 px-4">{getSubStateBadge(sub.estado)}</td>

                      <td className="py-3 px-4">{getBloqueioNivelLabel(sub.bloqueioNivel)}</td>

                      <td className="py-3 px-4 text-xs text-slate-600 font-mono">{sub.dataInicial}</td>

                      <td className="py-3 px-4">
                        <div className="text-xs font-mono font-medium text-slate-800">{sub.dataRenovacao}</div>
                        {sub.estado === 'trial' && sub.dataFimTrial && (
                          <div className="text-[10px] text-blue-600">Fim Trial: {sub.dataFimTrial}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {sub.valorKz.toLocaleString('pt-AO')} Kz
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Botão de Reactivação Rápida se suspenso ou past_due */}
                          {(sub.estado === 'suspended' || sub.estado === 'past_due' || sub.estado === 'cancelled') && (
                            <Button
                              size="sm"
                              variant="primary"
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5"
                              onClick={() => handleInstantReactivation(sub)}
                              icon={<RotateCcw className="w-3.5 h-3.5" />}
                              title="Reactivar subscrição e restaurar acesso integral"
                            >
                              Reactivar
                            </Button>
                          )}

                          {sub.estado === 'trial' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs h-7 px-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                              onClick={() => setSelectedSubForTrialExtension(sub)}
                              icon={<Clock className="w-3.5 h-3.5" />}
                              title="Estender período de Trial"
                            >
                              + Dias
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs h-7 px-2"
                            onClick={() => setSelectedSubForPlanChange(sub)}
                            icon={<Layers className="w-3.5 h-3.5" />}
                            title="Alterar Plano (Upgrade / Downgrade)"
                          >
                            Plano
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs h-7 px-2"
                            onClick={() => setSelectedSubForStateChange(sub)}
                            icon={<Sliders className="w-3.5 h-3.5" />}
                            title="Gerir Estado (Trial, Active, Past Due, Suspended, Cancelled)"
                          >
                            Estado
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs h-7 px-2"
                            onClick={() => setSelectedSubForHistory(sub)}
                            icon={<History className="w-3.5 h-3.5" />}
                            title="Ver Histórico Auditado"
                          >
                            Histórico
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Nenhuma subscrição encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANOS & PRECÁRIO */}
      {activeTab === 'planos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Catálogo de Planos Comerciais</h2>
              <p className="text-xs text-slate-500">
                Configure os limites de alunos, utilizadores, periodicidade e módulos de cada nível de oferta do SaaS EduGest.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreatePlan}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Criar Novo Plano
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl border flex flex-col justify-between shadow-sm relative overflow-hidden transition-all hover:shadow-md ${
                  plan.destaque
                    ? 'border-[#015FC4] ring-2 ring-[#015FC4]/20'
                    : 'border-[#E2E8F0]'
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute top-0 right-0 px-3 py-1 text-[11px] font-bold rounded-bl-lg uppercase tracking-wider ${
                      plan.destaque
                        ? 'bg-[#015FC4] text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="p-6">
                  <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    {plan.codigo}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{plan.nome}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.descricao}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {plan.precoKz.toLocaleString('pt-AO')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Kz / {plan.periodicidade}</span>
                  </div>

                  {/* Capacidade e Limites */}
                  <div className="mt-5 space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> Limite de Alunos:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {plan.limiteAlunos === -1 ? 'Ilimitado' : `${plan.limiteAlunos} Alunos`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Limite de Utilizadores:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {plan.limiteUtilizadores === -1 ? 'Ilimitado' : `${plan.limiteUtilizadores} Acessos`}
                      </span>
                    </div>
                  </div>

                  {/* Módulos Disponíveis */}
                  <div className="mt-5">
                    <div className="text-xs font-bold text-slate-700 mb-2">Módulos Activos no Plano:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.modulosDisponiveis.map((modKey) => {
                        const mObj = AVAILABLE_MODULES.find((m) => m.key === modKey);
                        return (
                          <span
                            key={modKey}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            {mObj ? mObj.label : modKey}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recursos Principais */}
                  <div className="mt-5">
                    <div className="text-xs font-bold text-slate-700 mb-2">Recursos & Benefícios:</div>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {plan.recursos.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {subscriptions.filter((s) => s.planoId === plan.id).length} escolas utilizam
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs"
                    onClick={() => handleOpenEditPlan(plan)}
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Editar Configuração
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRIAL & BLOQUEIO GRADUAL */}
      {activeTab === 'regras' && (
        <div className="space-y-6">
          {/* Card de Garantia de Não Exclusão de Dados */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-xl p-6 shadow-md border border-emerald-700">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl shrink-0">
                <ShieldCheck className="w-8 h-8 text-emerald-300" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Princípio Fundamental do SaaS EduGest
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Não Eliminar Dados de Uma Escola por Falta de Pagamento
                </h3>
                <p className="text-emerald-100/90 text-sm leading-relaxed max-w-4xl">
                  Em conformidade com a regulamentação do Ministério da Educação (MED) de Angola e os mais elevados padrões de ética tecnológica, <strong>nenhuma instituição de ensino terá seus cadastros de alunos, pautas de avaliações, histórico escolar ou recibos excluídos da plataforma</strong>, mesmo em caso de atraso prolongado ou cancelamento da subscrição.
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dados criptografados e preservados
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Reativação instantânea garantida
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Exportação de pautas oficiais assegurada
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuração de Trial e Régua de Bloqueio Gradual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bloco 1: Trial Configurável */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-[#012041]">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold">Configuração do Período Experimental (Trial)</h3>
              </div>
              <p className="text-xs text-slate-500">
                Defina o tempo de degustação concedido automaticamente a novas escolas cadastradas na plataforma.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Duração Padrão do Trial:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={7}
                      max={60}
                      value={commercialConfig.diasTrialPadrao}
                      onChange={(e) =>
                        onUpdateCommercialConfig({
                          ...commercialConfig,
                          diasTrialPadrao: Number(e.target.value),
                        })
                      }
                      className="w-24 px-3 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]"
                    />
                    <span className="text-xs text-slate-600">dias de acesso completo sem custos</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">
                    Permitir extensão de trial pelo Super Admin:
                  </span>
                  <input
                    type="checkbox"
                    checked={commercialConfig.permitirExtensaoTrial}
                    onChange={(e) =>
                      onUpdateCommercialConfig({
                        ...commercialConfig,
                        permitirExtensaoTrial: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#015FC4] rounded"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">
                    Permitir auto-reactivação instantânea via Multicaixa:
                  </span>
                  <input
                    type="checkbox"
                    checked={commercialConfig.permitirAutoReactivacao}
                    onChange={(e) =>
                      onUpdateCommercialConfig({
                        ...commercialConfig,
                        permitirAutoReactivacao: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#015FC4] rounded"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Parâmetros da Tolerância de Bloqueio */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-[#012041]">
                <Sliders className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold">Régua de Tolerância & Prazos</h3>
              </div>
              <p className="text-xs text-slate-500">
                Prazos em dias corridos após o vencimento da fatura mensal para aplicação gradual das travas.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Dias de Past Due (Aviso amigável sem bloqueio):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={commercialConfig.diasToleranciaPastDue}
                      onChange={(e) =>
                        onUpdateCommercialConfig({
                          ...commercialConfig,
                          diasToleranciaPastDue: Number(e.target.value),
                        })
                      }
                      className="w-16 px-2 py-1 border border-[#E2E8F0] rounded text-center"
                    />
                    <span className="text-slate-500">dias</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Dias para Restrição Nível 1 (Trava de novas matrículas):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={5}
                      max={30}
                      value={commercialConfig.diasParaBloqueioNivel1}
                      onChange={(e) =>
                        onUpdateCommercialConfig({
                          ...commercialConfig,
                          diasParaBloqueioNivel1: Number(e.target.value),
                        })
                      }
                      className="w-16 px-2 py-1 border border-[#E2E8F0] rounded text-center"
                    />
                    <span className="text-slate-500">dias</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Dias para Suspensão Total (Tela de regularização):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={10}
                      max={60}
                      value={commercialConfig.diasParaSuspensaoTotal}
                      onChange={(e) =>
                        onUpdateCommercialConfig({
                          ...commercialConfig,
                          diasParaSuspensaoTotal: Number(e.target.value),
                        })
                      }
                      className="w-16 px-2 py-1 border border-[#E2E8F0] rounded text-center"
                    />
                    <span className="text-slate-500">dias</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linha do Tempo Visual do Bloqueio Gradual */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Etapas Visuais do Bloqueio Gradual (Lifecycle)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Como a escola vivencia cada etapa do processo de cobrança amigável até a regularização.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Etapa 1 */}
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 space-y-2 relative">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <div className="font-bold text-sm text-emerald-950">Active / Em Dia</div>
                <div className="text-xs text-slate-500">Dia 0 da Renovação</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Acesso 100% livre a todos os módulos contratados no plano. Todos os utilizadores operam sem restrições.
                </p>
              </div>

              {/* Etapa 2 */}
              <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 space-y-2 relative">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <div className="font-bold text-sm text-amber-950">Past Due (Tolerância)</div>
                <div className="text-xs text-slate-500">Dias 1 a 7 de Atraso</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aviso suave no topo da tela informando o vencimento. <strong>Sem qualquer trava operacional</strong> para não prejudicar as aulas.
                </p>
              </div>

              {/* Etapa 3 */}
              <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-4 space-y-2 relative">
                <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <div className="font-bold text-sm text-orange-950">Restrição Nível 1</div>
                <div className="text-xs text-slate-500">Dias 8 a 14 de Atraso</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Novas matrículas congeladas temporariamente. <strong>Recebimento de propinas permitido</strong> para que a instituição arrecade receita.
                </p>
              </div>

              {/* Etapa 4 */}
              <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 space-y-2 relative">
                <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <div className="font-bold text-sm text-red-950">Suspensão Temporária</div>
                <div className="text-xs text-slate-500">A partir do Dia 15</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tela de bloqueio com garantia expressa de dados intactos e botão direto para <strong>reactivação imediata</strong> via Multicaixa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTÓRICO GLOBAL */}
      {activeTab === 'historico' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Histórico Consolidado de Transações & Eventos</h2>
              <p className="text-xs text-slate-500">
                Auditoria de pagamentos, renovações, suspensões e reactivações de todas as instituições de ensino.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Data / Hora</th>
                    <th className="py-3 px-4 font-semibold">Instituição</th>
                    <th className="py-3 px-4 font-semibold">Tipo de Evento</th>
                    <th className="py-3 px-4 font-semibold">Descrição Auditada</th>
                    <th className="py-3 px-4 font-semibold">Valor (Kz)</th>
                    <th className="py-3 px-4 font-semibold">Autor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {subscriptions
                    .flatMap((s) => s.historico.map((h) => ({ ...h, escolaNome: s.escolaNome })))
                    .sort((a, b) => b.data.localeCompare(a.data))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 text-xs">
                        <td className="py-3 px-4 font-mono text-slate-500">{item.data}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.escolaNome}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              item.tipo === 'reactivacao' || item.tipo === 'pagamento_confirmado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.tipo === 'suspensao'
                                ? 'bg-red-100 text-red-800'
                                : item.tipo === 'past_due'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.tipo.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{item.descricao}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {item.valorKz ? `${item.valorKz.toLocaleString('pt-AO')} Kz` : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{item.autor || 'Sistema'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO DETALHADO DA ESCOLA */}
      {selectedSubForHistory && (
        <Modal
          isOpen={!!selectedSubForHistory}
          onClose={() => setSelectedSubForHistory(null)}
          title={`Histórico da Subscrição — ${selectedSubForHistory.escolaNome}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500">Plano Actual:</span>{' '}
                <span className="font-semibold text-[#015FC4]">{selectedSubForHistory.planoNome}</span>
              </div>
              <div>
                <span className="text-slate-500">Estado:</span>{' '}
                {getSubStateBadge(selectedSubForHistory.estado)}
              </div>
              <div>
                <span className="text-slate-500">Valor Mensal:</span>{' '}
                <span className="font-bold text-slate-900">
                  {selectedSubForHistory.valorKz.toLocaleString('pt-AO')} Kz
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Linha de Eventos</h4>
              {selectedSubForHistory.historico.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex items-start gap-3 text-xs"
                >
                  <div
                    className={`p-1.5 rounded-full shrink-0 mt-0.5 ${
                      ev.tipo === 'reactivacao' || ev.tipo === 'pagamento_confirmado'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ev.tipo === 'suspensao'
                        ? 'bg-red-100 text-red-700'
                        : ev.tipo === 'past_due'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 capitalize">
                        {ev.tipo.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{ev.data}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{ev.descricao}</p>
                    {ev.valorKz && (
                      <div className="text-[11px] font-semibold text-slate-800 mt-1">
                        Montante: {ev.valorKz.toLocaleString('pt-AO')} Kz
                      </div>
                    )}
                    {ev.autor && (
                      <div className="text-[10px] text-slate-400 mt-0.5">Autor: {ev.autor}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setSelectedSubForHistory(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: ALTERAR PLANO (UPGRADE / DOWNGRADE) */}
      {selectedSubForPlanChange && (
        <Modal
          isOpen={!!selectedSubForPlanChange}
          onClose={() => setSelectedSubForPlanChange(null)}
          title={`Alterar Plano de ${selectedSubForPlanChange.escolaNome}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            <p className="text-xs text-slate-600">
              Selecione o novo plano comercial para a instituição. O novo valor passará a vigorar no próximo ciclo de faturação.
            </p>

            <div className="space-y-2">
              {plans.map((p) => {
                const isSelected = p.id === selectedSubForPlanChange.planoId;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleExecutePlanChange(p.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#015FC4] bg-blue-50/50 ring-1 ring-[#015FC4]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {p.nome}
                        {isSelected && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Plano Atual
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {p.limiteAlunos === -1 ? 'Alunos ilimitados' : `Até ${p.limiteAlunos} alunos`} • {p.limiteUtilizadores === -1 ? 'Utilizadores ilimitados' : `${p.limiteUtilizadores} utilizadores`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm">
                        {p.precoKz.toLocaleString('pt-AO')} Kz
                      </div>
                      <div className="text-[11px] text-slate-400">/ {p.periodicidade}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedSubForPlanChange(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: ALTERAR ESTADO (TRIAL, ACTIVE, PAST DUE, SUSPENDED, CANCELLED) */}
      {selectedSubForStateChange && (
        <Modal
          isOpen={!!selectedSubForStateChange}
          onClose={() => setSelectedSubForStateChange(null)}
          title={`Gerir Estado de Subscrição — ${selectedSubForStateChange.escolaNome}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            <p className="text-xs text-slate-600">
              Altere manualmente o estado da subscrição da instituição. Todas as alterações são registadas na auditoria e os dados continuam integralmente salvaguardados.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => handleExecuteStateChange('active', 'Reativado pelo Super Admin')}
                className="p-3 text-left rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active (Activa / Regularizada)
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Libera acesso irrestrito a todos os utilizadores.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() => handleExecuteStateChange('trial', 'Reiniciado em modo experimental')}
                className="p-3 text-left rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100/70 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> Trial (Período Experimental)
                  </div>
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    Coloca o tenant sob período de testes gratuito.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>

              <button
                onClick={() => handleExecuteStateChange('past_due', 'Colocado em tolerância Past Due')}
                className="p-3 text-left rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100/70 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Past Due (Em Atraso / Tolerância)
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Exibe alerta superior de cobrança mantendo operações activas.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600" />
              </button>

              <button
                onClick={() => handleExecuteStateChange('suspended', 'Suspensão manual aplicada')}
                className="p-3 text-left rounded-lg border border-red-200 bg-red-50 hover:bg-red-100/70 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-red-900 text-xs flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-red-600" /> Suspended (Suspensão Temporária)
                  </div>
                  <div className="text-[11px] text-red-700 mt-0.5">
                    Bloqueia acesso à tela com aviso de dados preservados e botão de reactivação.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-red-600" />
              </button>

              <button
                onClick={() => handleExecuteStateChange('cancelled', 'Cancelamento voluntário')}
                className="p-3 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-slate-500" /> Cancelled (Cancelada a Pedido)
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Subscrição cancelada com dados mantidos em arquivo seguro.
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedSubForStateChange(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: ESTENDER TRIAL */}
      {selectedSubForTrialExtension && (
        <Modal
          isOpen={!!selectedSubForTrialExtension}
          onClose={() => setSelectedSubForTrialExtension(null)}
          title={`Estender Período de Trial — ${selectedSubForTrialExtension.escolaNome}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-sm">
            <p className="text-xs text-slate-600">
              Conceda dias adicionais de avaliação gratuita para a instituição sem comprometer suas métricas.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Dias Adicionais a Acrescentar:
              </label>
              <select
                value={trialExtensionDays}
                onChange={(e) => setTrialExtensionDays(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg"
              >
                <option value={7}>+ 7 dias (1 semana)</option>
                <option value={14}>+ 14 dias (2 semanas)</option>
                <option value={30}>+ 30 dias (1 mês completo)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedSubForTrialExtension(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleExecuteTrialExtension}>
                Confirmar Prorrogação
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: NOVO PLANO OU EDITAR PLANO */}
      {isCreatingPlan && (
        <Modal
          isOpen={isCreatingPlan}
          onClose={() => setIsCreatingPlan(false)}
          title={editingPlan ? `Editar Plano — ${editingPlan.nome}` : 'Criar Novo Plano Comercial'}
          maxWidth="lg"
        >
          <form onSubmit={handleSavePlanSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nome do Plano *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Start, Professional, Enterprise"
                  value={planForm.nome}
                  onChange={(e) => setPlanForm({ ...planForm, nome: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Código Identificador
                </label>
                <input
                  type="text"
                  placeholder="Ex: START-AO, PRO-AO"
                  value={planForm.codigo}
                  onChange={(e) => setPlanForm({ ...planForm, codigo: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Preço em Kwanzas (Kz) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={planForm.precoKz}
                  onChange={(e) => setPlanForm({ ...planForm, precoKz: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Periodicidade de Cobrança *
                </label>
                <select
                  value={planForm.periodicidade}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, periodicidade: e.target.value as BillingPeriod })
                  }
                  className="w-full text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]"
                >
                  <option value="mensal">Mensal</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>

            {/* Limite de Alunos e Utilizadores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Limite de Alunos</label>
                  <label className="text-[11px] text-slate-600 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planForm.isAlunosUnlimited}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, isAlunosUnlimited: e.target.checked })
                      }
                      className="rounded text-[#015FC4]"
                    />
                    Ilimitado
                  </label>
                </div>
                <input
                  type="number"
                  disabled={planForm.isAlunosUnlimited}
                  value={planForm.isAlunosUnlimited ? '' : planForm.limiteAlunos}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, limiteAlunos: Number(e.target.value) })
                  }
                  placeholder="Ex: 500"
                  className="w-full text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg disabled:bg-slate-200 disabled:text-slate-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Limite de Utilizadores</label>
                  <label className="text-[11px] text-slate-600 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planForm.isUsersUnlimited}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, isUsersUnlimited: e.target.checked })
                      }
                      className="rounded text-[#015FC4]"
                    />
                    Ilimitado
                  </label>
                </div>
                <input
                  type="number"
                  disabled={planForm.isUsersUnlimited}
                  value={planForm.isUsersUnlimited ? '' : planForm.limiteUtilizadores}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, limiteUtilizadores: Number(e.target.value) })
                  }
                  placeholder="Ex: 15"
                  className="w-full text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg disabled:bg-slate-200 disabled:text-slate-500"
                />
              </div>
            </div>

            {/* Módulos Disponíveis */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Módulos de Sistema Incluídos no Plano:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                {AVAILABLE_MODULES.map((mod) => {
                  const isChecked = planForm.modulosDisponiveis.includes(mod.key);
                  return (
                    <label
                      key={mod.key}
                      className={`flex items-start gap-2 p-2 rounded cursor-pointer border text-xs transition-colors ${
                        isChecked
                          ? 'border-blue-300 bg-blue-50/70 text-blue-900 font-medium'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleModule(mod.key)}
                        className="mt-0.5 rounded text-[#015FC4]"
                      />
                      <div>
                        <div>{mod.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{mod.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Recursos / Features list */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Recursos & Destaques de Venda:
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Adicionar novo recurso (ex: Suporte 24/7)"
                  value={newPlanResourceInput}
                  onChange={(e) => setNewPlanResourceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddResource();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 border border-[#E2E8F0] rounded-lg"
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddResource}>
                  Adicionar
                </Button>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {planForm.recursos.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {rec}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveResource(i)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreatingPlan(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
