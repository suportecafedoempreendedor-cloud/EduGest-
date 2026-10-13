import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  CreditCard,
  Printer,
  ChevronRight,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Heart,
  CheckCircle2,
  Clock,
  Briefcase,
  UserCheck,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input, Select } from './ui/Input';
import { Modal } from './ui/Modal';
import {
  Student,
  Guardian,
  GuardianStudentRelation,
  NotaItem,
  HistoricoAcademico,
  MatriculaRecord,
  AssiduidadeRecord,
  ContaCorrenteItem,
  DocumentoItem,
  StudentState,
  UserRole,
  School,
  GrauParentesco,
  ToastNotification,
} from '../types';
import { TURMAS_INICIAIS } from '../data/mockData';
import { StudentProfileView } from './students/StudentProfileView';
import { GuardiansListView } from './students/GuardiansListView';
import { NewStudentModal } from './students/NewStudentModal';
import { NewGuardianModal } from './students/NewGuardianModal';
import { AssociateGuardianModal } from './students/AssociateGuardianModal';

export interface StudentsViewProps {
  students: Student[];
  guardians: Guardian[];
  guardianStudents: GuardianStudentRelation[];
  notas: NotaItem[];
  historicoMap: Record<string, HistoricoAcademico[]>;
  matriculasMap: Record<string, MatriculaRecord[]>;
  assiduidadeMap: Record<string, AssiduidadeRecord[]>;
  contaCorrenteMap: Record<string, ContaCorrenteItem[]>;
  documentosMap: Record<string, DocumentoItem[]>;
  selectedSchoolName: string;
  userRole: UserRole;
  schools: School[];
  onAddStudent: (student: Student, guardianIdToAssociate?: string) => void;
  onUpdateStudent: (student: Student) => void;
  onUpdateStudentState: (studentId: string, newState: StudentState) => void;
  onAddGuardian: (
    guardian: Guardian,
    relations: { studentId: string; grau: GrauParentesco; isPrincipal: boolean }[]
  ) => void;
  onUpdateGuardian: (guardian: Guardian) => void;
  onAssociateGuardianStudent: (relation: Omit<GuardianStudentRelation, 'id'>) => void;
  onRemoveGuardianStudentRelation: (relationId: string) => void;
  onOpenNewPaymentModal: (student?: Student) => void;
  onNotify: (toast: Omit<ToastNotification, 'id'> | string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  guardians,
  guardianStudents,
  notas,
  historicoMap,
  matriculasMap,
  assiduidadeMap,
  contaCorrenteMap,
  documentosMap,
  selectedSchoolName,
  userRole,
  schools,
  onAddStudent,
  onUpdateStudent,
  onUpdateStudentState,
  onAddGuardian,
  onUpdateGuardian,
  onAssociateGuardianStudent,
  onRemoveGuardianStudentRelation,
  onOpenNewPaymentModal,
  onNotify,
}) => {
  // Main view navigation: 'alunos' | 'encarregados' | 'perfil'
  const [activeTab, setActiveTab] = useState<'alunos' | 'encarregados'>('alunos');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Global Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<'todos' | StudentState>('todos');
  const [filterTurma, setFilterTurma] = useState('todas');
  const [filterPropina, setFilterPropina] = useState('todas');
  const [filterSuperAdminSchool, setFilterSuperAdminSchool] = useState<string>('todas');

  // Modals state
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isNewGuardianModalOpen, setIsNewGuardianModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [associateModalData, setAssociateModalData] = useState<{
    isOpen: boolean;
    studentId?: string;
    studentName?: string;
    guardianId?: string;
    guardianName?: string;
  }>({ isOpen: false });
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [declarationStudent, setDeclarationStudent] = useState<Student | null>(null);

  const isSchoolAdmin = userRole === 'school_admin';

  // 1. APLICAÇÃO DE PERMISSÕES:
  // "Um utilizador só pode consultar alunos pertencentes à sua escola."
  const authorizedStudents = useMemo(() => {
    if (isSchoolAdmin) {
      return students.filter(
        (st) =>
          st.escolaNome.trim().toLowerCase() === selectedSchoolName.trim().toLowerCase()
      );
    }
    // Para Super Admin
    if (filterSuperAdminSchool !== 'todas') {
      return students.filter(
        (st) =>
          st.escolaNome.trim().toLowerCase() === filterSuperAdminSchool.trim().toLowerCase()
      );
    }
    return students;
  }, [students, isSchoolAdmin, selectedSchoolName, filterSuperAdminSchool]);

  // Encarregados autorizados (aqueles cujos educandos pertencem à escola do utilizador)
  const authorizedGuardians = useMemo(() => {
    if (!isSchoolAdmin) return guardians;
    const authorizedStudentIds = new Set(authorizedStudents.map((s) => s.id));
    const authorizedGuardianIds = new Set(
      guardianStudents
        .filter((rel) => authorizedStudentIds.has(rel.studentId))
        .map((rel) => rel.guardianId)
    );
    return guardians.filter(
      (g) =>
        authorizedGuardianIds.has(g.id) ||
        (g.escolaId &&
          schools.find((s) => s.nome === selectedSchoolName)?.id === g.escolaId)
    );
  }, [guardians, isSchoolAdmin, authorizedStudents, guardianStudents, schools, selectedSchoolName]);

  // 2. PESQUISA GLOBAL & FILTROS:
  // "Criar pesquisa global por:
  // • Nome
  // • Número de matrícula
  // • Telefone
  // • Documento"
  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return authorizedStudents.filter((student) => {
      // Correspondência com Pesquisa Global
      if (term) {
        const matchNome = student.nomeCompleto.toLowerCase().includes(term);
        const matchMatricula =
          (student.numeroMatricula && student.numeroMatricula.toLowerCase().includes(term)) ||
          (student.processo && student.processo.toLowerCase().includes(term));
        const matchTelefone =
          (student.telefone && student.telefone.toLowerCase().includes(term)) ||
          (student.contactos?.telefone && student.contactos.telefone.toLowerCase().includes(term)) ||
          (student.contactos?.whatsapp && student.contactos.whatsapp.toLowerCase().includes(term)) ||
          (student.encarregadoContacto && student.encarregadoContacto.toLowerCase().includes(term));
        const matchDocumento =
          (student.documentoIdentificacao && student.documentoIdentificacao.toLowerCase().includes(term)) ||
          (student.bi && student.bi.toLowerCase().includes(term));

        if (!matchNome && !matchMatricula && !matchTelefone && !matchDocumento) {
          return false;
        }
      }

      // Filtro de Estado
      if (stateFilter !== 'todos' && student.estado !== stateFilter) {
        return false;
      }

      // Filtro de Turma
      if (filterTurma !== 'todas' && student.turmaId !== filterTurma) {
        return false;
      }

      // Filtro de Propina
      if (filterPropina !== 'todas' && student.statusPropina !== filterPropina) {
        return false;
      }

      return true;
    });
  }, [authorizedStudents, searchTerm, stateFilter, filterTurma, filterPropina]);

  // Contadores por estado para os chips de filtragem rápida
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: authorizedStudents.length,
      activo: 0,
      inscrito: 0,
      pre_inscrito: 0,
      suspenso: 0,
      transferido: 0,
      concluido: 0,
      inactivo: 0,
    };
    authorizedStudents.forEach((st) => {
      if (counts[st.estado] !== undefined) {
        counts[st.estado]++;
      }
    });
    return counts;
  }, [authorizedStudents]);

  // Função auxiliar para identificar o campo de correspondência da pesquisa
  const getSearchMatchBadge = (student: Student) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return null;

    if (
      (student.numeroMatricula && student.numeroMatricula.toLowerCase().includes(term)) ||
      (student.processo && student.processo.toLowerCase().includes(term))
    ) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-[#015FC4] font-semibold">
          Nº Matrícula
        </span>
      );
    }
    if (
      (student.documentoIdentificacao && student.documentoIdentificacao.toLowerCase().includes(term)) ||
      (student.bi && student.bi.toLowerCase().includes(term))
    ) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-semibold">
          Documento / BI
        </span>
      );
    }
    if (
      (student.telefone && student.telefone.toLowerCase().includes(term)) ||
      (student.contactos?.telefone && student.contactos.telefone.toLowerCase().includes(term)) ||
      (student.encarregadoContacto && student.encarregadoContacto.toLowerCase().includes(term))
    ) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-semibold">
          Telefone
        </span>
      );
    }
    if (student.nomeCompleto.toLowerCase().includes(term)) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-[#012041] font-semibold">
          Nome
        </span>
      );
    }
    return null;
  };

  const renderStateBadge = (estado: StudentState) => {
    switch (estado) {
      case 'activo':
        return <Badge variant="success">Activo</Badge>;
      case 'inscrito':
        return <Badge variant="primary">Inscrito</Badge>;
      case 'pre_inscrito':
        return <Badge variant="neutral">Pré inscrito</Badge>;
      case 'suspenso':
        return <Badge variant="warning">Suspenso</Badge>;
      case 'transferido':
        return <Badge variant="neutral">Transferido</Badge>;
      case 'concluido':
        return <Badge variant="success">Concluído</Badge>;
      case 'inactivo':
        return <Badge variant="error">Inactivo</Badge>;
      default:
        return <Badge variant="neutral">{estado}</Badge>;
    }
  };

  // Se estiver a visualizar o perfil individual de um aluno
  const activeStudent = activeStudentId
    ? students.find((s) => s.id === activeStudentId)
    : null;

  if (activeStudent) {
    return (
      <StudentProfileView
        student={activeStudent}
        allGuardians={guardians}
        allRelations={guardianStudents}
        allNotas={notas}
        historicoList={historicoMap[activeStudent.id] || []}
        matriculasList={matriculasMap[activeStudent.id] || []}
        assiduidadeList={assiduidadeMap[activeStudent.id] || []}
        contaCorrenteList={contaCorrenteMap[activeStudent.id] || []}
        documentosList={documentosMap[activeStudent.id] || []}
        userRole={userRole}
        currentSchoolName={selectedSchoolName}
        onBack={() => setActiveStudentId(null)}
        onEditStudent={(st) => {
          setEditingStudent(st);
          setIsNewStudentModalOpen(true);
        }}
        onUpdateStudentState={onUpdateStudentState}
        onOpenAssociateGuardian={(stId) => {
          setAssociateModalData({
            isOpen: true,
            studentId: stId,
            studentName: activeStudent.nomeCompleto,
          });
        }}
        onOpenNewPayment={(st) => onOpenNewPaymentModal(st)}
        onEmitDeclaration={(st) => {
          setDeclarationStudent(st);
          setShowDeclarationModal(true);
        }}
        onRemoveRelation={(relId) => onRemoveGuardianStudentRelation(relId)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Aviso de Isolamento de Tenant para Administrador da Escola */}
      {isSchoolAdmin ? (
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#015FC4] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#012041]">
                Controlo de Acesso & Tenant Isolado: {selectedSchoolName}
              </div>
              <p className="text-[11px] text-[#41515D] mt-0.5">
                Segurança activa: A sua conta de Administrador Escolar só pode consultar e gerir os alunos e encarregados matriculados na sua instituição.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px] shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Isolamento Rigoroso
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#012041] text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#012041]">
                Consola SaaS Multi-Tenant · Visão Global do Super Admin
              </div>
              <p className="text-[11px] text-[#41515D] mt-0.5">
                Acesso irrestrito a todas as escolas da rede EduGest Angola com capacidade de alternância rápida.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#41515D] font-medium">Filtrar Instituição:</span>
            <select
              value={filterSuperAdminSchool}
              onChange={(e) => setFilterSuperAdminSchool(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#012041]"
            >
              <option value="todas">Todas as Escolas ({schools.length})</option>
              {schools.map((s) => (
                <option key={s.id} value={s.nome}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Module Tabs (Alunos vs Encarregados) */}
      <div className="flex border-b border-[#E2E8F0] gap-2 overflow-x-auto bg-white rounded-xl p-1.5 shadow-2xs">
        <button
          onClick={() => setActiveTab('alunos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'alunos'
              ? 'bg-[#012041] text-white shadow-xs'
              : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alunos & Matrículas ({authorizedStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('encarregados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'encarregados'
              ? 'bg-[#012041] text-white shadow-xs'
              : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Encarregados de Educação ({authorizedGuardians.length})</span>
        </button>
      </div>

      {/* Se a aba for ENCARREGADOS DE EDUCAÇÃO */}
      {activeTab === 'encarregados' && (
        <GuardiansListView
          guardians={authorizedGuardians}
          students={authorizedStudents}
          relations={guardianStudents}
          onOpenNewGuardian={() => {
            setEditingGuardian(null);
            setIsNewGuardianModalOpen(true);
          }}
          onEditGuardian={(g) => {
            setEditingGuardian(g);
            setIsNewGuardianModalOpen(true);
          }}
          onSelectStudentProfile={(st) => setActiveStudentId(st.id)}
          onOpenAssociateEducando={(g) => {
            setAssociateModalData({
              isOpen: true,
              guardianId: g.id,
              guardianName: g.nome,
            });
          }}
        />
      )}

      {/* Se a aba for ALUNOS */}
      {activeTab === 'alunos' && (
        <div className="space-y-6">
          {/* Top Controls & Global Search */}
          <Card noPadding>
            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-lg font-bold text-[#012041]">Base de Dados Discente</h2>
                <p className="text-xs text-[#41515D]">
                  {authorizedStudents.length} estudantes cadastrados no tenant{' '}
                  <strong className="text-[#012041]">
                    {isSchoolAdmin
                      ? selectedSchoolName
                      : filterSuperAdminSchool === 'todas'
                      ? 'Rede Global'
                      : filterSuperAdminSchool}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Heart className="w-4 h-4" />}
                  onClick={() => {
                    setEditingGuardian(null);
                    setIsNewGuardianModalOpen(true);
                  }}
                >
                  Novo Encarregado
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingStudent(null);
                    setIsNewStudentModalOpen(true);
                  }}
                >
                  Cadastrar Aluno
                </Button>
              </div>
            </div>

            {/* Global Search Bar (Nome, Matrícula, Telefone, Documento) */}
            <div className="p-4 bg-slate-50/70 border-b border-[#E2E8F0] space-y-3">
              <div className="relative">
                <Input
                  placeholder="Pesquisa Global por Nome, Nº de Matrícula, Telefone ou Documento (BI/Cédula)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#41515D] hover:text-[#012041] cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Quick State Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-semibold text-[#41515D] uppercase mr-1 shrink-0 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Estado:
                </span>

                {(
                  [
                    { id: 'todos', label: 'Todos' },
                    { id: 'activo', label: 'Activo' },
                    { id: 'inscrito', label: 'Inscrito' },
                    { id: 'pre_inscrito', label: 'Pré inscrito' },
                    { id: 'suspenso', label: 'Suspenso' },
                    { id: 'transferido', label: 'Transferido' },
                    { id: 'concluido', label: 'Concluído' },
                    { id: 'inactivo', label: 'Inactivo' },
                  ] as { id: 'todos' | StudentState; label: string }[]
                ).map((chip) => {
                  const isSelected = stateFilter === chip.id;
                  const count = stateCounts[chip.id] || 0;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setStateFilter(chip.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#015FC4] text-white'
                          : 'bg-white border border-[#E2E8F0] text-[#012041] hover:bg-slate-100'
                      }`}
                    >
                      <span>{chip.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#41515D]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-Filters: Turma & Propina */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Select
                  value={filterTurma}
                  onChange={(e) => setFilterTurma(e.target.value)}
                >
                  <option value="todas">Todas as Turmas & Cursos</option>
                  {TURMAS_INICIAIS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.curso})
                    </option>
                  ))}
                </Select>

                <Select
                  value={filterPropina}
                  onChange={(e) => setFilterPropina(e.target.value)}
                >
                  <option value="todas">Todos os Estados de Propina</option>
                  <option value="em_dia">Propina Regularizada</option>
                  <option value="pendente">Pagamento Pendente</option>
                  <option value="atrasado">Em Atraso</option>
                </Select>
              </div>
            </div>

            {/* Results Counter & Search Indicator */}
            {searchTerm && (
              <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs text-[#015FC4]">
                <span>
                  Resultados da pesquisa global para "<strong>{searchTerm}</strong>": {filteredStudents.length} aluno(s) encontrado(s).
                </span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="font-semibold underline cursor-pointer"
                >
                  Ver todos
                </button>
              </div>
            )}
          </Card>

          {/* Students Data Table / Mobile Card Layout */}
          <Card noPadding>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-[#E2E8F0] text-[#012041]">
                    <th className="py-3 px-4 font-semibold">Nº Matrícula</th>
                    <th className="py-3 px-4 font-semibold">Nome Completo do Aluno</th>
                    <th className="py-3 px-4 font-semibold">Documento (BI/Cédula)</th>
                    <th className="py-3 px-4 font-semibold">Estado</th>
                    <th className="py-3 px-4 font-semibold">Turma & Curso</th>
                    <th className="py-3 px-4 font-semibold">Encarregado / Contacto</th>
                    <th className="py-3 px-4 font-semibold text-center">Média Geral</th>
                    <th className="py-3 px-4 font-semibold text-center">Propina</th>
                    <th className="py-3 px-4 font-semibold text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#41515D]">
                        <div className="max-w-xs mx-auto space-y-2">
                          <AlertCircle className="w-8 h-8 text-[#8EA5B8] mx-auto" />
                          <p className="font-semibold text-[#012041]">
                            Nenhum aluno encontrado
                          </p>
                          <p className="text-[11px] text-[#41515D]">
                            Tente ajustar os termos da pesquisa global ou seleccionar outro filtro de estado/turma.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((aluno) => {
                      const matchBadge = getSearchMatchBadge(aluno);
                      return (
                        <tr
                          key={aluno.id}
                          className="hover:bg-slate-50 transition-colors group"
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-[#015FC4]">
                              {aluno.numeroMatricula || aluno.processo}
                            </span>
                            {matchBadge && (
                              <div className="mt-0.5">{matchBadge}</div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {aluno.fotografia || aluno.foto ? (
                                <img
                                  src={aluno.fotografia || aluno.foto}
                                  alt={aluno.nomeCompleto}
                                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#015FC4] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {aluno.nomeCompleto.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <button
                                  onClick={() => setActiveStudentId(aluno.id)}
                                  className="font-bold text-[#012041] hover:text-[#015FC4] text-left truncate block cursor-pointer"
                                >
                                  {aluno.nomeCompleto}
                                </button>
                                <span className="text-[11px] text-[#41515D] block truncate">
                                  {aluno.sexo === 'F' ? 'Feminino' : 'Masculino'} · {aluno.nacionalidade || 'Angolana'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[#012041]">
                            <span className="font-medium">
                              {aluno.documentoIdentificacao || aluno.bi}
                            </span>
                            <span className="block text-[10px] text-[#41515D]">
                              {aluno.tipoDocumento || 'BI'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {renderStateBadge(aluno.estado)}
                          </td>

                          <td className="py-3 px-4 text-[#012041]">
                            <span className="font-medium">{aluno.turmaNome}</span>
                            <span className="block text-[11px] text-[#41515D] truncate max-w-[140px]">
                              {aluno.classe} · {aluno.curso}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-[#012041]">
                            <div className="truncate max-w-[150px] font-medium">
                              {aluno.encarregadoNome || '—'}
                            </div>
                            <div className="text-[11px] font-mono text-[#41515D]">
                              {aluno.encarregadoContacto || aluno.telefone || '—'}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-sm tabular-nums text-[#015FC4]">
                            {aluno.mediaGeral ? aluno.mediaGeral.toFixed(1) : '—'}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {aluno.statusPropina === 'em_dia' && (
                              <Badge variant="success">Em Dia</Badge>
                            )}
                            {aluno.statusPropina === 'pendente' && (
                              <Badge variant="warning">Pendente</Badge>
                            )}
                            {aluno.statusPropina === 'atrasado' && (
                              <Badge variant="error">Em Atraso</Badge>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setActiveStudentId(aluno.id)}
                                className="p-1.5 rounded-lg text-[#015FC4] hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Abrir Perfil Completo do Aluno"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeclarationStudent(aluno);
                                  setShowDeclarationModal(true);
                                }}
                                className="p-1.5 rounded-lg text-[#012041] hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Emitir Declaração com Notas"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden divide-y divide-[#E2E8F0]">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#41515D]">
                  Nenhum aluno encontrado com os filtros aplicados.
                </div>
              ) : (
                filteredStudents.map((aluno) => (
                  <div key={aluno.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        {aluno.fotografia || aluno.foto ? (
                          <img
                            src={aluno.fotografia || aluno.foto}
                            alt={aluno.nomeCompleto}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#015FC4] text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {aluno.nomeCompleto.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-[#012041]">{aluno.nomeCompleto}</h4>
                          <span className="text-xs font-mono font-bold text-[#015FC4]">
                            {aluno.numeroMatricula || aluno.processo}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {renderStateBadge(aluno.estado)}
                        {aluno.statusPropina === 'em_dia' && <Badge variant="success">Propina OK</Badge>}
                        {aluno.statusPropina === 'pendente' && <Badge variant="warning">Pendente</Badge>}
                        {aluno.statusPropina === 'atrasado' && <Badge variant="error">Atrasado</Badge>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#41515D] bg-slate-50 p-2.5 rounded-lg">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#8EA5B8] block">BI / Doc</span>
                        <span className="font-mono text-[#012041] font-medium">{aluno.documentoIdentificacao || aluno.bi}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#8EA5B8] block">Turma</span>
                        <span className="text-[#012041] font-medium">{aluno.turmaNome}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#8EA5B8] block">Média</span>
                        <span className="font-mono text-[#015FC4] font-bold">{aluno.mediaGeral ? aluno.mediaGeral.toFixed(1) : '—'} / 20</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#8EA5B8] block">Encarregado</span>
                        <span className="truncate block text-[#012041]">{aluno.encarregadoNome || '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => setActiveStudentId(aluno.id)}
                      >
                        Abrir Perfil
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          setDeclarationStudent(aluno);
                          setShowDeclarationModal(true);
                        }}
                      >
                        Declaração
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Cadastro & Edição de Aluno (NewStudentModal) */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => {
          setIsNewStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onAddStudent={(newSt, guardianId) => {
          if (editingStudent) {
            onUpdateStudent(newSt);
          } else {
            onAddStudent(newSt, guardianId);
          }
        }}
        selectedSchoolName={selectedSchoolName}
        guardians={guardians}
        editingStudent={editingStudent}
      />

      {/* Modal: Cadastro & Edição de Encarregado (NewGuardianModal) */}
      <NewGuardianModal
        isOpen={isNewGuardianModalOpen}
        onClose={() => {
          setIsNewGuardianModalOpen(false);
          setEditingGuardian(null);
        }}
        students={authorizedStudents}
        onAddGuardian={(newG, rels) => {
          if (editingGuardian) {
            onUpdateGuardian(newG);
          } else {
            onAddGuardian(newG, rels);
          }
        }}
        editingGuardian={editingGuardian}
      />

      {/* Modal: Associar Encarregado / Educando (AssociateGuardianModal) */}
      {associateModalData.isOpen && (
        <AssociateGuardianModal
          isOpen={associateModalData.isOpen}
          onClose={() => setAssociateModalData({ isOpen: false })}
          studentId={associateModalData.studentId}
          studentName={associateModalData.studentName}
          guardianId={associateModalData.guardianId}
          guardianName={associateModalData.guardianName}
          guardians={authorizedGuardians}
          students={authorizedStudents}
          onAssociate={onAssociateGuardianStudent}
        />
      )}

      {/* Modal: Declaração Escolar com Notas */}
      {declarationStudent && showDeclarationModal && (
        <Modal
          isOpen={showDeclarationModal}
          onClose={() => {
            setShowDeclarationModal(false);
            setDeclarationStudent(null);
          }}
          title="Declaração Escolar Oficial"
          subtitle="Documento com carimbo institucional homologado do EduGest Angola"
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="p-6 sm:p-8 bg-white border-2 border-slate-200 rounded-lg text-[#012041] space-y-6 shadow-xs font-serif print:border-none print:shadow-none">
              <div className="text-center space-y-1 border-b pb-4 border-slate-200">
                <div className="text-xs uppercase font-bold tracking-widest text-[#012041]">
                  República de Angola
                </div>
                <div className="text-xs uppercase font-medium text-[#41515D]">
                  Ministério da Educação · Direcção Nacional do Ensino Geral
                </div>
                <div className="text-sm font-bold uppercase text-[#012041] mt-1">
                  {declarationStudent.escolaNome || selectedSchoolName}
                </div>
                <div className="text-[10px] text-[#41515D]">
                  Registo Nacional de Instituições de Ensino · Decreto Executivo Nº 114/23
                </div>
              </div>

              <div className="text-center pt-2">
                <h3 className="text-lg font-bold uppercase tracking-wider text-[#012041] underline underline-offset-4">
                  Declaração Escolar de Matrícula e Aproveitamento
                </h3>
                <p className="text-xs text-[#41515D] mt-1 italic">
                  (Para todos os efeitos legais, abono de família e instrução de processo)
                </p>
              </div>

              <div className="text-xs leading-relaxed text-justify space-y-3 font-sans">
                <p>
                  Para os devidos efeitos e a pedido da parte interessada, declara-se que{' '}
                  <strong className="text-[#012041]">{declarationStudent.nomeCompleto}</strong>, portador(a) do Bilhete de Identidade / Documento nº{' '}
                  <strong className="font-mono">{declarationStudent.documentoIdentificacao || declarationStudent.bi}</strong>, emitido pelo Arquivo de Identificação de{' '}
                  <strong>{declarationStudent.provincia}</strong>, encontra-se regularmente matriculado(a) nesta instituição sob o processo nº{' '}
                  <strong className="font-mono">{declarationStudent.numeroMatricula || declarationStudent.processo}</strong>, frequentando a{' '}
                  <strong>{declarationStudent.classe}</strong> da Turma <strong>{declarationStudent.turmaNome}</strong>, Curso de{' '}
                  <strong>{declarationStudent.curso || 'Ensino Geral'}</strong>, no Ano Lectivo <strong>{declarationStudent.anoLectivo || '2025/2026'}</strong>.
                </p>
                <p>
                  Mais se certifica que o estudante apresenta a situação discente com o estado operacional de{' '}
                  <strong className="uppercase text-[#015FC4]">{declarationStudent.estado}</strong> e obteve até ao termo do presente período escolar o aproveitamento com a média curricular de{' '}
                  <strong className="text-[#015FC4]">{declarationStudent.mediaGeral ? declarationStudent.mediaGeral.toFixed(1) : '15.0'} valores</strong> (numa escala de 0 a 20 valores).
                </p>
                <p>
                  Por ser verdade e ter sido solicitada pela parte interessada, passou-se a presente declaração que vai assinada e autenticada com o carimbo a óleo em uso nesta instituição de ensino.
                </p>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-6 text-xs text-center border-t border-slate-200 font-sans">
                <div>
                  <p className="text-[#41515D]">
                    {declarationStudent.provincia || 'Luanda'}, {new Date().toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <div className="mt-8 border-t border-slate-400 w-48 mx-auto pt-1 font-semibold text-[#012041]">
                    O Secretário Pedagógico
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#015FC4] text-[#015FC4] flex flex-col items-center justify-center p-2 text-center text-[9px] font-bold uppercase rotate-[-6deg]">
                    <span>EduGest Angola</span>
                    <span className="text-[7px]">Selo Digital Homologado</span>
                    <span className="font-mono text-[8px]">REG: {declarationStudent.numeroMatricula || declarationStudent.processo}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#41515D]">
                    Carimbo Oficial Institucional
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#41515D]">
                Emissão eletrónica autenticada com código hash seguro do EduGest Angola.
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeclarationModal(false)}
                >
                  Voltar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => window.print()}
                >
                  Imprimir Documento
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
