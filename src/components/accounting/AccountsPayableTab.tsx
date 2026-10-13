import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Calendar,
  CreditCard,
  DollarSign,
  X,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FornecedorFinanceiro, FaturaPagar, ContaBancaria } from '../../types/accountingFinance';
import { exportToCsv } from '../../utils/hrDocumentGenerator';

interface AccountsPayableTabProps {
  fornecedores: FornecedorFinanceiro[];
  faturasPagar: FaturaPagar[];
  contasBancarias: ContaBancaria[];
  onLiquidarFatura: (
    faturaId: string,
    valorPagoKz: number,
    metodo: 'transferencia_bancaria' | 'caixa_numerario',
    bancoOrigemId: string
  ) => { success: boolean; message: string };
  onAddFornecedor: (forn: FornecedorFinanceiro) => void;
  onAddFaturaPagar: (fatura: FaturaPagar) => { success: boolean; message: string };
  schoolName: string;
}

export const AccountsPayableTab: React.FC<AccountsPayableTabProps> = ({
  fornecedores,
  faturasPagar,
  contasBancarias,
  onLiquidarFatura,
  onAddFornecedor,
  onAddFaturaPagar,
  schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  // Modais
  const [liquidandoFatura, setLiquidandoFatura] = useState<FaturaPagar | null>(null);
  const [isNovoFornecedorOpen, setIsNovoFornecedorOpen] = useState(false);
  const [isNovaFaturaOpen, setIsNovaFaturaOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Liquidação
  const [valorLiquidacaoKz, setValorLiquidacaoKz] = useState(0);
  const [metodoPagamento, setMetodoPagamento] = useState<'transferencia_bancaria' | 'caixa_numerario'>('transferencia_bancaria');
  const [bancoOrigemId, setBancoOrigemId] = useState(contasBancarias[0]?.id || 'bnc-01');

  // Form Novo Fornecedor
  const [novoNomeForn, setNovoNomeForn] = useState('');
  const [novoNifForn, setNovoNifForn] = useState('');
  const [novoTelForn, setNovoTelForn] = useState('+244 9');
  const [novoIbanForn, setNovoIbanForn] = useState('AO06 ');
  const [novoBancoForn, setNovoBancoForn] = useState('BAI');
  const [novaCategoriaForn, setNovaCategoriaForn] = useState<FornecedorFinanceiro['categoria']>('livros_material');

  // Form Nova Fatura
  const [faturaFornId, setFaturaFornId] = useState(fornecedores[0]?.id || 'forn-01');
  const [faturaNumOriginal, setFaturaNumOriginal] = useState('');
  const [faturaDataEmissao, setFaturaDataEmissao] = useState(new Date().toISOString().substring(0, 10));
  const [faturaDataVencimento, setFaturaDataVencimento] = useState('2026-04-15');
  const [faturaValorBase, setFaturaValorBase] = useState(150000);
  const [faturaDescricao, setFaturaDescricao] = useState('');

  const filtered = faturasPagar.filter((f) => {
    const matchSearch =
      f.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.numeroFaturaOriginal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.numeroRegistoInterno.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'todos' || f.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const totalEmAbertoKz = faturasPagar
    .filter((f) => f.estado !== 'paga' && f.estado !== 'cancelada')
    .reduce((acc, f) => acc + f.saldoPendenteKz, 0);

  const handleSubmeterLiquidacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liquidandoFatura) return;

    const res = onLiquidarFatura(
      liquidandoFatura.id,
      valorLiquidacaoKz,
      metodoPagamento,
      bancoOrigemId
    );

    if (res.success) {
      setLiquidandoFatura(null);
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleCriarFornecedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomeForn || !novoNifForn) return;

    const novo: FornecedorFinanceiro = {
      id: `forn-${Date.now()}`,
      escolaId: 'esc-001',
      codigoFornecedor: `FORN-${Math.floor(100 + Math.random() * 900)}`,
      nomeRazaoSocial: novoNomeForn,
      nif: novoNifForn,
      categoria: novaCategoriaForn,
      telefone: novoTelForn,
      email: `${novoNomeForn.toLowerCase().replace(/\s+/g, '')}@fornecedor.ao`,
      ibanPagamento: novoIbanForn,
      banco: novoBancoForn,
      morada: 'Luanda, Angola',
      saldoDevedorKz: 0,
      contaContabilisticaPGC: '32.1.1.009',
      activa: true,
    };

    onAddFornecedor(novo);
    setIsNovoFornecedorOpen(false);
    setNovoNomeForn('');
    setNovoNifForn('');
    setFeedback({ type: 'success', message: `Fornecedor ${novo.nomeRazaoSocial} cadastrado com sucesso.` });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCriarFatura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faturaNumOriginal) return;

    // Prevenção de faturas duplicadas
    const exists = faturasPagar.some(
      (f) => f.fornecedorId === faturaFornId && f.numeroFaturaOriginal.toLowerCase() === faturaNumOriginal.toLowerCase()
    );
    if (exists) {
      setFeedback({
        type: 'error',
        message: 'Aviso de Integridade: Já existe uma fatura deste fornecedor com o mesmo número original registada no sistema!',
      });
      return;
    }

    const forn = fornecedores.find((f) => f.id === faturaFornId);

    const nova: FaturaPagar = {
      id: `fatp-${Date.now()}`,
      escolaId: 'esc-001',
      fornecedorId: faturaFornId,
      fornecedorNome: forn?.nomeRazaoSocial || 'Fornecedor',
      fornecedorNif: forn?.nif || '5400000000',
      numeroFaturaOriginal: faturaNumOriginal,
      numeroRegistoInterno: `COMP-2026/${Math.floor(1000 + Math.random() * 9000)}`,
      dataEmissaoFatura: faturaDataEmissao,
      dataEntradaRegisto: new Date().toISOString().substring(0, 10),
      dataVencimento: faturaDataVencimento,
      valorBaseKz: faturaValorBase,
      valorIvaSuportadoKz: 0,
      taxaIvaPercent: 0,
      valorRetencaoFonteKz: 0,
      taxaRetencaoFontePercent: 0,
      valorTotalLiquidoPagarKz: faturaValorBase,
      valorPagoKz: 0,
      saldoPendenteKz: faturaValorBase,
      contaCustoPGC: '75.4.1',
      descricaoServicoMaterial: faturaDescricao || 'Aquisição de materiais pedagógicos e expediente',
      estado: 'aprovada',
    };

    const res = onAddFaturaPagar(nova);
    if (res.success) {
      setIsNovaFaturaOpen(false);
      setFaturaNumOriginal('');
      setFaturaDescricao('');
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'N_Registo_Interno',
      'Fornecedor',
      'NIF',
      'Fatura_Original',
      'Emissao',
      'Vencimento',
      'Total_Kz',
      'Valor_Pago_Kz',
      'Saldo_Pendente_Kz',
      'Estado',
    ];
    const rows = filtered.map((f) => [
      f.numeroRegistoInterno,
      `"${f.fornecedorNome.replace(/"/g, '""')}"`,
      f.fornecedorNif,
      f.numeroFaturaOriginal,
      f.dataEmissaoFatura,
      f.dataVencimento,
      f.valorTotalLiquidoPagarKz,
      f.valorPagoKz,
      f.saldoPendenteKz,
      f.estado,
    ]);
    exportToCsv(`contas_pagar_fornecedores_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Resumo de Dívidas a Fornecedores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-600">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Total a Pagar a Fornecedores</span>
          <div className="text-xl font-bold font-mono text-gray-900 mt-1">
            {totalEmAbertoKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-[#015FC4]">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Fornecedores Homologados</span>
          <div className="text-xl font-bold font-mono text-gray-900 mt-1">
            {fornecedores.length} <span className="text-xs font-sans text-gray-500">entidades</span>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Faturas em Aberto</span>
          <div className="text-xl font-bold font-mono text-gray-900 mt-1">
            {faturasPagar.filter((f) => f.estado !== 'paga').length} <span className="text-xs font-sans text-gray-500">faturas</span>
          </div>
        </Card>
      </div>

      {/* Barra de Filtros e Acções */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por fornecedor, fatura original ou registo interno..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
              />
            </div>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 font-medium"
            >
              <option value="todos">Todos os Estados</option>
              <option value="aprovada">Aprovada / Por Pagar</option>
              <option value="paga_parcial">Paga Parcialmente</option>
              <option value="paga">Totalmente Paga</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto no-print">
            <Button variant="secondary" size="sm" onClick={handleExportCsv} icon={<Download className="w-4 h-4" />}>
              Exportar CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsNovoFornecedorOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Novo Fornecedor
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsNovaFaturaOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Registar Fatura de Compra
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela de Contas a Pagar */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Registo Interno</th>
                <th className="py-2.5 px-3">Fornecedor</th>
                <th className="py-2.5 px-3">NIF</th>
                <th className="py-2.5 px-3">Nº Fatura Original</th>
                <th className="py-2.5 px-3">Vencimento</th>
                <th className="py-2.5 px-3 text-right font-mono">Valor Total</th>
                <th className="py-2.5 px-3 text-right font-mono">Valor Pago</th>
                <th className="py-2.5 px-3 text-right font-mono">Saldo Devedor</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center no-print">Liquidação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">{f.numeroRegistoInterno}</td>
                  <td className="py-2.5 px-3 font-bold text-gray-900">{f.fornecedorNome}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-600">{f.fornecedorNif}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-700">{f.numeroFaturaOriginal}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-600">{f.dataVencimento}</td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                    {f.valorTotalLiquidoPagarKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-emerald-700">
                    {f.valorPagoKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-rose-700">
                    {f.saldoPendenteKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        f.estado === 'paga'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.estado === 'paga_parcial'
                          ? 'bg-blue-100 text-[#015FC4]'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {f.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center no-print">
                    {f.saldoPendenteKz > 0 ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setLiquidandoFatura(f);
                          setValorLiquidacaoKz(f.saldoPendenteKz);
                        }}
                        className="text-[11px] py-1"
                      >
                        Pagar
                      </Button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700">Liquidada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: LIQUIDAR FATURA DE FORNECEDOR */}
      {liquidandoFatura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div>
                <h3 className="font-bold text-sm text-[#012041]">Pagar Fatura de Fornecedor</h3>
                <span className="text-[10px] text-gray-500">{liquidandoFatura.fornecedorNome}</span>
              </div>
              <button onClick={() => setLiquidandoFatura(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmeterLiquidacao} className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-gray-700 border border-gray-200">
                <div className="flex justify-between">
                  <span>Fatura Ref:</span>
                  <strong className="font-mono">{liquidandoFatura.numeroFaturaOriginal}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Saldo Pendente:</span>
                  <strong className="font-mono text-rose-700 font-bold">
                    {liquidandoFatura.saldoPendenteKz.toLocaleString('pt-AO')} Kz
                  </strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Montante a Pagar (Kz) *</label>
                <input
                  type="number"
                  min={1}
                  max={liquidandoFatura.saldoPendenteKz}
                  value={valorLiquidacaoKz}
                  onChange={(e) => setValorLiquidacaoKz(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold text-base"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Meio de Liquidação *</label>
                <select
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value as any)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold"
                >
                  <option value="transferencia_bancaria">Transferência Bancária (Banco BAI)</option>
                  <option value="caixa_numerario">Caixa Central da Secretaria (Numerário)</option>
                </select>
              </div>

              {metodoPagamento === 'transferencia_bancaria' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Conta Bancária de Saída *</label>
                  <select
                    value={bancoOrigemId}
                    onChange={(e) => setBancoOrigemId(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
                  >
                    {contasBancarias.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bancoNome} - Saldo: {b.saldoContabilisticoKz.toLocaleString('pt-AO')} Kz
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <p className="text-[10px] text-blue-700 bg-blue-50 p-2 rounded-lg">
                Esta liquidação gera automaticamente o lançamento contábil em partidas dobradas (Débito: 32.1.1 / Crédito: Banco ou Caixa).
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setLiquidandoFatura(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<CheckCircle2 className="w-4 h-4" />}>
                  Confirmar Pagamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NOVO FORNECEDOR */}
      {isNovoFornecedorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-[#012041]">Cadastrar Novo Fornecedor</h3>
              <button onClick={() => setIsNovoFornecedorOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarFornecedor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Razão Social / Nome da Empresa *</label>
                <input
                  type="text"
                  value={novoNomeForn}
                  onChange={(e) => setNovoNomeForn(e.target.value)}
                  placeholder="Ex: Papelaria & Livraria Luanda Lda"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">NIF Angolano (10 dígitos) *</label>
                <input
                  type="text"
                  value={novoNifForn}
                  onChange={(e) => setNovoNifForn(e.target.value)}
                  placeholder="Ex: 5412098451"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">IBAN para Pagamentos *</label>
                <input
                  type="text"
                  value={novoIbanForn}
                  onChange={(e) => setNovoIbanForn(e.target.value)}
                  placeholder="AO06 0040 0000 1234 5678 9012 3"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsNovoFornecedorOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Gravar Fornecedor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTAR FATURA DE COMPRA */}
      {isNovaFaturaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-[#012041]">Registar Fatura de Fornecedor</h3>
              <button onClick={() => setIsNovaFaturaOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarFatura} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Fornecedor *</label>
                <select
                  value={faturaFornId}
                  onChange={(e) => setFaturaFornId(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                >
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nomeRazaoSocial} (NIF: {f.nif})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nº da Fatura Original do Fornecedor *</label>
                <input
                  type="text"
                  value={faturaNumOriginal}
                  onChange={(e) => setFaturaNumOriginal(e.target.value)}
                  placeholder="Ex: FT 2026/0942"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    value={faturaDataEmissao}
                    onChange={(e) => setFaturaDataEmissao(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={faturaDataVencimento}
                    onChange={(e) => setFaturaDataVencimento(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Valor Total a Pagar (Kz) *</label>
                <input
                  type="number"
                  min={1}
                  value={faturaValorBase}
                  onChange={(e) => setFaturaValorBase(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold text-base"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Descrição dos Materiais / Serviços</label>
                <input
                  type="text"
                  value={faturaDescricao}
                  onChange={(e) => setFaturaDescricao(e.target.value)}
                  placeholder="Ex: Material escolar para o Iº Ciclo..."
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsNovaFaturaOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Registar Fatura
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
