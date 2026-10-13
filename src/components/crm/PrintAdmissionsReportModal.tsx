import React from 'react';
import { Printer, Download, X, Building2, Target, Users, Calendar, Award } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { School, Lead, PipelineStage, Campaign } from '../../types';

interface PrintAdmissionsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  leads: Lead[];
  pipelineStages: PipelineStage[];
  campaigns: Campaign[];
}

export const PrintAdmissionsReportModal: React.FC<PrintAdmissionsReportModalProps> = ({
  isOpen,
  onClose,
  school,
  leads,
  pipelineStages,
  campaigns,
}) => {
  if (!isOpen) return null;

  const totalLeads = leads.length;
  const matriculados = leads.filter((l) => l.estagio === 'aluno' || l.estagio === 'matricula').length;
  const taxaConversao = totalLeads > 0 ? Math.round((matriculados / totalLeads) * 100) : 0;
  const receitaEstimadaKz = leads
    .filter((l) => l.estagio !== 'perdido')
    .reduce((acc, curr) => acc + (curr.valorEstimadoKz || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Relatório Executivo de Admissões & Matrículas"
      subtitle={`${school.nome} · Ano Lectivo 2026/2027`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Printable Paper Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs font-sans print:border-none print:shadow-none print:p-0">
          {/* Header do Relatório com Timbre */}
          <div className="border-b-2 border-[#012041] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#015FC4]" />
                <h2 className="text-lg font-bold text-[#012041] tracking-tight">
                  {school.nome}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                NIF: {school.nif} · Província de {school.provincia || 'Luanda'} · Ministério da Educação
              </p>
              <p className="text-[11px] font-semibold text-[#015FC4] mt-1">
                GABINETE DE ADMISSÕES & COMUNICAÇÃO INSTITUCIONAL
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600">
              <span className="block font-bold text-[#012041]">RELATÓRIO DE PIPELINE</span>
              <span className="block text-[11px]">Emissão: {currentDate}</span>
              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                Documento Oficial Interno
              </span>
            </div>
          </div>

          {/* Resumo Executivo KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 py-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Candidatos</span>
              <span className="text-xl font-bold text-[#012041]">{totalLeads}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Matrículas Fechadas</span>
              <span className="text-xl font-bold text-emerald-700">{matriculados}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Taxa de Sucesso</span>
              <span className="text-xl font-bold text-[#015FC4]">{taxaConversao}%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Pipeline Previsto</span>
              <span className="text-base font-bold font-mono text-slate-800">
                {(receitaEstimadaKz / 1000).toLocaleString('pt-AO')}k Kz
              </span>
            </div>
          </div>

          {/* Tabela do Funil por Estágio */}
          <div className="space-y-2 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#012041]">
              Distribuição por Estágio do Funil
            </h4>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="py-2 px-3">Estágio</th>
                  <th className="py-2 px-3 text-center">Nº Candidatos</th>
                  <th className="py-2 px-3 text-center">% do Total</th>
                  <th className="py-2 px-3 text-right">Valor Estimado (Kz)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pipelineStages.map((stage) => {
                  const stageLeads = leads.filter((l) => l.estagio === stage.id);
                  const count = stageLeads.length;
                  const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                  const valKz = stageLeads.reduce((acc, curr) => acc + curr.valorEstimadoKz, 0);

                  return (
                    <tr key={stage.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.cor }} />
                        {stage.nome}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{count}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{pct}%</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        {valKz.toLocaleString('pt-AO')} Kz
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Lista Resumida dos Candidatos Recentes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#012041]">
              Últimos Candidatos em Acompanhamento
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-1.5 px-2.5">Candidato</th>
                    <th className="py-1.5 px-2.5">Classe</th>
                    <th className="py-1.5 px-2.5">Encarregado / Contacto</th>
                    <th className="py-1.5 px-2.5">Origem</th>
                    <th className="py-1.5 px-2.5">Estágio</th>
                    <th className="py-1.5 px-2.5">Consultor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.slice(0, 8).map((l) => (
                    <tr key={l.id}>
                      <td className="py-1.5 px-2.5 font-bold text-[#012041]">{l.nomeCandidato}</td>
                      <td className="py-1.5 px-2.5">{l.classeInteresse}</td>
                      <td className="py-1.5 px-2.5 text-slate-600">
                        {l.nomeEncarregado} ({l.telefone})
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-500">{l.origem}</td>
                      <td className="py-1.5 px-2.5 font-semibold text-[#015FC4]">
                        {pipelineStages.find((s) => s.id === l.estagio)?.nome || l.estagio}
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-600">{l.responsavelNome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assinatura institucional */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
            <div>
              <p>Relatório gerado automaticamente pela plataforma EduGest Angola.</p>
              <p>Autenticação digital: AGT/EG-CRM-{Date.now().toString(36).toUpperCase()}</p>
            </div>
            <div className="text-center w-48 border-t border-slate-400 pt-1 text-slate-700 font-semibold">
              Direcção Pedagógica & Admissões
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button
            variant="primary"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
            className="bg-[#015FC4]"
          >
            Imprimir Relatório (PDF)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
