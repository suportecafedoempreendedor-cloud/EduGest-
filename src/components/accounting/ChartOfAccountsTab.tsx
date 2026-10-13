import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ContaPlanoPGC, ClasseContabilistica } from '../../types/accountingFinance';
import { exportToCsv } from '../../utils/hrDocumentGenerator';

interface ChartOfAccountsTabProps {
  planoContas: ContaPlanoPGC[];
  onUpdateConta: (conta: ContaPlanoPGC) => void;
  onAddConta: (conta: ContaPlanoPGC) => void;
  schoolName: string;
}

export const ChartOfAccountsTab: React.FC<ChartOfAccountsTabProps> = ({
  planoContas,
  onUpdateConta,
  onAddConta,
  schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClasse, setFilterClasse] = useState<string>('todas');
  const [filterTipo, setFilterTipo] = useState<string>('todos');

  // Modal Nova Subconta
  const [isNewContaModalOpen, setIsNewContaModalOpen] = useState(false);
  const [codigoConta, setCodigoConta] = useState('');
  const [designacaoConta, setDesignacaoConta] = useState('');
  const [classeConta, setClasseConta] = useState<ClasseContabilistica>('6_proveitos');
  const [naturezaConta, setNaturezaConta] = useState<'devedora' | 'credora'>('credora');
  const [contaPai, setContaPai] = useState('61');
  const [saldoInicialKz, setSaldoInicialKz] = useState(0);

  const classesLabels: Record<ClasseContabilistica, string> = {
    '1_meios_fixos': 'Classe 1: Meios Fixos & Investimentos',
    '2_existencias': 'Classe 2: Existências & Materiais',
    '3_terceiros': 'Classe 3: Terceiros (Clientes, Fornecedores, Estado)',
    '4_meios_monetarios': 'Classe 4: Meios Monetários (Caixa & Bancos)',
    '5_capital_reservas': 'Classe 5: Capital & Fundos Próprios',
    '6_proveitos': 'Classe 6: Proveitos por Natureza (Propinas)',
    '7_custos': 'Classe 7: Custos por Natureza (Pessoal & FSE)',
    '8_resultados': 'Classe 8: Resultados',
  };

  const filtered = planoContas.filter((c) => {
    const matchSearch =
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.designacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClasse = filterClasse === 'todas' || c.classe === filterClasse;
    const matchTipo = filterTipo === 'todos' || c.tipo === filterTipo;
    return matchSearch && matchClasse && matchTipo;
  });

  const handleCreateConta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoConta || !designacaoConta) return;

    const nova: ContaPlanoPGC = {
      id: `pgc-custom-${Date.now()}`,
      codigo: codigoConta.trim(),
      designacao: designacaoConta.trim(),
      classe: classeConta,
      tipo: 'movimento',
      natureza: naturezaConta,
      contaPaiCodigo: contaPai,
      grau: codigoConta.split('.').length + 1,
      saldoInicialDevedorKz: naturezaConta === 'devedora' ? saldoInicialKz : 0,
      saldoInicialCredorKz: naturezaConta === 'credora' ? saldoInicialKz : 0,
      saldoAtualKz: naturezaConta === 'devedora' ? saldoInicialKz : -saldoInicialKz,
      totalDebitosKz: 0,
      totalCreditosKz: 0,
      aceitaCentroCusto: true,
      activa: true,
    };

    onAddConta(nova);
    setIsNewContaModalOpen(false);
    setCodigoConta('');
    setDesignacaoConta('');
    setSaldoInicialKz(0);
  };

  const handleExportCsv = () => {
    const headers = [
      'Codigo_PGC',
      'Designacao',
      'Classe',
      'Tipo_Conta',
      'Natureza',
      'Saldo_Inicial_Devedor_Kz',
      'Saldo_Inicial_Credor_Kz',
      'Total_Debitos_Kz',
      'Total_Creditos_Kz',
      'Saldo_Atual_Kz',
    ];
    const rows = filtered.map((c) => [
      c.codigo,
      `"${c.designacao.replace(/"/g, '""')}"`,
      c.classe,
      c.tipo,
      c.natureza,
      c.saldoInicialDevedorKz,
      c.saldoInicialCredorKz,
      c.totalDebitosKz,
      c.totalCreditosKz,
      c.saldoAtualKz,
    ]);
    exportToCsv(`plano_contas_pgc_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Filtros e Barra de Ações */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por código (ex: 61.1.1) ou designação..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              />
            </div>

            <select
              value={filterClasse}
              onChange={(e) => setFilterClasse(e.target.value)}
              className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 font-medium"
            >
              <option value="todas">Todas as Classes PGC (1 a 8)</option>
              {Object.entries(classesLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 font-medium"
            >
              <option value="todos">Todas (Agregadoras e Movimento)</option>
              <option value="movimento">Apenas Contas de Movimento</option>
              <option value="agregadora">Apenas Contas Agregadoras</option>
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
              Imprimir Plano
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewContaModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Nova Subconta
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela do Plano de Contas */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        {/* Cabeçalho oficial para impressão */}
        <div className="hidden print:block p-4 border-b-2 border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">República de Angola · Ministério das Finanças / AGT</p>
              <h2 className="text-base font-bold text-gray-900">{schoolName}</h2>
              <p className="text-xs text-gray-700 font-medium">Plano Geral de Contabilidade de Angola (PGC Institucional)</p>
            </div>
            <div className="text-right text-[10px] text-gray-600 font-mono">
              Emissão: {new Date().toLocaleDateString('pt-AO')} · Total: {filtered.length} Contas
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3 w-28">Código PGC</th>
                <th className="py-2.5 px-3">Designação da Conta</th>
                <th className="py-2.5 px-3">Classe</th>
                <th className="py-2.5 px-3 text-center">Tipo</th>
                <th className="py-2.5 px-3 text-center">Natureza</th>
                <th className="py-2.5 px-3 text-right font-mono">Saldo Inicial</th>
                <th className="py-2.5 px-3 text-right font-mono">Débitos Kz</th>
                <th className="py-2.5 px-3 text-right font-mono">Créditos Kz</th>
                <th className="py-2.5 px-3 text-right font-mono">Saldo Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map((c) => {
                const isAgregadora = c.tipo === 'agregadora';
                return (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      isAgregadora ? 'bg-slate-50/50 font-bold text-gray-900' : 'hover:bg-blue-50/20 text-gray-800'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">
                      {c.codigo}
                    </td>
                    <td className="py-2.5 px-3" style={{ paddingLeft: `${Math.max(12, c.grau * 12)}px` }}>
                      <div className="flex items-center gap-1.5">
                        {isAgregadora && <FolderTree className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                        <span>{c.designacao}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-gray-500">
                      {classesLabels[c.classe]?.split(':')[0] || c.classe}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isAgregadora ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-[#015FC4]'
                        }`}
                      >
                        {c.tipo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center capitalize text-gray-600 text-[11px]">
                      {c.natureza}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-gray-700">
                      {(c.saldoInicialDevedorKz || c.saldoInicialCredorKz).toLocaleString('pt-AO')} Kz
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-emerald-700 font-semibold">
                      {c.totalDebitosKz > 0 ? `${c.totalDebitosKz.toLocaleString('pt-AO')} Kz` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right text-rose-700 font-semibold">
                      {c.totalCreditosKz > 0 ? `${c.totalCreditosKz.toLocaleString('pt-AO')} Kz` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                      {Math.abs(c.saldoAtualKz).toLocaleString('pt-AO')} Kz
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVA SUBCONTA PGC */}
      {isNewContaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-[#012041]">Criar Nova Subconta (PGC Angola)</h3>
              <button onClick={() => setIsNewContaModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConta} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Classe Contabilística *</label>
                <select
                  value={classeConta}
                  onChange={(e) => setClasseConta(e.target.value as ClasseContabilistica)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                >
                  {Object.entries(classesLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Código da Subconta * (Ex: 61.1.3)</label>
                <input
                  type="text"
                  value={codigoConta}
                  onChange={(e) => setCodigoConta(e.target.value)}
                  placeholder="Ex: 61.1.3"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Designação da Conta *</label>
                <input
                  type="text"
                  value={designacaoConta}
                  onChange={(e) => setDesignacaoConta(e.target.value)}
                  placeholder="Ex: Propinas do Curso de Saúde..."
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Natureza do Saldo</label>
                  <select
                    value={naturezaConta}
                    onChange={(e) => setNaturezaConta(e.target.value as any)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="credora">Credora (Proveitos/Passivo)</option>
                    <option value="devedora">Devedora (Custos/Activo)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Saldo Inicial (Kz)</label>
                  <input
                    type="number"
                    min={0}
                    value={saldoInicialKz}
                    onChange={(e) => setSaldoInicialKz(Number(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsNewContaModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                  Criar Subconta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
