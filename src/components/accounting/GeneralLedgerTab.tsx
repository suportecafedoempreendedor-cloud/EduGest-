import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Printer,
  Download,
  Calendar,
  Layers,
  Building2,
  X,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  LancamentoContabilistico,
  DiarioContabilistico,
  ContaPlanoPGC,
  LinhaLancamentoContabilistico,
} from '../../types/accountingFinance';
import { exportToCsv } from '../../utils/hrDocumentGenerator';

interface GeneralLedgerTabProps {
  lancamentos: LancamentoContabilistico[];
  diarios: DiarioContabilistico[];
  planoContas: ContaPlanoPGC[];
  onAddLancamento: (
    novo: Omit<LancamentoContabilistico, 'id' | 'numeroLancamento' | 'totalDebitoKz' | 'totalCreditoKz' | 'diferencaKz' | 'criadoEm'>
  ) => { success: boolean; message: string };
  onEstornarLancamento: (lancamentoId: string, motivo: string) => { success: boolean; message: string };
  schoolName: string;
}

export const GeneralLedgerTab: React.FC<GeneralLedgerTabProps> = ({
  lancamentos,
  diarios,
  planoContas,
  onAddLancamento,
  onEstornarLancamento,
  schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiario, setFilterDiario] = useState('todos');
  const [filterPeriodo, setFilterPeriodo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');

  // Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingLancamento, setViewingLancamento] = useState<LancamentoContabilistico | null>(null);
  const [estornandoLancamento, setEstornandoLancamento] = useState<LancamentoContabilistico | null>(null);
  const [motivoEstorno, setMotivoEstorno] = useState('');
  const [operationFeedback, setOperationFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Formulário de Novo Lançamento
  const [diarioId, setDiarioId] = useState(diarios[0]?.id || 'dia-01');
  const [descricaoGeral, setDescricaoGeral] = useState('');
  const [dataDocumento, setDataDocumento] = useState(new Date().toISOString().substring(0, 10));
  const [numeroDocOrigem, setNumeroDocOrigem] = useState('');
  const [linhas, setLinhas] = useState<LinhaLancamentoContabilistico[]>([
    {
      id: 'lin-init-1',
      contaCodigo: '41.1.1',
      contaDesignacao: 'Caixa Central da Secretaria',
      descricaoLinha: 'Entrada de valor em numerário',
      debitoKz: 50000,
      creditoKz: 0,
    },
    {
      id: 'lin-init-2',
      contaCodigo: '61.1.1',
      contaDesignacao: 'Propinas do Ensino Primário',
      descricaoLinha: 'Recebimento de propina referente ao mês',
      debitoKz: 0,
      creditoKz: 50000,
    },
  ]);

  // Contas disponíveis para movimento
  const contasMovimento = planoContas.filter((c) => c.tipo === 'movimento');

  // Filtragem dos lançamentos
  const filtered = lancamentos.filter((l) => {
    const matchSearch =
      l.numeroLancamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.descricaoGeral.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.numeroDocumentoOrigem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.linhas.some((lin) => lin.contaCodigo.includes(searchTerm) || lin.contaDesignacao.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchDiario = filterDiario === 'todos' || l.diarioId === filterDiario || l.diarioCodigo === filterDiario;
    const matchPeriodo = filterPeriodo === 'todos' || String(l.periodoMes) === filterPeriodo;
    const matchEstado = filterEstado === 'todos' || l.estado === filterEstado;

    return matchSearch && matchDiario && matchPeriodo && matchEstado;
  });

  // Cálculos em tempo real do formulário
  const totalDebitoForm = Math.round(linhas.reduce((acc, l) => acc + (Number(l.debitoKz) || 0), 0) * 100) / 100;
  const totalCreditoForm = Math.round(linhas.reduce((acc, l) => acc + (Number(l.creditoKz) || 0), 0) * 100) / 100;
  const diferencaForm = Math.round(Math.abs(totalDebitoForm - totalCreditoForm) * 100) / 100;
  const isFormEquilibrado = diferencaForm === 0 && totalDebitoForm > 0;

  const handleAddLinha = () => {
    const firstConta = contasMovimento[0];
    setLinhas((prev) => [
      ...prev,
      {
        id: `lin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        contaCodigo: firstConta?.codigo || '43.1.1',
        contaDesignacao: firstConta?.designacao || 'Depósitos Bancários',
        descricaoLinha: descricaoGeral || 'Movimento contabilístico',
        debitoKz: 0,
        creditoKz: 0,
      },
    ]);
  };

  const handleRemoveLinha = (id: string) => {
    if (linhas.length <= 2) {
      alert('Um lançamento em partidas dobradas deve possuir no mínimo duas linhas.');
      return;
    }
    setLinhas((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLinha = (id: string, field: keyof LinhaLancamentoContabilistico, value: any) => {
    setLinhas((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (field === 'contaCodigo') {
          const selected = contasMovimento.find((c) => c.codigo === value);
          return {
            ...l,
            contaCodigo: value,
            contaDesignacao: selected?.designacao || l.contaDesignacao,
          };
        }
        return { ...l, [field]: value };
      })
    );
  };

  const handleSubmitLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricaoGeral) {
      setOperationFeedback({ type: 'error', message: 'Por favor preencha a descrição geral do lançamento.' });
      return;
    }

    if (!isFormEquilibrado) {
      setOperationFeedback({
        type: 'error',
        message: `Lançamento rejeitado: O total de Débito (${totalDebitoForm.toLocaleString('pt-AO')} Kz) deve ser rigorosamente igual ao Crédito (${totalCreditoForm.toLocaleString('pt-AO')} Kz). Diferença: ${diferencaForm.toLocaleString('pt-AO')} Kz.`,
      });
      return;
    }

    const targetDiario = diarios.find((d) => d.id === diarioId) || diarios[0];

    const res = onAddLancamento({
      escolaId: 'esc-001',
      diarioId: targetDiario.id,
      diarioCodigo: targetDiario.codigo,
      exercicioAno: 2026,
      periodoMes: new Date(dataDocumento).getMonth() + 1,
      dataDocumento,
      dataContabilistica: dataDocumento,
      tipoDocumentoOrigem: 'manual',
      numeroDocumentoOrigem: numeroDocOrigem || `MAN-${Date.now().toString().slice(-5)}`,
      descricaoGeral,
      linhas,
      estado: 'contabilizado',
      criadoPor: 'Dr. António Bento (Contabilista OCPCA)',
    });

    if (res.success) {
      setIsNewModalOpen(false);
      setDescricaoGeral('');
      setNumeroDocOrigem('');
      setOperationFeedback({ type: 'success', message: res.message });
      setTimeout(() => setOperationFeedback(null), 4000);
    } else {
      setOperationFeedback({ type: 'error', message: res.message });
    }
  };

  const handleConfirmEstorno = () => {
    if (!estornandoLancamento) return;
    const res = onEstornarLancamento(estornandoLancamento.id, motivoEstorno);
    if (res.success) {
      setEstornandoLancamento(null);
      setMotivoEstorno('');
      setOperationFeedback({ type: 'success', message: res.message });
      setTimeout(() => setOperationFeedback(null), 4000);
    } else {
      setOperationFeedback({ type: 'error', message: res.message });
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Numero_Lancamento',
      'Data_Contabilistica',
      'Diario',
      'Doc_Origem',
      'Descricao_Geral',
      'Total_Debito_Kz',
      'Total_Credito_Kz',
      'Estado',
    ];
    const rows = filtered.map((l) => [
      l.numeroLancamento,
      l.dataContabilistica,
      l.diarioCodigo,
      l.numeroDocumentoOrigem,
      `"${l.descricaoGeral.replace(/"/g, '""')}"`,
      l.totalDebitoKz,
      l.totalCreditoKz,
      l.estado,
    ]);
    exportToCsv(`diario_geral_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Notificação de Operações */}
      {operationFeedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            operationFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {operationFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{operationFeedback.message}</span>
          </div>
          <button onClick={() => setOperationFeedback(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Ações & Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nº lançamento, conta PGC, descrição ou doc..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              />
            </div>

            <select
              value={filterDiario}
              onChange={(e) => setFilterDiario(e.target.value)}
              className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 font-medium"
            >
              <option value="todos">Todos os Diários</option>
              {diarios.map((d) => (
                <option key={d.id} value={d.codigo}>
                  {d.codigo} - {d.nome}
                </option>
              ))}
            </select>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 font-medium"
            >
              <option value="todos">Todos os Estados</option>
              <option value="contabilizado">Contabilizado</option>
              <option value="estornado">Estornado</option>
              <option value="rascunho">Rascunho</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto no-print">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              icon={<Download className="w-4 h-4" />}
            >
              Exportar CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              icon={<Printer className="w-4 h-4" />}
            >
              Imprimir Diário
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Novo Lançamento
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela do Diário Geral */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        {/* Cabeçalho oficial para impressão */}
        <div className="hidden print:block p-4 border-b-2 border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">República de Angola · Ministério das Finanças</p>
              <h2 className="text-base font-bold text-gray-900">{schoolName}</h2>
              <p className="text-xs text-gray-700 font-medium">Diário Geral de Lançamentos Contabilísticos (Partidas Dobradas PGC)</p>
            </div>
            <div className="text-right text-[10px] text-gray-600 font-mono">
              Emissão: {new Date().toLocaleDateString('pt-AO')} · Total: {filtered.length} Lançamentos
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Nº Lançamento</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Diário</th>
                <th className="py-2.5 px-3">Doc. Suporte</th>
                <th className="py-2.5 px-3">Descrição Geral</th>
                <th className="py-2.5 px-3 text-right font-mono">Total Débito</th>
                <th className="py-2.5 px-3 text-right font-mono">Total Crédito</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center no-print">Operações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lan) => (
                <tr key={lan.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">
                    {lan.numeroLancamento}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-600">{lan.dataContabilistica}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 font-semibold text-gray-700">
                      {lan.diarioCodigo}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-600">{lan.numeroDocumentoOrigem}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-900 max-w-sm truncate" title={lan.descricaoGeral}>
                    {lan.descricaoGeral}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                    {lan.totalDebitoKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                    {lan.totalCreditoKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        lan.estado === 'contabilizado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lan.estado === 'estornado'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {lan.estado}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setViewingLancamento(lan)}
                        className="p-1 rounded text-gray-600 hover:text-[#015FC4] hover:bg-blue-50"
                        title="Visualizar Partidas Dobradas"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {lan.estado === 'contabilizado' && (
                        <button
                          onClick={() => setEstornandoLancamento(lan)}
                          className="p-1 rounded text-gray-600 hover:text-rose-600 hover:bg-rose-50"
                          title="Estornar Lançamento"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VISUALIZAR LANÇAMENTO EM PARTIDAS DOBRADAS */}
      {viewingLancamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#012041] text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-blue-200 uppercase tracking-wider block">
                  Registo Contabilístico em Partidas Dobradas · {viewingLancamento.diarioCodigo}
                </span>
                <h3 className="text-base font-bold text-white">{viewingLancamento.numeroLancamento}</h3>
              </div>
              <button onClick={() => setViewingLancamento(null)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-500 block">Data Documento:</span>
                  <strong className="font-mono text-gray-900">{viewingLancamento.dataDocumento}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Data Contabilística:</span>
                  <strong className="font-mono text-gray-900">{viewingLancamento.dataContabilistica}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Doc. de Suporte:</span>
                  <strong className="font-mono text-gray-900">{viewingLancamento.numeroDocumentoOrigem}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Estado:</span>
                  <span className="font-bold text-emerald-700 uppercase">{viewingLancamento.estado}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 block">Descrição Geral da Operação:</span>
                <p className="font-semibold text-gray-900 mt-0.5">{viewingLancamento.descricaoGeral}</p>
              </div>

              {/* Tabela de Linhas de Débito e Crédito */}
              <div>
                <h4 className="font-bold text-gray-900 text-xs mb-2">Linhas de Movimento (PGC Angola):</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                        <th className="py-2 px-3">Conta PGC</th>
                        <th className="py-2 px-3">Designação da Conta</th>
                        <th className="py-2 px-3">Histórico / Descrição da Linha</th>
                        <th className="py-2 px-3 text-right font-mono">Débito (Kz)</th>
                        <th className="py-2 px-3 text-right font-mono">Crédito (Kz)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewingLancamento.linhas.map((lin) => (
                        <tr key={lin.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">{lin.contaCodigo}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-900">{lin.contaDesignacao}</td>
                          <td className="py-2.5 px-3 text-gray-600">{lin.descricaoLinha}</td>
                          <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                            {lin.debitoKz > 0 ? `${lin.debitoKz.toLocaleString('pt-AO')} Kz` : '-'}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                            {lin.creditoKz > 0 ? `${lin.creditoKz.toLocaleString('pt-AO')} Kz` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t border-gray-300">
                        <td colSpan={3} className="py-2 px-3 text-right uppercase text-[10px] text-gray-600">
                          Totais Balanceados (Equilíbrio Obrigatório):
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-800 font-bold">
                          {viewingLancamento.totalDebitoKz.toLocaleString('pt-AO')} Kz
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-800 font-bold">
                          {viewingLancamento.totalCreditoKz.toLocaleString('pt-AO')} Kz
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-gray-400 flex justify-between">
                <span>Criado por: {viewingLancamento.criadoPor} em {viewingLancamento.criadoEm}</span>
                {viewingLancamento.aprovadoPor && <span>Aprovado por: {viewingLancamento.aprovadoPor}</span>}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                Imprimir Ficha
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setViewingLancamento(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CRIAR NOVO LANÇAMENTO COM VALIDAÇÃO INTERATIVA */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 bg-gradient-to-r from-[#012041] to-[#015FC4] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">Criar Lançamento em Partidas Dobradas</h3>
                <p className="text-xs text-blue-100">
                  Validação automática e em tempo real: Débito total deve igualar o Crédito total
                </p>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLancamento} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Cabeçalho do Lançamento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Diário Contabilístico *</label>
                  <select
                    value={diarioId}
                    onChange={(e) => setDiarioId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white"
                  >
                    {diarios.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.codigo} - {d.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data Contabilística *</label>
                  <input
                    type="date"
                    value={dataDocumento}
                    onChange={(e) => setDataDocumento(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Documento de Origem / Referência</label>
                  <input
                    type="text"
                    value={numeroDocOrigem}
                    onChange={(e) => setNumeroDocOrigem(e.target.value)}
                    placeholder="Ex: FT-0921, REC-120, TRF-BAI"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Descrição Geral da Operação *</label>
                <input
                  type="text"
                  value={descricaoGeral}
                  onChange={(e) => setDescricaoGeral(e.target.value)}
                  placeholder="Ex: Pagamento de material didático da 1ª classe via caixa central..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  required
                />
              </div>

              {/* Tabela de Linhas de Partidas Dobradas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 text-xs">Linhas do Lançamento (Débito e Crédito):</h4>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddLinha}
                    icon={<Plus className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Adicionar Linha
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700 font-bold uppercase text-[10px]">
                        <th className="py-2 px-3 w-44">Conta PGC</th>
                        <th className="py-2 px-3">Descrição da Linha</th>
                        <th className="py-2 px-3 w-32 text-right">Débito (Kz)</th>
                        <th className="py-2 px-3 w-32 text-right">Crédito (Kz)</th>
                        <th className="py-2 px-2 w-10 text-center">Acção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {linhas.map((lin) => (
                        <tr key={lin.id}>
                          <td className="p-2">
                            <select
                              value={lin.contaCodigo}
                              onChange={(e) => handleUpdateLinha(lin.id, 'contaCodigo', e.target.value)}
                              className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono font-semibold"
                            >
                              {contasMovimento.map((c) => (
                                <option key={c.id} value={c.codigo}>
                                  {c.codigo} - {c.designacao.substring(0, 24)}...
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={lin.descricaoLinha}
                              onChange={(e) => handleUpdateLinha(lin.id, 'descricaoLinha', e.target.value)}
                              className="w-full p-1.5 border border-gray-200 rounded text-xs"
                              placeholder="Histórico do movimento..."
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={lin.debitoKz || ''}
                              onChange={(e) =>
                                handleUpdateLinha(
                                  lin.id,
                                  'debitoKz',
                                  Number(e.target.value) || 0
                                )
                              }
                              className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono text-right font-bold"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={lin.creditoKz || ''}
                              onChange={(e) =>
                                handleUpdateLinha(
                                  lin.id,
                                  'creditoKz',
                                  Number(e.target.value) || 0
                                )
                              }
                              className="w-full p-1.5 border border-gray-200 rounded text-xs font-mono text-right font-bold"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLinha(lin.id)}
                              className="text-gray-400 hover:text-rose-600 p-1"
                              title="Remover Linha"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Painel de Validação e Equilíbrio em Tempo Real */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                    isFormEquilibrado
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isFormEquilibrado ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <strong className="block font-bold">
                        {isFormEquilibrado
                          ? 'Partidas Dobradas Equilibradas (Pronto para Contabilizar)'
                          : 'Lançamento Desequilibrado — Rejeitado pelo Motor Contabilístico'}
                      </strong>
                      <span className="text-[11px] opacity-90">
                        {isFormEquilibrado
                          ? `Total Débito (${totalDebitoForm.toLocaleString('pt-AO')} Kz) === Total Crédito (${totalCreditoForm.toLocaleString('pt-AO')} Kz)`
                          : `Diferença a regularizar: ${diferencaForm.toLocaleString('pt-AO')} Kz`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono font-bold text-xs shrink-0">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Total Débito:</span>
                      <span className="text-gray-900">{totalDebitoForm.toLocaleString('pt-AO')} Kz</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Total Crédito:</span>
                      <span className="text-gray-900">{totalCreditoForm.toLocaleString('pt-AO')} Kz</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsNewModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!isFormEquilibrado}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Confirmar e Contabilizar Lançamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMAR ESTORNO DE LANÇAMENTO */}
      {estornandoLancamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm border-b border-gray-100 pb-2">
              <RotateCcw className="w-5 h-5" />
              <span>Estornar Lançamento {estornandoLancamento.numeroLancamento}</span>
            </div>

            <p className="text-xs text-gray-600">
              O estorno gerará automaticamente um lançamento inverso balanceado, anulando os efeitos das contas envolvidas sem eliminar o histórico da auditoria.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Motivo / Justificação do Estorno *
              </label>
              <textarea
                rows={3}
                value={motivoEstorno}
                onChange={(e) => setMotivoEstorno(e.target.value)}
                placeholder="Ex: Erro no valor faturado, duplicação ou anulação do documento..."
                className="w-full p-2.5 border border-gray-200 rounded-lg text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setEstornandoLancamento(null)}>
                Cancelar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
                onClick={handleConfirmEstorno}
              >
                Sim, Executar Estorno
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
