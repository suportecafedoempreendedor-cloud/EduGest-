import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Layers,
  PieChart,
  BarChart3,
  TrendingUp,
  Building2,
  CheckCircle2,
  Table,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  calculateBalancoPatrimonial,
  calculateDemonstracaoResultados,
  calculateBalanceteVerificacao,
} from '../../services/accountingFinanceService';
import { exportToCsv } from '../../utils/hrDocumentGenerator';

interface FinancialReportsTabProps {
  schoolName: string;
}

export const FinancialReportsTab: React.FC<FinancialReportsTabProps> = ({ schoolName }) => {
  const [selectedReport, setSelectedReport] = useState<'balanco' | 'demonstracao_resultados' | 'balancete' | 'razao'>('balanco');
  const [anoExercicio, setAnoExercicio] = useState(2026);

  const balanco = calculateBalancoPatrimonial('esc-001', anoExercicio);
  const dr = calculateDemonstracaoResultados('esc-001', anoExercicio);
  const balancete = calculateBalanceteVerificacao('esc-001');

  const handleExportCsv = () => {
    if (selectedReport === 'balancete') {
      const headers = [
        'Conta_PGC',
        'Designacao',
        'Saldo_Inicial_Devedor',
        'Saldo_Inicial_Credor',
        'Mov_Debito',
        'Mov_Credito',
        'Saldo_Final_Devedor',
        'Saldo_Final_Credor',
      ];
      const rows = balancete.map((b) => [
        b.contaCodigo,
        `"${b.contaDesignacao.replace(/"/g, '""')}"`,
        b.saldoInicialDevedorKz,
        b.saldoInicialCredorKz,
        b.movimentoDebitoKz,
        b.movimentoCreditoKz,
        b.saldoFinalDevedorKz,
        b.saldoFinalCredorKz,
      ]);
      exportToCsv(`balancete_verificacao_${anoExercicio}.csv`, headers, rows);
    } else if (selectedReport === 'demonstracao_resultados') {
      const headers = ['Rubrica', 'Valor_Kz'];
      const rows = [
        ['Vendas e Serviços (Propinas)', dr.vendasEServicosPropinasKz],
        ['Outros Proveitos Operacionais', dr.outrosProveitosOperacionaisKz],
        ['Total Rendimentos Operacionais', dr.totalRendimentosOperacionaisKz],
        ['Custos com o Pessoal (Salários e Encargos)', dr.custosPessoalSalariosKz],
        ['Fornecimentos e Serviços Externos (FSE)', dr.fornecimentosEServicosExternosFseKz],
        ['Amortizações e Depreciações do Exercício', dr.amortizacoesEDepreciacoesExercicioKz],
        ['Total Gastos Operacionais', dr.totalGastosOperacionaisKz],
        ['Resultado Operacional (EBITDA)', dr.resultadoOperacionalEbitdaKz],
        ['Resultado Antes de Impostos (RAI)', dr.resultadoAntesImpostosKz],
        ['Imposto Industrial Estimado', dr.impostoIndustrialEstimadoKz],
        ['Resultado Líquido do Exercício', dr.resultadoLiquidoExercicioKz],
      ];
      exportToCsv(`demonstracao_resultados_${anoExercicio}.csv`, headers, rows);
    } else {
      const headers = ['Massa_Patrimonial', 'Rubrica', 'Ano_Atual_Kz', 'Ano_Anterior_Kz'];
      const rows: (string | number)[][] = [
        ...balanco.ativoNaoCorrente.map((a) => ['Activo Não Corrente', a.rubricaDescricao, a.anoAtualKz, a.anoAnteriorKz]),
        ...balanco.ativoCorrente.map((a) => ['Activo Corrente', a.rubricaDescricao, a.anoAtualKz, a.anoAnteriorKz]),
        ['Total Activo', 'Total do Activo', balanco.totalAtivoKz, 148500000],
        ...balanco.capitalProprio.map((c) => ['Capital Próprio', c.rubricaDescricao, c.anoAtualKz, c.anoAnteriorKz]),
        ...balanco.passivoCorrente.map((p) => ['Passivo Corrente', p.rubricaDescricao, p.anoAtualKz, p.anoAnteriorKz]),
        ['Total Capital Próprio e Passivo', 'Total Capital Próprio e Passivo', balanco.totalCapitalProprioEPassivoKz, 148500000],
      ];
      exportToCsv(`balanco_patrimonial_${anoExercicio}.csv`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botões de Selecção de Demonstração */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <button
          onClick={() => setSelectedReport('balanco')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === 'balanco'
              ? 'border-[#015FC4] bg-blue-50/50 shadow-xs'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <PieChart className="w-5 h-5 text-[#015FC4] mb-1.5" />
          <strong className="block text-gray-900 font-bold text-xs">1. Balanço Patrimonial</strong>
          <span className="text-[10px] text-gray-500">Activo, Passivo & Capital Próprio</span>
        </button>

        <button
          onClick={() => setSelectedReport('demonstracao_resultados')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === 'demonstracao_resultados'
              ? 'border-[#015FC4] bg-blue-50/50 shadow-xs'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-5 h-5 text-emerald-600 mb-1.5" />
          <strong className="block text-gray-900 font-bold text-xs">2. Demonstração de Resultados</strong>
          <span className="text-[10px] text-gray-500">Proveitos, Custos & Resultado Líquido</span>
        </button>

        <button
          onClick={() => setSelectedReport('balancete')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === 'balancete'
              ? 'border-[#015FC4] bg-blue-50/50 shadow-xs'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <Table className="w-5 h-5 text-purple-600 mb-1.5" />
          <strong className="block text-gray-900 font-bold text-xs">3. Balancete de Verificação</strong>
          <span className="text-[10px] text-gray-500">8 Colunas PGC Angola</span>
        </button>

        <button
          onClick={() => setSelectedReport('razao')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === 'razao'
              ? 'border-[#015FC4] bg-blue-50/50 shadow-xs'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <FileText className="w-5 h-5 text-amber-600 mb-1.5" />
          <strong className="block text-gray-900 font-bold text-xs">4. Livro Razão Geral</strong>
          <span className="text-[10px] text-gray-500">Movimentos analíticos por conta</span>
        </button>
      </div>

      {/* Barra de Ações */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-gray-200 no-print">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-semibold">Exercício Económico:</span>
          <select
            value={anoExercicio}
            onChange={(e) => setAnoExercicio(Number(e.target.value))}
            className="p-1.5 border border-gray-200 rounded font-bold"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportCsv} icon={<Download className="w-4 h-4" />}>
            Exportar CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
            Imprimir Relatório A4
          </Button>
        </div>
      </div>

      {/* Relatório Oficial Seleccionado (#hr-printable-area) */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-6">
        {/* Cabeçalho Institucional de Impressão */}
        <div className="border-b-2 border-gray-800 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              República de Angola · Ministério das Finanças / OCPCA
            </span>
            <h2 className="text-lg font-bold text-gray-900">{schoolName}</h2>
            <p className="text-xs text-gray-600">NIF: 5401239841 · Luanda, Angola</p>
            <h3 className="text-sm font-bold text-[#015FC4] mt-1">
              {selectedReport === 'balanco' && 'Balanço Patrimonial Oficial (PGC Angola)'}
              {selectedReport === 'demonstracao_resultados' && 'Demonstração dos Resultados por Natureza (PGC Angola)'}
              {selectedReport === 'balancete' && 'Balancete de Verificação de 8 Colunas (Classes 1 a 8)'}
              {selectedReport === 'razao' && 'Livro Razão Geral Analítico'}
            </h3>
          </div>
          <div className="text-right text-xs">
            <span className="font-mono text-gray-600 block">Exercício Findo em 31/12/{anoExercicio}</span>
            <span className="text-[10px] text-gray-400 font-mono">
              Emissão: {new Date().toLocaleDateString('pt-AO')} · Moeda: Kwanza (AOA)
            </span>
          </div>
        </div>

        {/* 1. RELATÓRIO: BALANÇO PATRIMONIAL */}
        {selectedReport === 'balanco' && (
          <div className="space-y-6 text-xs">
            {/* Activo */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-100 font-bold text-gray-900 flex justify-between">
                <span>1. ACTIVO</span>
                <span>31/12/{anoExercicio}</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3">Rubrica</th>
                    <th className="py-2 px-3 text-right">Ano Corrente (Kz)</th>
                    <th className="py-2 px-3 text-right">Ano Anterior (Kz)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2 px-3">Activo Não Corrente:</td>
                    <td className="py-2 px-3 text-right font-mono">{balanco.totalAtivoNaoCorrenteKz.toLocaleString('pt-AO')} Kz</td>
                    <td className="py-2 px-3 text-right font-mono">110.000.000 Kz</td>
                  </tr>
                  {balanco.ativoNaoCorrente.map((a, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 pl-6 text-gray-700">{a.rubricaDescricao}</td>
                      <td className="py-2 px-3 text-right font-mono">{a.anoAtualKz.toLocaleString('pt-AO')} Kz</td>
                      <td className="py-2 px-3 text-right font-mono">{a.anoAnteriorKz.toLocaleString('pt-AO')} Kz</td>
                    </tr>
                  ))}

                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2 px-3">Activo Corrente:</td>
                    <td className="py-2 px-3 text-right font-mono">{balanco.totalAtivoCorrenteKz.toLocaleString('pt-AO')} Kz</td>
                    <td className="py-2 px-3 text-right font-mono">38.500.000 Kz</td>
                  </tr>
                  {balanco.ativoCorrente.map((a, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 pl-6 text-gray-700">{a.rubricaDescricao}</td>
                      <td className="py-2 px-3 text-right font-mono">{a.anoAtualKz.toLocaleString('pt-AO')} Kz</td>
                      <td className="py-2 px-3 text-right font-mono">{a.anoAnteriorKz.toLocaleString('pt-AO')} Kz</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#012041] text-white font-bold text-sm">
                    <td className="py-2.5 px-3 uppercase">Total do Activo:</td>
                    <td className="py-2.5 px-3 text-right font-mono">{balanco.totalAtivoKz.toLocaleString('pt-AO')} Kz</td>
                    <td className="py-2.5 px-3 text-right font-mono">148.500.000 Kz</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Capital Próprio e Passivo */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-100 font-bold text-gray-900 flex justify-between">
                <span>2. CAPITAL PRÓPRIO E PASSIVO</span>
                <span>31/12/{anoExercicio}</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-3">Rubrica</th>
                    <th className="py-2 px-3 text-right">Ano Corrente (Kz)</th>
                    <th className="py-2 px-3 text-right">Ano Anterior (Kz)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2 px-3">Capital Próprio (Fundos da Instituição):</td>
                    <td className="py-2 px-3 text-right font-mono">{balanco.totalCapitalProprioKz.toLocaleString('pt-AO')} Kz</td>
                    <td className="py-2 px-3 text-right font-mono">140.550.000 Kz</td>
                  </tr>
                  {balanco.capitalProprio.map((c, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 pl-6 text-gray-700">{c.rubricaDescricao}</td>
                      <td className="py-2 px-3 text-right font-mono">{c.anoAtualKz.toLocaleString('pt-AO')} Kz</td>
                      <td className="py-2 px-3 text-right font-mono">{c.anoAnteriorKz.toLocaleString('pt-AO')} Kz</td>
                    </tr>
                  ))}

                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2 px-3">Passivo Corrente:</td>
                    <td className="py-2 px-3 text-right font-mono">{balanco.totalPassivoCorrenteKz.toLocaleString('pt-AO')} Kz</td>
                    <td className="py-2 px-3 text-right font-mono">7.950.000 Kz</td>
                  </tr>
                  {balanco.passivoCorrente.map((p, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 pl-6 text-gray-700">{p.rubricaDescricao}</td>
                      <td className="py-2 px-3 text-right font-mono">{p.anoAtualKz.toLocaleString('pt-AO')} Kz</td>
                      <td className="py-2 px-3 text-right font-mono">{p.anoAnteriorKz.toLocaleString('pt-AO')} Kz</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#012041] text-white font-bold text-sm">
                    <td className="py-2.5 px-3 uppercase">Total Capital Próprio e Passivo:</td>
                    <td className="py-2.5 px-3 text-right font-mono">{balanco.totalCapitalProprioEPassivoKz.toLocaleString('pt-AO')} Kz</td>
                    <td className="py-2.5 px-3 text-right font-mono">148.500.000 Kz</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2. RELATÓRIO: DEMONSTRAÇÃO DE RESULTADOS */}
        {selectedReport === 'demonstracao_resultados' && (
          <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] border-b border-gray-200">
                  <th className="py-2.5 px-4">Rubrica de Proveitos e Custos por Natureza</th>
                  <th className="py-2.5 px-4 text-right font-mono">Valor (Kz)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr className="bg-emerald-50/50 font-bold text-emerald-950">
                  <td className="py-2.5 px-4">1. Vendas e Serviços Prestados (Propinas & Mensalidades)</td>
                  <td className="py-2.5 px-4 text-right font-mono">{dr.vendasEServicosPropinasKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 pl-8 text-gray-600">2. Outros Proveitos Operacionais (Taxas, Multas, Emolumentos)</td>
                  <td className="py-2 px-4 text-right font-mono">{dr.outrosProveitosOperacionaisKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr className="bg-emerald-100/60 font-bold text-emerald-950">
                  <td className="py-2.5 px-4">TOTAL DOS RENDIMENTOS OPERACIONAIS (A)</td>
                  <td className="py-2.5 px-4 text-right font-mono">{dr.totalRendimentosOperacionaisKz.toLocaleString('pt-AO')} Kz</td>
                </tr>

                <tr>
                  <td className="py-2 px-4 pl-8 text-gray-600">3. Custos com o Pessoal (Salários dos Professores & Encargos Sociais)</td>
                  <td className="py-2 px-4 text-right font-mono text-rose-700">-{dr.custosPessoalSalariosKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 pl-8 text-gray-600">4. Fornecimentos e Serviços Externos (Energia, Água, Internet, Combustível)</td>
                  <td className="py-2 px-4 text-right font-mono text-rose-700">-{dr.fornecimentosEServicosExternosFseKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 pl-8 text-gray-600">5. Amortizações e Depreciações do Exercício (Autocarros e Equipamento)</td>
                  <td className="py-2 px-4 text-right font-mono text-rose-700">-{dr.amortizacoesEDepreciacoesExercicioKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 pl-8 text-gray-600">6. Impostos e Taxas Operacionais</td>
                  <td className="py-2 px-4 text-right font-mono text-rose-700">-{dr.impostosTaxasOperacionaisKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr className="bg-rose-50 font-bold text-rose-950">
                  <td className="py-2.5 px-4">TOTAL DOS GASTOS OPERACIONAIS (B)</td>
                  <td className="py-2.5 px-4 text-right font-mono">-{dr.totalGastosOperacionaisKz.toLocaleString('pt-AO')} Kz</td>
                </tr>

                <tr className="bg-blue-50/70 font-bold text-[#015FC4]">
                  <td className="py-2.5 px-4">RESULTADO OPERACIONAL — EBITDA (A - B)</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold">{dr.resultadoOperacionalEbitdaKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 pl-8 text-gray-600">7. Resultados Financeiros Líquidos (Juros e Diferenças de Câmbio)</td>
                  <td className="py-2 px-4 text-right font-mono">+{(dr.rendimentosFinanceirosJurosKz - dr.gastosFinanceirosJurosBancariosKz).toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr className="font-bold bg-slate-100">
                  <td className="py-2.5 px-4">RESULTADO ANTES DE IMPOSTOS (RAI)</td>
                  <td className="py-2.5 px-4 text-right font-mono">{dr.resultadoAntesImpostosKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 pl-8 text-gray-600">8. Imposto Industrial Estimado (25%)</td>
                  <td className="py-2 px-4 text-right font-mono text-rose-700">-{dr.impostoIndustrialEstimadoKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr className="bg-[#012041] text-white font-bold text-sm">
                  <td className="py-3 px-4 uppercase">RESULTADO LÍQUIDO DO EXERCÍCIO:</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">+{dr.resultadoLiquidoExercicioKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 3. RELATÓRIO: BALANCETE DE VERIFICAÇÃO 8 COLUNAS */}
        {selectedReport === 'balancete' && (
          <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[9px] border-b border-gray-200">
                    <th className="py-2 px-2" rowSpan={2}>Conta PGC</th>
                    <th className="py-2 px-2" rowSpan={2}>Designação</th>
                    <th className="py-2 px-2 text-center" colSpan={2}>Saldos Iniciais</th>
                    <th className="py-2 px-2 text-center" colSpan={2}>Movimento do Período</th>
                    <th className="py-2 px-2 text-center" colSpan={2}>Saldos Finais</th>
                  </tr>
                  <tr className="bg-gray-50 text-[9px] uppercase font-bold text-gray-600 border-b border-gray-200">
                    <th className="py-1 px-2 text-right">Débito</th>
                    <th className="py-1 px-2 text-right">Crédito</th>
                    <th className="py-1 px-2 text-right">Débito</th>
                    <th className="py-1 px-2 text-right">Crédito</th>
                    <th className="py-1 px-2 text-right">Devedor</th>
                    <th className="py-1 px-2 text-right">Credor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {balancete.map((b) => (
                    <tr key={b.contaCodigo} className={b.tipo === 'agregadora' ? 'bg-slate-50 font-bold' : ''}>
                      <td className="py-1.5 px-2 text-[#015FC4]">{b.contaCodigo}</td>
                      <td className="py-1.5 px-2 font-sans font-medium text-gray-900 truncate max-w-xs">{b.contaDesignacao}</td>
                      <td className="py-1.5 px-2 text-right">{b.saldoInicialDevedorKz > 0 ? b.saldoInicialDevedorKz.toLocaleString('pt-AO') : '-'}</td>
                      <td className="py-1.5 px-2 text-right">{b.saldoInicialCredorKz > 0 ? b.saldoInicialCredorKz.toLocaleString('pt-AO') : '-'}</td>
                      <td className="py-1.5 px-2 text-right text-emerald-700">{b.movimentoDebitoKz > 0 ? b.movimentoDebitoKz.toLocaleString('pt-AO') : '-'}</td>
                      <td className="py-1.5 px-2 text-right text-rose-700">{b.movimentoCreditoKz > 0 ? b.movimentoCreditoKz.toLocaleString('pt-AO') : '-'}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-gray-900">{b.saldoFinalDevedorKz > 0 ? b.saldoFinalDevedorKz.toLocaleString('pt-AO') : '-'}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-gray-900">{b.saldoFinalCredorKz > 0 ? b.saldoFinalCredorKz.toLocaleString('pt-AO') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. RELATÓRIO: RAZÃO GERAL ANALÍTICO */}
        {selectedReport === 'razao' && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 text-xs">
            <span className="font-bold text-gray-900 block">Extracto Analítico das Contas Movimentadas</span>
            <p className="text-gray-600 text-[11px]">
              O razão geral reflete a evolução de cada conta PGC após a apropriação dos lançamentos balanceados de propinas, salários e fornecedores.
            </p>
          </div>
        )}

        {/* Rodapé Oficial de Homologação e Assinaturas */}
        <div className="pt-8 border-t border-gray-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-gray-400 w-52 mx-auto mb-1.5" />
            <p className="font-bold text-gray-900">Dr. António Bento</p>
            <p className="text-[10px] text-gray-500">Contabilista Certificado · Cédula OCPCA nº 4892/AO</p>
          </div>
          <div>
            <div className="border-b border-gray-400 w-52 mx-auto mb-1.5" />
            <p className="font-bold text-gray-900">Dra. Luísa Gaspar</p>
            <p className="text-[10px] text-gray-500">A Direcção Geral da Instituição · Visto Oficial</p>
          </div>
        </div>
      </div>
    </div>
  );
};
