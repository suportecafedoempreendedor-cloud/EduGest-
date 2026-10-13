import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { RegistoAuditoriaFinanceira } from '../../types/accountingFinance';
import { exportToCsv } from '../../utils/hrDocumentGenerator';

interface AuditLogTabProps {
  logs: RegistoAuditoriaFinanceira[];
  schoolName: string;
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({ logs, schoolName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcao, setFilterAcao] = useState('todas');

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.utilizadorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.moduloSubseccao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entidadeAfetadaDescricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detalhesTecnicos.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAcao = filterAcao === 'todas' || l.acao === filterAcao;
    return matchSearch && matchAcao;
  });

  const handleExportCsv = () => {
    const headers = [
      'Data_Hora',
      'Utilizador',
      'Perfil',
      'Submodulo',
      'Acao',
      'Entidade_Afetada',
      'Detalhes_Tecnicos',
      'Valor_Kz',
      'Endereco_IP',
    ];
    const rows = filtered.map((l) => [
      l.dataHora,
      `"${l.utilizadorNome.replace(/"/g, '""')}"`,
      l.perfilPapel,
      l.moduloSubseccao,
      l.acao,
      `"${l.entidadeAfetadaDescricao.replace(/"/g, '""')}"`,
      `"${l.detalhesTecnicos.replace(/"/g, '""')}"`,
      l.valorMonetarioKz || '-',
      l.enderecoIp,
    ]);
    exportToCsv(`auditoria_contabil_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Informação de Segurança & Compliance */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-700">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="block text-gray-900 font-bold">Rastreabilidade & Trilha de Auditoria Indelével</strong>
            <p className="text-gray-500 text-[11px]">
              Todos os lançamentos, aprovações, estornos, conciliações e fechos de período ficam registados de forma inviolável.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportCsv} icon={<Download className="w-4 h-4" />}>
          Exportar Trilha de Auditoria (CSV)
        </Button>
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
              placeholder="Pesquisar utilizador, lançamento, descrição ou IP..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            />
          </div>

          <select
            value={filterAcao}
            onChange={(e) => setFilterAcao(e.target.value)}
            className="px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 font-medium"
          >
            <option value="todas">Todas as Ações</option>
            <option value="CONTABILIZACAO">Contabilização</option>
            <option value="ESTORNO">Estorno</option>
            <option value="APROVACAO">Aprovação</option>
            <option value="ENCERRAMENTO_PERIODO">Encerramento de Período</option>
            <option value="RECONCILIACAO_BANCO">Conciliação Bancária</option>
            <option value="CRIACAO">Criação</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Utilizador & Perfil</th>
                <th className="py-2.5 px-3">Módulo</th>
                <th className="py-2.5 px-3 text-center">Ação</th>
                <th className="py-2.5 px-3">Entidade Afectada</th>
                <th className="py-2.5 px-3">Detalhes Técnicos & Justificação</th>
                <th className="py-2.5 px-3 font-mono text-gray-500">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap">{l.dataHora}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-gray-900 block">{l.utilizadorNome}</span>
                    <span className="text-[10px] text-gray-400">{l.perfilPapel}</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-gray-700">{l.moduloSubseccao}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        l.acao === 'CONTABILIZACAO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.acao === 'ESTORNO'
                          ? 'bg-rose-100 text-rose-800'
                          : l.acao === 'APROVACAO'
                          ? 'bg-blue-100 text-[#015FC4]'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {l.acao}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-900 max-w-xs truncate">{l.entidadeAfetadaDescricao}</td>
                  <td className="py-2.5 px-3 text-gray-600 max-w-sm truncate" title={l.detalhesTecnicos}>
                    {l.detalhesTecnicos}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-400 text-[11px]">{l.enderecoIp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
