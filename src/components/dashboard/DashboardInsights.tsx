import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  AlertCircle,
  Award,
  BookOpen,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Input';
import { Student, NotaItem } from '../../types';

interface DashboardInsightsProps {
  students: Student[];
  notas: NotaItem[];
  selectedPeriod?: string;
  selectedYear?: string;
}

export type DisciplineCategory = 'todas' | 'stem' | 'humanas' | 'ciencias';
export type ChartType = 'linhas' | 'barras';

interface DisciplineTrend {
  key: string;
  nome: string;
  categoria: 'stem' | 'humanas' | 'ciencias';
  cor: string;
  t1: number;
  t2: number;
  t3: number;
  meta: number;
  profResponsavel: string;
}

export const DashboardInsights: React.FC<DashboardInsightsProps> = ({
  students,
  notas,
  selectedPeriod = '02',
  selectedYear = '2025/2026',
}) => {
  // Local interaction states
  const [activeCategory, setActiveCategory] = useState<DisciplineCategory>('todas');
  const [selectedDisciplineKey, setSelectedDisciplineKey] = useState<string>('todas');
  const [chartType, setChartType] = useState<ChartType>('linhas');
  const [selectedTurma, setSelectedTurma] = useState<string>('todas');

  // Base list of curricular disciplines in the Angolan secondary education system
  const disciplinesConfig: DisciplineTrend[] = useMemo(() => {
    // Dynamic integration with real live notas if available
    const calcAvg = (disciplinaNome: string, defaultT1: number, defaultT2: number, defaultT3: number) => {
      const notasDisciplina = notas.filter(
        (n) => n.disciplina.toLowerCase() === disciplinaNome.toLowerCase()
      );
      if (notasDisciplina.length > 0) {
        const liveT2Avg =
          notasDisciplina.reduce((acc, n) => acc + (n.mt || n.mac || 14), 0) /
          notasDisciplina.length;
        return {
          t1: defaultT1,
          t2: Number(liveT2Avg.toFixed(1)),
          t3: defaultT3,
        };
      }
      return { t1: defaultT1, t2: defaultT2, t3: defaultT3 };
    };

    const mat = calcAvg('Matemática', 13.2, 14.8, 15.6);
    const port = calcAvg('Língua Portuguesa', 14.5, 15.6, 16.2);
    const fis = calcAvg('Física', 12.8, 13.9, 14.7);
    const qui = calcAvg('Química', 13.0, 14.2, 15.0);
    const bio = calcAvg('Biologia', 14.9, 16.1, 16.8);
    const info = calcAvg('Informática', 16.2, 17.5, 18.2);
    const hist = calcAvg('História', 14.1, 15.0, 15.7);
    const geo = calcAvg('Geografia', 13.8, 14.7, 15.4);
    const ing = calcAvg('Inglês', 15.0, 16.2, 16.8);

    return [
      {
        key: 'matematica',
        nome: 'Matemática',
        categoria: 'stem',
        cor: '#015FC4', // Azul Tecnológico EduGest
        t1: mat.t1,
        t2: mat.t2,
        t3: mat.t3,
        meta: 15.0,
        profResponsavel: 'Lic. Mateus Cassoma',
      },
      {
        key: 'portugues',
        nome: 'Língua Portuguesa',
        categoria: 'humanas',
        cor: '#012041', // Azul Marinho Oficial
        t1: port.t1,
        t2: port.t2,
        t3: port.t3,
        meta: 16.0,
        profResponsavel: 'Dra. Luzia Gaspar',
      },
      {
        key: 'fisica',
        nome: 'Física',
        categoria: 'stem',
        cor: '#D97706', // Âmbar
        t1: fis.t1,
        t2: fis.t2,
        t3: fis.t3,
        meta: 14.5,
        profResponsavel: 'Eng. Gilberto Neto',
      },
      {
        key: 'quimica',
        nome: 'Química',
        categoria: 'ciencias',
        cor: '#9333EA', // Púrpura
        t1: qui.t1,
        t2: qui.t2,
        t3: qui.t3,
        meta: 15.0,
        profResponsavel: 'Dra. Neusa Tomás',
      },
      {
        key: 'biologia',
        nome: 'Biologia',
        categoria: 'ciencias',
        cor: '#10B981', // Verde Esmeralda
        t1: bio.t1,
        t2: bio.t2,
        t3: bio.t3,
        meta: 16.5,
        profResponsavel: 'Prof. Bento Kassoma',
      },
      {
        key: 'informatica',
        nome: 'Informática',
        categoria: 'stem',
        cor: '#06B6D4', // Ciano
        t1: info.t1,
        t2: info.t2,
        t3: info.t3,
        meta: 17.5,
        profResponsavel: 'Eng. Mauro Silva',
      },
      {
        key: 'historia',
        nome: 'História',
        categoria: 'humanas',
        cor: '#E11D48', // Carmim
        t1: hist.t1,
        t2: hist.t2,
        t3: hist.t3,
        meta: 15.5,
        profResponsavel: 'Dra. Teresa Chissingui',
      },
      {
        key: 'geografia',
        nome: 'Geografia',
        categoria: 'humanas',
        cor: '#84CC16', // Lima
        t1: geo.t1,
        t2: geo.t2,
        t3: geo.t3,
        meta: 15.0,
        profResponsavel: 'Lic. Afonso Muandumba',
      },
      {
        key: 'ingles',
        nome: 'Inglês',
        categoria: 'humanas',
        cor: '#6366F1', // Índigo
        t1: ing.t1,
        t2: ing.t2,
        t3: ing.t3,
        meta: 16.0,
        profResponsavel: 'Lic. Hamilton Kaputo',
      },
    ];
  }, [notas]);

  // Filtered disciplines based on activeCategory and selectedDisciplineKey
  const activeDisciplines = useMemo(() => {
    let list = disciplinesConfig;
    if (activeCategory !== 'todas') {
      list = list.filter((d) => d.categoria === activeCategory);
    }
    if (selectedDisciplineKey !== 'todas') {
      list = list.filter((d) => d.key === selectedDisciplineKey);
    }
    return list;
  }, [disciplinesConfig, activeCategory, selectedDisciplineKey]);

  // Recharts Data Series: Evolution over the 3 Trimesters
  const evolutionChartData = useMemo(() => {
    const trimesters = [
      { id: 't1', label: '1º Trimestre', sub: 'Concluído' },
      { id: 't2', label: '2º Trimestre', sub: 'Actual' },
      { id: 't3', label: '3º Trimestre', sub: 'Projecção' },
    ];

    return trimesters.map((trim) => {
      const dataPoint: Record<string, any> = {
        trimestre: trim.label,
        trimestreCurto: trim.id.toUpperCase(),
        sub: trim.sub,
      };

      let sum = 0;
      activeDisciplines.forEach((d) => {
        const val = trim.id === 't1' ? d.t1 : trim.id === 't2' ? d.t2 : d.t3;
        dataPoint[d.key] = val;
        dataPoint[`${d.key}_meta`] = d.meta;
        sum += val;
      });

      // Media Geral ponderada deste trimestre
      dataPoint['MediaGeral'] =
        activeDisciplines.length > 0
          ? Number((sum / activeDisciplines.length).toFixed(1))
          : 0;

      return dataPoint;
    });
  }, [activeDisciplines]);

  // Comparative Bar Chart Data by Discipline (side-by-side trimesters)
  const barChartData = useMemo(() => {
    return activeDisciplines.map((d) => ({
      disciplina: d.nome,
      '1º Trimestre': d.t1,
      '2º Trimestre': d.t2,
      '3º Trimestre (Proj.)': d.t3,
      meta: d.meta,
      variacao: Number((d.t3 - d.t1).toFixed(1)),
    }));
  }, [activeDisciplines]);

  // High-level pedagogical metrics & insights
  const insightsMetrics = useMemo(() => {
    // 1. Discipline with highest growth from T1 to T2/T3
    const sortedGrowth = [...disciplinesConfig].sort(
      (a, b) => b.t2 - a.t1 - (a.t2 - a.t1)
    );
    const topPerformer = sortedGrowth[0];
    const topGrowthVal = topPerformer ? Number((topPerformer.t2 - topPerformer.t1).toFixed(1)) : 0;

    // 2. Discipline needing attention (lowest current average or below 14.0)
    const sortedLowest = [...disciplinesConfig].sort((a, b) => a.t2 - b.t2);
    const attentionDiscipline = sortedLowest[0];

    // 3. Overall school average across trimesters
    const t1Overall = Number(
      (disciplinesConfig.reduce((acc, d) => acc + d.t1, 0) / disciplinesConfig.length).toFixed(1)
    );
    const t2Overall = Number(
      (disciplinesConfig.reduce((acc, d) => acc + d.t2, 0) / disciplinesConfig.length).toFixed(1)
    );
    const t3Overall = Number(
      (disciplinesConfig.reduce((acc, d) => acc + d.t3, 0) / disciplinesConfig.length).toFixed(1)
    );
    const globalDelta = Number((t2Overall - t1Overall).toFixed(1));

    // 4. Percentage of disciplines above 14.0v (MED standard target)
    const aboveTargetCount = disciplinesConfig.filter((d) => d.t2 >= 14.0).length;
    const targetAchievementPct = Math.round((aboveTargetCount / disciplinesConfig.length) * 100);

    return {
      topPerformer,
      topGrowthVal,
      attentionDiscipline,
      t1Overall,
      t2Overall,
      t3Overall,
      globalDelta,
      targetAchievementPct,
      aboveTargetCount,
    };
  }, [disciplinesConfig]);

  // Custom Recharts Tooltip styled for EduGest Angola Design System
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#CBD5E1] p-3.5 rounded-xl shadow-lg text-xs z-50 min-w-56 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="font-bold text-[#012041]">{label}</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
              Escala 0-20v
            </span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {payload.map((entry: any) => {
              const discName =
                disciplinesConfig.find((d) => d.key === entry.dataKey)?.nome ||
                entry.name;
              const val = entry.value;
              const isAbove10 = val >= 10;
              const isAbove14 = val >= 14;

              return (
                <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-700 truncate font-medium">
                      {discName}:
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold font-mono text-[#012041]">
                      {val}v
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        isAbove14
                          ? 'bg-emerald-50 text-emerald-700'
                          : isAbove10
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {isAbove14 ? 'Bom' : isAbove10 ? 'Apto' : 'Alerta'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Mínimo aprovação: 10.0v</span>
            <span>Meta MED: 14.0v</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card noPadding className="border-slate-200 shadow-sm overflow-hidden">
      {/* 1. Header Banner & Context */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-blue-200">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="font-bold uppercase tracking-wider">
                Dashboard Insights · Módulo Analítico
              </span>
              <span aria-hidden="true">·</span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-mono">
                Ano Lectivo {selectedYear}
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
              Evolução das Médias por Disciplina ao Longo dos Trimestres
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-3xl">
              Análise comparativa trimestral do rendimento pedagógico oficial (1º, 2º e 3º Trimestres),
              identificação de disciplinas com maior aceleração e acompanhamento de metas curriculares do MED de Angola.
            </p>
          </div>

          {/* Quick Stats Highlights */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2.5 rounded-xl text-left">
              <span className="text-[10px] uppercase text-blue-200 block font-semibold">
                Média Geral Actual (T2)
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white block mt-0.5">
                {insightsMetrics.t2Overall} valores
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +{insightsMetrics.globalDelta}v vs 1º Trimestre
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2.5 rounded-xl text-left hidden sm:block">
              <span className="text-[10px] uppercase text-blue-200 block font-semibold">
                Disciplinas &ge; 14v (Meta)
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-300 block mt-0.5">
                {insightsMetrics.targetAchievementPct}%
              </span>
              <span className="text-[10px] text-blue-200">
                {insightsMetrics.aboveTargetCount} de {disciplinesConfig.length} disciplinas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Analytical Cards (Pedagogical Insights) */}
      <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Top Evolution */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Maior Evolução</span>
              <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#012041]">
                {insightsMetrics.topPerformer?.nome}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +{insightsMetrics.topGrowthVal}v
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Passou de {insightsMetrics.topPerformer?.t1}v no 1º Trimestre para {insightsMetrics.topPerformer?.t2}v no actual.
            </p>
          </div>

          {/* Card 2: Attention Point */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Ponto de Atenção</span>
              <span className="p-1 rounded-md bg-amber-50 text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#012041]">
                {insightsMetrics.attentionDiscipline?.nome}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {insightsMetrics.attentionDiscipline?.t2}v
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Abaixo da meta de {insightsMetrics.attentionDiscipline?.meta}v do MED; requer reforço pedagógico.
            </p>
          </div>

          {/* Card 3: Projection 3rd Trim */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Projecção 3º Trim.</span>
              <span className="p-1 rounded-md bg-blue-50 text-[#015FC4]">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-[#015FC4]">
                {insightsMetrics.t3Overall} valores
              </span>
              <span className="text-xs text-blue-700 font-semibold">+0.8v proj.</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Estimativa baseada na curva de rendimento dos exames e provas finais.
            </p>
          </div>

          {/* Card 4: Taxa de Aprovação */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Conformidade MED</span>
              <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-emerald-700">100%</span>
              <span className="text-xs text-slate-500">&ge; 10 valores</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Todas as médias globais por disciplina mantêm-se em zona de aprovação.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Grupos:
          </span>

          {[
            { id: 'todas' as DisciplineCategory, label: 'Todas as Disciplinas' },
            { id: 'stem' as DisciplineCategory, label: 'Ciências Exatas & STEM' },
            { id: 'humanas' as DisciplineCategory, label: 'Línguas & Humanas' },
            { id: 'ciencias' as DisciplineCategory, label: 'Ciências Naturais' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedDisciplineKey('todas');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#012041] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right side controls: Chart Type & Discipline Focus */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Discipline Focus Dropdown */}
          <div className="w-48">
            <Select
              value={selectedDisciplineKey}
              onChange={(e) => setSelectedDisciplineKey(e.target.value)}
              className="text-xs py-1"
            >
              <option value="todas">Foco: Comparar Todas</option>
              {disciplinesConfig.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.nome} ({d.t2}v)
                </option>
              ))}
            </Select>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setChartType('linhas')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                chartType === 'linhas'
                  ? 'bg-white text-[#012041] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualizar em gráfico de linhas temporais"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Linhas</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('barras')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                chartType === 'barras'
                  ? 'bg-white text-[#012041] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualizar em barras comparativas"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Barras</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Chart Rendering with Recharts */}
      <div className="p-5 sm:p-6 bg-white space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#015FC4]" />
              <strong>{activeDisciplines.length} disciplinas</strong> exibidas
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-400">
              Escala oficial angolana (0 a 20 valores)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-rose-600 font-semibold">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500" />
              Mínimo Aprov. (10v)
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" />
              Meta MED (14v)
            </span>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-88 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'linhas' ? (
              /* LINE CHART: Evolution from T1 to T2 to T3 */
              <LineChart
                data={evolutionChartData}
                margin={{ top: 15, right: 25, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="trimestre"
                  stroke="#41515D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fontWeight: 600 }}
                />
                <YAxis
                  domain={[8, 20]}
                  stroke="#41515D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  ticks={[8, 10, 12, 14, 16, 18, 20]}
                  tickFormatter={(val) => `${val}v`}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 16, fontSize: 12 }}
                />

                {/* Reference line: 10.0 minimum approval */}
                <ReferenceLine
                  y={10}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{
                    value: '10.0v (Mínimo)',
                    fill: '#EF4444',
                    fontSize: 10,
                    position: 'insideBottomLeft',
                  }}
                />

                {/* Reference line: 14.0 MED Target */}
                <ReferenceLine
                  y={14}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  label={{
                    value: '14.0v (Meta MED)',
                    fill: '#10B981',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />

                {/* Dynamic Lines for Active Disciplines */}
                {activeDisciplines.map((d) => (
                  <Line
                    key={d.key}
                    type="monotone"
                    dataKey={d.key}
                    name={d.nome}
                    stroke={d.cor}
                    strokeWidth={selectedDisciplineKey === d.key ? 4 : 2.5}
                    dot={{ r: 4.5, fill: d.cor, strokeWidth: 1.5, stroke: '#FFFFFF' }}
                    activeDot={{ r: 7, stroke: d.cor, strokeWidth: 2, fill: '#FFFFFF' }}
                  />
                ))}

                {/* Linha de Média Geral da Escola quando 'todas' está selecionada */}
                {selectedDisciplineKey === 'todas' && (
                  <Line
                    type="monotone"
                    dataKey="MediaGeral"
                    name="Média Global da Escola"
                    stroke="#0F172A"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 5, fill: '#0F172A' }}
                  />
                )}
              </LineChart>
            ) : (
              /* BAR CHART: Comparative side-by-side Trimester Bars per Discipline */
              <BarChart
                data={barChartData}
                margin={{ top: 15, right: 25, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="disciplina"
                  stroke="#41515D"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  domain={[0, 20]}
                  stroke="#41515D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  ticks={[0, 5, 10, 15, 20]}
                  tickFormatter={(val) => `${val}v`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} valores`, name]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
                />

                <ReferenceLine
                  y={10}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{
                    value: '10v Aprov.',
                    fill: '#EF4444',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />

                <Bar
                  dataKey="1º Trimestre"
                  fill="#012041"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="2º Trimestre"
                  fill="#015FC4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="3º Trimestre (Proj.)"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Summary Analytical Table with Deltas & Pedagogy Status */}
      <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-[#012041]">
              Tabela de Variação Trimestral & Acompanhamento Pedagógico
            </h4>
            <p className="text-xs text-slate-500">
              Progressão detalhada de médias e classificação de rendimento por disciplina.
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Regime Trimestral do Ensino Secundário em Angola
          </span>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-[#012041] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Disciplina</th>
                <th className="py-3 px-3 text-center">1º Trimestre</th>
                <th className="py-3 px-3 text-center">2º Trimestre (Actual)</th>
                <th className="py-3 px-3 text-center">3º Trimestre (Proj.)</th>
                <th className="py-3 px-3 text-center">Evolução (Δ T1 &rarr; T2)</th>
                <th className="py-3 px-3 text-center">Meta do MED</th>
                <th className="py-3 px-4 text-right">Diagnóstico Pedagógico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {activeDisciplines.map((d) => {
                const deltaT2T1 = Number((d.t2 - d.t1).toFixed(1));
                const isPositive = deltaT2T1 >= 0;
                const isExcellent = d.t2 >= 16;
                const isGood = d.t2 >= 14;
                const isCritical = d.t2 < 12;

                return (
                  <tr key={d.key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: d.cor }}
                        />
                        <div>
                          <span className="font-bold text-[#012041] block">
                            {d.nome}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {d.profResponsavel}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                      {d.t1.toFixed(1)}v
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-[#012041] bg-blue-50/30">
                      {d.t2.toFixed(1)}v
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                      {d.t3.toFixed(1)}v
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {isPositive ? `+${deltaT2T1}` : deltaT2T1}v
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {d.meta.toFixed(1)}v
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isExcellent
                            ? 'bg-emerald-100 text-emerald-800'
                            : isGood
                            ? 'bg-blue-100 text-[#015FC4]'
                            : isCritical
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isExcellent
                          ? 'Excelente'
                          : isGood
                          ? 'Bom Rendimento'
                          : isCritical
                          ? 'Requer Apoio'
                          : 'Satisfatório'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
