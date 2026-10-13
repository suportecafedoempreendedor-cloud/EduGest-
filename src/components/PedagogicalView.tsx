import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  Filter,
  Save,
  Download,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Edit2,
  Lock,
  Unlock,
  Check,
  X,
  Clock,
  Layers,
  Award,
  ShieldAlert,
  Search,
  Eye,
  Send,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import {
  Student,
  NotaItem,
  UserRole,
} from '../types';
import {
  PeriodoLectivoConfig,
  RegraCalculoMedia,
  NotaAcademicaCompleta,
  HistoricoAlteracaoNota,
  EstadoAprovacaoNota,
} from '../types/academicModule';
import {
  INITIAL_PERIODOS_LECTIVOS,
  INITIAL_REGRAS_CALCULO_MEDIA,
  INITIAL_NOTAS_ACADEMICAS,
  INITIAL_HISTORICO_ALTERACOES,
} from '../data/mockAcademicModuleData';
import { TURMAS_INICIAIS, DISCIPLINAS_POR_CURSO } from '../data/mockData';
import {
  calcularMediaTrimestral,
  classificarAproveitamento,
} from '../services/academicGradingEngine';
import { BoletimDigitalModal } from './academic/BoletimDigitalModal';
import { BloqueioPeriodoModal } from './academic/BloqueioPeriodoModal';
import { JustificativaAlteracaoNotaModal } from './academic/JustificativaAlteracaoNotaModal';
import { exportToCsv } from '../utils/documentExportUtils';

interface PedagogicalViewProps {
  students: Student[];
  notas: NotaItem[];
  onUpdateNota: (updatedNota: NotaItem) => void;
}

export const PedagogicalView: React.FC<PedagogicalViewProps> = ({
  students,
  notas,
  onUpdateNota,
}) => {
  // Abas principais do Módulo Académico
  const [activeTab, setActiveTab] = useState<
    'lancamento_professor' | 'coordenacao_aprovacao' | 'pautas' | 'boletins' | 'periodos' | 'auditoria' | 'aproveitamento'
  >('lancamento_professor');

  // Modo de perfil activo dentro do módulo (Professor vs Coordenação)
  const [visaoPapel, setVisaoPapel] = useState<'professor' | 'coordenacao'>('professor');

  // Dados do Módulo Académico
  const [periodos, setPeriodos] = useState<PeriodoLectivoConfig[]>(INITIAL_PERIODOS_LECTIVOS);
  const [regrasMedia, setRegrasMedia] = useState<RegraCalculoMedia[]>(INITIAL_REGRAS_CALCULO_MEDIA);
  const [notasAcademicas, setNotasAcademicas] = useState<NotaAcademicaCompleta[]>(INITIAL_NOTAS_ACADEMICAS);
  const [historicoAuditoria, setHistoricoAuditoria] = useState<HistoricoAlteracaoNota[]>(INITIAL_HISTORICO_ALTERACOES);

  // Selecções activas
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('t-10cfb-a');
  const [selectedTrimestre, setSelectedTrimestre] = useState<number>(2);
  const selectedTurma = TURMAS_INICIAIS.find((t) => t.id === selectedTurmaId) || TURMAS_INICIAIS[0];
  const disciplinasDisponiveis = DISCIPLINAS_POR_CURSO[selectedTurma.curso] || ['Matemática', 'Língua Portuguesa', 'Física', 'Química'];
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>(disciplinasDisponiveis[0]);

  // Regra de média activa
  const regraAtiva = regrasMedia[0];

  // Período lectivo correspondente ao trimestre seleccionado
  const periodoActivo = useMemo(() => {
    return periodos.find((p) => p.trimestre === selectedTrimestre) || periodos[1];
  }, [periodos, selectedTrimestre]);

  // Alunos da turma seleccionada
  const alunosDaTurma = useMemo(() => {
    return students.filter((s) => s.turmaId === selectedTurmaId || s.turmaNome.includes('10ª Classe'));
  }, [students, selectedTurmaId]);

  // Modais
  const [boletimStudent, setBoletimStudent] = useState<Student | null>(null);
  const [isBloqueioModalOpen, setIsBloqueioModalOpen] = useState(false);
  const [retificandoNota, setRetificandoNota] = useState<NotaAcademicaCompleta | null>(null);

  // Mensagens de feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Obter ou instanciar nota académica do aluno
  const getNotaItem = (aluno: Student): NotaAcademicaCompleta => {
    const existing = notasAcademicas.find(
      (n) =>
        n.alunoId === aluno.id &&
        n.disciplinaNome === selectedDisciplina &&
        n.trimestre === selectedTrimestre
    );

    if (existing) return existing;

    // Calcular default baseado no histórico do mock
    const mac = 12.0;
    const npp = 11.5;
    const npt = 13.0;
    const mt = calcularMediaTrimestral(mac, npp, npt, regraAtiva);

    return {
      id: `nt-auto-${aluno.id}-${selectedDisciplina}-${selectedTrimestre}`,
      escolaId: aluno.escolaId,
      alunoId: aluno.id,
      alunoNome: aluno.nomeCompleto,
      alunoProcesso: aluno.processo,
      turmaId: selectedTurmaId,
      turmaNome: selectedTurma.nome,
      classe: selectedTurma.nome.split(' ')[0],
      disciplinaId: `disc-${selectedDisciplina.toLowerCase()}`,
      disciplinaNome: selectedDisciplina,
      professorId: 'prof-001',
      professorNome: 'Prof. Titular de Disciplina',
      trimestre: selectedTrimestre as 1 | 2 | 3,
      anoLectivo: aluno.anoLectivo,
      mac,
      npp,
      npt,
      mt,
      estado: 'rascunho',
      dataLancamento: new Date().toISOString().split('T')[0],
      bloqueadaParaEdicao: false,
      quantidadeAlteracoes: 0,
    };
  };

  // Edição em linha de notas pelo Professor
  const handleAtualizarNotaProfessor = (
    aluno: Student,
    campo: 'mac' | 'npp' | 'npt',
    novoValor: number
  ) => {
    const notaAtual = getNotaItem(aluno);

    // REGRA DE SEGURANÇA 1: Período bloqueado impede edições
    if (periodoActivo.estado === 'bloqueado' || periodoActivo.estado === 'encerrado') {
      showNotification('error', `O ${periodoActivo.nome} está bloqueado pela Coordenação. Não é permitido lançar notas.`);
      return;
    }

    // REGRA DE SEGURANÇA 2: Nota aprovada não pode ser alterada directamente
    if (notaAtual.estado === 'aprovada') {
      showNotification('error', `A nota de ${aluno.nomeCompleto} já foi APROVADA. Requer fluxo formal de retificação.`);
      setRetificandoNota(notaAtual);
      return;
    }

    // Validar escala angolana do MED (0 a 20)
    const valorValido = Math.max(0, Math.min(20, novoValor));

    const updatedMac = campo === 'mac' ? valorValido : notaAtual.mac;
    const updatedNpp = campo === 'npp' ? valorValido : notaAtual.npp;
    const updatedNpt = campo === 'npt' ? valorValido : notaAtual.npt;

    const novaMt = calcularMediaTrimestral(updatedMac, updatedNpp, updatedNpt, regraAtiva);

    const updatedNota: NotaAcademicaCompleta = {
      ...notaAtual,
      mac: updatedMac,
      npp: updatedNpp,
      npt: updatedNpt,
      mt: novaMt,
      estado: 'rascunho', // volta a rascunho se foi alterada antes de submeter
      dataLancamento: new Date().toISOString().split('T')[0],
    };

    setNotasAcademicas((prev) => {
      const idx = prev.findIndex((n) => n.id === updatedNota.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedNota;
        return copy;
      }
      return [...prev, updatedNota];
    });

    // Sincronizar com o estado global compatível
    onUpdateNota({
      id: updatedNota.id,
      alunoId: updatedNota.alunoId,
      alunoNome: updatedNota.alunoNome,
      disciplina: updatedNota.disciplinaNome,
      turmaId: updatedNota.turmaId,
      trimestre: updatedNota.trimestre,
      mac: updatedNota.mac,
      npp: updatedNota.npp,
      npt: updatedNota.npt,
      mt: updatedNota.mt,
    });
  };

  // Submeter notas da turma para aprovação da Coordenação
  const handleSubmeterNotasTurma = () => {
    if (periodoActivo.estado === 'bloqueado') {
      showNotification('error', 'O período lectivo está bloqueado.');
      return;
    }

    let submetidas = 0;
    setNotasAcademicas((prev) =>
      prev.map((n) => {
        if (
          n.turmaId === selectedTurmaId &&
          n.disciplinaNome === selectedDisciplina &&
          n.trimestre === selectedTrimestre &&
          n.estado === 'rascunho'
        ) {
          submetidas++;
          return {
            ...n,
            estado: 'submetida',
            dataSubmissao: new Date().toISOString().split('T')[0],
            bloqueadaParaEdicao: true,
          };
        }
        return n;
      })
    );

    showNotification(
      'success',
      `Pauta de ${selectedDisciplina} submetida à Coordenação Pedagógica para revisão (${submetidas || alunosDaTurma.length} notas).`
    );
  };

  // Coordenação: Aprovar Pauta ou Nota
  const handleAprovarNotas = (notaId?: string) => {
    setNotasAcademicas((prev) =>
      prev.map((n) => {
        if (notaId ? n.id === notaId : n.turmaId === selectedTurmaId && n.disciplinaNome === selectedDisciplina) {
          return {
            ...n,
            estado: 'aprovada',
            dataAprovacao: new Date().toISOString().split('T')[0],
            aprovadoPor: 'Coordenação Pedagógica',
            bloqueadaParaEdicao: true,
          };
        }
        return n;
      })
    );

    showNotification('success', 'Notas homologadas e aprovadas com sucesso pela Coordenação.');
  };

  // Coordenação: Rejeitar Pauta ou Nota com Justificativa
  const handleRejeitarNotas = (motivo: string, notaId?: string) => {
    setNotasAcademicas((prev) =>
      prev.map((n) => {
        if (notaId ? n.id === notaId : n.turmaId === selectedTurmaId && n.disciplinaNome === selectedDisciplina) {
          return {
            ...n,
            estado: 'rejeitada',
            motivoRejeicao: motivo,
            bloqueadaParaEdicao: false,
          };
        }
        return n;
      })
    );

    showNotification('info', 'Notas devolvidas ao Professor titular com indicação de correcções.');
  };

  // Confirmar Retificação com Registro de Auditoria Obrigatório
  const handleConfirmarRetificacao = (
    notaId: string,
    novosValores: { mac: number; npp: number; npt: number; mt: number },
    justificativa: string,
    autorizacaoId: string
  ) => {
    const notaAnterior = notasAcademicas.find((n) => n.id === notaId);
    if (!notaAnterior) return;

    // Novo registo no Histórico de Auditoria
    const novoRegistroAuditoria: HistoricoAlteracaoNota = {
      id: `aud-${Date.now()}`,
      notaId,
      alunoId: notaAnterior.alunoId,
      alunoNome: notaAnterior.alunoNome,
      disciplina: notaAnterior.disciplinaNome,
      trimestre: notaAnterior.trimestre,
      campoAlterado: 'mt',
      valorAnterior: notaAnterior.mt,
      valorNovo: novosValores.mt,
      autorId: 'prof-001',
      autorNome: 'Prof. Titular / Coordenação',
      autorPapel: visaoPapel === 'professor' ? 'professor' : 'coordenador',
      motivoJustificacao: justificativa,
      autorizacaoCoordenacaoId: autorizacaoId,
      autorizadoPor: 'Coordenação Pedagógica Central',
      dataHora: new Date().toLocaleString('pt-AO'),
    };

    setHistoricoAuditoria((prev) => [novoRegistroAuditoria, ...prev]);

    // Actualiza a nota e mantém o estado aprovado com carimbo de retificação
    setNotasAcademicas((prev) =>
      prev.map((n) => {
        if (n.id === notaId) {
          return {
            ...n,
            mac: novosValores.mac,
            npp: novosValores.npp,
            npt: novosValores.npt,
            mt: novosValores.mt,
            quantidadeAlteracoes: n.quantidadeAlteracoes + 1,
            ultimaAlteracao: new Date().toISOString().split('T')[0],
          };
        }
        return n;
      })
    );

    showNotification('success', `Nota retificada com sucesso sob o despacho ${autorizacaoId}.`);
  };

  // Exportar Pauta da Turma para Excel
  const handleExportPautaExcel = () => {
    const headers = [
      'Nº Processo',
      'Nome do Aluno',
      'Turma',
      'Disciplina',
      'Trimestre',
      'MAC (30%)',
      'NPP (30%)',
      'NPT (40%)',
      'Média Trimestral (MT)',
      'Resultado',
      'Estado',
    ];

    const rows = alunosDaTurma.map((aluno) => {
      const n = getNotaItem(aluno);
      const classif = classificarAproveitamento(n.mt);
      return [
        aluno.processo,
        aluno.nomeCompleto,
        selectedTurma.nome,
        selectedDisciplina,
        `${selectedTrimestre}º Trimestre`,
        n.mac.toFixed(1),
        n.npp.toFixed(1),
        n.npt.toFixed(1),
        n.mt.toFixed(1),
        classif.classificacao,
        n.estado.toUpperCase(),
      ];
    });

    exportToCsv(
      `pauta_${selectedTurma.nome.replace(/\s+/g, '_')}_${selectedDisciplina}_tri${selectedTrimestre}`,
      headers,
      rows
    );

    showNotification('success', 'Pauta oficial exportada para Excel com codificação UTF-8 BOM.');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          CABEÇALHO OFICIAL: MÓDULO ACADÉMICO & PAUTAS DO MED
         ======================================================== */}
      <div className="bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] rounded-xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
            <span>Módulo Académico Oficial</span>
            <span aria-hidden="true">·</span>
            <span>Sistema de Avaliação do Ministério da Educação (MED)</span>
            <span aria-hidden="true">·</span>
            <span className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-200 border border-blue-400/30">
              Cálculo 100% Determinístico (Sem IA)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestão Pedagógica, Pautas & Avaliações
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed max-w-3xl">
            Lançamento e controlo de avaliações (MAC, NPP, NPT), aprovação colegial pela Coordenação,
            bloqueio de períodos lectivos, emissão de pautas por turma, boletins digitais e auditoria
            inviolável de alterações de notas.
          </p>

          {/* Seletor de Papel / Modo Operacional */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
            <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/10">
              <span className="text-[11px] text-blue-200 px-2 font-semibold uppercase">Modo Activo:</span>
              <button
                onClick={() => {
                  setVisaoPapel('professor');
                  setActiveTab('lancamento_professor');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  visaoPapel === 'professor'
                    ? 'bg-white text-[#012041] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Visão do Professor
              </button>
              <button
                onClick={() => {
                  setVisaoPapel('coordenacao');
                  setActiveTab('coordenacao_aprovacao');
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  visaoPapel === 'coordenacao'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Coordenação Pedagógica
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-blue-200">Período Lectivo:</span>
              <span className="font-bold text-white flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md">
                {periodoActivo.estado === 'bloqueado' ? (
                  <Lock className="w-3.5 h-3.5 text-rose-300" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-emerald-300" />
                )}
                {periodoActivo.nome} ({periodoActivo.estado.toUpperCase()})
              </span>
            </div>
          </div>

          {/* Abas Superiores de Navegação */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab('lancamento_professor')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'lancamento_professor'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Edit2 className="w-4 h-4" />
              <span>Lançamento de Notas</span>
            </button>

            <button
              onClick={() => setActiveTab('coordenacao_aprovacao')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'coordenacao_aprovacao'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Revisão & Aprovação</span>
            </button>

            <button
              onClick={() => setActiveTab('pautas')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'pautas'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Pautas por Turma</span>
            </button>

            <button
              onClick={() => setActiveTab('boletins')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'boletins'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Boletins Digitais</span>
            </button>

            <button
              onClick={() => setActiveTab('periodos')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'periodos'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Períodos Lectivos</span>
            </button>

            <button
              onClick={() => setActiveTab('auditoria')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'auditoria'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Auditoria de Notas ({historicoAuditoria.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('aproveitamento')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'aproveitamento'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Relatórios de Aproveitamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banner de Notificação / Feedback */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedbackMsg.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          ABA 1: LANÇAMENTO DE NOTAS (VISÃO DO PROFESSOR)
         ======================================================== */}
      {activeTab === 'lancamento_professor' && (
        <Card>
          <div className="p-6 space-y-6">
            {/* Barra de Selecção: Turma, Trimestre, Disciplina */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50/75 border border-gray-200 rounded-xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Turma Atribuída
                </label>
                <select
                  value={selectedTurmaId}
                  onChange={(e) => setSelectedTurmaId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                >
                  {TURMAS_INICIAIS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.curso})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Disciplina
                </label>
                <select
                  value={selectedDisciplina}
                  onChange={(e) => setSelectedDisciplina(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                >
                  {disciplinasDisponiveis.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Trimestre Lectivo
                </label>
                <select
                  value={selectedTrimestre}
                  onChange={(e) => setSelectedTrimestre(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                >
                  <option value={1}>1º Trimestre (Encerrado)</option>
                  <option value={2}>2º Trimestre (Em Curso)</option>
                  <option value={3}>3º Trimestre (Futuro)</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  icon={<Send className="w-3.5 h-3.5" />}
                  onClick={handleSubmeterNotasTurma}
                  disabled={periodoActivo.estado === 'bloqueado'}
                >
                  Submeter à Coordenação
                </Button>
              </div>
            </div>

            {/* Aviso de Bloqueio se aplicável */}
            {periodoActivo.estado === 'bloqueado' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Atenção:</strong> O {periodoActivo.nome} está bloqueado pela Coordenação Pedagógica.
                  O formulário está em modo de leitura estrita.
                </span>
              </div>
            )}

            {/* Grelha de Lançamento de Notas */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-700 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Processo</th>
                    <th className="py-3 px-3">Nome Completo do Estudante</th>
                    <th className="py-3 px-3 text-center w-28">MAC (30%)</th>
                    <th className="py-3 px-3 text-center w-28">NPP (30%)</th>
                    <th className="py-3 px-3 text-center w-28">NPT (40%)</th>
                    <th className="py-3 px-3 text-center w-28">Média Trim.</th>
                    <th className="py-3 px-3 text-center">Aproveitamento</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                    <th className="py-3 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {alunosDaTurma.map((aluno) => {
                    const nota = getNotaItem(aluno);
                    const classif = classificarAproveitamento(nota.mt);
                    const isBloqueada = nota.estado === 'aprovada' || periodoActivo.estado === 'bloqueado';

                    return (
                      <tr key={aluno.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-semibold text-gray-700">
                          {aluno.processo}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">
                          {aluno.nomeCompleto}
                        </td>

                        {/* Campo MAC */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="20"
                            value={nota.mac}
                            disabled={isBloqueada}
                            onChange={(e) =>
                              handleAtualizarNotaProfessor(aluno, 'mac', Number(e.target.value))
                            }
                            className={`w-20 px-2 py-1 text-center font-mono rounded border text-xs ${
                              isBloqueada
                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                : 'bg-white border-gray-300 focus:border-[#015FC4] focus:ring-1 focus:ring-[#015FC4]'
                            }`}
                          />
                        </td>

                        {/* Campo NPP */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="20"
                            value={nota.npp}
                            disabled={isBloqueada}
                            onChange={(e) =>
                              handleAtualizarNotaProfessor(aluno, 'npp', Number(e.target.value))
                            }
                            className={`w-20 px-2 py-1 text-center font-mono rounded border text-xs ${
                              isBloqueada
                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                : 'bg-white border-gray-300 focus:border-[#015FC4] focus:ring-1 focus:ring-[#015FC4]'
                            }`}
                          />
                        </td>

                        {/* Campo NPT */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="20"
                            value={nota.npt}
                            disabled={isBloqueada}
                            onChange={(e) =>
                              handleAtualizarNotaProfessor(aluno, 'npt', Number(e.target.value))
                            }
                            className={`w-20 px-2 py-1 text-center font-mono rounded border text-xs ${
                              isBloqueada
                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                : 'bg-white border-gray-300 focus:border-[#015FC4] focus:ring-1 focus:ring-[#015FC4]'
                            }`}
                          />
                        </td>

                        {/* Média Trimestral Calculada */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-sm">
                          <span className={nota.mt >= 10 ? 'text-[#015FC4]' : 'text-rose-600'}>
                            {nota.mt.toFixed(1)}
                          </span>
                        </td>

                        {/* Aproveitamento */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              nota.mt >= 14
                                ? 'bg-emerald-100 text-emerald-800'
                                : nota.mt >= 10
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {classif.classificacao}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              nota.estado === 'aprovada'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : nota.estado === 'submetida'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : nota.estado === 'rejeitada'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {nota.estado}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="py-2.5 px-3 text-right">
                          {nota.estado === 'aprovada' ? (
                            <button
                              onClick={() => setRetificandoNota(nota)}
                              className="text-[11px] text-[#015FC4] hover:underline font-semibold"
                            >
                              Retificar
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400">Editável</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 2: REVISÃO & APROVAÇÃO (COORDENAÇÃO PEDAGÓGICA)
         ======================================================== */}
      {activeTab === 'coordenacao_aprovacao' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-[#012041]">
                  Painel de Homologação da Coordenação Pedagógica
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Revisão de pautas submetidas pelos docentes, validação de médias e bloqueio institucional.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<X className="w-3.5 h-3.5 text-rose-600" />}
                  onClick={() => handleRejeitarNotas('Divergência detectada com provas físicas.')}
                >
                  Devolver / Rejeitar Pauta
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Check className="w-3.5 h-3.5" />}
                  onClick={() => handleAprovarNotas()}
                >
                  Aprovar Pauta da Turma
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/75 text-gray-700 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Estudante</th>
                    <th className="py-3 px-3">Disciplina & Turma</th>
                    <th className="py-3 px-2 text-center">MAC</th>
                    <th className="py-3 px-2 text-center">NPP</th>
                    <th className="py-3 px-2 text-center">NPT</th>
                    <th className="py-3 px-2 text-center">Média Trim.</th>
                    <th className="py-3 px-3 text-center">Estado Atual</th>
                    <th className="py-3 px-3 text-right">Ações Individuais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {notasAcademicas
                    .filter((n) => n.turmaId === selectedTurmaId)
                    .map((nota) => (
                      <tr key={nota.id} className="hover:bg-blue-50/20">
                        <td className="py-2.5 px-3">
                          <strong className="text-gray-900 block">{nota.alunoNome}</strong>
                          <span className="text-[11px] text-gray-500">{nota.alunoProcesso}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-gray-800">{nota.disciplinaNome}</span>
                          <span className="text-[11px] text-gray-400 block">{nota.turmaNome}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono">{nota.mac.toFixed(1)}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{nota.npp.toFixed(1)}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{nota.npt.toFixed(1)}</td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-sm">
                          <span className={nota.mt >= 10 ? 'text-[#015FC4]' : 'text-rose-600'}>
                            {nota.mt.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              nota.estado === 'aprovada'
                                ? 'bg-emerald-100 text-emerald-800'
                                : nota.estado === 'submetida'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {nota.estado}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          {nota.estado !== 'aprovada' && (
                            <button
                              onClick={() => handleAprovarNotas(nota.id)}
                              className="text-emerald-700 hover:underline font-semibold"
                            >
                              Homologar
                            </button>
                          )}
                          <button
                            onClick={() => setRetificandoNota(nota)}
                            className="text-[#015FC4] hover:underline font-semibold"
                          >
                            Retificar
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 3: PAUTAS POR TURMA (DOCUMENTO OFICIAL DO MED)
         ======================================================== */}
      {activeTab === 'pautas' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-[#012041]">
                  Pauta Oficial por Turma ({selectedTurma.nome})
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mapa de aproveitamento trimestral no modelo padrão do Ministério da Educação da República de Angola.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleExportPautaExcel}
                >
                  Exportar Pauta Excel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => window.print()}
                >
                  Imprimir Pauta
                </Button>
              </div>
            </div>

            {/* Cabeçalho da Pauta Timbrada */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                República de Angola · Ministério da Educação
              </span>
              <h3 className="text-sm font-extrabold text-[#012041]">
                PAUTA DE AVALIAÇÃO TRIMESTRAL · {selectedTrimestre}º TRIMESTRE
              </h3>
              <div className="flex justify-center gap-4 text-[11px] text-gray-600 pt-1">
                <span>Turma: <strong>{selectedTurma.nome}</strong></span>
                <span>Curso: <strong>{selectedTurma.curso}</strong></span>
                <span>Disciplina: <strong>{selectedDisciplina}</strong></span>
                <span>Ano Lectivo: <strong>2025/2026</strong></span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100 text-gray-800 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Nº Proc.</th>
                    <th className="py-2.5 px-3">Nome Completo do Aluno</th>
                    <th className="py-2.5 px-2 text-center">MAC (30%)</th>
                    <th className="py-2.5 px-2 text-center">NPP (30%)</th>
                    <th className="py-2.5 px-2 text-center">NPT (40%)</th>
                    <th className="py-2.5 px-2 text-center">Média Trimestral</th>
                    <th className="py-2.5 px-3 text-center">Resultado</th>
                    <th className="py-2.5 px-3 text-center">Boletim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono">
                  {alunosDaTurma.map((aluno) => {
                    const n = getNotaItem(aluno);
                    const classif = classificarAproveitamento(n.mt);
                    return (
                      <tr key={aluno.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-600">{aluno.processo}</td>
                        <td className="py-2 px-3 font-sans font-semibold text-gray-900">
                          {aluno.nomeCompleto}
                        </td>
                        <td className="py-2 px-2 text-center text-gray-700">{n.mac.toFixed(1)}</td>
                        <td className="py-2 px-2 text-center text-gray-700">{n.npp.toFixed(1)}</td>
                        <td className="py-2 px-2 text-center text-gray-700">{n.npt.toFixed(1)}</td>
                        <td className="py-2 px-2 text-center font-bold text-sm">
                          <span className={n.mt >= 10 ? 'text-[#015FC4]' : 'text-rose-600'}>
                            {n.mt.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-sans text-[10px]">
                          <span
                            className={`font-bold ${
                              n.mt >= 10 ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {classif.classificacao}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-sans">
                          <button
                            onClick={() => setBoletimStudent(aluno)}
                            className="text-[#015FC4] hover:underline font-semibold text-xs flex items-center justify-center gap-1 mx-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 4: BOLETINS DIGITAIS DOS ALUNOS
         ======================================================== */}
      {activeTab === 'boletins' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#012041]">
                Catálogo de Boletins Digitais por Estudante
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Consulte o boletim individual completo de cada aluno com discriminação de todas as disciplinas e médias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alunosDaTurma.map((aluno) => (
                <div
                  key={aluno.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#015FC4] transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#015FC4] font-bold">
                      {aluno.processo}
                    </span>
                    <h3 className="font-bold text-sm text-[#012041] mt-0.5">{aluno.nomeCompleto}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {aluno.turmaNome} · {aluno.classe}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-4">
                    <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      2º Trimestre Activo
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<GraduationCap className="w-3.5 h-3.5" />}
                      onClick={() => setBoletimStudent(aluno)}
                    >
                      Abrir Boletim
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 5: PERÍODOS LECTIVOS & BLOQUEIO
         ======================================================== */}
      {activeTab === 'periodos' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#012041]">
                Controlo de Períodos Lectivos & Bloqueio de Notas
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Defina as janelas temporais oficiais e controle o encerramento do lançamento de notas para homologação.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {periodos.map((p) => (
                <div key={p.id} className="p-5 rounded-xl border border-gray-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#012041]">{p.nome}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        p.estado === 'aberto'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.estado}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="text-gray-400">Início:</span> {p.dataInicio}
                    </div>
                    <div>
                      <span className="text-gray-400">Término:</span> {p.dataFim}
                    </div>
                    <div>
                      <span className="text-gray-400">Prazo Professores:</span> {p.dataLimiteLancamentoProfessor}
                    </div>
                  </div>

                  {p.observacoes && (
                    <p className="text-[11px] text-gray-500 italic pt-2 border-t border-gray-100">
                      "{p.observacoes}"
                    </p>
                  )}

                  <div className="pt-2">
                    <Button
                      variant={p.estado === 'aberto' ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full justify-center"
                      icon={p.estado === 'aberto' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      onClick={() => setIsBloqueioModalOpen(true)}
                    >
                      {p.estado === 'aberto' ? 'Bloquear Período' : 'Reabrir Período'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 6: AUDITORIA INVIOLÁVEL DE NOTAS
         ======================================================== */}
      {activeTab === 'auditoria' && (
        <Card>
          <div className="p-6 space-y-4">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#012041]">
                Livro de Auditoria & Histórico de Alterações de Notas
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Rastreio permanente de todas as retificações efectuadas com autorização e justificação pedagógica.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Data & Hora</th>
                    <th className="py-2.5 px-3">Aluno</th>
                    <th className="py-2.5 px-3">Disciplina / Trim.</th>
                    <th className="py-2.5 px-2 text-center">Campo</th>
                    <th className="py-2.5 px-2 text-center">Valor Anterior</th>
                    <th className="py-2.5 px-2 text-center">Novo Valor</th>
                    <th className="py-2.5 px-3">Autor & Papel</th>
                    <th className="py-2.5 px-3">Despacho / Justificação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {historicoAuditoria.map((aud) => (
                    <tr key={aud.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{aud.dataHora}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-gray-900">
                        {aud.alunoNome}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-gray-800">
                        {aud.disciplina} ({aud.trimestre}º Tri)
                      </td>
                      <td className="py-2.5 px-2 text-center uppercase font-bold text-[#015FC4]">
                        {aud.campoAlterado}
                      </td>
                      <td className="py-2.5 px-2 text-center text-gray-400 line-through">
                        {aud.valorAnterior}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-700">
                        {aud.valorNovo}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="font-semibold text-gray-800 block">{aud.autorNome}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{aud.autorPapel}</span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-gray-600 max-w-xs">
                        <span className="font-semibold text-[#012041] block">
                          {aud.autorizacaoCoordenacaoId || 'Homologação Directa'}
                        </span>
                        <span className="text-[11px] text-gray-500 italic line-clamp-2">
                          "{aud.motivoJustificacao}"
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 7: RELATÓRIOS DE APROVEITAMENTO
         ======================================================== */}
      {activeTab === 'aproveitamento' && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#012041]">
                Relatório de Aproveitamento Escolar ({selectedTurma.nome})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Indicadores de sucesso pedagógico, taxas de transição e estudantes em risco de retenção.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-xs text-blue-700 font-semibold block">Total de Alunos Avaliados</span>
                <span className="text-2xl font-bold text-[#012041] font-mono mt-1 block">
                  {alunosDaTurma.length}
                </span>
                <span className="text-[11px] text-blue-600">100% da turma</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-700 font-semibold block">Taxa de Aproveitamento Positivo</span>
                <span className="text-2xl font-bold text-emerald-800 font-mono mt-1 block">
                  87.5%
                </span>
                <span className="text-[11px] text-emerald-600">Média trimestral $\ge$ 10</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs text-amber-700 font-semibold block">Quadro de Honra ($\ge$ 16)</span>
                <span className="text-2xl font-bold text-amber-800 font-mono mt-1 block">
                  2 Alunos
                </span>
                <span className="text-[11px] text-amber-600">Elegíveis a Bolsa de Mérito</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-xs text-rose-700 font-semibold block">Em Risco de Retenção</span>
                <span className="text-2xl font-bold text-rose-800 font-mono mt-1 block">
                  1 Aluno
                </span>
                <span className="text-[11px] text-rose-600">Apoio pedagógico sugerido</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================
          MODAIS INTEGRADOS
         ======================================================== */}
      <BoletimDigitalModal
        isOpen={!!boletimStudent}
        onClose={() => setBoletimStudent(null)}
        student={boletimStudent}
        notas={notasAcademicas}
        periodos={periodos}
        schoolName="Colégio Esperança do Saber"
      />

      <BloqueioPeriodoModal
        isOpen={isBloqueioModalOpen}
        onClose={() => setIsBloqueioModalOpen(false)}
        periodo={periodoActivo}
        onConfirmarBloqueio={(id, estado, resp, obs) => {
          setPeriodos((prev) =>
            prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    estado,
                    bloqueadoPor: resp,
                    dataBloqueio: new Date().toISOString().split('T')[0],
                    observacoes: obs,
                  }
                : p
            )
          );
          showNotification('success', `Período ${periodoActivo.nome} actualizado para ${estado.toUpperCase()}.`);
        }}
      />

      <JustificativaAlteracaoNotaModal
        isOpen={!!retificandoNota}
        onClose={() => setRetificandoNota(null)}
        nota={retificandoNota}
        regraMedia={regraAtiva}
        userRole={visaoPapel}
        onConfirmarAlteracao={handleConfirmarRetificacao}
      />
    </div>
  );
};
