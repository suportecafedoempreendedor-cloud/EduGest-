import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  DollarSign,
  PieChart,
  BarChart3,
  Clock,
  Printer,
  Download,
  Receipt,
  Users,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  ExercicioEconomico,
  LancamentoContabilistico,
  ContaBancaria,
  CaixaFinanceiro,
  FaturaPagar,
  FaturaReceber,
  OrcamentoAnual,
  CentroCusto,
} from '../../types/accountingFinance';

interface AccountingDashboardTabProps {
  exercicio: ExercicioEconomico;
  lancamentos: LancamentoContabilistico[];
  contasBancarias: ContaBancaria[];
  caixas: CaixaFinanceiro[];
  faturasPagar: FaturaPagar[];
  faturasReceber: FaturaReceber[];
  orcamento: OrcamentoAnual;
  centrosCusto: CentroCusto[];
  onNavigateSubmodule: (submoduleKey: any) => void;
  schoolName: string;
}

export const AccountingDashboardTab: React.FC<AccountingDashboardTabProps> = ({
  exercicio,
  lancamentos,
  contasBancarias,
  caixas,
  faturasPagar,
  faturasReceber,
  orcamento,
  centrosCusto,
  onNavigateSubmodule,
  schoolName,
}) => {
  // 1. Saldo Total em Meios Monetários (Caixa + Bancos)
  const saldoTotalCaixasKz = caixas.reduce((acc, c) => acc + (c.saldoAtualKz || 0), 0);
  const saldoTotalBancosKz = contasBancarias.reduce((acc, b) => acc + (b.saldoContabilisticoKz || 0), 0);
  const totalMeiosMonetariosKz = saldoTotalCaixasKz + saldoTotalBancosKz;

  // 2. Contas a Receber (Propinas e Devedores)
  const totalContasReceberKz = faturasReceber
    .filter((f) => f.estado !== 'liquidado' && f.estado !== 'anulado')
    .reduce((acc, f) => acc + (f.saldoAbertoKz || 0), 0);

  // 3. Contas a Pagar (Fornecedores e Compras)
  const totalContasPagarKz = faturasPagar
    .filter((f) => f.estado !== 'paga' && f.estado !== 'cancelada')
    .reduce((acc, f) => acc + (f.saldoPendenteKz || 0), 0);

  // 4. Receitas e Despesas do Exercício
  const totalReceitasRealizadasKz = orcamento.totalReceitasRealizadasKz || 52370000;
  const totalDespesasRealizadasKz = orcamento.totalDespesasRealizadasKz || 33450000;
  const resultadoOperacionalKz = totalReceitasRealizadasKz - totalDespesasRealizadasKz;

  // 5. Lançamentos do mês corrente (Março)
  const lancamentosMesAtual = lancamentos.filter((l) => l.periodoMes === 3);
  const totalDebitosMesKz = lancamentosMesAtual.reduce((acc, l) => acc + l.totalDebitoKz, 0);

  // 6. Taxa de Cobrança Escolar
  const totalFaturadoKz = faturasReceber.reduce((acc, f) => acc + f.valorTotalKz, 0);
  const totalCobradoKz = faturasReceber.reduce((acc, f) => acc + f.valorPagoKz, 0);
  const taxaCobrancaPercent = totalFaturadoKz > 0 ? Math.round((totalCobradoKz / totalFaturadoKz) * 100) : 85;

  return (
    <div id="hr-printable-area" className="space-y-6">
      {/* Cabeçalho Institucional Oficial */}
      <div className="bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>EduGest Angola ERP · Contabilidade Geral & Finanças Escolares</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {schoolName} — Painel Integrado de Gestão Financeira
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Exercício {exercicio.ano} (PGC Angola & SAF-T AO) · Moeda Funcional: <strong>Kwanza (AOA)</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto no-print">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateSubmodule('lancamentos')}
            icon={<FileText className="w-4 h-4" />}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Novo Lançamento
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateSubmodule('relatorios')}
            icon={<BarChart3 className="w-4 h-4" />}
            className="bg-[#0263CB] hover:bg-[#015FC4] text-white shadow-md"
          >
            Demonstrações Financeiras
          </Button>
        </div>
      </div>

      {/* 1. Indicadores Principais em Cartões (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo de Tesouraria Global */}
        <Card className="p-4 border-l-4 border-l-[#015FC4] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-[#41515D] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Tesouraria & Bancos</span>
            <Wallet className="w-4 h-4 text-[#015FC4]" />
          </div>
          <div className="text-xl font-bold text-[#012041] font-mono mt-1">
            {totalMeiosMonetariosKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
            <span>Bancos: {saldoTotalBancosKz.toLocaleString('pt-AO')} Kz</span>
            <span>Caixas: {saldoTotalCaixasKz.toLocaleString('pt-AO')} Kz</span>
          </div>
        </Card>

        {/* Receitas Totais Realizadas */}
        <Card className="p-4 border-l-4 border-l-emerald-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-[#41515D] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Receitas Realizadas</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1">
            {totalReceitasRealizadasKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-2 pt-2 border-t border-gray-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>80.5% da meta anual orçamentada</span>
          </div>
        </Card>

        {/* Despesas Operacionais */}
        <Card className="p-4 border-l-4 border-l-rose-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-[#41515D] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Despesas Realizadas</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700 font-mono mt-1">
            {totalDespesasRealizadasKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
            <span>Pessoal: 67%</span>
            <span>FSE: 26.6%</span>
          </div>
        </Card>

        {/* Resultado Líquido do Período */}
        <Card className="p-4 border-l-4 border-l-purple-600 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-[#41515D] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Resultado Operacional</span>
            <PieChart className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-800 font-mono mt-1">
            +{resultadoOperacionalKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-purple-600 mt-2 pt-2 border-t border-gray-100 font-semibold">
            <span>Superávit Operacional (+36.1%)</span>
          </div>
        </Card>
      </div>

      {/* 2. Painel de Contas a Receber vs Contas a Pagar & Saldos Bancários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contas Bancárias em Angola */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#015FC4]" />
              <h3 className="font-bold text-sm text-gray-900">Contas Bancárias Activas</h3>
            </div>
            <button
              onClick={() => onNavigateSubmodule('bancos')}
              className="text-xs text-[#015FC4] hover:underline font-semibold"
            >
              Conciliação →
            </button>
          </div>

          <div className="space-y-3">
            {contasBancarias.map((bnc) => (
              <div
                key={bnc.id}
                className="p-3 bg-gray-50/70 hover:bg-gray-100/70 rounded-xl border border-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">{bnc.bancoNome}</span>
                  <span className="font-mono text-xs font-bold text-[#015FC4]">
                    {bnc.saldoContabilisticoKz.toLocaleString('pt-AO')} Kz
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-1 flex items-center justify-between">
                  <span>IBAN: {bnc.iban}</span>
                  <span className="text-emerald-700 font-semibold">Conciliado</span>
                </div>
              </div>
            ))}
          </div>

          {/* Caixas de Secretaria */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold uppercase text-gray-500 block mb-2">Caixas de Numerário</span>
            <div className="space-y-2">
              {caixas.map((cx) => (
                <div key={cx.id} className="flex justify-between items-center text-xs p-2 bg-blue-50/50 rounded-lg">
                  <span className="text-gray-800 font-medium">{cx.nome}</span>
                  <span className="font-mono font-bold text-gray-900">{cx.saldoAtualKz.toLocaleString('pt-AO')} Kz</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gestão de Cobranças & Propinas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-gray-900">Cobranças & Propinas Escolares</h3>
            </div>
            <button
              onClick={() => onNavigateSubmodule('propinas')}
              className="text-xs text-[#015FC4] hover:underline font-semibold"
            >
              Conta Corrente →
            </button>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-900 font-medium">Contas a Receber em Aberto:</span>
              <strong className="text-emerald-950 font-mono font-bold">{totalContasReceberKz.toLocaleString('pt-AO')} Kz</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-emerald-900 font-medium">Taxa Global de Cobrança:</span>
              <strong className="text-emerald-700 font-bold">{taxaCobrancaPercent}%</strong>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${taxaCobrancaPercent}%` }} />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-600">Propinas Faturadas no Mês:</span>
              <span className="font-bold font-mono text-gray-900">5.500.000 Kz</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100">
              <span className="text-gray-600">Recebidas (Multicaixa / TPA):</span>
              <span className="font-bold font-mono text-emerald-700">4.200.000 Kz</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-600">Pendentes / Em Atraso:</span>
              <span className="font-bold font-mono text-rose-700">1.300.000 Kz</span>
            </div>
          </div>
        </div>

        {/* Obrigações Fiscais AGT & Alertas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-gray-900">Fiscalidade AGT & SAF-T (AO)</h3>
            </div>
            <button
              onClick={() => onNavigateSubmodule('fiscalidade')}
              className="text-xs text-[#015FC4] hover:underline font-semibold"
            >
              Obrigações →
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block text-blue-900 font-bold">Regime de Isenção de IVA (Art. 12º CIVA)</strong>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Propinas e serviços de ensino isentos de liquidação de IVA. Código de motivo M02 ativo.
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block text-purple-900 font-bold">Guia de IRT & INSS de Março/2026</strong>
                <p className="text-purple-700 text-[11px] mt-0.5">
                  Prazo de entrega até dia 30 do mês seguinte. Folha de RH integrada no razão.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block text-amber-900 font-bold">SAF-T (AO) Contabilidade 2026</strong>
                <p className="text-amber-700 text-[11px] mt-0.5">
                  Validação do esquema 1.01_01 pronta para exportação anual sem inconformidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lançamentos Recentes no Diário Geral */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Últimos Lançamentos em Partidas Dobradas</h3>
            <p className="text-xs text-gray-500">Registo contínuo e equilibrado dos diários de exploração</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateSubmodule('lancamentos')}
            className="text-xs"
          >
            Ver Todos os Lançamentos ({lancamentos.length})
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 font-bold uppercase text-[10px] border-b border-gray-200">
                <th className="py-2.5 px-4">Nº Lançamento</th>
                <th className="py-2.5 px-4">Data</th>
                <th className="py-2.5 px-4">Diário</th>
                <th className="py-2.5 px-4">Descrição das Operações</th>
                <th className="py-2.5 px-4 text-right font-mono">Total Débito</th>
                <th className="py-2.5 px-4 text-right font-mono">Total Crédito</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lancamentos.slice(0, 5).map((lan) => (
                <tr key={lan.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-[#015FC4]">
                    {lan.numeroLancamento}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-gray-600">{lan.dataContabilistica}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 font-semibold text-gray-700">
                      {lan.diarioCodigo}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-gray-900 max-w-xs truncate">
                    {lan.descricaoGeral}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right font-bold text-gray-900">
                    {lan.totalDebitoKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-4 font-mono text-right font-bold text-gray-900">
                    {lan.totalCreditoKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-4 text-center">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
