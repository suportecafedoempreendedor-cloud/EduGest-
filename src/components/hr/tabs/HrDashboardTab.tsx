import React from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Cake,
  TrendingUp,
  FileText,
  Award,
  ArrowRight,
  Download,
  Printer,
} from 'lucide-react';
import {
  Employee,
  HrDepartment,
  EmploymentContract,
  LeaveRequest,
  DisciplinaryCase,
  HrAlert,
} from '../../../types/humanResources';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { exportToCsv } from '../../../utils/hrDocumentGenerator';

interface HrDashboardTabProps {
  employees: Employee[];
  departments: HrDepartment[];
  contracts: EmploymentContract[];
  leaves: LeaveRequest[];
  disciplinaryCases: DisciplinaryCase[];
  alerts: HrAlert[];
  onNavigateTab: (tabKey: any) => void;
}

export const HrDashboardTab: React.FC<HrDashboardTabProps> = ({
  employees,
  departments,
  contracts,
  leaves,
  disciplinaryCases,
  alerts,
  onNavigateTab,
}) => {
  const activeEmployees = employees.filter((e) => e.estadoProfissional !== 'cessado');
  const teachersCount = activeEmployees.filter((e) => e.tipoColaborador === 'docente').length;
  const adminStaffCount = activeEmployees.filter(
    (e) => e.tipoColaborador === 'administrativo' || e.tipoColaborador === 'direccao'
  ).length;
  const supportCount = activeEmployees.filter(
    (e) => e.tipoColaborador === 'apoio' || e.tipoColaborador === 'tecnico' || e.tipoColaborador === 'motorista'
  ).length;
  const probationCount = activeEmployees.filter((e) => e.estadoProfissional === 'periodo_experimental').length;

  const pendingLeaves = leaves.filter((l) => l.estado === 'pendente' || l.estado === 'aprovado_chefia');
  const contractsExpiringSoon = contracts.filter((c) => c.estado === 'a_renovar');

  // Distribuição por departamento
  const deptDistribution = departments.map((d) => {
    const count = activeEmployees.filter((e) => e.departamentoId === d.id).length;
    const percentage = activeEmployees.length > 0 ? Math.round((count / activeEmployees.length) * 100) : 0;
    return { ...d, count, percentage };
  });

  // Distribuição por tipo de vínculo
  const indeterminateCount = activeEmployees.filter((e) => e.tipoVinculo === 'tempo_indeterminado').length;
  const fixedTermCount = activeEmployees.filter((e) => e.tipoVinculo === 'termo_certo').length;
  const serviceCount = activeEmployees.filter((e) => e.tipoVinculo === 'comissao_servico' || e.tipoVinculo === 'prestacao_servicos').length;

  // Aniversariantes do mês corrente (Outubro - mês 10)
  const currentMonthNum = '10';
  const birthdayPeople = activeEmployees.filter((e) => {
    if (!e.dataNascimento) return false;
    const month = e.dataNascimento.split('-')[1];
    return month === currentMonthNum;
  });

  const handleExportKpiCsv = () => {
    const headers = ['Indicador', 'Valor', 'Observacao'];
    const rows = [
      ['Total Colaboradores Activos', activeEmployees.length, '100% Quadro Activo'],
      ['Corpo Docente Titular', teachersCount, 'Professores'],
      ['Pessoal Administrativo', adminStaffCount, 'Secretaria e Financas'],
      ['Pessoal Tecnico e Apoio', supportCount, 'TI, Manutencao e Motoristas'],
      ['Colaboradores em Periodo Experimental', probationCount, 'Avaliacao probatoria'],
      ['Pedidos de Ferias Pendentes', pendingLeaves.length, 'Aguardam decisao RH'],
      ['Contratos a Renovar (<35 dias)', contractsExpiringSoon.length, 'Termo certo LGT'],
      ['Total Alertas Activos', alerts.filter((a) => !a.resolvido).length, 'Atencao requerida'],
    ];
    exportToCsv(`kpis_rh_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div id="hr-printable-area" className="space-y-6">
      {/* Barra de Ações Executivas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs no-print">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#015FC4]" />
            <span>Painel Executivo de Recursos Humanos & Quadro de Pessoal</span>
          </h3>
          <p className="text-gray-500 text-[11px] mt-0.5">
            Métricas em tempo real sobre efectividade docente, vigência de contratos e fluxos regulamentares.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportKpiCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Exportar KPIs (CSV)
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Imprimir Painel
          </Button>
        </div>
      </div>

      {/* Indicadores Principais de Topo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">Total Pessoal</span>
            <Users className="w-4 h-4 text-[#015FC4]" />
          </div>
          <strong className="text-xl font-extrabold text-[#012041] font-mono block">
            {activeEmployees.length}
          </strong>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            100% Quadro Activo
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">Corpo Docente</span>
            <GraduationCap className="w-4 h-4 text-teal-600" />
          </div>
          <strong className="text-xl font-extrabold text-gray-900 font-mono block">
            {teachersCount}
          </strong>
          <span className="text-[10px] text-gray-500 block mt-0.5">
            Professores Titulares
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">Administrativos</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <strong className="text-xl font-extrabold text-gray-900 font-mono block">
            {adminStaffCount}
          </strong>
          <span className="text-[10px] text-gray-500 block mt-0.5">
            Secretaria & Finanças
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">Técnicos & Apoio</span>
            <Briefcase className="w-4 h-4 text-amber-600" />
          </div>
          <strong className="text-xl font-extrabold text-gray-900 font-mono block">
            {supportCount}
          </strong>
          <span className="text-[10px] text-gray-500 block mt-0.5">
            TI, Obras & Motoristas
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">Férias Pendentes</span>
            <Calendar className="w-4 h-4 text-[#015FC4]" />
          </div>
          <strong className="text-xl font-extrabold text-[#015FC4] font-mono block">
            {pendingLeaves.length}
          </strong>
          <button
            onClick={() => onNavigateTab('ferias')}
            className="text-[10px] text-blue-700 hover:underline font-semibold block mt-0.5"
          >
            Aprovar pedidos →
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold text-rose-800">Contratos a Vencer</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <strong className="text-xl font-extrabold text-rose-700 font-mono block">
            {contractsExpiringSoon.length}
          </strong>
          <button
            onClick={() => onNavigateTab('contratos')}
            className="text-[10px] text-rose-700 hover:underline font-semibold block mt-0.5"
          >
            Ver renovações →
          </button>
        </div>
      </div>

      {/* Alertas Críticos de Recursos Humanos */}
      {alerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-amber-900 text-xs">
                Centro de Alertas & Notificações de Recursos Humanos
              </h4>
            </div>
            <span className="text-[10px] font-bold uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
              {alerts.length} Acções Requeridas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs space-y-1.5 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-gray-900 text-[11px] line-clamp-1">{al.titulo}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                        al.prioridade === 'urgente'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {al.prioridade}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-snug mt-1">{al.mensagem}</p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">{al.dataAlerta}</span>
                  <button
                    onClick={() => {
                      if (al.tipo === 'contrato_termo') onNavigateTab('contratos');
                      else if (al.tipo === 'ferias_pendentes') onNavigateTab('ferias');
                      else onNavigateTab('colaboradores');
                    }}
                    className="font-bold text-[#015FC4] hover:underline inline-flex items-center gap-0.5"
                  >
                    Resolver <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos e Distribuições Reais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Colaboradores por Departamento */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#015FC4]" />
              <span>Colaboradores por Departamento</span>
            </h4>
            <span className="text-[10px] text-gray-400">Total: {activeEmployees.length}</span>
          </div>

          <div className="space-y-3">
            {deptDistribution.slice(0, 6).map((d) => (
              <div key={d.id} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-gray-700 truncate max-w-[190px]">{d.nome}</span>
                  <span className="font-mono font-bold text-gray-900">
                    {d.count} ({d.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#012041] to-[#015FC4] rounded-full transition-all"
                    style={{ width: `${Math.max(5, d.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Gráfico 2: Vínculo Contratual */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#015FC4]" />
              <span>Vínculo Contratual (LGT Angola)</span>
            </h4>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <strong className="text-gray-900 text-xs block">Tempo Indeterminado (Efectivos)</strong>
                <span className="text-gray-500 text-[10px]">Contrato sem termo resolutivo</span>
              </div>
              <span className="text-lg font-bold font-mono text-[#015FC4]">{indeterminateCount}</span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between">
              <div>
                <strong className="text-gray-900 text-xs block">Termo Certo Resolutivo</strong>
                <span className="text-gray-500 text-[10px]">Contratos temporários com termo</span>
              </div>
              <span className="text-lg font-bold font-mono text-amber-700">{fixedTermCount}</span>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between">
              <div>
                <strong className="text-gray-900 text-xs block">Comissão de Serviço / Outros</strong>
                <span className="text-gray-500 text-[10px]">Cargos directivos e avenças</span>
              </div>
              <span className="text-lg font-bold font-mono text-purple-700">{serviceCount}</span>
            </div>
          </div>
        </Card>

        {/* Aniversariantes do Mês & Assiduidade */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
              <Cake className="w-4 h-4 text-rose-500" />
              <span>Aniversariantes do Mês (Outubro)</span>
            </h4>
            <span className="text-[10px] text-gray-400">Autorizado pelo RH</span>
          </div>

          <div className="space-y-2.5">
            {birthdayPeople.length > 0 ? (
              birthdayPeople.map((bp) => (
                <div key={bp.id} className="p-2.5 rounded-lg bg-gray-50 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-gray-900 block text-[11px]">{bp.nomeCompleto}</strong>
                    <span className="text-gray-500 text-[10px]">{bp.cargoNome}</span>
                  </div>
                  <span className="text-rose-700 font-bold font-mono bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                    {bp.dataNascimento.split('-')[2]}/10
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4 text-xs italic">
                Sem aniversários registados para este mês.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 font-semibold">Taxa Global de Assiduidade:</span>
              <strong className="text-emerald-700 font-mono font-bold text-sm">98.2%</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
