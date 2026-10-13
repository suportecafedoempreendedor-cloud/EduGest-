import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  ArrowRight,
  UserCheck,
  Plus,
  MessageSquare,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Input';
import { Lead, PipelineStageId, Activity, FollowUp, PipelineStage } from '../../types';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  pipelineStages: PipelineStage[];
  activities: Activity[];
  followUps: FollowUp[];
  staffList: { id: string; nome: string; cargo: string }[];
  onChangeStage: (leadId: string, newStage: PipelineStageId) => void;
  onChangeResponsible: (leadId: string, staffName: string) => void;
  onOpenLogActivity: () => void;
  onOpenScheduleFollowUp: () => void;
  onOpenConvertModal: () => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  isOpen,
  onClose,
  lead,
  pipelineStages,
  activities,
  followUps,
  staffList,
  onChangeStage,
  onChangeResponsible,
  onOpenLogActivity,
  onOpenScheduleFollowUp,
  onOpenConvertModal,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'followups' | 'info'>('timeline');

  if (!lead) return null;

  const leadActivities = activities.filter((a) => a.leadId === lead.id);
  const leadFollowUps = followUps.filter((f) => f.leadId === lead.id);

  const currentStageObj = pipelineStages.find((s) => s.id === lead.estagio);
  const isConverted = lead.estagio === 'aluno';
  const isLost = lead.estagio === 'perdido';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead.nomeCandidato}
      subtitle={`Processo de Admissão · ${lead.classeInteresse} · Origem: ${lead.origem}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Pipeline Stage Quick Progress Stepper Bar */}
        <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#012041] uppercase tracking-wide">
              Estágio Actual no Funil de Admissões:
            </span>

            <div className="flex items-center gap-2">
              <Select
                value={lead.estagio}
                onChange={(e) => onChangeStage(lead.id, e.target.value as PipelineStageId)}
                className="text-xs font-bold"
              >
                {pipelineStages.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.ordem}. {st.nome}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Mini Progress Dots */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {pipelineStages.map((st) => {
              const isPastOrCurrent = st.ordem <= (currentStageObj?.ordem || 1);
              const isCurrent = st.id === lead.estagio;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onChangeStage(lead.id, st.id)}
                  title={`${st.ordem}. ${st.nome}`}
                  className={`h-2 flex-1 min-w-[28px] rounded-full transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#015FC4] ring-2 ring-[#015FC4]/30'
                      : isPastOrCurrent
                      ? 'bg-blue-400'
                      : 'bg-slate-200'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Lead Main Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#CBD5E1] rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              icon={<MessageSquare className="w-3.5 h-3.5" />}
              onClick={onOpenLogActivity}
            >
              Registar Contacto
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={<Calendar className="w-3.5 h-3.5" />}
              onClick={onOpenScheduleFollowUp}
            >
              Agendar Follow-up
            </Button>

            <a
              href={`https://wa.me/${lead.telefone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div>
            {!isConverted && !isLost && (
              <Button
                variant="primary"
                size="sm"
                className="bg-[#015FC4]"
                icon={<UserCheck className="w-4 h-4" />}
                onClick={onOpenConvertModal}
              >
                Converter em Aluno
              </Button>
            )}

            {isConverted && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> Aluno Matriculado
              </span>
            )}
          </div>
        </div>

        {/* 2-Column Info & Timeline View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Lead Data Card */}
          <div className="space-y-4">
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 space-y-3 text-xs">
              <span className="font-bold text-[#012041] uppercase tracking-wide block border-b border-slate-200 pb-1.5">
                Dados do Candidato & Família
              </span>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 block">Encarregado de Educação:</span>
                  <span className="font-bold text-[#012041]">
                    {lead.nomeEncarregado} ({lead.parentesco})
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Telefone Principal:</span>
                  <span className="font-mono font-bold text-[#015FC4]">{lead.telefone}</span>
                </div>

                {lead.email && (
                  <div>
                    <span className="text-slate-500 block">Email:</span>
                    <span className="font-mono text-slate-700">{lead.email}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block">Classe & Curso Pretendido:</span>
                  <span className="font-semibold text-[#012041]">
                    {lead.classeInteresse} · {lead.cursoInteresse || 'Geral'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Turno & Ano Lectivo:</span>
                  <span className="font-semibold text-[#012041]">
                    {lead.turnoPretendido} · {lead.anoLectivo}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Canal de Origem:</span>
                  <span className="font-bold text-[#015FC4]">{lead.origem}</span>
                  {lead.campanhaNome && (
                    <span className="text-slate-400 block text-[11px] mt-0.5">
                      Campanha: {lead.campanhaNome}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Commercial Assignment Box */}
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 space-y-3 text-xs">
              <span className="font-bold text-[#012041] uppercase tracking-wide block border-b border-slate-200 pb-1.5">
                Gestão & Probabilidade
              </span>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-500 block mb-1">Responsável de Admissões:</label>
                  <Select
                    value={lead.responsavelNome}
                    onChange={(e) => onChangeResponsible(lead.id, e.target.value)}
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.nome}>
                        {st.nome}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Probabilidade de Fecho:</span>
                  <span className="font-mono font-bold text-[#015FC4]">
                    {lead.probabilidade}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Valor Estimado (Kz):</span>
                  <span className="font-mono font-bold text-[#012041]">
                    {lead.valorEstimadoKz.toLocaleString('pt-AO')} Kz
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                  <span>Criado a: {lead.dataCriacao}</span>
                  <span>Última interacção: {lead.ultimaInteracao}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline / Follow-ups */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`text-xs font-bold pb-2 cursor-pointer transition-colors ${
                  activeTab === 'timeline'
                    ? 'text-[#015FC4] border-b-2 border-[#015FC4]'
                    : 'text-slate-500 hover:text-[#012041]'
                }`}
              >
                Histórico de Contactos ({leadActivities.length})
              </button>

              <button
                onClick={() => setActiveTab('followups')}
                className={`text-xs font-bold pb-2 cursor-pointer transition-colors ${
                  activeTab === 'followups'
                    ? 'text-[#015FC4] border-b-2 border-[#015FC4]'
                    : 'text-slate-500 hover:text-[#012041]'
                }`}
              >
                Follow-ups Agendados ({leadFollowUps.length})
              </button>
            </div>

            {/* Tab: Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-3">
                {leadActivities.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                    Nenhuma actividade registada ainda para este lead.
                    <div className="mt-2">
                      <Button size="sm" variant="secondary" onClick={onOpenLogActivity}>
                        Registar Primeiro Contacto
                      </Button>
                    </div>
                  </div>
                ) : (
                  leadActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#012041]">{act.titulo}</span>
                          <span className="text-[10px] font-bold uppercase text-[#015FC4] bg-blue-50 px-2 py-0.5 rounded">
                            {act.tipo}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">{act.dataHora}</span>
                      </div>

                      <p className="text-[#41515D]">{act.descricao}</p>

                      {act.resultado && (
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Resultado: <strong className="text-[#012041]">{act.resultado}</strong></span>
                          <span>Por: {act.responsavelNome}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Follow-ups */}
            {activeTab === 'followups' && (
              <div className="space-y-3">
                {leadFollowUps.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                    Nenhum follow-up agendado no momento.
                    <div className="mt-2">
                      <Button size="sm" variant="secondary" onClick={onOpenScheduleFollowUp}>
                        Agendar Lembrete
                      </Button>
                    </div>
                  </div>
                ) : (
                  leadFollowUps.map((fu) => (
                    <div
                      key={fu.id}
                      className="p-3.5 bg-white border border-[#E2E8F0] rounded-xl text-xs space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#012041]">{fu.titulo}</span>
                        <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                          {fu.dataPrevista} às {fu.horaPrevista}
                        </span>
                      </div>

                      {fu.observacoes && <p className="text-[#41515D]">{fu.observacoes}</p>}

                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Canal: <strong className="capitalize">{fu.tipo}</strong></span>
                        <span>Responsável: {fu.responsavelNome}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
