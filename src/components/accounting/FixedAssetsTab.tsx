import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Printer,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ActivoFixoImobilizado } from '../../types/accountingFinance';
import { exportToCsv } from '../../utils/hrDocumentGenerator';

interface FixedAssetsTabProps {
  activosFixos: ActivoFixoImobilizado[];
  onAddActivo: (activo: ActivoFixoImobilizado) => void;
  schoolName: string;
}

export const FixedAssetsTab: React.FC<FixedAssetsTabProps> = ({
  activosFixos,
  onAddActivo,
  schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNovoActivoOpen, setIsNovoActivoOpen] = useState(false);

  // Form
  const [designacao, setDesignacao] = useState('');
  const [categoria, setCategoria] = useState<ActivoFixoImobilizado['categoria']>('equipamento_informatico');
  const [custoKz, setCustoKz] = useState(1500000);
  const [vidaUtilAnos, setVidaUtilAnos] = useState(3);
  const [localizacao, setLocalizacao] = useState('Campus Central - Sala de Servidores');
  const [responsavel, setResponsavel] = useState('Prof. Nelson Quarenta');

  const filtered = activosFixos.filter((a) => {
    return (
      a.codigoPatrimonial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.designacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.localizacaoFisica.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalCustoImobilizadoKz = activosFixos.reduce((acc, a) => acc + a.custoAquisicaoKz, 0);
  const totalAmortizacoesAcumuladasKz = activosFixos.reduce((acc, a) => acc + a.amortizacaoAcumuladaKz, 0);
  const totalValorLiquidoKz = totalCustoImobilizadoKz - totalAmortizacoesAcumuladasKz;

  const handleCriarActivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designacao) return;

    const taxa = Number((100 / vidaUtilAnos).toFixed(2));
    const novo: ActivoFixoImobilizado = {
      id: `pat-${Date.now()}`,
      escolaId: 'esc-001',
      codigoPatrimonial: `PAT-2026-${Math.floor(100 + Math.random() * 900)}`,
      designacao,
      categoria,
      dataAquisicao: new Date().toISOString().substring(0, 10),
      fornecedorNome: 'Fornecedor Credenciado',
      numeroFaturaCompra: `FT-${Math.floor(1000 + Math.random() * 9000)}`,
      custoAquisicaoKz: custoKz,
      valorResidualEstimadoKz: Math.round(custoKz * 0.1),
      vidaUtilAnos,
      taxaAmortizacaoAnualPercent: taxa,
      metodo: 'quotas_constantes',
      amortizacaoAcumuladaKz: 0,
      valorLiquidoContabilisticoKz: custoKz,
      estadoConservacao: 'excelente',
      localizacaoFisica: localizacao,
      responsavelNome: responsavel,
      contaActivoPGC: '11.3',
      contaAmortizacaoAcumuladaPGC: '18.3',
      contaCustoAmortizacaoPGC: '74',
      ativo: true,
    };

    onAddActivo(novo);
    setIsNovoActivoOpen(false);
    setDesignacao('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Codigo_Patrimonial',
      'Designacao',
      'Categoria',
      'Aquisicao',
      'Custo_Aquisicao_Kz',
      'Vida_Util_Anos',
      'Taxa_Amortizacao_Percent',
      'Amortizacao_Acumulada_Kz',
      'Valor_Liquido_Kz',
      'Localizacao',
    ];
    const rows = filtered.map((a) => [
      a.codigoPatrimonial,
      `"${a.designacao.replace(/"/g, '""')}"`,
      a.categoria,
      a.dataAquisicao,
      a.custoAquisicaoKz,
      a.vidaUtilAnos,
      `${a.taxaAmortizacaoAnualPercent}%`,
      a.amortizacaoAcumuladaKz,
      a.valorLiquidoContabilisticoKz,
      `"${a.localizacaoFisica.replace(/"/g, '""')}"`,
    ]);
    exportToCsv(`inventario_activos_fixos_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Resumo do Património Escolar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-[#015FC4]">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Custo Histórico Bruto de Aquisição</span>
          <div className="text-xl font-bold font-mono text-gray-900 mt-1">
            {totalCustoImobilizadoKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-600">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Amortizações Acumuladas (Conta 18)</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            -{totalAmortizacoesAcumuladasKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-600">
          <span className="text-xs text-gray-500 font-semibold uppercase block">Valor Líquido Contabilístico (Balanço)</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {totalValorLiquidoKz.toLocaleString('pt-AO')} <span className="text-xs font-sans text-gray-500">Kz</span>
          </div>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por código patrimonial, designação ou localização..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto no-print">
            <Button variant="secondary" size="sm" onClick={handleExportCsv} icon={<Download className="w-4 h-4" />}>
              Exportar CSV
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
              Imprimir Inventário
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsNovoActivoOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Registar Novo Activo
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela do Inventário de Activos */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Código Patrimonial</th>
                <th className="py-2.5 px-3">Designação do Bem</th>
                <th className="py-2.5 px-3">Aquisição</th>
                <th className="py-2.5 px-3 text-right font-mono">Custo Bruto</th>
                <th className="py-2.5 px-3 text-center">Vida Útil</th>
                <th className="py-2.5 px-3 text-center">Taxa Anual</th>
                <th className="py-2.5 px-3 text-right font-mono">Amort. Acumulada</th>
                <th className="py-2.5 px-3 text-right font-mono">Valor Líquido</th>
                <th className="py-2.5 px-3">Localização / Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">{a.codigoPatrimonial}</td>
                  <td className="py-2.5 px-3 font-bold text-gray-900">{a.designacao}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-600">{a.dataAquisicao}</td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">
                    {a.custoAquisicaoKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">{a.vidaUtilAnos} anos</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-700">{a.taxaAmortizacaoAnualPercent}%</td>
                  <td className="py-2.5 px-3 font-mono text-right text-amber-700">
                    -{a.amortizacaoAcumuladaKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-emerald-700">
                    {a.valorLiquidoContabilisticoKz.toLocaleString('pt-AO')} Kz
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    <span className="block font-medium text-gray-800">{a.localizacaoFisica}</span>
                    <span className="text-[10px] text-gray-400">{a.responsavelNome}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVO ACTIVO FIXO */}
      {isNovoActivoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-[#012041]">Registar Bem no Activo Fixo</h3>
              <button onClick={() => setIsNovoActivoOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarActivo} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Designação do Equipamento / Bem *</label>
                <input
                  type="text"
                  value={designacao}
                  onChange={(e) => setDesignacao(e.target.value)}
                  placeholder="Ex: Ar Condicionado Split Inverter 24000 BTU"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="equipamento_informatico">Equipamento Informático</option>
                    <option value="mobiliario_escolar">Mobiliário Escolar</option>
                    <option value="viaturas_transporte">Viaturas de Transporte</option>
                    <option value="equipamento_laboratorio">Equipamento Laboratorial</option>
                    <option value="edificios_instalacoes">Instalações e Edifícios</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Vida Útil (Anos)</label>
                  <input
                    type="number"
                    min={1}
                    value={vidaUtilAnos}
                    onChange={(e) => setVidaUtilAnos(Number(e.target.value) || 1)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Custo de Aquisição (Kz) *</label>
                <input
                  type="number"
                  min={1}
                  value={custoKz}
                  onChange={(e) => setCustoKz(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold text-base"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Localização Física no Campus</label>
                <input
                  type="text"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Responsável pelo Bem</label>
                <input
                  type="text"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsNovoActivoOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Registar Imobilizado
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
