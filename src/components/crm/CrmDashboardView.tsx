import React, { useState, useMemo } from 'react';
import {
  Users,
  Target,
  TrendingUp,
  Award,
  Phone,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  BarChart3,
  PieChart,
  Megaphone,
  UserCheck,
  UserPlus,
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles,
  Printer,
  GripVertical,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select, Input } from '../ui/Input';
import {
  Lead,
  LeadSource,
  PipelineStageId,
  PipelineStage,
  LeadSourceEntity,
  Campaign,
  Activity,
  FollowUp,
  Section,
  School,
  Student,
} from '../../types';
import { NewLeadModal } from './NewLeadModal';
import { LeadDetailsModal } from './LeadDetailsModal';
import { LogActivityModal } from './LogActivityModal';
import { ScheduleFollowUpModal } from './ScheduleFollowUpModal';
import { ConvertLeadToStudentModal } from './ConvertLeadToStudentModal';
import { PrintAdmissionsReportModal } from './PrintAdmissionsReportModal';

type CrmTab = 'pipeline' | 'leads' | 'dashboard' | 'followups' | 'campaigns';

interface CrmDashboardViewProps {
  currentSchool: School;
  pipelineStages: PipelineStage[];
  leadSources: LeadSourceEntity[];
  campaigns: Campaign[];
  leads: Lead[];
  activities: Activity[];
  followUps: FollowUp[];
  staffList: { id: string; nome: string; cargo: string; email: string }[];
  sections: Section[];
  onSaveLead: (lead: Lead) => void;
  onUpdateLeadStage: (leadId: string, newStage: PipelineStageId) => void;
  onUpdateLeadResponsible: (leadId: string, staffName: string) => void;
  onSaveActivity: (activity: Activity) => void;
  onScheduleFollowUp: (followUp: FollowUp) => void;
  onToggleFollowUpComplete: (followUpId: string) => void;
  onConvertLeadToStudent: (leadId: string, student: Student, turmaId: string) => void;
  onNotify: (msg: string) => void;
}

export const CrmDashboardView: React.FC<CrmDashboardViewProps> = ({
  currentSchool,
  pipelineStages,
  leadSources,
  campaigns,
  leads,
  activities,
  followUps,
  staffList,
  sections,
  onSaveLead,
  onUpdateLeadStage,
  onUpdateLeadResponsible,
  onSaveActivity,
  onScheduleFollowUp,
  onToggleFollowUpComplete,
  onConvertLeadToStudent,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<CrmTab>('pipeline');

  // Modals state
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<Lead | null>(null);
  const [leadForActivity, setLeadForActivity] = useState<Lead | null>(null);
  const [leadForFollowUp, setLeadForFollowUp] = useState<Lead | null>(null);
  const [leadForConversion, setLeadForConversion] = useState<Lead | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Drag and drop state for Kanban pipeline
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<PipelineStageId | null>(null);

  // Filters for Leads Table
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('todos');
  const [filterSource, setFilterSource] = useState<string>('todas');
  const [filterStaff, setFilterStaff] = useState<string>('todos');
  const [filterCampaign, setFilterCampaign] = useState<string>('todas');

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        lead.nomeCandidato.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.nomeEncarregado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone.includes(searchTerm);
      const matchStage = filterStage === 'todos' || lead.estagio === filterStage;
      const matchSource = filterSource === 'todas' || lead.origem === filterSource;
      const matchStaff = filterStaff === 'todos' || lead.responsavelNome === filterStaff;
      const matchCampaign =
        filterCampaign === 'todas' ||
        lead.campanhaId === filterCampaign ||
        lead.campanhaNome === filterCampaign;
      return matchSearch && matchStage && matchSource && matchStaff && matchCampaign;
    });
  }, [leads, searchTerm, filterStage, filterSource, filterStaff, filterCampaign]);

  // Handler for drop event on stage
  const handleDrop = (targetStageId: PipelineStageId) => {
    if (!draggedLeadId) return;
    const targetLead = leads.find((l) => l.id === draggedLeadId);
    setDragOverStageId(null);
    setDraggedLeadId(null);
    if (!targetLead || targetLead.estagio === targetStageId) return;

    if (targetStageId === 'aluno' && targetLead.estagio !== 'aluno') {
      setLeadForConversion(targetLead);
    } else {
      onUpdateLeadStage(targetLead.id, targetStageId);
      const stageName = pipelineStages.find((s) => s.id === targetStageId)?.nome || targetStageId;
      onNotify(`Lead "${targetLead.nomeCandidato}" movido para "${stageName}".`);
    }
  };

  // Overall Statistics & Conversion Metrics
  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const matriculas = leads.filter((l) => l.estagio === 'aluno' || l.estagio === 'matricula').length;
    const perdidos = leads.filter((l) => l.estagio === 'perdido').length;
    const taxaConversao = totalLeads > 0 ? Math.round((matriculas / totalLeads) * 100) : 0;
    const valorPipeline = leads
      .filter((l) => l.estagio !== 'perdido')
      .reduce((acc, curr) => acc + (curr.valorEstimadoKz || 0), 0);

    // Distribution by Source
    const sourceMap: Record<string, number> = {};
    leads.forEach((l) => {
      sourceMap[l.origem] = (sourceMap[l.origem] || 0) + 1;
    });

    // Performance by Staff
    const staffMap: Record<string, { total: number; matriculas: number }> = {};
    staffList.forEach((st) => {
      staffMap[st.nome] = { total: 0, matriculas: 0 };
    });
    leads.forEach((l) => {
      if (!staffMap[l.responsavelNome]) {
        staffMap[l.responsavelNome] = { total: 0, matriculas: 0 };
      }
      staffMap[l.responsavelNome].total += 1;
      if (l.estagio === 'aluno' || l.estagio === 'matricula') {
        staffMap[l.responsavelNome].matriculas += 1;
      }
    });

    const staffPerformance = Object.entries(staffMap).map(([nome, data]) => ({
      nome,
      total: data.total,
      matriculas: data.matriculas,
      taxa: data.total > 0 ? Math.round((data.matriculas / data.total) * 100) : 0,
    }));

    return {
      totalLeads,
      matriculas,
      perdidos,
      taxaConversao,
      valorPipeline,
      sourceMap,
      staffPerformance,
    };
  }, [leads, staffList]);

  // Handler to advance stage to next in pipeline
  const handleAdvanceStage = (lead: Lead) => {
    const currentIdx = pipelineStages.findIndex((s) => s.id === lead.estagio);
    if (currentIdx >= 0 && currentIdx < pipelineStages.length - 2) {
      const nextStage = pipelineStages[currentIdx + 1];
      onUpdateLeadStage(lead.id, nextStage.id);
      onNotify(`Lead "${lead.nomeCandidato}" avançou para o estágio "${nextStage.nome}".`);
    } else if (lead.estagio === 'matricula') {
      // Suggest convert
      setLeadForConversion(lead);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. CRM HERO BANNER */}
      {/* ========================================================= */}
      <div className="bg-[#012041] text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-blue-200">
              <Target className="w-4 h-4 text-blue-300" />
              <span className="font-semibold uppercase tracking-wider">{currentSchool.nome}</span>
              <span aria-hidden="true">·</span>
              <span>CRM Escolar & Admissões</span>
              <span aria-hidden="true">·</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-mono">
                Ano 2026/2027 Activo
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
              Funil de Captação & Gestão de Leads
            </h1>

            <p className="text-xs sm:text-sm text-[#8EA5B8] mt-1.5 max-w-2xl">
              Acompanhamento de novos contactos, marcação de visitas, agendamento de follow-ups,
              atribuição de consultores e conversão directa de candidatos em alunos matriculados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => setIsPrintReportOpen(true)}
            >
              Relatório de Admissões (PDF)
            </Button>

            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              size="sm"
              icon={<Calendar className="w-4 h-4" />}
              onClick={() => setActiveTab('followups')}
            >
              Agenda ({followUps.filter((f) => !f.concluido).length} Tarefas)
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="bg-[#015FC4]"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsNewLeadOpen(true)}
            >
              Novo Lead / Candidato
            </Button>
          </div>
        </div>

        {/* Real-time KPI Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Total de Leads</span>
            <span className="text-2xl font-bold text-white mt-0.5 block">{stats.totalLeads}</span>
            <span className="text-[10px] text-blue-300">Candidatos registados</span>
          </div>

          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Taxa de Conversão</span>
            <span className="text-2xl font-bold text-emerald-400 mt-0.5 block">
              {stats.taxaConversao}%
            </span>
            <span className="text-[10px] text-emerald-300">Meta da escola: &ge; 25%</span>
          </div>

          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Matrículas Fechadas</span>
            <span className="text-2xl font-bold text-white mt-0.5 block">{stats.matriculas}</span>
            <span className="text-[10px] text-slate-300">Convertidos em alunos</span>
          </div>

          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Valor em Pipeline</span>
            <span className="text-2xl font-bold font-mono text-amber-300 mt-0.5 block">
              {(stats.valorPipeline / 1000).toFixed(0)}k Kz
            </span>
            <span className="text-[10px] text-slate-300">Potencial de receita</span>
          </div>

          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Perdidos / Desistências</span>
            <span className="text-2xl font-bold text-slate-400 mt-0.5 block">{stats.perdidos}</span>
            <span className="text-[10px] text-slate-400">Motivos catalogados</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. NAVIGATION TABS */}
      {/* ========================================================= */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'pipeline' as CrmTab, label: 'Funil Kanban (Pipeline)', icon: <Layers className="w-4 h-4" /> },
            { id: 'leads' as CrmTab, label: 'Lista de Leads & Candidatos', icon: <Users className="w-4 h-4" /> },
            { id: 'dashboard' as CrmTab, label: 'Dashboard & Conversão', icon: <BarChart3 className="w-4 h-4" /> },
            {
              id: 'followups' as CrmTab,
              label: 'Agenda de Follow-ups',
              icon: <Clock className="w-4 h-4" />,
              badge: followUps.filter((f) => !f.concluido).length || undefined,
            },
            { id: 'campaigns' as CrmTab, label: 'Campanhas de Captação', icon: <Megaphone className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#012041] text-white shadow-xs'
                    : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: KANBAN PIPELINE VIEW */}
      {/* ========================================================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#41515D] px-1">
            <span>
              Exibindo <strong>{pipelineStages.filter((s) => s.id !== 'perdido').length} estágios</strong> operacionais do funil de admissão.
            </span>
            <span className="font-semibold text-[#015FC4] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Arraste os cartões entre as colunas ou utilize o botão «Avançar»</span>
            </span>
          </div>

          {/* Kanban Board Container */}
          <div className="flex gap-3 overflow-x-auto pb-4 items-start min-h-[550px]">
            {pipelineStages
              .filter((st) => st.id !== 'perdido')
              .map((stage) => {
                const stageLeads = leads.filter((l) => l.estagio === stage.id);
                const stageTotalKz = stageLeads.reduce((acc, curr) => acc + curr.valorEstimadoKz, 0);
                const isDragOver = dragOverStageId === stage.id;

                return (
                  <div
                    key={stage.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverStageId !== stage.id) setDragOverStageId(stage.id);
                    }}
                    onDragLeave={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                      if (dragOverStageId === stage.id) setDragOverStageId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(stage.id);
                    }}
                    className={`w-72 shrink-0 rounded-xl border p-3 space-y-3 flex flex-col transition-all duration-150 ${
                      isDragOver
                        ? 'bg-blue-50/90 border-[#015FC4] ring-2 ring-[#015FC4]/30 shadow-md scale-[1.01]'
                        : 'bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: stage.cor }}
                        />
                        <h3 className="font-bold text-xs text-[#012041] truncate uppercase tracking-wider">
                          {stage.nome}
                        </h3>
                      </div>

                      <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-white text-slate-700 shadow-2xs">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                      <span>Total estimado:</span>
                      <span className="font-bold text-slate-700">
                        {stageTotalKz > 0 ? `${(stageTotalKz / 1000).toFixed(0)}k Kz` : '0 Kz'}
                      </span>
                    </div>

                    {/* Stage Cards Column */}
                    <div className="space-y-2.5 overflow-y-auto max-h-[620px] pr-0.5">
                      {stageLeads.length === 0 ? (
                        <div
                          className={`p-4 text-center text-[11px] rounded-lg border border-dashed transition-colors ${
                            isDragOver
                              ? 'border-[#015FC4] bg-white text-[#015FC4] font-semibold'
                              : 'border-slate-200 text-slate-400'
                          }`}
                        >
                          {isDragOver ? 'Solte aqui para mover' : 'Sem candidatos neste estágio'}
                        </div>
                      ) : (
                        stageLeads.map((lead) => {
                          const isBeingDragged = draggedLeadId === lead.id;

                          return (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => {
                                setDraggedLeadId(lead.id);
                                e.dataTransfer.setData('text/plain', lead.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragEnd={() => {
                                setDraggedLeadId(null);
                                setDragOverStageId(null);
                              }}
                              className={`bg-white rounded-lg border p-3 shadow-2xs hover:shadow-xs transition-all space-y-2 text-xs select-none cursor-grab active:cursor-grabbing ${
                                isBeingDragged
                                  ? 'opacity-40 border-dashed border-[#015FC4] scale-95 shadow-none'
                                  : 'border-[#CBD5E1] hover:border-slate-400'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="flex items-start gap-1 min-w-0">
                                  <GripVertical className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-[#012041] leading-tight truncate">
                                      {lead.nomeCandidato}
                                    </h4>
                                    <span className="text-[11px] text-slate-500 block mt-0.5">
                                      {lead.classeInteresse} · {lead.cursoInteresse ? lead.cursoInteresse.split(' ')[0] : 'Geral'}
                                    </span>
                                  </div>
                                </div>

                                <span className="text-[10px] font-bold text-[#015FC4] bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                                  {lead.origem}
                                </span>
                              </div>

                              <div className="text-[11px] text-[#41515D] space-y-0.5 pt-1 border-t border-slate-100">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Encarregado:</span>
                                  <span className="font-semibold truncate max-w-[140px] text-right">
                                    {lead.nomeEncarregado}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Telefone:</span>
                                  <span className="font-mono text-[10px] text-slate-700 flex items-center gap-1">
                                    {lead.telefone}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Responsável:</span>
                                  <span className="text-slate-600 truncate max-w-[130px]">
                                    {lead.responsavelNome.split(' ')[1] || lead.responsavelNome}
                                  </span>
                                </div>
                              </div>

                              {/* Card Footer Actions & Direct Shortcuts */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLeadForDetails(lead)}
                                    className="text-[11px] text-[#015FC4] font-semibold hover:underline cursor-pointer"
                                  >
                                    Detalhes
                                  </button>

                                  <span className="text-slate-200">·</span>

                                  {/* Quick Contact Shortcuts */}
                                  <a
                                    href={`https://wa.me/${lead.telefone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                    title="Conversar via WhatsApp"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLeadForActivity(lead);
                                    }}
                                    className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Registar Contacto"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLeadForFollowUp(lead);
                                    }}
                                    className="p-1 rounded text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                    title="Agendar Follow-up"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {lead.estagio !== 'aluno' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceStage(lead)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 hover:bg-[#015FC4] hover:text-white text-slate-700 transition-colors cursor-pointer"
                                    title="Avançar para o próximo estágio"
                                  >
                                    <span>{lead.estagio === 'matricula' ? 'Matricular' : 'Avançar'}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> Matriculado
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LEADS TABLE VIEW WITH FILTERS */}
      {/* ========================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <Card noPadding>
            {/* Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar candidato, encarregado ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#012041]"
                  />
                </div>

                <Select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="text-xs"
                >
                  <option value="todos">Todos os Estágios</option>
                  {pipelineStages.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nome}
                    </option>
                  ))}
                </Select>

                <Select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="text-xs"
                >
                  <option value="todas">Todas as Origens</option>
                  {leadSources.map((src) => (
                    <option key={src.id} value={src.nome}>
                      {src.nome}
                    </option>
                  ))}
                </Select>

                <Select
                  value={filterStaff}
                  onChange={(e) => setFilterStaff(e.target.value)}
                  className="text-xs"
                >
                  <option value="todos">Todos os Responsáveis</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.nome}>
                      {st.nome}
                    </option>
                  ))}
                </Select>

                <Select
                  value={filterCampaign}
                  onChange={(e) => setFilterCampaign(e.target.value)}
                  className="text-xs"
                >
                  <option value="todas">Todas as Campanhas</option>
                  {campaigns.map((cmp) => (
                    <option key={cmp.id} value={cmp.id}>
                      {cmp.nome.length > 22 ? cmp.nome.substring(0, 22) + '...' : cmp.nome}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => setIsPrintReportOpen(true)}
                  className="bg-white"
                >
                  Imprimir
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsNewLeadOpen(true)}
                >
                  Novo Lead
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Candidato / Aluno</th>
                    <th className="py-3 px-4">Encarregado & Telefone</th>
                    <th className="py-3 px-4">Classe & Turno</th>
                    <th className="py-3 px-4">Origem</th>
                    <th className="py-3 px-4">Estágio no Funil</th>
                    <th className="py-3 px-4">Responsável</th>
                    <th className="py-3 px-4 text-right">Acções Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                        Nenhum lead encontrado com os filtros actuais.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const stageObj = pipelineStages.find((s) => s.id === lead.estagio);
                      const isAluno = lead.estagio === 'aluno';

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#012041]">
                            {lead.nomeCandidato}
                            <span className="text-[11px] text-slate-400 font-mono block">
                              Criado a {lead.dataCriacao}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">
                              {lead.nomeEncarregado} ({lead.parentesco})
                            </span>
                            <span className="text-[11px] font-mono text-[#015FC4]">
                              {lead.telefone}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#012041] block">
                              {lead.classeInteresse}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {lead.turnoPretendido} · {lead.anoLectivo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {lead.origem}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded uppercase"
                              style={{
                                backgroundColor: `${stageObj?.cor}20`,
                                color: stageObj?.cor,
                              }}
                            >
                              {stageObj?.nome}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">
                            {lead.responsavelNome}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLeadForDetails(lead)}
                              >
                                Ficha
                              </Button>

                              <button
                                type="button"
                                onClick={() => setLeadForActivity(lead)}
                                className="p-1.5 rounded text-slate-600 hover:text-[#015FC4] hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Registar Contacto"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              {!isAluno && (
                                <button
                                  type="button"
                                  onClick={() => setLeadForConversion(lead)}
                                  className="p-1.5 rounded text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                  title="Converter em Aluno Oficial"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DASHBOARD DE MÉTRICAS & CONVERSÃO */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Funnel Conversion Bar Chart Representation */}
          <Card>
            <div className="flex items-center justify-between mb-4 border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#012041]">
                  Funil Visual de Admissões (Taxa de Passagem por Estágio)
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Acompanhamento quantitativo da progressão desde o primeiro contacto até à matrícula homologada.
                </p>
              </div>

              <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                Taxa Global: {stats.taxaConversao}%
              </span>
            </div>

            <div className="space-y-3">
              {pipelineStages
                .filter((st) => st.id !== 'perdido')
                .map((stage) => {
                  const count = leads.filter((l) => l.estagio === stage.id).length;
                  const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;

                  return (
                    <div key={stage.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[#012041] flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: stage.cor }}
                          />
                          {stage.nome}
                        </span>
                        <span className="font-mono text-slate-700">
                          {count} leads ({pct}%)
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max(4, pct)}%`,
                            backgroundColor: stage.cor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* 2-Column Metrics: Origin Distribution & Performance by Staff */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Origin Distribution */}
            <Card>
              <h3 className="text-sm font-bold text-[#012041] mb-3 border-b border-[#E2E8F0] pb-2">
                Origem dos Leads (Canais de Captação)
              </h3>

              <div className="space-y-2.5">
                {leadSources.map((src) => {
                  const count = stats.sourceMap[src.nome] || 0;
                  const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;

                  return (
                    <div key={src.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#012041]">{src.nome}</span>
                        <span className="text-[10px] text-slate-400">({src.descricao})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#015FC4]">{count}</span>
                        <span className="text-[11px] text-slate-500 w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Conversion by Admissions Staff */}
            <Card>
              <h3 className="text-sm font-bold text-[#012041] mb-3 border-b border-[#E2E8F0] pb-2">
                Conversão por Consultor / Funcionário
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[#012041] font-semibold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-2.5 px-3">Funcionário</th>
                      <th className="py-2.5 px-2 text-center">Leads</th>
                      <th className="py-2.5 px-2 text-center">Matrículas</th>
                      <th className="py-2.5 px-3 text-right">Taxa (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {stats.staffPerformance.map((stf) => (
                      <tr key={stf.nome} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-[#012041]">{stf.nome}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{stf.total}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-700">
                          {stf.matriculas}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#015FC4]">
                          {stf.taxa}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: AGENDA DE FOLLOW-UPS */}
      {/* ========================================================= */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Agenda de Follow-ups & Tarefas Comerciais
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Lembretes planeados para chamadas, mensagens e acolhimento de visitas.
                </p>
              </div>

              <span className="text-xs font-bold text-[#015FC4]">
                {followUps.filter((f) => !f.concluido).length} pendentes
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {followUps.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500">
                  Nenhuma tarefa agendada no momento.
                </div>
              ) : (
                followUps.map((fu) => (
                  <div
                    key={fu.id}
                    className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                      fu.concluido ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={fu.concluido}
                        onChange={() => onToggleFollowUpComplete(fu.id)}
                        className="mt-1 rounded border-slate-300 text-[#015FC4] focus:ring-[#015FC4] cursor-pointer"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              fu.concluido ? 'line-through text-slate-400' : 'text-[#012041]'
                            }`}
                          >
                            {fu.titulo}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-[#015FC4] bg-blue-50 px-2 py-0.5 rounded">
                            {fu.tipo}
                          </span>
                        </div>

                        {fu.observacoes && (
                          <p className="text-xs text-[#41515D] mt-1">{fu.observacoes}</p>
                        )}

                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>Candidato: <strong className="text-slate-700">{fu.leadNome}</strong></span>
                          <span aria-hidden="true">·</span>
                          <span>Responsável: <strong>{fu.responsavelNome}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded block">
                        {fu.dataPrevista} às {fu.horaPrevista}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: CAMPANHAS DE CAPTAÇÃO */}
      {/* ========================================================= */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map((cmp) => {
              const progressPct =
                cmp.metaMatriculas > 0
                  ? Math.round((cmp.totalMatriculas / cmp.metaMatriculas) * 100)
                  : 0;

              return (
                <div
                  key={cmp.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#015FC4] block">
                        {cmp.anoLectivo}
                      </span>
                      <h4 className="font-bold text-sm text-[#012041] mt-0.5 leading-snug">
                        {cmp.nome}
                      </h4>
                    </div>

                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase">
                      {cmp.estado}
                    </span>
                  </div>

                  <p className="text-xs text-[#41515D] line-clamp-2">{cmp.descricao}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Meta de Matrículas:</span>
                      <span className="font-bold text-[#012041]">
                        {cmp.totalMatriculas} de {cmp.metaMatriculas} ({progressPct}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, progressPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Leads Gerados: <strong className="text-[#012041]">{cmp.totalLeads}</strong></span>
                    <span>Orçamento: <strong className="font-mono text-slate-700">{(cmp.orcamentoKz || 0).toLocaleString('pt-AO')} Kz</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* INTERACTIVE MODALS */}
      {/* ========================================================= */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        escolaId={currentSchool.id}
        campaigns={campaigns}
        staffList={staffList}
        onSaveLead={(newLead) => {
          onSaveLead(newLead);
          onNotify(`Lead "${newLead.nomeCandidato}" registado com sucesso no funil de admissão!`);
        }}
      />

      <LeadDetailsModal
        isOpen={!!selectedLeadForDetails}
        onClose={() => setSelectedLeadForDetails(null)}
        lead={selectedLeadForDetails}
        pipelineStages={pipelineStages}
        activities={activities}
        followUps={followUps}
        staffList={staffList}
        onChangeStage={(leadId, newStage) => {
          onUpdateLeadStage(leadId, newStage);
          if (selectedLeadForDetails) {
            setSelectedLeadForDetails({ ...selectedLeadForDetails, estagio: newStage });
          }
          const stageName = pipelineStages.find((s) => s.id === newStage)?.nome || newStage;
          onNotify(`Estágio alterado para "${stageName}".`);
        }}
        onChangeResponsible={(leadId, staffName) => {
          onUpdateLeadResponsible(leadId, staffName);
          if (selectedLeadForDetails) {
            setSelectedLeadForDetails({ ...selectedLeadForDetails, responsavelNome: staffName });
          }
          onNotify(`Responsável alterado para ${staffName}.`);
        }}
        onOpenLogActivity={() => {
          setLeadForActivity(selectedLeadForDetails);
        }}
        onOpenScheduleFollowUp={() => {
          setLeadForFollowUp(selectedLeadForDetails);
        }}
        onOpenConvertModal={() => {
          setLeadForConversion(selectedLeadForDetails);
        }}
      />

      <LogActivityModal
        isOpen={!!leadForActivity}
        onClose={() => setLeadForActivity(null)}
        lead={leadForActivity}
        onSaveActivity={(act) => {
          onSaveActivity(act);
          onNotify(`Contacto registado com sucesso no histórico.`);
        }}
      />

      <ScheduleFollowUpModal
        isOpen={!!leadForFollowUp}
        onClose={() => setLeadForFollowUp(null)}
        lead={leadForFollowUp}
        staffList={staffList}
        onSchedule={(fu) => {
          onScheduleFollowUp(fu);
          onNotify(`Follow-up agendado para ${fu.dataPrevista} às ${fu.horaPrevista}.`);
        }}
      />

      <ConvertLeadToStudentModal
        isOpen={!!leadForConversion}
        onClose={() => setLeadForConversion(null)}
        lead={leadForConversion}
        sections={sections}
        onConvert={(newStudent, turmaId) => {
          if (leadForConversion) {
            onConvertLeadToStudent(leadForConversion.id, newStudent, turmaId);
            onNotify(`Candidato ${newStudent.nomeCompleto} convertido em aluno com a matrícula ${newStudent.numeroMatricula}!`);
            setSelectedLeadForDetails(null);
          }
        }}
      />

      <PrintAdmissionsReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        school={currentSchool}
        leads={leads}
        pipelineStages={pipelineStages}
        campaigns={campaigns}
      />
    </div>
  );
};
