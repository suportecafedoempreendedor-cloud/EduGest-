import React, { useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Ban,
  XCircle,
  PlusCircle,
  Sparkles,
  CreditCard,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  Users,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { School, ViewMode } from '../../types';

interface SaasDashboardViewProps {
  schools: School[];
  onNavigate: (view: ViewMode) => void;
  onSelectSchoolToView?: (school: School) => void;
}

export const SaasDashboardView: React.FC<SaasDashboardViewProps> = ({
  schools,
  onNavigate,
  onSelectSchoolToView,
}) => {
  // SaaS Key Metrics computed from schools state
  const totalEscolas = schools.length;
  const escolasActivas = schools.filter((s) => s.estado === 'activa').length;
  const escolasTrial = schools.filter((s) => s.estado === 'trial').length;
  const escolasSuspensas = schools.filter((s) => s.estado === 'suspensa').length;
  const escolasCanceladas = schools.filter((s) => s.estado === 'cancelada').length;

  // Novas escolas: criadas no ano/mês recente
  const novasEscolas = schools.filter((s) => s.dataCriacao.startsWith('2026')).length;

  // Subscrições activas: activas + trial vigente
  const subscricoesActivas = escolasActivas + escolasTrial;

  // Receita mensal total do SaaS (apenas escolas activas geram receita liquidada)
  const receitaMensalKz = useMemo(() => {
    return schools
      .filter((s) => s.estado === 'activa')
      .reduce((sum, s) => sum + s.valorMensalKz, 0);
  }, [schools]);

  // Receita potencial (incluindo conversão de trials)
  const receitaPotencialKz = useMemo(() => {
    return schools
      .filter((s) => s.estado === 'activa' || s.estado === 'trial')
      .reduce((sum, s) => sum + s.valorMensalKz, 0);
  }, [schools]);

  // Total de alunos e professores geridos em toda a plataforma SaaS
  const totalAlunosPlataforma = schools.reduce((sum, s) => sum + s.totalAlunos, 0);
  const totalProfessoresPlataforma = schools.reduce((sum, s) => sum + s.totalProfessores, 0);

  // Revenue projection data for Recharts (Simulação de evolução mensal)
  const revenueTrendData = [
    { mes: 'Out 2025', receita: 410000, activas: 3, trials: 1 },
    { mes: 'Nov 2025', receita: 535000, activas: 4, trials: 1 },
    { mes: 'Dez 2025', receita: 535000, activas: 4, trials: 2 },
    { mes: 'Jan 2026', receita: 610000, activas: 4, trials: 2 },
    { mes: 'Fev 2026', receita: receitaMensalKz, activas: escolasActivas, trials: escolasTrial },
    { mes: 'Mar 2026 (Proj.)', receita: receitaPotencialKz, activas: escolasActivas + 2, trials: 3 },
  ];

  // Distribution by Province
  const provinceData = useMemo(() => {
    const counts: Record<string, number> = {};
    schools.forEach((s) => {
      counts[s.provincia] = (counts[s.provincia] || 0) + 1;
    });
    return Object.entries(counts).map(([prov, qtd]) => ({
      provincia: prov,
      quantidade: qtd,
    }));
  }, [schools]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Administrador da Plataforma EduGest Angola */}
      <div className="bg-[#012041] text-white rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <Building2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold text-[#8EA5B8] uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#015FC4]" />
            Consola Multi-Tenant · Super Administrador SaaS
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Painel Central de Gestão das Escolas
          </h2>
          <p className="text-sm text-[#8EA5B8] mt-2 leading-relaxed">
            Supervisão e provisionamento de instituições escolares em Angola. Controle de subscrições,
            ciclo de vida de tenants (Trial, Activas, Suspensas), e monitorização de receita mensal em Kwanzas.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => onNavigate('saas-onboarding')}
            >
              Iniciar Onboarding de Escola
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<CreditCard className="w-4 h-4" />}
              onClick={() => onNavigate('saas-commercial')}
            >
              Gestão Comercial & Planos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white border border-white/20 hover:bg-white/10"
              onClick={() => onNavigate('saas-schools')}
            >
              Gerir Catálogo de Escolas
            </Button>
            <button
              onClick={() => onNavigate('saas-audit-logs')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#0263CB]" />
              Ver Logs de Auditoria
            </button>
          </div>
        </div>
      </div>

      {/* Required KPI Cards Grid - Administrador da Plataforma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total de Escolas */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#41515D]">Total de Escolas</span>
              <div className="text-2xl font-bold text-[#012041] mt-1 tabular-nums">
                {totalEscolas}
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{novasEscolas} adicionadas em 2026</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#012041] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* KPI 2: Escolas Activas */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#41515D]">Escolas Activas</span>
              <div className="text-2xl font-bold text-[#015FC4] mt-1 tabular-nums">
                {escolasActivas}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#015FC4] mt-2 font-medium">
                <span>{Math.round((escolasActivas / totalEscolas) * 100)}% da base com subscrição regular</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* KPI 3: Escolas em Período Experimental (Trial) */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#41515D]">Período Experimental</span>
              <div className="text-2xl font-bold text-[#0263CB] mt-1 tabular-nums">
                {escolasTrial}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#0263CB] mt-2 font-medium">
                <span>Trial de 30 dias com acesso total</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0263CB] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* KPI 4: Receita Mensal do SaaS */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#41515D]">Receita Mensal do SaaS</span>
              <div className="text-2xl font-bold text-[#012041] mt-1 tabular-nums">
                {(receitaMensalKz / 1000).toLocaleString('pt-AO')} <span className="text-sm font-semibold text-[#41515D]">mil Kz</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>MRR activo de subscrições</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#015FC4] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Second Row of KPIs: Suspensas, Canceladas, Subscrições Activas e Comunidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Escolas Suspensas */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#41515D] font-medium">Escolas Suspensas</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums">{escolasSuspensas}</div>
          <span className="text-[11px] text-[#41515D] block mt-1">Acesso bloqueado por pendência</span>
        </div>

        {/* Escolas Canceladas */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#41515D] font-medium">Escolas Canceladas</span>
            <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-red-700 mt-1 tabular-nums">{escolasCanceladas}</div>
          <span className="text-[11px] text-[#41515D] block mt-1">Subscrição descontinuada</span>
        </div>

        {/* Subscrições Activas (Activas + Trial) */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#41515D] font-medium">Subscrições Activas</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-[#015FC4] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#012041] mt-1 tabular-nums">{subscricoesActivas}</div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">
            {escolasActivas} pagantes + {escolasTrial} em teste
          </span>
        </div>

        {/* População Discente Total na Plataforma */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#41515D] font-medium">Comunidade Global</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0263CB] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#012041] mt-1 tabular-nums">
            {totalAlunosPlataforma.toLocaleString('pt-AO')}
          </div>
          <span className="text-[11px] text-[#41515D] block mt-1">
            Alunos em {schools.length} instituições
          </span>
        </div>
      </div>

      {/* Gráficos Recharts: Evolução da Receita SaaS e Distribuição por Província */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receita Mensal do SaaS (Span 2) */}
        <Card
          className="lg:col-span-2"
          title="Evolução da Receita Mensal do SaaS (Kwanzas - Kz)"
          subtitle="Crescimento de receita recorrente mensal (MRR) e projeção com conversão de trials"
          headerAction={
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[#012041]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#015FC4]" />
                <span className="font-medium">Receita Liquidada</span>
              </div>
            </div>
          }
        >
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueTrendData}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorSaasRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#015FC4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#015FC4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="mes"
                  stroke="#41515D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  stroke="#41515D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString('pt-AO')} Kz`, 'Receita SaaS']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  name="Receita Mensal (Kz)"
                  stroke="#015FC4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSaasRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#41515D]">
            <span>Média por escola: {(receitaMensalKz / (escolasActivas || 1)).toLocaleString('pt-AO')} Kz/mês</span>
            <span className="font-semibold text-[#015FC4]">Potencial com Trials: {receitaPotencialKz.toLocaleString('pt-AO')} Kz</span>
          </div>
        </Card>

        {/* Escolas por Província */}
        <Card
          title="Escolas por Província"
          subtitle="Expansão territorial da plataforma em Angola"
        >
          <div className="space-y-3.5 pt-2 text-xs">
            {provinceData.map((item) => {
              const pct = Math.round((item.quantidade / totalEscolas) * 100);
              return (
                <div key={item.provincia} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-[#012041] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#015FC4]" />
                      {item.provincia}
                    </span>
                    <span className="text-[#41515D] tabular-nums font-mono">
                      {item.quantidade} escola{item.quantidade > 1 ? 's' : ''} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#015FC4] h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => onNavigate('saas-schools')}
            >
              Ver Tabela Completa de Escolas
            </Button>
          </div>
        </Card>
      </div>

      {/* Lista Recente de Escolas & Ações Rápidas */}
      <Card
        title="Catálogo Recente de Escolas Cadastradas"
        subtitle="Últimos tenants provisionados e respetivo estado operacional"
        headerAction={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('saas-schools')}
            className="text-[#015FC4]"
          >
            Ver Todas ({totalEscolas}) →
          </Button>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041]">
                <th className="py-3 px-4 font-semibold">Instituição / Nome Comercial</th>
                <th className="py-3 px-4 font-semibold">NIF</th>
                <th className="py-3 px-4 font-semibold">Província / Município</th>
                <th className="py-3 px-4 font-semibold">Plano Subscrito</th>
                <th className="py-3 px-4 font-semibold">Administrador do Tenant</th>
                <th className="py-3 px-4 font-semibold text-center">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {schools.slice(0, 5).map((escola) => (
                <tr key={escola.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#012041] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {escola.logotipo || escola.nome.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#012041]">{escola.nome}</div>
                        <div className="text-[11px] text-[#41515D]">{escola.nomeComercial}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[#41515D]">
                    {escola.nif}
                  </td>
                  <td className="py-3 px-4 text-[#012041]">
                    <div>{escola.provincia}</div>
                    <div className="text-[11px] text-[#41515D]">{escola.municipio}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#012041] block">{escola.plano}</span>
                    <span className="text-[11px] font-mono text-[#015FC4]">
                      {escola.valorMensalKz.toLocaleString('pt-AO')} Kz/mês
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#012041]">
                    <div>{escola.adminNome}</div>
                    <div className="text-[11px] text-[#41515D] font-mono">{escola.adminEmail}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {escola.estado === 'activa' && <Badge variant="success">Activa</Badge>}
                    {escola.estado === 'trial' && <Badge variant="primary">Trial</Badge>}
                    {escola.estado === 'suspensa' && <Badge variant="warning">Suspensa</Badge>}
                    {escola.estado === 'cancelada' && <Badge variant="error">Cancelada</Badge>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate('saas-schools')}
                      className="text-[#015FC4]"
                    >
                      Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
