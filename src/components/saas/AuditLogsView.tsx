import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Building2,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { AuditLog, ViewMode } from '../../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
  onNavigate: (view: ViewMode) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      log.acao.toLowerCase().includes(term) ||
      log.autorNome.toLowerCase().includes(term) ||
      (log.escolaNome && log.escolaNome.toLowerCase().includes(term)) ||
      log.detalhes.toLowerCase().includes(term);

    const matchType = typeFilter === 'todos' || log.tipo === typeFilter;

    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card noPadding>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#012041]">Logs de Auditoria Administrativa</h2>
              <Badge variant="neutral">{logs.length} registos</Badge>
            </div>
            <p className="text-xs text-[#41515D] mt-0.5">
              Rastreamento imutável de todas as alterações administrativas, provisionamentos e mudanças de estado no SaaS
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('saas-schools')}
          >
            Voltar a Escolas
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60">
          <Input
            placeholder="Pesquisar por ação, autor, escola ou detalhe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="todos">Todos os Tipos de Registo</option>
            <option value="onboarding">Onboarding / Criação de Tenant</option>
            <option value="estado">Alteração de Estado (Activar/Suspender/Cancelar)</option>
            <option value="edicao">Edição Cadastral / Subscrição</option>
            <option value="seguranca">Segurança & Permissões</option>
          </Select>
        </div>
      </Card>

      {/* Logs Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-[#E2E8F0] text-[#012041]">
                <th className="py-3 px-4 font-semibold w-40">Data & Hora</th>
                <th className="py-3 px-4 font-semibold">Autor da Operação</th>
                <th className="py-3 px-4 font-semibold">Acção Administrativa</th>
                <th className="py-3 px-4 font-semibold">Instituição Afectada</th>
                <th className="py-3 px-4 font-semibold">Detalhes do Evento</th>
                <th className="py-3 px-4 font-semibold text-right">Endereço IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#41515D]">
                    Nenhum registo de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[#41515D] whitespace-nowrap">
                      {log.dataHora}
                    </td>

                    {/* Autor */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#012041]">{log.autorNome}</div>
                      <div className="text-[11px] text-[#41515D] font-mono">{log.autorEmail}</div>
                    </td>

                    {/* Acção */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {log.tipo === 'onboarding' && <Badge variant="primary">Onboarding</Badge>}
                        {log.tipo === 'estado' && <Badge variant="warning">Estado</Badge>}
                        {log.tipo === 'edicao' && <Badge variant="neutral">Edição</Badge>}
                        {log.tipo === 'seguranca' && <Badge variant="error">Segurança</Badge>}
                      </div>
                      <span className="font-semibold text-[#012041] block mt-1">{log.acao}</span>
                    </td>

                    {/* Escola */}
                    <td className="py-3 px-4">
                      {log.escolaNome ? (
                        <div className="font-medium text-[#012041]">{log.escolaNome}</div>
                      ) : (
                        <span className="text-[#41515D] italic">Sistema Global</span>
                      )}
                    </td>

                    {/* Detalhes */}
                    <td className="py-3 px-4 max-w-md text-[#41515D] leading-relaxed">
                      {log.detalhes}
                    </td>

                    {/* IP */}
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-[#41515D]">
                      {log.ip || '197.149.20.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
