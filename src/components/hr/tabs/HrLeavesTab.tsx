import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  AlertTriangle,
  UserCheck,
  FileText,
  Palmtree,
  Printer,
  Download,
  Eye,
  Building2,
  X,
  Search,
} from 'lucide-react';
import { LeaveRequest, Employee } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv, downloadFile, defaultSchoolHeader } from '../../../utils/hrDocumentGenerator';

interface HrLeavesTabProps {
  leaves: LeaveRequest[];
  employees: Employee[];
  onRequestLeave: (data: Omit<LeaveRequest, 'id' | 'submetidoEm' | 'estado'>) => void;
  onDecideLeave: (leaveId: string, decision: 'aprovado_rh' | 'rejeitado', parecer: string) => void;
  schoolName?: string;
}

export const HrLeavesTab: React.FC<HrLeavesTabProps> = ({
  leaves,
  employees,
  onRequestLeave,
  onDecideLeave,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [tipoLicenca, setTipoLicenca] = useState<LeaveRequest['tipo']>('ferias');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [totalDias, setTotalDias] = useState(10);
  const [motivo, setMotivo] = useState('');

  // Decisão
  const [decisionModalLeave, setDecisionModalLeave] = useState<LeaveRequest | null>(null);
  const [parecerTexto, setParecerTexto] = useState('');

  // Visualizar Guia de Férias
  const [viewingLeave, setViewingLeave] = useState<LeaveRequest | null>(null);

  const filteredLeaves = leaves.filter((l) => {
    const matchSearch =
      l.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cargoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.departamentoNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || l.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    onRequestLeave({
      escolaId: 'esc-001',
      colaboradorId: selectedEmpId,
      colaboradorNome: emp.nomeCompleto,
      departamentoNome: emp.departamentoNome,
      cargoNome: emp.cargoNome,
      tipo: tipoLicenca,
      dataInicio,
      dataFim,
      totalDiasUteis: Number(totalDias) || 1,
      motivo,
    });

    setIsModalOpen(false);
    setMotivo('');
  };

  const handleConfirmDecision = (decision: 'aprovado_rh' | 'rejeitado') => {
    if (!decisionModalLeave) return;
    onDecideLeave(decisionModalLeave.id, decision, parecerTexto);
    setDecisionModalLeave(null);
    setParecerTexto('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Colaborador',
      'Cargo',
      'Departamento',
      'Tipo_Ausencia',
      'Data_Inicio',
      'Data_Fim',
      'Dias_Uteis',
      'Estado',
      'Parecer_RH',
    ];
    const rows = filteredLeaves.map((l) => [
      l.colaboradorNome,
      l.cargoNome,
      l.departamentoNome,
      l.tipo,
      l.dataInicio,
      l.dataFim,
      l.totalDiasUteis,
      l.estado,
      l.parecerRh || l.motivo || '',
    ]);
    exportToCsv(`mapa_ferias_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleDownloadLeaveGuide = (lvr: LeaveRequest) => {
    const emp = employees.find((e) => e.id === lvr.colaboradorId);
    const subFeriasKz = emp ? Math.round(emp.salarioBaseKz * 0.5) : 150000;

    const text = `================================================================================
REPÚBLICA DE ANGOLA · MINISTÉRIO DA EDUCAÇÃO
${schoolName.toUpperCase()}
================================================================================

                    GUIA OFICIAL DE GOZO DE FÉRIAS E LICENÇA
                    REF: GUIA-FERIAS/${new Date().getFullYear()}/${lvr.id}

DADOS DO TRABALHADOR:
  Nome: ${lvr.colaboradorNome}
  Cargo: ${lvr.cargoNome}
  Departamento: ${lvr.departamentoNome}

DADOS DA AUSÊNCIA (LEI GERAL DO TRABALHO):
  Tipo de Ausência: ${lvr.tipo.toUpperCase().replace('_', ' ')}
  Período Autorizado: De ${lvr.dataInicio} a ${lvr.dataFim}
  Total de Dias Úteis: ${lvr.totalDiasUteis} dias
  Data de Retorno ao Serviço: ${lvr.dataFim}

DIREITOS PECUNIÁRIOS (SUBSÍDIO DE FÉRIAS):
  Valor do Subsídio de Férias atribuído: ${subFeriasKz.toLocaleString('pt-AO')} Kz
  Situação no Mapa de Efetividade: Férias Regulamentares Homologadas

PARECER DA DIRECÇÃO:
  Decisão: ${lvr.estado.toUpperCase()}
  Homologado por: ${lvr.decididoPor || 'Direcção de Recursos Humanos'}
  Observações: ${lvr.parecerRh || lvr.motivo || 'Gozo regular de férias anuais.'}

Luanda, aos ${new Date().toLocaleDateString('pt-AO')}.

__________________________________________          __________________________________________
        PELA DIRECÇÃO DE RH                                    O COLABORADOR
     (Assinatura e Carimbo)                                (${lvr.colaboradorNome})
================================================================================`;

    downloadFile(text, `guia_ferias_${lvr.colaboradorNome.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Topo Informativo */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-emerald-600" />
              <span>Férias Regulamentares & Gestão de Licenças (LGT Angola)</span>
            </h3>
            <p className="text-gray-500 text-[11px] mt-0.5">
              Cada trabalhador dispõe de 22 dias úteis de férias remuneradas anuais. O fluxo obedece a aprovação Chefia → Recursos Humanos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Exportar Mapa (CSV)
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Marcar Férias / Licença
            </Button>
          </div>
        </div>

        {/* Linha de Busca & Filtro */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar pedido de férias ou colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
          >
            <option value="todos">Todos os Estados</option>
            <option value="pendente">Pendente de Homologação</option>
            <option value="aprovado_rh">Aprovado pelo RH</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>

      {/* Lista de Pedidos de Férias e Ausências */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Colaborador</th>
              <th className="py-3 px-4">Tipo de Ausência</th>
              <th className="py-3 px-4">Período de Ausência</th>
              <th className="py-3 px-4 text-center">Dias Úteis</th>
              <th className="py-3 px-4">Motivo / Parecer</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Operações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeaves.map((lvr) => (
              <tr key={lvr.id} className="hover:bg-blue-50/20">
                <td className="py-3 px-4">
                  <strong className="text-gray-900 block font-semibold">{lvr.colaboradorNome}</strong>
                  <span className="text-[10px] text-gray-400 block">{lvr.cargoNome} · {lvr.departamentoNome}</span>
                </td>

                <td className="py-3 px-4 capitalize font-semibold text-gray-800">
                  {lvr.tipo.replace('_', ' ')}
                </td>

                <td className="py-3 px-4 font-mono text-gray-700">
                  {lvr.dataInicio} ➔ {lvr.dataFim}
                </td>

                <td className="py-3 px-4 text-center font-bold font-mono text-[#015FC4]">
                  {lvr.totalDiasUteis} dias
                </td>

                <td className="py-3 px-4 max-w-[200px]">
                  <span className="text-gray-600 block truncate">{lvr.motivo || 'Férias regulares'}</span>
                  {lvr.parecerChefia && (
                    <span className="text-[10px] text-teal-700 block italic">Chefia: {lvr.parecerChefia}</span>
                  )}
                </td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      lvr.estado === 'concluido' || lvr.estado === 'aprovado_rh'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lvr.estado === 'aprovado_chefia'
                        ? 'bg-blue-100 text-[#015FC4]'
                        : lvr.estado === 'rejeitado'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {lvr.estado.replace('_', ' ')}
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setViewingLeave(lvr)}
                      className="px-2 py-1 rounded bg-[#015FC4]/10 hover:bg-[#015FC4] text-[#015FC4] hover:text-white font-semibold text-[10px] transition-colors flex items-center gap-1"
                      title="Visualizar Guia de Férias"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Guia</span>
                    </button>

                    {lvr.estado === 'pendente' || lvr.estado === 'aprovado_chefia' ? (
                      <button
                        onClick={() => {
                          setDecisionModalLeave(lvr);
                          setParecerTexto('Homologado pelo Departamento de Recursos Humanos.');
                        }}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors"
                      >
                        Avaliar
                      </button>
                    ) : (
                      <span className="text-gray-400 text-[10px] px-1">Concluído</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Visualizar Guia Oficial de Férias */}
      {viewingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2 no-print">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">
                  Guia Oficial de Gozo de Férias / Licença
                </strong>
                <span className="text-[11px] text-gray-500">
                  {viewingLeave.colaboradorNome} · {schoolName}
                </span>
              </div>
              <button onClick={() => setViewingLeave(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            {/* Documento Imprimível (#hr-printable-area) */}
            <div id="hr-printable-area" className="p-5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-3 text-xs">
              <div className="text-center border-b border-gray-200 pb-2">
                <h4 className="font-bold text-[#012041] text-sm uppercase">{schoolName}</h4>
                <p className="text-[10px] text-gray-500">NIF: {defaultSchoolHeader.nif} · Luanda, Angola</p>
                <strong className="text-xs text-emerald-800 block mt-1 uppercase">
                  GUIA DE GOZO DE FÉRIAS REGULAMENTARES
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-gray-200 text-[11px]">
                <div>
                  <span className="text-gray-400 text-[10px] block">Colaborador:</span>
                  <strong className="text-gray-900 block">{viewingLeave.colaboradorNome}</strong>
                  <span className="text-gray-600 block">{viewingLeave.cargoNome} · {viewingLeave.departamentoNome}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] block">Modalidade:</span>
                  <strong className="text-gray-900 capitalize block">{viewingLeave.tipo.replace('_', ' ')}</strong>
                  <span className="text-[#015FC4] font-bold block">{viewingLeave.totalDiasUteis} Dias Úteis</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                <strong>Período de Ausência Autorizado:</strong>
                <p>
                  De <strong>{viewingLeave.dataInicio}</strong> até <strong>{viewingLeave.dataFim}</strong>, devendo apresentar-se ao trabalho no dia útil imediatamente posterior.
                </p>
                <p className="text-[10px] text-emerald-800">
                  Parecer do RH: {viewingLeave.parecerRh || 'Autorizado nos termos do Artigo 127º da Lei Geral do Trabalho.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-[10px]">
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>Pela Direcção de RH</strong>
                    <span className="block text-gray-500">{schoolName}</span>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>O(A) Colaborador(a)</strong>
                    <span className="block text-gray-500">{viewingLeave.colaboradorNome}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 no-print">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadLeaveGuide(viewingLeave)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Descarregar (.txt)
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.print()}
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Imprimir Guia
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setViewingLeave(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Solicitar Férias */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Submeter Pedido de Férias ou Licença</h4>
            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Colaborador *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nomeCompleto} (Saldo: {e.saldoDiasFeriasAno} dias)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tipo de Ausência</label>
                <select
                  value={tipoLicenca}
                  onChange={(e) => setTipoLicenca(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                >
                  <option value="ferias">Férias Anuais Regulamentares (22 dias úteis LGT)</option>
                  <option value="doenca">Baixa Médica / Doença Comprovada</option>
                  <option value="maternidade_paternidade">Licença de Maternidade / Paternidade</option>
                  <option value="luto_nojo">Licença de Nojo / Luto Familiar</option>
                  <option value="casamento">Licença de Casamento</option>
                  <option value="dispensa_autorizada">Dispensa Especial Autorizada</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    required
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    required
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Total de Dias Úteis</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={totalDias}
                  onChange={(e) => setTotalDias(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Motivo / Observações</label>
                <textarea
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Informações adicionais para a Chefia e RH..."
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Submeter Pedido
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Decisão do RH */}
      {decisionModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Decisão de Férias / Parecer do RH</h4>
            <p className="text-gray-600 text-xs">
              Colaborador: <strong>{decisionModalLeave.colaboradorNome}</strong> ({decisionModalLeave.totalDiasUteis} dias)
            </p>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Parecer Formal do RH</label>
              <textarea
                rows={3}
                value={parecerTexto}
                onChange={(e) => setParecerTexto(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => setDecisionModalLeave(null)}>
                Cancelar
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                  size="sm"
                  onClick={() => handleConfirmDecision('rejeitado')}
                >
                  Rejeitar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleConfirmDecision('aprovado_rh')}
                >
                  Homologar Férias
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
