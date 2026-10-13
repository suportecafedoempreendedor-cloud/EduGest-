import React from 'react';
import {
  PieChart,
  Plus,
  Download,
  Printer,
  Building2,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CentroCusto } from '../../types/accountingFinance';
import { exportToCsv } from '../../utils/hrDocumentGenerator';

interface CostCentersTabProps {
  centrosCusto: CentroCusto[];
  schoolName: string;
}

export const CostCentersTab: React.FC<CostCentersTabProps> = ({ centrosCusto, schoolName }) => {
  const totalOrcamentoKz = centrosCusto.reduce((acc, c) => acc + c.orcamentoAtribuidoKz, 0);
  const totalCustosKz = centrosCusto.reduce((acc, c) => acc + c.custosAcumuladosKz, 0);
  const totalReceitasKz = centrosCusto.reduce((acc, c) => acc + c.receitasAtribuidasKz, 0);

  const handleExportCsv = () => {
    const headers = [
      'Codigo_Centro',
      'Nome',
      'Tipo',
      'Responsavel',
      'Orcamento_Kz',
      'Custos_Kz',
      'Receitas_Kz',
      'Saldo_Operacional_Kz',
    ];
    const rows = centrosCusto.map((c) => [
      c.codigo,
      `"${c.nome.replace(/"/g, '""')}"`,
      c.tipo,
      c.responsavelNome,
      c.orcamentoAtribuidoKz,
      c.custosAcumuladosKz,
      c.receitasAtribuidasKz,
      c.saldoOperacionalKz,
    ]);
    exportToCsv(`centros_custo_analitica_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Resumo Global */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-[#015FC4]">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Orçamento Alocado por Centros</span>
          <div className="text-xl font-bold font-mono text-gray-900 mt-1">
            {totalOrcamentoKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-600">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Custos Acumulados</span>
          <div className="text-xl font-bold font-mono text-rose-700 mt-1">
            {totalCustosKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Receitas Directas Atribuídas</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {totalReceitasKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
        </Card>
      </div>

      {/* Ações */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-gray-900">Centros de Responsabilidade & Custo (Contabilidade Analítica)</h3>
          <p className="text-xs text-gray-500">Alocação de custos por cursos, ciclos de ensino e logística</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportCsv} icon={<Download className="w-4 h-4" />}>
            Exportar CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
            Imprimir
          </Button>
        </div>
      </div>

      {/* Tabela de Centros de Custo */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Designação do Centro de Custo</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Responsável</th>
                <th className="py-2.5 px-3 text-right font-mono">Orçamento Kz</th>
                <th className="py-2.5 px-3 text-right font-mono">Custos Kz</th>
                <th className="py-2.5 px-3 text-right font-mono">Receitas Kz</th>
                <th className="py-2.5 px-3 text-right font-mono">Saldo Operacional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {centrosCusto.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">{c.codigo}</td>
                  <td className="py-2.5 px-3 font-bold text-gray-900">{c.nome}</td>
                  <td className="py-2.5 px-3 capitalize text-gray-600">{c.tipo}</td>
                  <td className="py-2.5 px-3 text-gray-700">{c.responsavelNome}</td>
                  <td className="py-2.5 px-3 font-mono text-right text-gray-800">
                    {c.orcamentoAtribuidoKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-rose-700 font-bold">
                    -{c.custosAcumuladosKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-emerald-700 font-bold">
                    {c.receitasAtribuidasKz > 0 ? `+${c.receitasAtribuidasKz.toLocaleString('pt-AO')} Kz` : '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                    {c.saldoOperacionalKz >= 0
                      ? `+${c.saldoOperacionalKz.toLocaleString('pt-AO')} Kz`
                      : `${c.saldoOperacionalKz.toLocaleString('pt-AO')} Kz`}
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
