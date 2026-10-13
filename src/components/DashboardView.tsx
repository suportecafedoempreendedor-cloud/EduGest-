import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  CreditCard,
  Building,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  LineChart as LineChartIcon,
  Filter,
  UserX,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Check,
  Printer,
  FileDown,
  FileText,
  HardDrive,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { Select } from './ui/Input';
import {
  ViewMode,
  Student,
  Pagamento,
  NotaItem,
  Section,
  StudentAttendanceRecord,
  School,
} from '../types';
import { DashboardInsights } from './dashboard/DashboardInsights';
import { DashboardKPIs } from './dashboard/DashboardKPIs';
import { PrintDashboardReportModal } from './dashboard/PrintDashboardReportModal';

interface DashboardViewProps {
  onNavigate: (view: ViewMode) => void;
  students: Student[];
  notas: NotaItem[];
  payments: Pagamento[];
  sections?: Section[];
  attendanceRecords?: StudentAttendanceRecord[];
  currentSchool?: School;
  onOpenNewEnrollment: () => void;
  onOpenNewPayment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  students,
  notas,
  payments,
  sections = [],
  attendanceRecords = [],
  currentSchool,
  onOpenNewEnrollment,
  onOpenNewPayment,
}) => {
  // Period filter states (Mês / Ano / Trimestre)
  const [selectedYear, setSelectedYear] = useState<string>('2025/2026');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('02'); // Default: Fevereiro 2026 (Actual)
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Default institutional school profile fallback
  const activeSchool: School = useMemo(() => {
    if (currentSchool) return currentSchool;
    return {
      id: 'esc-001',
      nome: 'Colégio Welwitschia Mirabilis',
      nomeComercial: 'Colégio Welwitschia Mirabilis, Lda',
      nif: '5412890312',
      logotipo: 'CWM',
      provincia: 'Luanda',
      municipio: 'Talatona',
      morada: 'Avenida 21 de Janeiro, Morro Bento',
      telefone: '+244 923 456 789',
      email: 'direccao@welwitschia.edu.ao',
      website: 'https://welwitschia.edu.ao',
      estado: 'activa',
      plano: 'Plano Pro',
      valorMensalKz: 125000,
      dataCriacao: '2024-02-15',
      adminNome: 'Dr. Afonso Muandumba',
      adminEmail: 'a.muandumba@welwitschia.edu.ao',
      adminTelefone: '+244 923 456 780',
      totalAlunos: 1480,
      totalProfessores: 64,
      anoLectivoActivo: '2025/2026',
    };
  }, [currentSchool]);

  const PERIOD_OPTIONS = [
    { id: 'todos', label: 'Todo o Ano Lectivo (Consolidado)' },
    { id: 't1', label: '1º Trimestre (Out - Dez)' },
    { id: 't2', label: '2º Trimestre (Jan - Mar · Actual)' },
    { id: 't3', label: '3º Trimestre (Abr - Jun)' },
    { id: '10', label: 'Outubro 2025 (Início Lectivo)' },
    { id: '11', label: 'Novembro 2025' },
    { id: '12', label: 'Dezembro 2025 (Pautas T1)' },
    { id: '01', label: 'Janeiro 2026 (Início T2)' },
    { id: '02', label: 'Fevereiro 2026 (Mês Vigente)' },
    { id: '03', label: 'Março 2026 (Pautas T2)' },
    { id: '04', label: 'Abril 2026 (Início T3)' },
    { id: '05', label: 'Maio 2026' },
    { id: '06', label: 'Junho 2026 (Exames Finais)' },
  ];

  // Calculate dynamic average grade from actual students data
  const mediaGlobalCalculada = useMemo(() => {
    if (students.length === 0) return '14.8';
    const sum = students.reduce((acc, s) => acc + (s.mediaGeral ?? 14.8), 0);
    return (sum / students.length).toFixed(1);
  }, [students]);

  // Dynamic metrics computed based on the selected period and year
  const dynamicMetrics = useMemo(() => {
    const isPastYear = selectedYear === '2024/2025';

    switch (selectedPeriod) {
      case 'todos':
        return {
          totalAlunos: isPastYear ? 1390 : 1480,
          arrecadadoLabel: isPastYear ? '238,0 M Kz' : '264,8 M Kz',
          arrecadadoSub: 'Consolidado de todo o ano lectivo',
          taxaAprovacao: isPastYear ? 85.2 : 88.4,
          mediaGlobal: isPastYear ? '13.9' : '14.8',
          turmasActivas: isPastYear ? 36 : 38,
          assiduidade: 95.9,
          absentismo: 4.1,
          alunosAlertaFaltas: 18,
          proporcaoFaltasJustif: 59,
          labelPeriodo: `Ano Lectivo ${selectedYear} Completo`,
          badgePeriodo: 'Consolidado Anual',
        };
      case 't1':
      case '12':
        return {
          totalAlunos: isPastYear ? 1370 : 1460,
          arrecadadoLabel: isPastYear ? '142,0 M Kz' : '157,8 M Kz',
          arrecadadoSub: 'Fecho financeiro do 1º Trimestre',
          taxaAprovacao: 85.6,
          mediaGlobal: '13.7',
          turmasActivas: 38,
          assiduidade: 94.5,
          absentismo: 5.5,
          alunosAlertaFaltas: 24,
          proporcaoFaltasJustif: 56,
          labelPeriodo: `1º Trimestre · ${selectedYear}`,
          badgePeriodo: '1º Trimestre Concluído',
        };
      case '10':
        return {
          totalAlunos: isPastYear ? 1340 : 1420,
          arrecadadoLabel: '52,8 M Kz',
          arrecadadoSub: 'Matrículas e propinas de Outubro',
          taxaAprovacao: 84.2,
          mediaGlobal: '13.5',
          turmasActivas: 38,
          assiduidade: 96.8,
          absentismo: 3.2,
          alunosAlertaFaltas: 12,
          proporcaoFaltasJustif: 59,
          labelPeriodo: `Outubro 2025 · Início das Aulas`,
          badgePeriodo: '1º Trimestre',
        };
      case '11':
        return {
          totalAlunos: isPastYear ? 1360 : 1445,
          arrecadadoLabel: '53,6 M Kz',
          arrecadadoSub: '92,1% de arrecadação em Novembro',
          taxaAprovacao: 85.9,
          mediaGlobal: '13.8',
          turmasActivas: 38,
          assiduidade: 96.1,
          absentismo: 3.9,
          alunosAlertaFaltas: 16,
          proporcaoFaltasJustif: 56,
          labelPeriodo: `Novembro 2025 · Frequência Regular`,
          badgePeriodo: '1º Trimestre',
        };
      case '01':
        return {
          totalAlunos: isPastYear ? 1380 : 1472,
          arrecadadoLabel: '54,2 M Kz',
          arrecadadoSub: 'Reabertura lectiva de Janeiro',
          taxaAprovacao: 87.5,
          mediaGlobal: '14.2',
          turmasActivas: 38,
          assiduidade: 95.8,
          absentismo: 4.2,
          alunosAlertaFaltas: 19,
          proporcaoFaltasJustif: 60,
          labelPeriodo: `Janeiro 2026 · Abertura 2º Trimestre`,
          badgePeriodo: '2º Trimestre',
        };
      case '03':
        return {
          totalAlunos: 1480,
          arrecadadoLabel: '55,1 M Kz',
          arrecadadoSub: 'Previsão de arrecadação em Março',
          taxaAprovacao: 89.0,
          mediaGlobal: '15.0',
          turmasActivas: 38,
          assiduidade: 96.0,
          absentismo: 4.0,
          alunosAlertaFaltas: 17,
          proporcaoFaltasJustif: 60,
          labelPeriodo: `Março 2026 · Encerramento 2º Trimestre`,
          badgePeriodo: '2º Trimestre',
        };
      case 't3':
      case '04':
      case '05':
      case '06':
        return {
          totalAlunos: 1480,
          arrecadadoLabel: '115,0 M Kz',
          arrecadadoSub: 'Projeção orçamental do 3º Trimestre',
          taxaAprovacao: 89.8,
          mediaGlobal: '15.3',
          turmasActivas: 38,
          assiduidade: 96.5,
          absentismo: 3.5,
          alunosAlertaFaltas: 14,
          proporcaoFaltasJustif: 65,
          labelPeriodo: `3º Trimestre · ${selectedYear} (Fase Final)`,
          badgePeriodo: '3º Trimestre (Projetado)',
        };
      case '02':
      case 't2':
      default:
        return {
          totalAlunos: isPastYear ? 1390 : 1480,
          arrecadadoLabel: '57,0 M Kz',
          arrecadadoSub: '94,8% de adimplência em Fevereiro',
          taxaAprovacao: 88.4,
          mediaGlobal: mediaGlobalCalculada,
          turmasActivas: 38,
          assiduidade: 96.3,
          absentismo: 3.7,
          alunosAlertaFaltas: 18,
          proporcaoFaltasJustif: 62,
          labelPeriodo: `Fevereiro 2026 · 2º Trimestre (Actual)`,
          badgePeriodo: '2º Trimestre (Mês Vigente)',
        };
    }
  }, [selectedYear, selectedPeriod, mediaGlobalCalculada]);

  // Active chart view mode
  const [chartViewType, setChartViewType] = useState<'disciplinas' | 'componentes' | 'aluno'>('disciplinas');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'alu-01');

  // Chart data 1: Quarterly comparison by Discipline (dynamic with selectedPeriod)
  const comparativeDisciplineData = useMemo(() => {
    if (['10', '11', '12', 't1'].includes(selectedPeriod)) {
      return [
        { disciplina: 'Matemática', t1: 13.2, t2: 13.2, meta: 14.5 },
        { disciplina: 'L. Portuguesa', t1: 14.5, t2: 14.5, meta: 15.0 },
        { disciplina: 'Física', t1: 12.8, t2: 12.8, meta: 14.0 },
        { disciplina: 'Química', t1: 13.0, t2: 13.0, meta: 14.5 },
        { disciplina: 'Biologia', t1: 14.9, t2: 14.9, meta: 15.5 },
        { disciplina: 'Informática', t1: 16.2, t2: 16.2, meta: 17.0 },
      ];
    }
    if (['04', '05', '06', 't3'].includes(selectedPeriod)) {
      return [
        { disciplina: 'Matemática', t1: 14.8, t2: 15.5, meta: 16.0 },
        { disciplina: 'L. Portuguesa', t1: 15.6, t2: 16.2, meta: 16.5 },
        { disciplina: 'Física', t1: 13.9, t2: 14.8, meta: 15.0 },
        { disciplina: 'Química', t1: 14.2, t2: 15.0, meta: 15.5 },
        { disciplina: 'Biologia', t1: 16.1, t2: 16.8, meta: 17.0 },
        { disciplina: 'Informática', t1: 17.5, t2: 18.2, meta: 18.5 },
      ];
    }
    return [
      { disciplina: 'Matemática', t1: 13.2, t2: 14.8, meta: 15.0 },
      { disciplina: 'L. Portuguesa', t1: 14.5, t2: 15.6, meta: 16.0 },
      { disciplina: 'Física', t1: 12.8, t2: 13.9, meta: 14.5 },
      { disciplina: 'Química', t1: 13.0, t2: 14.2, meta: 15.0 },
      { disciplina: 'Biologia', t1: 14.9, t2: 16.1, meta: 16.5 },
      { disciplina: 'Informática', t1: 16.2, t2: 17.5, meta: 18.0 },
    ];
  }, [selectedPeriod]);

  // Chart data 2: Evaluation component evolution (MAC vs NPP vs NPT) throughout trimesters
  const componentEvolutionData = useMemo(() => {
    // Integrate live notas values to calculate realistic averages
    const avgMacT2 = notas.length > 0
      ? (notas.reduce((acc, n) => acc + n.mac, 0) / notas.length).toFixed(1)
      : '14.5';
    const avgNppT2 = notas.length > 0
      ? (notas.reduce((acc, n) => acc + n.npp, 0) / notas.length).toFixed(1)
      : '13.8';
    const avgNptT2 = notas.length > 0
      ? (notas.reduce((acc, n) => acc + n.npt, 0) / notas.length).toFixed(1)
      : '15.2';

    return [
      {
        etapa: '1º Trimestre (Final)',
        MAC: 13.8,
        NPP: 13.1,
        NPT: 14.2,
        MT: 13.7,
      },
      {
        etapa: '2º Trimestre (Actual)',
        MAC: Number(avgMacT2),
        NPP: Number(avgNppT2),
        NPT: Number(avgNptT2),
        MT: Number(((Number(avgMacT2) + Number(avgNppT2) + Number(avgNptT2)) / 3).toFixed(1)),
      },
      {
        etapa: '3º Trimestre (Projeção)',
        MAC: 15.4,
        NPP: 14.9,
        NPT: 16.0,
        MT: 15.4,
      },
    ];
  }, [notas]);

  // Chart data 3: Individual student evolution
  const individualStudentData = useMemo(() => {
    const student = students.find((s) => s.id === selectedStudentId) || students[0];
    const studentNotas = notas.filter((n) => n.alunoId === student?.id);

    if (studentNotas.length > 0) {
      return studentNotas.map((n) => ({
        disciplina: n.disciplina,
        MAC: n.mac,
        NPP: n.npp,
        NPT: n.npt,
        MT: n.mt,
      }));
    }

    // Default student progression
    return [
      { disciplina: 'Matemática', MAC: 16, NPP: 15, NPT: 17, MT: 16.0 },
      { disciplina: 'L. Portuguesa', MAC: 15, NPP: 16, NPT: 16, MT: 15.7 },
      { disciplina: 'Física', MAC: 14, NPP: 13, NPT: 15, MT: 14.0 },
      { disciplina: 'Química', MAC: 15, NPP: 15, NPT: 16, MT: 15.3 },
      { disciplina: 'Informática', MAC: 18, NPP: 17, NPT: 19, MT: 18.0 },
    ];
  }, [selectedStudentId, students, notas]);

  // Grade Tier Distribution (faixas de aproveitamento com base nos alunos reais)
  const tierDistributionData = useMemo(() => {
    let excelente = 0; // 17-20
    let bom = 0;       // 14-16.9
    let suficiente = 0;// 10-13.9
    let critico = 0;   // < 10

    students.forEach((s) => {
      const media = s.mediaGeral ?? 14.0;
      if (media >= 17) excelente++;
      else if (media >= 14) bom++;
      else if (media >= 10) suficiente++;
      else critico++;
    });

    return [
      { categoria: 'Excelente (17-20v)', quantidade: excelente, percentagem: `${Math.round((excelente / students.length) * 100)}%` },
      { categoria: 'Bom (14-16v)', quantidade: bom, percentagem: `${Math.round((bom / students.length) * 100)}%` },
      { categoria: 'Suficiente (10-13v)', quantidade: suficiente, percentagem: `${Math.round((suficiente / students.length) * 100)}%` },
      { categoria: 'Não Apto (< 10v)', quantidade: critico, percentagem: `${Math.round((critico / students.length) * 100)}%` },
    ];
  }, [students]);

  // Simulated Monthly Attendance & Absenteeism Data (Outubro a Março)
  const monthlyAbsenteeismData = useMemo(() => {
    return [
      {
        mes: 'Outubro',
        assiduidade: 96.8,
        absentismoTotal: 3.2,
        faltasJustificadas: 1.9,
        faltasInjustificadas: 1.3,
        totalAusencias: 47,
      },
      {
        mes: 'Novembro',
        assiduidade: 96.1,
        absentismoTotal: 3.9,
        faltasJustificadas: 2.2,
        faltasInjustificadas: 1.7,
        totalAusencias: 58,
      },
      {
        mes: 'Dezembro',
        assiduidade: 94.5,
        absentismoTotal: 5.5,
        faltasJustificadas: 3.1,
        faltasInjustificadas: 2.4,
        totalAusencias: 81,
      },
      {
        mes: 'Janeiro',
        assiduidade: 95.8,
        absentismoTotal: 4.2,
        faltasJustificadas: 2.5,
        faltasInjustificadas: 1.7,
        totalAusencias: 62,
      },
      {
        mes: 'Fevereiro',
        assiduidade: 96.3,
        absentismoTotal: 3.7,
        faltasJustificadas: 2.3,
        faltasInjustificadas: 1.4,
        totalAusencias: 55,
      },
      {
        mes: 'Março (Proj.)',
        assiduidade: 96.0,
        absentismoTotal: 4.0,
        faltasJustificadas: 2.4,
        faltasInjustificadas: 1.6,
        totalAusencias: 59,
      },
    ];
  }, []);

  const cycleAttendanceSummary = [
    { ciclo: 'Ensino Primário', taxaAssiduidade: '97.4%', absentismo: '2.6%', status: 'Excelente', criticos: 2 },
    { ciclo: 'Iº Ciclo (7ª - 9ª)', taxaAssiduidade: '95.8%', absentismo: '4.2%', status: 'Regular', criticos: 7 },
    { ciclo: 'IIº Ciclo Geral', taxaAssiduidade: '96.2%', absentismo: '3.8%', status: 'Regular', criticos: 4 },
    { ciclo: 'IIº Ciclo Técnico', taxaAssiduidade: '94.7%', absentismo: '5.3%', status: 'Alerta', criticos: 5 },
  ];

  // Custom Recharts Tooltip following EduGest Design System
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#E2E8F0] p-3 rounded-lg shadow-md text-xs z-50">
          <p className="font-semibold text-[#012041] mb-1.5 border-b border-slate-100 pb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-[#41515D]">{entry.name}:</span>
                </div>
                <span className="font-bold text-[#012041] font-mono tabular-nums">
                  {entry.value} valores
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Absenteeism Tooltip
  const AbsenteeismTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#E2E8F0] p-3 rounded-lg shadow-md text-xs z-50">
          <p className="font-semibold text-[#012041] mb-1.5 border-b border-slate-100 pb-1">
            Mês de {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`abs-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-[#41515D]">{entry.name}:</span>
                </div>
                <span className="font-bold text-[#012041] font-mono tabular-nums">
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Period Selector Card (Filtro por Mês, Ano e Trimestre) */}
      <Card noPadding className="border-[#015FC4]/20 shadow-xs">
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-t-xl">
          {/* Left: Indicator & Active Period */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#012041] text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#012041]">
                  Filtro Temporal de Gestão
                </h3>
                <Badge variant="primary">
                  {dynamicMetrics.badgePeriodo}
                </Badge>
              </div>
              <p className="text-xs text-[#41515D] mt-0.5">
                Período em análise: <strong className="text-[#012041]">{dynamicMetrics.labelPeriodo}</strong>
              </p>
            </div>
          </div>

          {/* Right: Selectors & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Year Selector */}
            <div className="w-36">
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="2025/2026">2025/2026 (Actual)</option>
                <option value="2024/2025">2024/2025 (Histórico)</option>
              </Select>
            </div>

            {/* Period / Month Selector */}
            <div className="w-56">
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Reset Button */}
            {selectedPeriod !== '02' && (
              <button
                onClick={() => {
                  setSelectedYear('2025/2026');
                  setSelectedPeriod('02');
                }}
                className="px-2.5 py-2 rounded-lg text-[#015FC4] hover:bg-blue-50 border border-blue-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                title="Repor para Fevereiro 2026 (Mês Vigente)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Repor Vigente</span>
              </button>
            )}

            {/* Export Official PDF Report Button */}
            <button
              onClick={() => setIsPrintReportOpen(true)}
              className="px-3 py-2 rounded-lg bg-[#015FC4] hover:bg-[#014FA5] text-white transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
              title="Exportar Relatório Oficial de Gestão e Métricas em PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>

        {/* Quick Segmented Shortcut Filter Bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-[#E2E8F0] flex items-center gap-1.5 overflow-x-auto text-xs rounded-b-xl">
          <span className="text-[11px] font-semibold text-[#41515D] uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Atalhos:
          </span>
          {[
            { id: 'todos', label: 'Todo o Ano' },
            { id: 't1', label: '1º Trimestre' },
            { id: 't2', label: '2º Trimestre (Actual)' },
            { id: 't3', label: '3º Trimestre' },
            { id: '10', label: 'Outubro' },
            { id: '12', label: 'Dezembro' },
            { id: '02', label: 'Fevereiro 2026' },
          ].map((quick) => {
            const isSelected = selectedPeriod === quick.id;
            return (
              <button
                key={quick.id}
                onClick={() => setSelectedPeriod(quick.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#015FC4] text-white shadow-xs'
                    : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-200/60'
                }`}
              >
                {quick.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Componente de Cartões de Indicadores Chave (KPIs) Estratégicos */}
      <DashboardKPIs
        students={students}
        sections={sections}
        attendanceRecords={attendanceRecords}
        payments={payments}
        selectedPeriod={selectedPeriod}
        selectedYear={selectedYear}
        onNavigate={onNavigate}
        onOpenNewPayment={onOpenNewPayment}
        onOpenNewEnrollment={onOpenNewEnrollment}
      />

      {/* Institutional Banner */}
      <div className="bg-[#012041] text-white rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold text-[#8EA5B8] uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#015FC4]" />
            Sistema Oficial · EduGest Angola
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Painel Executivo de Gestão Escolar & Académica
          </h2>
          <p className="text-sm text-[#8EA5B8] mt-2 leading-relaxed">
            Monitorização centralizada com análise gráfica de evolução das pautas do Ministério da Educação (MED),
            arrecadação de propinas em Kwanzas (Kz) e indicadores discentes em tempo real.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenNewEnrollment}
            >
              Matricular Novo Aluno
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('pedagogical')}
            >
              Consultar Pautas Trimestrais
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('documents-reports')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-200" />
              Documentos & Relatórios
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('data-export-security')}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/30 flex items-center gap-1.5 cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              Backup Agendado & APD
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPrintReportOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#0263CB]" />
              Relatório PDF Oficial
            </Button>
            <button
              onClick={() => onNavigate('design-system')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0263CB]" />
              Ver Directrizes da Marca
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Indicadores Principais com Azul Tecnológico #015FC4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#41515D]">Total de Estudantes</span>
              <div className="text-2xl font-bold text-[#012041] mt-1 tabular-nums">
                {dynamicMetrics.totalAlunos.toLocaleString('pt-AO')}
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+6,2% vs. ano anterior</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#015FC4] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#41515D]">Arrecadação de Propinas</span>
              <div className="text-2xl font-bold text-[#012041] mt-1 tabular-nums">
                {dynamicMetrics.arrecadadoLabel}
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{dynamicMetrics.arrecadadoSub}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#015FC4] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#41515D]">Aproveitamento Escolar</span>
              <div className="text-2xl font-bold text-[#012041] mt-1 tabular-nums">
                {dynamicMetrics.taxaAprovacao}%
              </div>
              <div className="flex items-center gap-1 text-xs text-[#015FC4] mt-2 font-medium">
                <span>Média global: {dynamicMetrics.mediaGlobal} / 20 valores</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0263CB] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#41515D]">Turmas & Salas Activas</span>
              <div className="text-2xl font-bold text-[#012041] mt-1 tabular-nums">
                {dynamicMetrics.turmasActivas}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#41515D] mt-2 font-medium">
                <span>4 Ciclos · 2 Turnos lectivos</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#015FC4] flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Componente 'Dashboard Insights' (Recharts): Evolução da média de notas por disciplina ao longo dos trimestres */}
      <DashboardInsights
        students={students}
        notas={notas}
        selectedPeriod={selectedPeriod}
        selectedYear={selectedYear}
      />

      {/* Main Interactive Charts Section using Recharts */}
      <Card
        title="Análise e Evolução das Notas Académicas (Recharts)"
        subtitle="Visualização interactiva das notas integradas com os dados discentes segundo os padrões do MED"
        headerAction={
          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setChartViewType('disciplinas')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  chartViewType === 'disciplinas'
                    ? 'bg-white text-[#012041] shadow-xs font-semibold'
                    : 'text-[#41515D] hover:text-[#012041]'
                }`}
              >
                Por Disciplina
              </button>
              <button
                onClick={() => setChartViewType('componentes')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  chartViewType === 'componentes'
                    ? 'bg-white text-[#012041] shadow-xs font-semibold'
                    : 'text-[#41515D] hover:text-[#012041]'
                }`}
              >
                Evolução Trimestral (MAC/NPP/NPT)
              </button>
              <button
                onClick={() => setChartViewType('aluno')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  chartViewType === 'aluno'
                    ? 'bg-white text-[#012041] shadow-xs font-semibold'
                    : 'text-[#41515D] hover:text-[#012041]'
                }`}
              >
                Por Aluno Específico
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Sub-selector when "aluno" is active */}
          {chartViewType === 'aluno' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-[#E2E8F0]">
              <div className="flex items-center gap-2 text-xs text-[#012041]">
                <span className="font-semibold">Seleccionar Aluno:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-[#012041] focus:ring-2 focus:ring-[#015FC4]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nomeCompleto} ({s.turmaNome} - Média: {s.mediaGeral} v.)
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-[#41515D]">
                Visualizando pauta individual de notas do 2º Trimestre
              </div>
            </div>
          )}

          {/* Chart Rendering Area */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartViewType === 'disciplinas' ? (
                /* BarChart: 1º Trimestre vs 2º Trimestre por Disciplina */
                <BarChart
                  data={comparativeDisciplineData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="disciplina"
                    stroke="#41515D"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    domain={[0, 20]}
                    stroke="#41515D"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    ticks={[0, 5, 10, 15, 20]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
                  />
                  {/* Reference line at 10.0 minimum approval threshold */}
                  <ReferenceLine
                    y={10}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Mínimo Aprov. (10v)',
                      fill: '#EF4444',
                      fontSize: 10,
                      position: 'insideBottomRight',
                    }}
                  />
                  {/* Official Brand Palette: #012041 (Azul Marinho) & #015FC4 (Azul Tecnológico) */}
                  <Bar
                    dataKey="t1"
                    name="1º Trimestre (Concluído)"
                    fill="#012041"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="t2"
                    name="2º Trimestre (Actual)"
                    fill="#015FC4"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              ) : chartViewType === 'componentes' ? (
                /* Area/LineChart: Evolution of evaluation components (MAC, NPP, NPT, MT) */
                <AreaChart
                  data={componentEvolutionData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorMT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#015FC4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#015FC4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="etapa"
                    stroke="#41515D"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    domain={[0, 20]}
                    stroke="#41515D"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    ticks={[0, 5, 10, 15, 20]}
                  />
                  <Tooltip content={<CustomTooltip />} />
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
                      value: 'Linha de Aprovação (10v)',
                      fill: '#EF4444',
                      fontSize: 10,
                      position: 'insideBottomRight',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="MT"
                    name="Média Trimestral (MT)"
                    stroke="#015FC4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMT)"
                  />
                  <Line
                    type="monotone"
                    dataKey="MAC"
                    name="MAC (Aval. Contínua)"
                    stroke="#012041"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#012041' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="NPP"
                    name="NPP (Prova Prof.)"
                    stroke="#41515D"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#41515D' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="NPT"
                    name="NPT (Prova Trimestral)"
                    stroke="#0263CB"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#0263CB' }}
                  />
                </AreaChart>
              ) : (
                /* BarChart: Individual student grades across disciplines */
                <BarChart
                  data={individualStudentData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="disciplina"
                    stroke="#41515D"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    domain={[0, 20]}
                    stroke="#41515D"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    ticks={[0, 5, 10, 15, 20]}
                  />
                  <Tooltip content={<CustomTooltip />} />
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
                      value: 'Aprovação (10v)',
                      fill: '#EF4444',
                      fontSize: 10,
                      position: 'insideBottomRight',
                    }}
                  />
                  <Bar
                    dataKey="MAC"
                    name="MAC"
                    fill="#012041"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="NPP"
                    name="NPP"
                    fill="#41515D"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="NPT"
                    name="NPT"
                    fill="#0263CB"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="MT"
                    name="Média Trimestral"
                    fill="#015FC4"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Informational footer about MED standards */}
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#41515D] gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Dados sincronizados com o módulo de Pautas e Histórico dos Alunos</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('pedagogical')}
              className="text-[#015FC4] hover:text-[#014FA5]"
            >
              Abrir Lançamento de Pautas →
            </Button>
          </div>
        </div>
      </Card>

      {/* New Card: Visão Geral do Absentismo Escolar Mensal */}
      <Card
        title="Visão Geral do Absentismo & Assiduidade Mensal"
        subtitle={`Monitorização de frequência escolar · ${dynamicMetrics.labelPeriodo}`}
        headerAction={
          <div className="flex items-center gap-2">
            <Badge variant="success">Assiduidade: {dynamicMetrics.assiduidade}%</Badge>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-slate-50/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#41515D] font-medium">Assiduidade no Período</span>
                <div className="w-7 h-7 rounded-md bg-blue-50 text-[#015FC4] flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-[#012041] mt-1 tabular-nums">
                {dynamicMetrics.assiduidade}%
              </div>
              <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                Conforme as directrizes do MED
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-slate-50/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#41515D] font-medium">Taxa Média de Absentismo</span>
                <div className="w-7 h-7 rounded-md bg-slate-100 text-[#41515D] flex items-center justify-center">
                  <UserX className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-[#012041] mt-1 tabular-nums">
                {dynamicMetrics.absentismo}%
              </div>
              <span className="text-[11px] text-[#41515D] block mt-1">
                Abaixo do limite de alerta (5,0%)
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-slate-50/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#41515D] font-medium">Proporção de Faltas</span>
                <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0263CB] flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-[#012041] mt-1 tabular-nums">
                {dynamicMetrics.proporcaoFaltasJustif}% <span className="text-xs font-normal text-[#41515D]">Justif.</span>
              </div>
              <span className="text-[11px] text-[#41515D] block mt-1">
                {100 - dynamicMetrics.proporcaoFaltasJustif}% injustificadas registradas
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-slate-50/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#41515D] font-medium">Alunos em Alerta de Faltas</span>
                <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums">
                {dynamicMetrics.alunosAlertaFaltas} Alunos
              </div>
              <span className="text-[11px] text-amber-700 font-medium block mt-1">
                Risco de perda de frequência
              </span>
            </div>
          </div>

          {/* Recharts Monthly Attendance & Absenteeism Breakdown */}
          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyAbsenteeismData}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="mes"
                  stroke="#41515D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  domain={[0, 8]}
                  stroke="#41515D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  ticks={[0, 2, 4, 5, 6, 8]}
                  unit="%"
                />
                <Tooltip content={<AbsenteeismTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                />
                {/* Limite de Alerta de Absentismo Máximo Regulamentar */}
                <ReferenceLine
                  y={5}
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Limite Crítico MED (5,0%)',
                    fill: '#D97706',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />
                <Bar
                  dataKey="faltasJustificadas"
                  name="Faltas Justificadas (%)"
                  fill="#015FC4"
                  stackId="abs"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="faltasInjustificadas"
                  name="Faltas Injustificadas (%)"
                  fill="#F59E0B"
                  stackId="abs"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Line
                  type="monotone"
                  dataKey="absentismoTotal"
                  name="Absentismo Global (%)"
                  stroke="#012041"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#012041' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown by Academic Cycle and Legal Notice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
            <div>
              <span className="text-xs font-semibold text-[#012041] block mb-2">
                Frequência por Ciclo de Ensino:
              </span>
              <div className="space-y-2">
                {cycleAttendanceSummary.map((item) => (
                  <div
                    key={item.ciclo}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#012041]">{item.ciclo}</span>
                      <span className="text-[11px] text-[#41515D] block">
                        Absentismo: {item.absentismo} · {item.criticos} alunos sob atenção
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#012041] tabular-nums">
                        {item.taxaAssiduidade}
                      </span>
                      {item.status === 'Excelente' && <Badge variant="success">Excelente</Badge>}
                      {item.status === 'Regular' && <Badge variant="primary">Regular</Badge>}
                      {item.status === 'Alerta' && <Badge variant="warning">Atenção</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#015FC4] mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Regulamento de Frequência do MED (Angola)</span>
                </div>
                <p className="text-xs text-[#41515D] leading-relaxed">
                  Conforme o Decreto Executivo nº 212/20 do Ministério da Educação, o limite máximo de faltas injustificadas por ano lectivo não deve exceder o triplo da carga horária semanal da disciplina.
                </p>
                <p className="text-[11px] text-[#41515D] mt-2 italic">
                  Notificações preventivas são enviadas automaticamente aos encarregados de educação via SMS e portal EduGest ao atingir 50% do limite de faltas.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
                <span className="text-[#012041] font-medium">Acção da Secretaria:</span>
                <button
                  onClick={() => onNavigate('students')}
                  className="text-xs font-semibold text-[#015FC4] hover:text-[#014FA5] cursor-pointer"
                >
                  Ver Lista de Alunos em Risco →
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Grade Distribution by Tiers + Official Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Bar Chart (Span 2) */}
        <Card
          className="lg:col-span-2"
          title="Distribuição por Faixas de Desempenho Escolar"
          subtitle="Classificação dos alunos matriculados segundo a escala oficial de 0 a 20 valores do MED"
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tierDistributionData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  stroke="#41515D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  dataKey="categoria"
                  type="category"
                  stroke="#012041"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  width={140}
                />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} estudantes (${item.payload.percentagem})`,
                    'Total Alunos',
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  name="Estudantes"
                  radius={[0, 4, 4, 0]}
                  fill="#015FC4"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#E2E8F0] text-center">
            {tierDistributionData.map((tier) => (
              <div key={tier.categoria} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-[#41515D] truncate">{tier.categoria.split(' ')[0]}</div>
                <div className="text-base font-bold text-[#012041] mt-0.5 tabular-nums">
                  {tier.quantidade} <span className="text-xs font-normal text-[#41515D]">({tier.percentagem})</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Notices & Operational Alerts */}
        <div className="space-y-6">
          <Card
            title="Avisos do Ministério (MED)"
            subtitle="Normas e circulares do calendário escolar"
          >
            <div className="space-y-3">
              <Alert type="info" title="Circulares do 2º Trimestre">
                Prazo de entrega das notas de frequência (MAC e NPP) à Secretaria até 28 de Fevereiro.
              </Alert>

              <Alert type="warning" title="Inscrições para Exames Nacionais">
                Homologação dos cadernos de encargos da 12ª classe em articulação com o INFQD.
              </Alert>
            </div>
          </Card>

          <Card
            title="Distribuição Geográfica"
            subtitle="Alunos matriculados por província de origem"
          >
            <div className="space-y-3 text-xs">
              {[
                { prov: 'Luanda', count: 980, pct: '66%' },
                { prov: 'Benguela', count: 240, pct: '16%' },
                { prov: 'Huambo', count: 150, pct: '10%' },
                { prov: 'Huíla', count: 110, pct: '8%' },
              ].map((item) => (
                <div key={item.prov} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-[#012041]">{item.prov}</span>
                    <span className="text-[#41515D] tabular-nums">{item.count} alunos ({item.pct})</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0263CB] h-full rounded-full"
                      style={{ width: item.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Movements: Students and Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card
          title="Alunos Recentes Cadastrados"
          subtitle="Últimos processos atribuídos no sistema"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('students')}
              className="text-[#015FC4]"
            >
              Ver Todos
            </Button>
          }
          noPadding
        >
          <div className="divide-y divide-[#E2E8F0]">
            {students.slice(0, 4).map((student) => (
              <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#012041] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {student.nomeCompleto.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#012041]">{student.nomeCompleto}</div>
                    <div className="text-xs text-[#41515D]">
                      {student.turmaNome} · <span className="font-mono">{student.processo}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {student.statusPropina === 'em_dia' && (
                    <Badge variant="success">Propina Regular</Badge>
                  )}
                  {student.statusPropina === 'pendente' && (
                    <Badge variant="warning">Pendente</Badge>
                  )}
                  {student.statusPropina === 'atrasado' && (
                    <Badge variant="error">Em Atraso</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Financial Payments */}
        <Card
          title="Últimos Pagamentos Confirmados"
          subtitle="Recibos emitidos via Multicaixa e Bancos"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('financial')}
              className="text-[#015FC4]"
            >
              Ver Finanças
            </Button>
          }
          noPadding
        >
          <div className="divide-y divide-[#E2E8F0]">
            {payments.slice(0, 4).map((pag) => (
              <div key={pag.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-[#012041]">{pag.alunoNome}</div>
                  <div className="text-xs text-[#41515D]">
                    {pag.metodo} · <span className="font-mono text-[#012041]">{pag.reciboNumero}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#012041] font-mono tabular-nums">
                    {pag.valorKz.toLocaleString('pt-AO')} Kz
                  </div>
                  <div className="text-xs text-[#41515D]">{pag.mesReferencia}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal de Exportação do Relatório Oficial da Instituição em PDF */}
      <PrintDashboardReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        school={activeSchool}
        students={students}
        notas={notas}
        payments={payments}
        sections={sections}
        attendanceRecords={attendanceRecords}
        selectedPeriod={selectedPeriod}
        selectedYear={selectedYear}
        periodLabel={PERIOD_OPTIONS.find((p) => p.id === selectedPeriod)?.label || 'Fevereiro 2026'}
        mediaGlobal={dynamicMetrics.mediaGlobal}
        taxaAprovacao={dynamicMetrics.taxaAprovacao}
      />
    </div>
  );
};
