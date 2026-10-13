import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  Layers,
  ChevronRight,
  TrendingUp,
  Sliders,
  Award,
  Sparkles,
  ShieldCheck,
  Tag,
  ArrowDownUp,
  Receipt,
  FileSpreadsheet,
  Calculator,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import {
  Student,
  Pagamento,
  TipoCobranca,
  EstadoLancamentoConta,
  ItemTabelaPreco,
  RegraCobrancaMulta,
  BeneficioRegra,
  PlanoPagamento,
  LancamentoContaCorrente,
  ResumoContaCorrenteAluno,
} from '../types';
import {
  METADATA_TIPOS_COBRANCA,
  INITIAL_TABELA_PRECOS,
  INITIAL_REGRAS_MULTAS,
  INITIAL_BENEFICIOS,
  INITIAL_PLANOS_PAGAMENTO,
  INITIAL_LANCAMENTOS_CONTA_CORRENTE,
} from '../data/mockFinancialBillingData';
import { NovoLancamentoModal } from './financial/NovoLancamentoModal';
import { LiquidarLancamentoModal } from './financial/LiquidarLancamentoModal';
import { exportToCsv } from '../utils/documentExportUtils';

interface FinancialViewProps {
  payments: Pagamento[];
  students: Student[];
  onOpenNewPayment: () => void;
  selectedSchoolName: string;
  onNavigateToAccounting?: () => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  payments,
  students,
  onOpenNewPayment,
  selectedSchoolName,
  onNavigateToAccounting,
}) => {
  // Aba activa: 'conta_corrente' | 'tabela_precos' | 'regras_cobranca' | 'beneficios' | 'planos' | 'relatorios' | 'historico_recibos'
  const [activeTab, setActiveTab] = useState<
    'conta_corrente' | 'tabela_precos' | 'regras_cobranca' | 'beneficios' | 'planos' | 'relatorios' | 'historico_recibos'
  >('conta_corrente');

  // Estados locais das configurações e lançamentos
  const [lancamentos, setLancamentos] = useState<LancamentoContaCorrente[]>(
    INITIAL_LANCAMENTOS_CONTA_CORRENTE
  );
  const [tabelaPrecos, setTabelaPrecos] = useState<ItemTabelaPreco[]>(INITIAL_TABELA_PRECOS);
  const [regrasMultas, setRegrasMultas] = useState<RegraCobrancaMulta[]>(INITIAL_REGRAS_MULTAS);
  const [beneficios, setBeneficios] = useState<BeneficioRegra[]>(INITIAL_BENEFICIOS);
  const [planosPagamento, setPlanosPagamento] = useState<PlanoPagamento[]>(INITIAL_PLANOS_PAGAMENTO);

  // Filtros na Conta Corrente
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('todos');
  const [filterTipoCobranca, setFilterTipoCobranca] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modais de operação
  const [isNovoLancamentoOpen, setIsNovoLancamentoOpen] = useState(false);
  const [liquidandoLancamento, setLiquidandoLancamento] = useState<LancamentoContaCorrente | null>(null);
  const [selectedStudentDetalhes, setSelectedStudentDetalhes] = useState<Student | null>(null);

  // Filtragem dos lançamentos da Conta Corrente
  const filteredLancamentos = useMemo(() => {
    return lancamentos.filter((lan) => {
      const matchAluno =
        selectedStudentFilter === 'todos' || lan.studentId === selectedStudentFilter;
      const matchTipo =
        filterTipoCobranca === 'todos' || lan.tipoCobranca === filterTipoCobranca;
      const matchEstado = filterEstado === 'todos' || lan.estado === filterEstado;
      const matchSearch =
        lan.studentNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lan.studentProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lan.titulo.toLowerCase().includes(searchTerm.toLowerCase());

      return matchAluno && matchTipo && matchEstado && matchSearch;
    });
  }, [lancamentos, selectedStudentFilter, filterTipoCobranca, filterEstado, searchTerm]);

  // Totais consolidados
  const totalDebitosGlobal = useMemo(() => {
    return lancamentos.reduce((acc, curr) => acc + curr.valorTotalDevidoKz, 0);
  }, [lancamentos]);

  const totalCreditosLiquidadosGlobal = useMemo(() => {
    return lancamentos.reduce((acc, curr) => acc + curr.valorPagoKz, 0);
  }, [lancamentos]);

  const totalSaldoDevedorGlobal = useMemo(() => {
    return lancamentos.reduce((acc, curr) => acc + curr.saldoDevedorKz, 0);
  }, [lancamentos]);

  const totalMultasGlobal = useMemo(() => {
    return lancamentos.reduce((acc, curr) => acc + curr.valorMultaKz, 0);
  }, [lancamentos]);

  // Contagem por estado
  const contagemEstados = useMemo(() => {
    const pendente = lancamentos.filter((l) => l.estado === 'pendente').length;
    const parcial = lancamentos.filter((l) => l.estado === 'parcialmente_pago').length;
    const pago = lancamentos.filter((l) => l.estado === 'pago').length;
    const vencido = lancamentos.filter((l) => l.estado === 'vencido').length;
    const cancelado = lancamentos.filter((l) => l.estado === 'cancelado').length;
    return { pendente, parcial, pago, vencido, cancelado };
  }, [lancamentos]);

  // Handler para criar novo lançamento
  const handleCriarLancamento = (novo: LancamentoContaCorrente) => {
    setLancamentos((prev) => [novo, ...prev]);
  };

  // Handler para liquidar/amortizar lançamento
  const handleConfirmarLiquidacao = (
    lancamentoId: string,
    valorPago: number,
    metodo: string,
    referencia: string
  ) => {
    const reciboNumero = `RC-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    setLancamentos((prev) =>
      prev.map((item) => {
        if (item.id !== lancamentoId) return item;
        const novoTotalPago = item.valorPagoKz + valorPago;
        const novoSaldo = Math.max(0, item.valorTotalDevidoKz - novoTotalPago);
        const novoEstado: EstadoLancamentoConta =
          novoSaldo === 0 ? 'pago' : 'parcialmente_pago';

        const recibosActualizados = [
          ...(item.recibosVinculados || []),
          {
            pagamentoId: `pay-${Date.now()}`,
            reciboNumero,
            dataPagamento: new Date().toISOString().split('T')[0],
            valorLiquidadoKz: valorPago,
            metodo,
          },
        ];

        return {
          ...item,
          valorPagoKz: novoTotalPago,
          saldoDevedorKz: novoSaldo,
          estado: novoEstado,
          recibosVinculados: recibosActualizados,
        };
      })
    );
  };

  // Exportar Conta Corrente para Excel
  const handleExportContaCorrenteExcel = () => {
    const headers = [
      'Aluno',
      'Processo',
      'Turma',
      'Tipo de Cobrança',
      'Descrição',
      'Vencimento',
      'Valor Original (Kz)',
      'Desconto/Bolsa (Kz)',
      'Multa (Kz)',
      'Total Devido (Kz)',
      'Valor Pago (Kz)',
      'Saldo Devedor (Kz)',
      'Estado',
    ];

    const rows = filteredLancamentos.map((l) => [
      l.studentNome,
      l.studentProcesso,
      l.turmaNome,
      METADATA_TIPOS_COBRANCA[l.tipoCobranca]?.label || l.tipoCobranca,
      l.titulo,
      l.dataVencimento,
      l.valorOriginalKz,
      l.valorDescontoBolsaKz,
      l.valorMultaKz,
      l.valorTotalDevidoKz,
      l.valorPagoKz,
      l.saldoDevedorKz,
      l.estado.toUpperCase(),
    ]);

    exportToCsv(
      `conta_corrente_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  // Helper de badges de estado
  const renderEstadoBadge = (estado: EstadoLancamentoConta) => {
    switch (estado) {
      case 'pago':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Pago
          </span>
        );
      case 'parcialmente_pago':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            Parcialmente Pago
          </span>
        );
      case 'vencido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Vencido
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          CABEÇALHO OFICIAL: GESTÃO FINANCEIRA & CONTAS CORRENTES
         ======================================================== */}
      <div className="bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] rounded-xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
            <span>{selectedSchoolName}</span>
            <span aria-hidden="true">·</span>
            <span>Módulo de Facturação, Tabela de Preços & Contas Correntes</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestão Financeira & Tesouraria Escolar
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed max-w-3xl">
            Controlo de contas correntes individualizadas por estudante com apuramento de débitos,
            créditos, liquidações por Multicaixa/TPA, descontos de família, bolsas de estudo (INAGBE/mérito),
            isenções e gestão automatizada de multas e planos de pagamento.
          </p>

          {/* Abas de Navegação Financeira */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('conta_corrente')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'conta_corrente'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Contas Correntes ({lancamentos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tabela_precos')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'tabela_precos'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Tabela de Preços (12 Tipos)</span>
            </button>

            <button
              onClick={() => setActiveTab('regras_cobranca')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'regras_cobranca'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Regras de Cobrança & Multas</span>
            </button>

            <button
              onClick={() => setActiveTab('beneficios')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'beneficios'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Descontos, Bolsas & Isenções</span>
            </button>

            <button
              onClick={() => setActiveTab('planos')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'planos'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Planos de Pagamento</span>
            </button>

            <button
              onClick={() => setActiveTab('relatorios')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'relatorios'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Relatórios Financeiros</span>
            </button>

            {onNavigateToAccounting && (
              <button
                onClick={onNavigateToAccounting}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm cursor-pointer ml-auto"
                title="Aceder ao Módulo de Contabilidade Geral, PGC Angola, Diários e SAF-T"
              >
                <Calculator className="w-4 h-4" />
                <span>Contabilidade Geral PGC &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* Métricas Globais da Tesouraria */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-blue-300 block">Total Liquidado (Créditos)</span>
            <span className="text-base font-bold text-white font-mono mt-0.5 block">
              {totalCreditosLiquidadosGlobal.toLocaleString('pt-AO')} Kz
            </span>
            <span className="text-[10px] text-emerald-300">Recebimento confirmado</span>
          </div>

          <div>
            <span className="text-blue-300 block">Saldo a Receber (Débitos)</span>
            <span className="text-base font-bold text-amber-300 font-mono mt-0.5 block">
              {totalSaldoDevedorGlobal.toLocaleString('pt-AO')} Kz
            </span>
            <span className="text-[10px] text-amber-200">
              {contagemEstados.pendente + contagemEstados.vencido} itens em aberto
            </span>
          </div>

          <div>
            <span className="text-blue-300 block">Multas Acumuladas</span>
            <span className="text-base font-bold text-rose-300 font-mono mt-0.5 block">
              {totalMultasGlobal.toLocaleString('pt-AO')} Kz
            </span>
            <span className="text-[10px] text-rose-200">{contagemEstados.vencido} mensalidades vencidas</span>
          </div>

          <div>
            <span className="text-blue-300 block">Volume Total Faturado</span>
            <span className="text-base font-bold text-white font-mono mt-0.5 block">
              {totalDebitosGlobal.toLocaleString('pt-AO')} Kz
            </span>
            <span className="text-[10px] text-blue-200">Ano lectivo 2025/2026</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          ABA 1: CONTA CORRENTE DOS ALUNOS
         ======================================================== */}
      {activeTab === 'conta_corrente' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6 space-y-4">
              {/* Barra de Filtros e Ações */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Busca */}
                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar por aluno, processo ou item..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                    />
                  </div>

                  {/* Filtro por Aluno Específico */}
                  <select
                    value={selectedStudentFilter}
                    onChange={(e) => setSelectedStudentFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                  >
                    <option value="todos">Todos os Alunos</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nomeCompleto} ({st.processo})
                      </option>
                    ))}
                  </select>

                  {/* Filtro por Tipo de Cobrança */}
                  <select
                    value={filterTipoCobranca}
                    onChange={(e) => setFilterTipoCobranca(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                  >
                    <option value="todos">Todos os 12 Tipos</option>
                    {Object.entries(METADATA_TIPOS_COBRANCA).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>

                  {/* Filtro por Estado */}
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                  >
                    <option value="todos">Todos os Estados</option>
                    <option value="pendente">Pendente</option>
                    <option value="parcialmente_pago">Parcialmente Pago</option>
                    <option value="pago">Pago</option>
                    <option value="vencido">Vencido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={handleExportContaCorrenteExcel}
                  >
                    Exportar Excel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setIsNovoLancamentoOpen(true)}
                  >
                    Novo Débito / Encargo
                  </Button>
                </div>
              </div>

              {/* Tabela da Conta Corrente */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Aluno / Processo</th>
                      <th className="py-3 px-4">Tipo & Descrição</th>
                      <th className="py-3 px-4">Vencimento</th>
                      <th className="py-3 px-4 text-right">Valor Nominal</th>
                      <th className="py-3 px-4 text-right">Multa</th>
                      <th className="py-3 px-4 text-right">Total Devido</th>
                      <th className="py-3 px-4 text-right">Liquidado</th>
                      <th className="py-3 px-4 text-right">Saldo Devedor</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLancamentos.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/25 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{item.studentNome}</div>
                          <div className="text-[11px] text-gray-500">
                            {item.studentProcesso} · {item.turmaNome}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-900">{item.titulo}</span>
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <span className="capitalize font-semibold text-[#015FC4]">
                              {METADATA_TIPOS_COBRANCA[item.tipoCobranca]?.label || item.tipoCobranca}
                            </span>
                            {item.beneficioAplicadoNome && (
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                                · {item.beneficioAplicadoNome}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-gray-600 font-mono">
                          {item.dataVencimento}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-gray-700">
                          {item.valorOriginalKz.toLocaleString('pt-AO')} Kz
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right font-mono text-rose-600">
                          {item.valorMultaKz > 0
                            ? `+ ${item.valorMultaKz.toLocaleString('pt-AO')} Kz`
                            : '---'}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-gray-900">
                          {item.valorTotalDevidoKz.toLocaleString('pt-AO')} Kz
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-semibold text-emerald-700">
                          {item.valorPagoKz > 0
                            ? `${item.valorPagoKz.toLocaleString('pt-AO')} Kz`
                            : '---'}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold">
                          {item.saldoDevedorKz > 0 ? (
                            <span className="text-rose-700">
                              {item.saldoDevedorKz.toLocaleString('pt-AO')} Kz
                            </span>
                          ) : (
                            <span className="text-gray-400">0 Kz</span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          {renderEstadoBadge(item.estado)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          {item.saldoDevedorKz > 0 ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs"
                              onClick={() => setLiquidandoLancamento(item)}
                            >
                              Liquidar
                            </Button>
                          ) : (
                            <span className="text-[11px] text-gray-400">Liquidado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================
          ABA 2: TABELA DE PREÇOS (12 TIPOS DE COBRANÇA)
         ======================================================== */}
      {activeTab === 'tabela_precos' && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-[#012041]">
                  Tabela Oficial de Preços & Emolumentos
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Catálogo homologado cobrindo todos os 12 tipos de cobrança escolares da instituição.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tabelaPrecos.map((item) => {
                const meta = METADATA_TIPOS_COBRANCA[item.tipoCobranca];
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#015FC4] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#015FC4]">
                          {meta?.label || item.tipoCobranca}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
                          Vence dia {item.diaVencimentoPadrao}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-[#012041] mb-1">{item.nome}</h3>
                      <p className="text-xs text-gray-500 mb-3">{meta?.descricao}</p>

                      <div className="text-xs text-gray-600 space-y-1 mb-4">
                        <div>
                          <span className="text-gray-400">Periodicidade:</span>{' '}
                          <span className="font-semibold capitalize">{item.periodicidade}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Classes:</span>{' '}
                          <span className="font-semibold">{item.classesAplicaveis.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-gray-400 block font-semibold">
                          Valor Base
                        </span>
                        <span className="text-base font-extrabold text-[#012041] font-mono">
                          {item.valorBaseKz.toLocaleString('pt-AO')} Kz
                        </span>
                      </div>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        Activo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 3: REGRAS DE COBRANÇA & MULTAS
         ======================================================== */}
      {activeTab === 'regras_cobranca' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#012041]">
                Regras de Cobrança, Prazos de Tolerância e Multas
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Parâmetros automáticos de mora aplicados pelo motor financeiro EduGest após expiração dos dias úteis de tolerância.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regrasMultas.map((regra) => (
                <div key={regra.id} className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#012041] uppercase tracking-wide">
                      {regra.nome}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Activa
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{regra.descricao}</p>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 text-xs">
                    <div>
                      <span className="text-gray-500 block">Dias de Tolerância:</span>
                      <span className="font-bold text-gray-900">{regra.diasTolerancia} dias pós-vencimento</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Tipo de Encargo:</span>
                      <span className="font-bold text-gray-900 capitalize">
                        {regra.tipoMulta === 'percentagem_fixa'
                          ? `${regra.valorPercentualMulta}% sobre a propina`
                          : `${regra.valorFixoMultaKz.toLocaleString('pt-AO')} Kz fixo`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 4: DESCONTOS, BOLSAS & ISENÇÕES
         ======================================================== */}
      {activeTab === 'beneficios' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#012041]">
                Políticas de Descontos, Bolsas de Estudo & Isenções
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Quadro de benefícios por fraternidade familiar, mérito académico (quadro de honra), bolsas estatais INAGBE e funcionários.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beneficios.map((ben) => (
                <div key={ben.id} className="p-5 rounded-xl border border-gray-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#012041]">{ben.nome}</span>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase">
                      {ben.tipo}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{ben.descricao}</p>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block">Abatimento:</span>
                      <span className="font-bold text-emerald-700 text-sm font-mono">
                        {ben.percentualDesconto}% de Desconto
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Aplicável a:</span>
                      <span className="font-semibold text-gray-800 capitalize">
                        {ben.tiposCobrancaAplicaveis.join(', ')}
                      </span>
                    </div>
                  </div>

                  {ben.entidadeFinanciadora && (
                    <div className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded">
                      Financiado por: <strong>{ben.entidadeFinanciadora}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 5: PLANOS DE PAGAMENTO
         ======================================================== */}
      {activeTab === 'planos' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#012041]">
                Planos de Pagamento Homologados
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Modalidades de fracionamento do ano lectivo disponíveis aos encarregados de educação.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planosPagamento.map((plano) => (
                <div key={plano.id} className="p-5 rounded-xl border border-gray-200 bg-white space-y-3">
                  <h3 className="font-bold text-sm text-[#012041]">{plano.nome}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{plano.descricao}</p>

                  <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Parcelas:</span>
                      <span className="font-bold text-gray-900">{plano.numeroParcelas} prestações</span>
                    </div>
                    {plano.descontoAplicavelPercentual && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Bonificação:</span>
                        <span className="font-bold font-mono">+{plano.descontoAplicavelPercentual}% de desconto</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dia Vencimento:</span>
                      <span className="font-semibold text-gray-900">Dia {plano.diaVencimento}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 6: RELATÓRIOS FINANCEIROS ANALÍTICOS
         ======================================================== */}
      {activeTab === 'relatorios' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-[#012041]">
                  Relatório Analítico de Cobrança por Tipo & Estado
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Consolidação executiva de arrecadação e carteira de débitos em atraso.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportContaCorrenteExcel}
              >
                Exportar Relatório Excel
              </Button>
            </div>

            {/* Tabela de Arrecadação por Tipo de Cobrança */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Tipo de Cobrança</th>
                    <th className="py-3 px-4 text-center">Nº Lançamentos</th>
                    <th className="py-3 px-4 text-right">Faturado Total (Kz)</th>
                    <th className="py-3 px-4 text-right">Liquidado (Kz)</th>
                    <th className="py-3 px-4 text-right">Pendente / Vencido (Kz)</th>
                    <th className="py-3 px-4 text-right">Taxa Liquidação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(METADATA_TIPOS_COBRANCA).map(([tipo, meta]) => {
                    const lansDoTipo = lancamentos.filter((l) => l.tipoCobranca === tipo);
                    const totalFat = lansDoTipo.reduce((sum, l) => sum + l.valorTotalDevidoKz, 0);
                    const totalLiq = lansDoTipo.reduce((sum, l) => sum + l.valorPagoKz, 0);
                    const totalPend = lansDoTipo.reduce((sum, l) => sum + l.saldoDevedorKz, 0);
                    const taxa = totalFat > 0 ? ((totalLiq / totalFat) * 100).toFixed(1) : '100.0';

                    return (
                      <tr key={tipo} className="hover:bg-blue-50/25">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {meta.label}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {lansDoTipo.length}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-900">
                          {totalFat.toLocaleString('pt-AO')} Kz
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                          {totalLiq.toLocaleString('pt-AO')} Kz
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                          {totalPend.toLocaleString('pt-AO')} Kz
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-gray-800">
                          {taxa}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          MODAIS DE OPERAÇÃO FINANCEIRA
         ======================================================== */}
      <NovoLancamentoModal
        isOpen={isNovoLancamentoOpen}
        onClose={() => setIsNovoLancamentoOpen(false)}
        students={students}
        tabelaPrecos={tabelaPrecos}
        beneficios={beneficios}
        onCriarLancamento={handleCriarLancamento}
      />

      <LiquidarLancamentoModal
        isOpen={!!liquidandoLancamento}
        onClose={() => setLiquidandoLancamento(null)}
        lancamento={liquidandoLancamento}
        onConfirmarLiquidacao={handleConfirmarLiquidacao}
      />
    </div>
  );
};
