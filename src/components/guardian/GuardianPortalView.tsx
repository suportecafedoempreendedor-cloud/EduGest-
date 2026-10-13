import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  FileText,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  ChevronRight,
  Download,
  Printer,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  QrCode,
  UserCheck,
  Check,
  X,
  Send,
  Eye,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select, Input } from '../ui/Input';
import {
  Student,
  Guardian,
  GuardianStudentRelation,
  NotaItem,
  Section,
  School,
  DocumentoItem,
  ContaCorrenteItem,
  MatriculaRecord,
  AssiduidadeRecord,
  PaymentReference,
  OfficialReceipt,
  SchoolAnnouncement,
  HorarioAula,
  GuardianNotification,
  PaymentItemType,
} from '../../types';
import { SwitchStudentModal } from './SwitchStudentModal';
import { NewPaymentReferenceModal } from './NewPaymentReferenceModal';
import { OfficialReceiptModal } from './OfficialReceiptModal';
import { RequestDocumentModal } from './RequestDocumentModal';

export type GuardianTab =
  | 'overview'
  | 'grades'
  | 'performance'
  | 'attendance'
  | 'schedule'
  | 'finances'
  | 'payments'
  | 'receipts'
  | 'documents'
  | 'announcements'
  | 'enrollment'
  | 'notifications';

interface GuardianPortalViewProps {
  currentSchool: School;
  guardians: Guardian[];
  guardianStudentRelations: GuardianStudentRelation[];
  students: Student[];
  notas: NotaItem[];
  sections: Section[];
  contaCorrenteMock: Record<string, ContaCorrenteItem[]>;
  documentosMock: Record<string, DocumentoItem[]>;
  matriculasMock: Record<string, MatriculaRecord[]>;
  assiduidadeMock: Record<string, AssiduidadeRecord[]>;
  paymentReferences: PaymentReference[];
  receipts: OfficialReceipt[];
  announcements: SchoolAnnouncement[];
  timetables: Record<string, HorarioAula[]>;
  notifications: GuardianNotification[];
  onSavePaymentReference: (ref: PaymentReference) => void;
  onPayReference: (receipt: OfficialReceipt, referenceId?: string) => void;
  onRequestDocument: (doc: DocumentoItem) => void;
  onMarkNotificationRead: (notifId: string) => void;
  onConfirmRenewal: (studentId: string) => void;
  onNotify: (msg: string) => void;
}

export const GuardianPortalView: React.FC<GuardianPortalViewProps> = ({
  currentSchool,
  guardians,
  guardianStudentRelations,
  students,
  notas,
  sections,
  contaCorrenteMock,
  documentosMock,
  matriculasMock,
  assiduidadeMock,
  paymentReferences,
  receipts,
  announcements,
  timetables,
  onSavePaymentReference,
  onPayReference,
  onRequestDocument,
  onMarkNotificationRead,
  onConfirmRenewal,
  onNotify,
}) => {
  // 1. Encarregado activo (Simulação de Encarregado)
  const [selectedGuardianId, setSelectedGuardianId] = useState<string>(
    guardians[0]?.id || 'enc-01'
  );

  const activeGuardian =
    guardians.find((g) => g.id === selectedGuardianId) || guardians[0];

  // 2. ISOLAMENTO ESTRITO: Apenas educandos associados a este encarregado
  const associatedRelations = useMemo(() => {
    return guardianStudentRelations.filter((r) => r.guardianId === activeGuardian.id);
  }, [guardianStudentRelations, activeGuardian.id]);

  const guardianStudents = useMemo(() => {
    const studentIds = associatedRelations.map((r) => r.studentId);
    return students.filter((s) => studentIds.includes(s.id));
  }, [associatedRelations, students]);

  // 3. Educando seleccionado actualmente (Trocar educando)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    guardianStudents[0]?.id || ''
  );

  // Sync if selected guardian changes
  React.useEffect(() => {
    if (guardianStudents.length > 0 && !guardianStudents.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(guardianStudents[0].id);
    }
  }, [guardianStudents, selectedStudentId]);

  const currentStudent =
    guardianStudents.find((s) => s.id === selectedStudentId) || guardianStudents[0];

  // Tab State
  const [activeTab, setActiveTab] = useState<GuardianTab>('overview');

  // Modals
  const [isSwitchStudentOpen, setIsSwitchStudentOpen] = useState(false);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [selectedReceiptForModal, setSelectedReceiptForModal] =
    useState<OfficialReceipt | null>(null);
  const [isRequestDocOpen, setIsRequestDocOpen] = useState(false);

  // Filtered Notifications for this Guardian
  const [guardianNotifs, setGuardianNotifs] = useState<GuardianNotification[]>(
    () => [
      {
        id: 'notif-01',
        guardianId: activeGuardian.id,
        studentId: currentStudent?.id || 'alu-01',
        studentNome: currentStudent?.nomeCompleto || 'Educando',
        tipo: 'nota',
        titulo: 'Nova Avaliação Trimestral Lançada',
        mensagem: 'Nota da Prova do Professor (NPP) lançada em Matemática com 17 valores.',
        dataHora: '2026-03-11 10:30',
        lida: false,
        tabDestino: 'grades',
      },
      {
        id: 'notif-02',
        guardianId: activeGuardian.id,
        studentId: currentStudent?.id || 'alu-01',
        studentNome: currentStudent?.nomeCompleto || 'Educando',
        tipo: 'comunicado',
        titulo: 'Convocatória para Reunião de Pais',
        mensagem: 'A Direcção Pedagógica convida todos os encarregados para a assembleia de dia 18.',
        dataHora: '2026-03-08 14:15',
        lida: false,
        tabDestino: 'announcements',
      },
      {
        id: 'notif-03',
        guardianId: activeGuardian.id,
        studentId: currentStudent?.id || 'alu-01',
        studentNome: currentStudent?.nomeCompleto || 'Educando',
        tipo: 'pagamento',
        titulo: 'Referência Multicaixa Disponível',
        mensagem: 'A referência de pagamento da propina de Março já se encontra gerada.',
        dataHora: '2026-03-01 08:00',
        lida: true,
        tabDestino: 'payments',
      },
      {
        id: 'notif-04',
        guardianId: activeGuardian.id,
        studentId: currentStudent?.id || 'alu-01',
        studentNome: currentStudent?.nomeCompleto || 'Educando',
        tipo: 'falta',
        titulo: 'Aviso de Assiduidade: Atraso',
        mensagem: 'Atraso de 15 minutos registado na primeira aula de Língua Portuguesa.',
        dataHora: '2026-03-06 07:45',
        lida: false,
        tabDestino: 'attendance',
      },
    ]
  );

  const unreadNotifsCount = guardianNotifs.filter((n) => !n.lida).length;

  // Student-specific data
  const studentNotas = useMemo(() => {
    if (!currentStudent) return [];
    return notas.filter((n) => n.alunoId === currentStudent.id);
  }, [notas, currentStudent]);

  const studentContaCorrente = useMemo(() => {
    if (!currentStudent) return [];
    return contaCorrenteMock[currentStudent.id] || [
      {
        id: `cc-default-1`,
        studentId: currentStudent.id,
        data: '2026-03-01',
        descricao: 'Mensalidade Escolar · Março 2026',
        tipo: 'debito',
        valorKz: 38500,
        saldoAposKz: -38500,
        status: currentStudent.statusPropina === 'em_dia' ? 'pago' : 'pendente',
      },
      {
        id: `cc-default-2`,
        studentId: currentStudent.id,
        data: '2026-02-04',
        descricao: 'Liquidação de Propina · Fevereiro 2026',
        tipo: 'credito',
        valorKz: 38500,
        saldoAposKz: 0,
        referenciaDoc: 'RC-2026/01294',
        metodo: 'Multicaixa Express',
        status: 'pago',
      },
    ];
  }, [contaCorrenteMock, currentStudent]);

  const studentDocumentos = useMemo(() => {
    if (!currentStudent) return [];
    return documentosMock[currentStudent.id] || [
      {
        id: `doc-std-1`,
        studentId: currentStudent.id,
        titulo: 'Cópia do Bilhete de Identidade / Cédula',
        tipo: 'BI',
        dataEmissao: '2024-09-02',
        estado: 'Valido',
        tamanho: '1.2 MB (PDF)',
      },
      {
        id: `doc-std-2`,
        studentId: currentStudent.id,
        titulo: 'Declaração de Matrícula Homologada',
        tipo: 'Declaracao_Matricula',
        dataEmissao: '2025-09-10',
        estado: 'Valido',
        tamanho: '850 KB (PDF)',
        codigoVerificacao: 'MED-MAT-2025-9921',
      },
    ];
  }, [documentosMock, currentStudent]);

  const studentMatriculas = useMemo(() => {
    if (!currentStudent) return [];
    return matriculasMock[currentStudent.id] || [
      {
        id: `mat-rec-1`,
        studentId: currentStudent.id,
        numeroMatricula: currentStudent.numeroMatricula,
        anoLectivo: currentStudent.anoLectivo,
        classe: currentStudent.classe,
        turma: currentStudent.turmaNome,
        dataMatricula: '2025-09-02',
        responsavelRegisto: 'Secretaria Geral',
        estado: 'Confirmada',
      },
    ];
  }, [matriculasMock, currentStudent]);

  const studentAssiduidade = useMemo(() => {
    if (!currentStudent) return [];
    return assiduidadeMock[currentStudent.id] || [
      {
        id: `ass-cur-1`,
        studentId: currentStudent.id,
        mes: 'Fevereiro 2026',
        totalAulas: 80,
        presencas: 78,
        faltasJustificadas: 2,
        faltasInjustificadas: 0,
        percentagemFrequencia: 97.5,
      },
      {
        id: `ass-cur-2`,
        studentId: currentStudent.id,
        mes: 'Março 2026 (Em curso)',
        totalAulas: 36,
        presencas: 34,
        faltasJustificadas: 1,
        faltasInjustificadas: 1,
        percentagemFrequencia: 94.4,
      },
    ];
  }, [assiduidadeMock, currentStudent]);

  const studentPaymentRefs = useMemo(() => {
    if (!currentStudent) return [];
    return paymentReferences.filter((r) => r.studentId === currentStudent.id);
  }, [paymentReferences, currentStudent]);

  const studentReceipts = useMemo(() => {
    if (!currentStudent) return [];
    return receipts.filter((r) => r.studentId === currentStudent.id);
  }, [receipts, currentStudent]);

  // Schedule for current student's turma
  const currentTurmaSchedule = useMemo(() => {
    if (!currentStudent) return [];
    return (
      timetables[currentStudent.turmaId] ||
      timetables['t-10cfb-a'] ||
      []
    );
  }, [timetables, currentStudent]);

  // Academic Performance Metrics
  const performanceStats = useMemo(() => {
    if (studentNotas.length === 0) {
      return {
        mediaGeral: currentStudent?.mediaGeral || 16.4,
        totalDisciplinas: 6,
        positivas: 6,
        negativas: 0,
        melhorDisciplina: 'Matemática (17.5)',
        disciplinaApoio: 'Nenhuma (Aproveitamento Excelente)',
      };
    }

    const mts = studentNotas.map((n) => n.mt);
    const media = Number((mts.reduce((a, b) => a + b, 0) / mts.length).toFixed(1));
    const positivas = studentNotas.filter((n) => n.mt >= 10).length;
    const negativas = studentNotas.filter((n) => n.mt < 10).length;

    const sortedByMt = [...studentNotas].sort((a, b) => b.mt - a.mt);
    const best = sortedByMt[0];
    const lowest = sortedByMt[sortedByMt.length - 1];

    return {
      mediaGeral: media,
      totalDisciplinas: studentNotas.length,
      positivas,
      negativas,
      melhorDisciplina: `${best.disciplina} (${best.mt})`,
      disciplinaApoio: lowest.mt < 10 ? `${lowest.disciplina} (${lowest.mt} valores)` : 'Nenhuma em risco',
    };
  }, [studentNotas, currentStudent]);

  // Handle pay now directly
  const handleDirectPayRef = (ref: PaymentReference) => {
    const receiptNum = `RC-${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;
    const newReceipt: OfficialReceipt = {
      id: `rec-${Date.now()}`,
      numeroRecibo: receiptNum,
      escolaId: currentSchool.id,
      escolaNome: currentSchool.nome,
      escolaNif: currentSchool.nif,
      studentId: ref.studentId,
      studentNome: ref.studentNome,
      studentProcesso: currentStudent?.processo || currentStudent?.numeroMatricula || 'EG-2025/1042',
      studentTurma: currentStudent?.turmaNome || 'Turma',
      guardianNome: activeGuardian.nome,
      guardianBi: activeGuardian.documento,
      dataEmissao: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tipoItem: ref.tipo,
      descricao: ref.descricao,
      valorKz: ref.valorKz,
      metodoPagamento: 'Multicaixa Express (Online)',
      referenciaOperacao: `MCX-${ref.referencia.replace(/\s/g, '')}`,
      hashCertificacao: `${Math.random().toString(36).substring(2, 10)}-agt-valido`,
      operadorSecretaria: 'Portal do Encarregado (Auto-Serviço)',
    };

    onPayReference(newReceipt, ref.id);
    setSelectedReceiptForModal(newReceipt);
    onNotify(`Pagamento de ${ref.valorKz.toLocaleString('pt-AO')} Kz liquidado com sucesso! Recibo ${receiptNum} emitido.`);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. INSTITUTIONAL GUARDIAN PORTAL HERO BANNER */}
      {/* ========================================================= */}
      <div className="bg-[#012041] text-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-800 relative overflow-hidden">
        {/* Background glow subtle */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#015FC4]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-blue-200 flex-wrap">
              <span className="font-semibold uppercase tracking-wider">{currentSchool.nome}</span>
              <span aria-hidden="true">·</span>
              <span>Portal Oficial da Família & Encarregados</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Canal Conectado
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
              Portal do Encarregado de Educação
            </h1>

            <p className="text-xs sm:text-sm text-[#8EA5B8] mt-1.5 max-w-2xl">
              Acompanhamento pedagógico, pautas trimestrais, assiduidade, propinas via
              Multicaixa e comunicação direta com a direcção pedagógica.
            </p>
          </div>

          {/* Encarregado Simulation Profile Card */}
          <div className="p-3.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 flex items-center justify-between gap-4 min-w-[280px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#015FC4] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {activeGuardian.nome.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] text-blue-200 uppercase font-semibold block">
                  Encarregado(a) Conectado(a)
                </span>
                <span className="text-xs font-bold text-white block">
                  {activeGuardian.nome}
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  BI: {activeGuardian.documento} · {activeGuardian.telefone}
                </span>
              </div>
            </div>

            {/* Quick Guardian Switcher for Demo */}
            {guardians.length > 1 && (
              <select
                value={selectedGuardianId}
                onChange={(e) => setSelectedGuardianId(e.target.value)}
                className="bg-[#012041] border border-white/20 text-white text-[11px] font-semibold px-2 py-1 rounded cursor-pointer"
                title="Trocar Encarregado (Simulação)"
              >
                {guardians.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#012041] text-white">
                    {g.nome.split(' ')[0]} ({g.grauParentescoPrincipal})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. PROMINENT "TROCAR EDUCANDO" STRIP */}
        {/* ========================================================= */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
              Educando Activo:
            </span>

            {/* Student Chips to Quick Switch */}
            <div className="flex items-center gap-2 flex-wrap">
              {guardianStudents.map((st) => {
                const isSelected = st.id === currentStudent?.id;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#012041] shadow-sm ring-2 ring-[#015FC4]'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {st.foto || st.fotografia ? (
                      <img
                        src={st.foto || st.fotografia}
                        alt={st.nomeCompleto}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-blue-300 text-[#012041] flex items-center justify-center font-bold text-[10px] shrink-0">
                        {st.nomeCompleto.charAt(0)}
                      </div>
                    )}
                    <span>{st.nomeCompleto}</span>
                    <span className="text-[10px] opacity-75 font-mono">({st.turmaNome})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-white/20"
              icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              onClick={() => setIsSwitchStudentOpen(true)}
            >
              Trocar Educando ({guardianStudents.length} associados)
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="bg-[#015FC4]"
              icon={<CreditCard className="w-3.5 h-3.5" />}
              onClick={() => setIsNewPaymentOpen(true)}
            >
              Pagar Propinas / Encargos
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ACTIVE STUDENT SUMMARY CARD */}
      {/* ========================================================= */}
      {currentStudent && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentStudent.foto || currentStudent.fotografia ? (
              <img
                src={currentStudent.foto || currentStudent.fotografia}
                alt={currentStudent.nomeCompleto}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#CBD5E1] shadow-xs shrink-0"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#012041] text-white flex items-center justify-center text-xl font-bold shrink-0">
                {currentStudent.nomeCompleto.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#012041]">
                  {currentStudent.nomeCompleto}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-blue-50 text-[#015FC4]">
                  {currentStudent.classe} · {currentStudent.turmaNome}
                </span>
              </div>

              <div className="text-xs text-[#41515D] mt-1 flex items-center gap-3 flex-wrap">
                <span>Nº Processo: <strong className="font-mono text-[#012041]">{currentStudent.numeroMatricula}</strong></span>
                <span aria-hidden="true">·</span>
                <span>BI: <strong className="font-mono text-[#012041]">{currentStudent.bi}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Curso: <strong>{currentStudent.curso}</strong></span>
                <span aria-hidden="true">·</span>
                <span>
                  Propina:{' '}
                  <strong
                    className={
                      currentStudent.statusPropina === 'em_dia'
                        ? 'text-emerald-700'
                        : currentStudent.statusPropina === 'pendente'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }
                  >
                    {currentStudent.statusPropina === 'em_dia'
                      ? 'Em Dia'
                      : currentStudent.statusPropina === 'pendente'
                      ? 'Pendente'
                      : 'Em Atraso'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#E2E8F0]">
            <div className="text-left md:text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Média Actual</span>
              <span className="text-xl font-bold text-[#015FC4] block">
                {performanceStats.mediaGeral} <span className="text-xs font-normal text-slate-500">/ 20</span>
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block" />

            <div className="text-left md:text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Assiduidade</span>
              <span className="text-xl font-bold text-emerald-700 block">
                97% <span className="text-xs font-normal text-slate-500">presente</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. RESPONSIVE TAB NAVIGATION BAR */}
      {/* ========================================================= */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'overview' as GuardianTab, label: 'Educandos & Painel', icon: <Users className="w-4 h-4" /> },
            { id: 'grades' as GuardianTab, label: 'Notas (Pautas)', icon: <GraduationCap className="w-4 h-4" /> },
            { id: 'performance' as GuardianTab, label: 'Aproveitamento', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'attendance' as GuardianTab, label: 'Faltas & Presenças', icon: <CalendarCheck className="w-4 h-4" /> },
            { id: 'schedule' as GuardianTab, label: 'Horário de Aulas', icon: <Clock className="w-4 h-4" /> },
            { id: 'finances' as GuardianTab, label: 'Conta Corrente', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'payments' as GuardianTab, label: 'Pagamentos (Multicaixa)', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'receipts' as GuardianTab, label: 'Recibos Oficiais', icon: <FileText className="w-4 h-4" /> },
            { id: 'documents' as GuardianTab, label: 'Documentos', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'announcements' as GuardianTab, label: 'Comunicados', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'enrollment' as GuardianTab, label: 'Matrícula & Confirmação', icon: <CheckCircle2 className="w-4 h-4" /> },
            {
              id: 'notifications' as GuardianTab,
              label: 'Notificações',
              icon: <Bell className="w-4 h-4" />,
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#012041] text-white shadow-xs'
                    : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & EDUCANDOS */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Notification Alert Banner */}
          {unreadNotifsCount > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-blue-900">
                <Bell className="w-4 h-4 text-[#015FC4] shrink-0" />
                <span>
                  Tem <strong>{unreadNotifsCount} notificação(ões) nova(s)</strong> por ler no portal escolar.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('notifications')}
                className="font-bold text-[#015FC4] hover:underline"
              >
                Ver Notificações →
              </button>
            </div>
          )}

          {/* Educandos Catalogue Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#012041]">
                  Educandos Associados ({guardianStudents.length})
                </h3>
                <p className="text-xs text-[#41515D]">
                  Acesso seguro e restrito apenas aos educandos tutelados por {activeGuardian.nome}.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                onClick={() => setIsSwitchStudentOpen(true)}
              >
                Trocar Educando
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guardianStudents.map((st) => {
                const isSelected = st.id === currentStudent?.id;

                return (
                  <div
                    key={st.id}
                    className={`bg-white rounded-xl border p-5 shadow-xs space-y-4 transition-all ${
                      isSelected
                        ? 'border-[#015FC4] ring-2 ring-[#015FC4]/20'
                        : 'border-[#E2E8F0] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {st.foto || st.fotografia ? (
                          <img
                            src={st.foto || st.fotografia}
                            alt={st.nomeCompleto}
                            className="w-12 h-12 rounded-xl object-cover border border-[#CBD5E1] shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#012041] text-white flex items-center justify-center font-bold text-base shrink-0">
                            {st.nomeCompleto.substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <h4 className="font-bold text-sm text-[#012041] leading-tight">
                            {st.nomeCompleto}
                          </h4>
                          <span className="text-[11px] text-[#41515D] block mt-0.5">
                            {st.classe} · {st.turmaNome}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="text-[10px] font-bold bg-[#015FC4] text-white px-2 py-0.5 rounded">
                          Em Foco
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-[#015FC4]"
                          onClick={() => setSelectedStudentId(st.id)}
                        >
                          Seleccionar
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Processo</span>
                        <span className="font-mono font-bold text-[#012041]">{st.numeroMatricula}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Propina</span>
                        <span
                          className={`font-semibold ${
                            st.statusPropina === 'em_dia'
                              ? 'text-emerald-700'
                              : st.statusPropina === 'pendente'
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}
                        >
                          {st.statusPropina === 'em_dia'
                            ? 'Em Dia'
                            : st.statusPropina === 'pendente'
                            ? 'Pendente'
                            : 'Em Atraso'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                      <span className="text-slate-500">Média: <strong className="text-[#012041]">{st.mediaGeral || 16.2}</strong></span>
                      <button
                        onClick={() => {
                          setSelectedStudentId(st.id);
                          setActiveTab('grades');
                        }}
                        className="text-[#015FC4] font-semibold hover:underline"
                      >
                        Ver Boletim →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dashboard Summary Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Widget 1: Notas & Aproveitamento Rápido */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#012041] uppercase tracking-wide flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#015FC4]" />
                  Aproveitamento Escolar
                </span>
                <span className="text-xs font-bold font-mono text-[#015FC4]">
                  {performanceStats.mediaGeral} / 20
                </span>
              </div>
              <p className="text-xs text-[#41515D]">
                {currentStudent?.nomeCompleto} obteve{' '}
                <strong>{performanceStats.positivas} disciplinas positivas</strong> de{' '}
                {performanceStats.totalDisciplinas} avaliadas no trimestre.
              </p>
              <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 space-y-1">
                <span className="font-bold block">Ponto Forte:</span>
                <span>{performanceStats.melhorDisciplina}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-[#015FC4]"
                onClick={() => setActiveTab('grades')}
              >
                Abrir Pauta Completa →
              </Button>
            </div>

            {/* Widget 2: Propinas & Multicaixa */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#012041] uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Estado das Propinas
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    currentStudent?.statusPropina === 'em_dia'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {currentStudent?.statusPropina === 'em_dia' ? 'Regularizado' : 'Pendente'}
                </span>
              </div>
              <p className="text-xs text-[#41515D]">
                Mensalidade de Março (38.500 Kz). Efectue o pagamento por referência Multicaixa
                ou aplique Multicaixa Express.
              </p>
              <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Ref Multicaixa</span>
                  <span className="font-mono font-bold text-[#012041]">923 881 042</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-[#015FC4] text-xs"
                  onClick={() => setActiveTab('payments')}
                >
                  Pagar
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-[#015FC4]"
                onClick={() => setActiveTab('receipts')}
              >
                Consultar Recibos Emitidos →
              </Button>
            </div>

            {/* Widget 3: Próximas Aulas & Horário */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#012041] uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Horário de Hoje (Segunda)
                </span>
                <span className="text-xs text-slate-500">5 tempos</span>
              </div>
              <div className="divide-y divide-[#E2E8F0] text-xs">
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-semibold text-[#012041]">07:30 - Matemática</span>
                  <span className="text-[11px] text-slate-500">Sala 01</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-semibold text-[#012041]">09:20 - Física</span>
                  <span className="text-[11px] text-slate-500">Lab. Física</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-semibold text-[#012041]">10:10 - Língua Portuguesa</span>
                  <span className="text-[11px] text-slate-500">Sala 01</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-[#015FC4]"
                onClick={() => setActiveTab('schedule')}
              >
                Ver Grade Semanal Completa →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: NOTAS & BOLETIM TRIMESTRAL (PAUTAS OFICIAIS MED) */}
      {/* ========================================================= */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Pauta de Notas & Boletim Trimestral Oficial
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Educando: <strong>{currentStudent?.nomeCompleto}</strong> · {currentStudent?.turmaNome} ·
                  Ano Lectivo: {currentStudent?.anoLectivo}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => window.print()}
                >
                  Imprimir Boletim
                </Button>
              </div>
            </div>

            {/* Sistema de Avaliação do MED Explanatory Banner */}
            <div className="px-5 py-3 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#015FC4]" />
                Cálculo oficial do Ministério da Educação (MED): <strong>MT = (MAC + NPP + NPT) / 3</strong>
              </span>
              <span className="text-slate-500 hidden sm:inline">Escala: 0 a 20 valores (Aprovação: &ge; 10)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Disciplina Curricular</th>
                    <th className="py-3 px-3 text-center">Trimestre</th>
                    <th className="py-3 px-3 text-center">MAC</th>
                    <th className="py-3 px-3 text-center">NPP</th>
                    <th className="py-3 px-3 text-center">NPT</th>
                    <th className="py-3 px-4 text-center">Média Trimestral (MT)</th>
                    <th className="py-3 px-4 text-center">Classificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {studentNotas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                        Nenhuma nota lançada ainda para este educando no trimestre corrente.
                      </td>
                    </tr>
                  ) : (
                    studentNotas.map((nota) => {
                      const isPositive = nota.mt >= 10;

                      return (
                        <tr key={nota.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#012041]">
                            {nota.disciplina}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                            {nota.trimestre}º Trim.
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                            {nota.mac.toFixed(1)}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                            {nota.npp.toFixed(1)}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                            {nota.npt.toFixed(1)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-sm">
                            <span
                              className={`px-2.5 py-0.5 rounded ${
                                isPositive
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-red-50 text-red-800'
                              }`}
                            >
                              {nota.mt.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`text-xs font-semibold ${
                                nota.mt >= 16
                                  ? 'text-emerald-700'
                                  : nota.mt >= 14
                                  ? 'text-blue-700'
                                  : nota.mt >= 10
                                  ? 'text-slate-700'
                                  : 'text-red-700'
                              }`}
                            >
                              {nota.mt >= 16
                                ? 'Excelente'
                                : nota.mt >= 14
                                ? 'Bom'
                                : nota.mt >= 10
                                ? 'Suficiente'
                                : 'Insuficiente'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-[#41515D]">
                Total de Disciplinas: <strong>{studentNotas.length}</strong> · Positivas:{' '}
                <strong className="text-emerald-700">{performanceStats.positivas}</strong> · Negativas:{' '}
                <strong className="text-red-700">{performanceStats.negativas}</strong>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Média Global do Período:</span>
                <span className="text-base font-bold font-mono text-[#015FC4]">
                  {performanceStats.mediaGeral} valores
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: APROVEITAMENTO & ANÁLISE DE DESEMPENHO */}
      {/* ========================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <span className="text-[11px] text-slate-500 uppercase font-bold block">
                Média Ponderada Global
              </span>
              <span className="text-3xl font-bold font-mono text-[#015FC4] mt-1 block">
                {performanceStats.mediaGeral}
              </span>
              <span className="text-xs text-emerald-700 font-semibold block mt-1">
                +1.2 valores em relação ao 1º trimestre
              </span>
            </Card>

            <Card>
              <span className="text-[11px] text-slate-500 uppercase font-bold block">
                Taxa de Sucesso Curricular
              </span>
              <span className="text-3xl font-bold font-mono text-emerald-700 mt-1 block">
                100%
              </span>
              <span className="text-xs text-slate-600 block mt-1">
                Todas as disciplinas com aproveitamento positivo (&ge; 10)
              </span>
            </Card>

            <Card>
              <span className="text-[11px] text-slate-500 uppercase font-bold block">
                Quadro de Mérito Escolar
              </span>
              <span className="text-xl font-bold text-[#012041] mt-1 block flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" /> Elegível
              </span>
              <span className="text-xs text-slate-600 block mt-1">
                Média &ge; 16.0 qualifica para distinção académica no encerramento
              </span>
            </Card>
          </div>

          {/* Visual Performance Progression Bar Breakdown */}
          <Card>
            <h3 className="text-sm font-bold text-[#012041] mb-3">
              Distribuição de Notas por Disciplina (2º Trimestre)
            </h3>

            <div className="space-y-3">
              {studentNotas.map((n) => {
                const pct = (n.mt / 20) * 100;
                const isGood = n.mt >= 14;

                return (
                  <div key={n.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#012041]">{n.disciplina}</span>
                      <span className="font-mono font-bold text-slate-700">
                        {n.mt.toFixed(1)} / 20 valores ({Math.round(pct)}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          n.mt >= 16
                            ? 'bg-emerald-600'
                            : isGood
                            ? 'bg-[#015FC4]'
                            : n.mt >= 10
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: FALTAS & ASSIDUIDADE */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Registo Mensal de Assiduidade & Frequência
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Regulamento do MED: Limite mínimo de 75% de presença para validação do ano lectivo.
                </p>
              </div>

              <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold">
                Situação Regular
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Mês de Referência</th>
                    <th className="py-3 px-3 text-center">Total de Tempos</th>
                    <th className="py-3 px-3 text-center">Presenças</th>
                    <th className="py-3 px-3 text-center">Faltas Justificadas</th>
                    <th className="py-3 px-3 text-center">Faltas Injustificadas</th>
                    <th className="py-3 px-4 text-center">% de Frequência</th>
                    <th className="py-3 px-4 text-center">Parecer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {studentAssiduidade.map((ass) => {
                    const isGood = ass.percentagemFrequencia >= 75;

                    return (
                      <tr key={ass.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-bold text-[#012041]">{ass.mes}</td>
                        <td className="py-3.5 px-3 text-center font-mono">{ass.totalAulas}</td>
                        <td className="py-3.5 px-3 text-center font-mono text-emerald-700 font-semibold">
                          {ass.presencas}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-blue-700">
                          {ass.faltasJustificadas}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-red-700 font-semibold">
                          {ass.faltasInjustificadas}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              isGood ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                            }`}
                          >
                            {ass.percentagemFrequencia.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-xs font-semibold text-emerald-700">
                            {isGood ? 'Regular' : 'Atenção / Risco'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: HORÁRIO DE AULAS */}
      {/* ========================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Horário Semanal de Aulas · {currentStudent?.turmaNome}
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Turno da Manhã (07:30 - 12:40) · Sala Principal: Sala 01
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Imprimir Horário
              </Button>
            </div>

            <div className="p-5 overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 min-w-[700px]">
                {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'].map(
                  (dia) => {
                    const aulasDia = currentTurmaSchedule.filter((h) => h.diaSemana === dia);

                    return (
                      <div
                        key={dia}
                        className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 space-y-2.5"
                      >
                        <span className="text-xs font-bold text-[#012041] uppercase tracking-wide block pb-1 border-b border-slate-200">
                          {dia}
                        </span>

                        <div className="space-y-2">
                          {aulasDia.map((aula) => (
                            <div
                              key={aula.id}
                              className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-[11px] font-mono text-[#015FC4]">
                                <span>{aula.tempo}º Tempo</span>
                                <span>{aula.horaInicio} - {aula.horaFim}</span>
                              </div>
                              <span className="font-bold text-[#012041] block">
                                {aula.disciplina}
                              </span>
                              <div className="text-[11px] text-slate-500 flex justify-between">
                                <span>{aula.sala}</span>
                                <span className="truncate max-w-[90px]">{aula.professor.split(' ')[1]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: CONTA CORRENTE */}
      {/* ========================================================= */}
      {activeTab === 'finances' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Extracto de Conta Corrente do Educando
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Movimentos de débito (facturação de propinas) e crédito (liquidação e pagamentos).
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<CreditCard className="w-4 h-4" />}
                onClick={() => setIsNewPaymentOpen(true)}
              >
                Efectuar Pagamento
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Descrição do Movimento</th>
                    <th className="py-3 px-3 text-center">Tipo</th>
                    <th className="py-3 px-4 text-right">Valor em Kz</th>
                    <th className="py-3 px-4 text-center">Referência / Documento</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {studentContaCorrente.map((cc) => {
                    const isCredit = cc.tipo === 'credito';

                    return (
                      <tr key={cc.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-mono text-slate-600">{cc.data}</td>
                        <td className="py-3.5 px-4 font-bold text-[#012041]">{cc.descricao}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              isCredit ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                            }`}
                          >
                            {isCredit ? 'Crédito' : 'Débito'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          <span className={isCredit ? 'text-emerald-700' : 'text-slate-800'}>
                            {isCredit ? '+' : '-'} {cc.valorKz.toLocaleString('pt-AO')} Kz
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                          {cc.referenciaDoc || 'FACT-INTERNA'}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`text-xs font-semibold ${
                              cc.status === 'pago' ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {cc.status === 'pago' ? 'Liquidado' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: PAGAMENTOS & REFERÊNCIAS MULTICAIXA */}
      {/* ========================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#012041]">
                Central de Pagamento por Referência Multicaixa
              </h3>
              <p className="text-xs text-[#41515D] mt-0.5">
                Pague em qualquer Caixa Automático (ATM), Multicaixa Express ou Internet Banking.
              </p>
            </div>

            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewPaymentOpen(true)}
            >
              Novo Pagamento / Gerar Referência
            </Button>
          </div>

          {/* Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentPaymentRefs.length === 0 ? (
              <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-[#E2E8F0]">
                Não há referências de pagamento pendentes para este educando.
              </div>
            ) : (
              studentPaymentRefs.map((ref) => {
                const isPaid = ref.estado === 'pago';

                return (
                  <div
                    key={ref.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#015FC4] block">
                          {ref.tipo}
                        </span>
                        <h4 className="font-bold text-sm text-[#012041] mt-0.5">
                          {ref.descricao}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isPaid ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {isPaid ? 'Pago' : 'Pendente'}
                      </span>
                    </div>

                    {/* Multicaixa Official Data Box */}
                    <div className="p-3.5 bg-slate-50 border border-[#CBD5E1] rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Entidade:</span>
                        <span className="font-mono font-bold text-sm text-[#012041]">
                          {ref.entidade}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Referência:</span>
                        <span className="font-mono font-bold text-sm text-[#015FC4]">
                          {ref.referencia}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Montante:</span>
                        <span className="font-mono font-bold text-base text-[#012041]">
                          {ref.valorKz.toLocaleString('pt-AO')} Kz
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#41515D]">
                      <span>Válido até: <strong>{ref.dataValidade}</strong></span>
                      {!isPaid && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-[#015FC4] text-xs"
                          onClick={() => handleDirectPayRef(ref)}
                        >
                          Pagar Agora
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: RECIBOS OFICIAIS */}
      {/* ========================================================= */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Histórico de Recibos Oficiais Certificados
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Comprovativos emitidos com certificação e assinatura digital da escola.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nº Recibo</th>
                    <th className="py-3 px-4">Data Emissão</th>
                    <th className="py-3 px-4">Encargo / Discriminação</th>
                    <th className="py-3 px-4">Método de Pagamento</th>
                    <th className="py-3 px-4 text-right">Valor em Kz</th>
                    <th className="py-3 px-4 text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {studentReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                        Nenhum recibo registado para este educando.
                      </td>
                    </tr>
                  ) : (
                    studentReceipts.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#015FC4]">
                          {rec.numeroRecibo}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                          {rec.dataEmissao}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#012041]">
                          {rec.descricao}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          {rec.metodoPagamento}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#012041]">
                          {rec.valorKz.toLocaleString('pt-AO')} Kz
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedReceiptForModal(rec)}
                          >
                            Ver / Imprimir
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: DOCUMENTOS */}
      {/* ========================================================= */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Processo Individual & Documentos do Educando
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Descarregue declarações emitidas ou solicite nova emissão à secretaria escolar.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsRequestDocOpen(true)}
              >
                Solicitar Novo Documento
              </Button>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {studentDocumentos.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#015FC4] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div>
                      <span className="font-bold text-[#012041] block text-sm">
                        {doc.titulo}
                      </span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">
                        Emissão: {doc.dataEmissao} · Tamanho: {doc.tamanho} · Estado: {doc.estado}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Download className="w-3.5 h-3.5" />}
                      onClick={() => onNotify(`A transferir documento "${doc.titulo}"...`)}
                    >
                      Descarregar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 10: COMUNICADOS DA DIRECÇÃO */}
      {/* ========================================================= */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {announcements.map((com) => (
              <div
                key={com.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase text-[#015FC4] bg-blue-50 px-2 py-0.5 rounded">
                        {com.categoria}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Publicado a {com.dataPublicacao}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#012041]">{com.titulo}</h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      com.prioridade === 'urgente'
                        ? 'bg-red-50 text-red-800'
                        : com.prioridade === 'alta'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {com.prioridade}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#41515D] leading-relaxed">
                  {com.conteudo}
                </p>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500">
                  <span>Autor: <strong>{com.autor}</strong></span>
                  {com.anexoNome && (
                    <button
                      onClick={() => onNotify(`A transferir anexo "${com.anexoNome}"...`)}
                      className="text-[#015FC4] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> {com.anexoNome}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 11: MATRÍCULA & RENOVAÇÃO */}
      {/* ========================================================= */}
      {activeTab === 'enrollment' && (
        <div className="space-y-5">
          <Card noPadding>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Situação Cadastral de Matrícula
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Registo oficial de matrícula no Ministério da Educação (MED).
                </p>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Matrícula Activa
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-[#E2E8F0]">
                  <span className="text-slate-500 block">Número de Matrícula</span>
                  <span className="font-mono font-bold text-sm text-[#012041] block mt-0.5">
                    {currentStudent?.numeroMatricula}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-[#E2E8F0]">
                  <span className="text-slate-500 block">Classe & Turma Actual</span>
                  <span className="font-bold text-sm text-[#012041] block mt-0.5">
                    {currentStudent?.classe} · {currentStudent?.turmaNome}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-[#E2E8F0]">
                  <span className="text-slate-500 block">Ano Lectivo Homologado</span>
                  <span className="font-bold text-sm text-[#012041] block mt-0.5">
                    {currentStudent?.anoLectivo}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Renewal Box for Next Year */}
          <div className="bg-gradient-to-r from-blue-900 to-[#012041] text-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                  Período Oficial de Confirmação & Renovação
                </span>
                <h3 className="text-lg font-bold mt-1">
                  Confirmação de Matrícula para o Ano Lectivo 2026/2027
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Garanta a vaga do educando para o próximo ano lectivo através da confirmação
                  digital antecipada. Não necessita deslocar-se presencialmente à secretaria escolar.
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/15">
              <span className="text-xs text-slate-300">
                Taxa de Confirmação: <strong>25.000 Kz</strong> (Seguro Escolar Incluído)
              </span>

              <Button
                variant="primary"
                className="bg-[#015FC4] hover:bg-[#0263CB]"
                onClick={() => {
                  if (currentStudent) {
                    onConfirmRenewal(currentStudent.id);
                  }
                }}
              >
                Confirmar Renovação de Matrícula
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 12: CENTRAL DE NOTIFICAÇÕES */}
      {/* ========================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-5 border-b border-[#E2E8F0] bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Central de Notificações do Encarregado
                </h3>
                <p className="text-xs text-[#41515D] mt-0.5">
                  Avisos automáticos de notas, atrasos, faltas e cobranças de propinas.
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGuardianNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));
                  onNotify('Todas as notificações marcadas como lidas.');
                }}
              >
                Marcar Todas como Lidas
              </Button>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {guardianNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    !notif.lida ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.tipo === 'nota'
                          ? 'bg-emerald-100 text-emerald-700'
                          : notif.tipo === 'falta'
                          ? 'bg-amber-100 text-amber-700'
                          : notif.tipo === 'pagamento'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {notif.tipo === 'nota' ? (
                        <GraduationCap className="w-5 h-5" />
                      ) : notif.tipo === 'falta' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : notif.tipo === 'pagamento' ? (
                        <CreditCard className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#012041]">{notif.titulo}</span>
                        {!notif.lida && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#41515D] mt-0.5">{notif.mensagem}</p>
                      <span className="text-[11px] text-slate-400 font-mono block mt-1">
                        {notif.studentNome} · {notif.dataHora}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setGuardianNotifs((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, lida: true } : n))
                        );
                        if (notif.tabDestino) {
                          setActiveTab(notif.tabDestino as any);
                        }
                      }}
                    >
                      Ver Detalhes →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* INTERACTIVE MODALS */}
      {/* ========================================================= */}
      <SwitchStudentModal
        isOpen={isSwitchStudentOpen}
        onClose={() => setIsSwitchStudentOpen(false)}
        students={guardianStudents}
        selectedStudentId={selectedStudentId}
        onSelectStudent={(id) => {
          setSelectedStudentId(id);
          const st = guardianStudents.find((s) => s.id === id);
          if (st) onNotify(`Perfil alterado para ${st.nomeCompleto}`);
        }}
        guardianNome={activeGuardian.nome}
      />

      <NewPaymentReferenceModal
        isOpen={isNewPaymentOpen}
        onClose={() => setIsNewPaymentOpen(false)}
        students={guardianStudents}
        initialStudentId={selectedStudentId}
        guardianNome={activeGuardian.nome}
        guardianBi={activeGuardian.documento}
        escolaId={currentSchool.id}
        escolaNome={currentSchool.nome}
        escolaNif={currentSchool.nif}
        onGenerateReference={(ref) => {
          onSavePaymentReference(ref);
          onNotify(`Referência Multicaixa gerada: ${ref.referencia} (${ref.valorKz.toLocaleString('pt-AO')} Kz)`);
        }}
        onPayImmediately={(receipt, refId) => {
          onPayReference(receipt, refId);
          setSelectedReceiptForModal(receipt);
          onNotify(`Pagamento liquidado com sucesso! Recibo ${receipt.numeroRecibo} emitido.`);
        }}
      />

      <OfficialReceiptModal
        isOpen={!!selectedReceiptForModal}
        onClose={() => setSelectedReceiptForModal(null)}
        receipt={selectedReceiptForModal}
      />

      <RequestDocumentModal
        isOpen={isRequestDocOpen}
        onClose={() => setIsRequestDocOpen(false)}
        student={currentStudent}
        onRequestSuccess={(doc) => {
          onRequestDocument(doc);
          onNotify(`Documento "${doc.titulo}" gerado com sucesso! Código: ${doc.codigoVerificacao}`);
        }}
      />
    </div>
  );
};
