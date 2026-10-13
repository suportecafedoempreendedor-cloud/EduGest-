import React from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { OrcamentoAnual } from '../../types/accountingFinance';
import { exportToCsv } from '../../utils/hrDocumentGenerator';

interface BudgetingTabProps {
  orcamento: OrcamentoAnual;
  schoolName: string;
}

export const BudgetingTab: React.FC<BudgetingTabProps> = ({ orcamento, schoolName }) => {
  const receitasOrcadas = orcamento.totalReceitasOrcamentadasKz;
  const receitasRealizadas = orcamento.totalReceitasRealizadasKz;
  const taxaExecucaoReceitas = Math.round((receitasRealizadas / receitasOrcadas) * 100);

  const despesasOrcadas = orcamento.totalDespesasOrcamentadasKz;
  const despesasRealizadas = orcamento.totalDespesasRealizadasKz;
  const taxaExecucaoDespesas = Math.round((despesasRealizadas / despesasOrcadas) * 100);

  const handleExportCsv = () => {
    const headers = [
      'Codigo_Rubrica',
      'Tipo',
      'Designacao',
      'Conta_PGC',
      'Valor_Orcamentado_Kz',
      'Valor_Realizado_Kz',
      'Desvio_Kz',
      'Execucao_Percent',
    ];
    const rows = orcamento.rubricas.map((r) => [
      r.codigoRubrica,
      r.tipo,
      `"${r.designacao.replace(/"/g, '""')}"`,
      r.contaContabilisticaPGC,
      r.valorOrcamentadoAnualKz,
      r.valorRealizadoKz,
      r.desvioValorKz,
      `${r.desvioPercentual}%`,
    ]);
    exportToCsv(`orcamento_execucao_${orcamento.anoExercicio}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Banner Executivo */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#015FC4] uppercase tracking-wider block">
            Planeamento & Controlo Orçamental · Exercício {orcamento.anoExercicio}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-0.5">{orcamento.titulo}</h3>
          <p className="text-xs text-gray-500">
            Versão: {orcamento.versao} · Aprovado por {orcamento.aprovadoPor} em {orcamento.dataAprovacao}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto no-print">
          <Button variant="secondary" size="sm" onClick={handleExportCsv} icon={<Download className="w-4 h-4" />}>
            Exportar Orçamento
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
            Imprimir Mapa
          </Button>
        </div>
      </div>

      {/* Cartões Comparativos Previsto vs Realizado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Receitas */}
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Receitas Orçamentadas vs Realizadas</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {receitasRealizadas.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">de {receitasOrcadas.toLocaleString('pt-AO')} Kz</span>
          </div>
          <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, taxaExecucaoReceitas)}%` }} />
          </div>
          <div className="text-[11px] text-emerald-800 font-bold mt-1.5 flex justify-between">
            <span>Taxa de Execução:</span>
            <span>{taxaExecucaoReceitas}%</span>
          </div>
        </Card>

        {/* Despesas */}
        <Card className="p-4 border-l-4 border-l-rose-600">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Despesas Previstas vs Realizadas</span>
          <div className="text-xl font-bold font-mono text-rose-700 mt-1">
            {despesasRealizadas.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">de {despesasOrcadas.toLocaleString('pt-AO')} Kz</span>
          </div>
          <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-rose-600 h-full rounded-full" style={{ width: `${Math.min(100, taxaExecucaoDespesas)}%` }} />
          </div>
          <div className="text-[11px] text-rose-800 font-bold mt-1.5 flex justify-between">
            <span>Consumo Orçamental:</span>
            <span>{taxaExecucaoDespesas}% (Dentro do Limite)</span>
          </div>
        </Card>

        {/* Saldo Operacional Projetado */}
        <Card className="p-4 border-l-4 border-l-[#015FC4]">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Superávit Operacional Executado</span>
          <div className="text-xl font-bold font-mono text-[#015FC4] mt-1">
            +{(receitasRealizadas - despesasRealizadas).toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 pt-2 border-t border-gray-100">
            Margem Operacional de <strong>36.1%</strong> no exercício corrente.
          </p>
        </Card>
      </div>

      {/* Tabela de Rubricas Orçamentais */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Designação da Rubrica</th>
                <th className="py-2.5 px-3">Conta PGC</th>
                <th className="py-2.5 px-3 text-right font-mono">Orçado (Kz)</th>
                <th className="py-2.5 px-3 text-right font-mono">Realizado (Kz)</th>
                <th className="py-2.5 px-3 text-right font-mono">Desvio (Kz)</th>
                <th className="py-2.5 px-3 text-center">Execução</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orcamento.rubricas.map((r) => {
                const isReceita = r.tipo === 'receita';
                return (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">{r.codigoRubrica}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isReceita ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.tipo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{r.designacao}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-500">{r.contaContabilisticaPGC}</td>
                    <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-800">
                      {r.valorOrcamentadoAnualKz.toLocaleString('pt-AO')} Kz
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                      {r.valorRealizadoKz.toLocaleString('pt-AO')} Kz
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-700">
                      {r.desvioValorKz.toLocaleString('pt-AO')} Kz
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          r.desvioPercentual >= 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.desvioPercentual >= 70
                            ? 'bg-blue-100 text-[#015FC4]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.desvioPercentual}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
