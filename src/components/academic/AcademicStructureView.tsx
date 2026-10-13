import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Layers,
  Users,
  BookOpen,
  UserCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Check,
  Power,
  Lock,
  ArrowUpDown,
  BookMarked,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import {
  AcademicYear,
  SchoolClass,
  Section,
  Subject,
  ClassSubject,
  Teacher,
  TeacherAssignment,
  School,
  UserRole,
  TurnoType,
  SectionState,
} from '../../types';
import { NewAcademicYearModal } from './NewAcademicYearModal';
import { NewClassModal } from './NewClassModal';
import { NewSectionModal } from './NewSectionModal';
import { NewSubjectModal } from './NewSubjectModal';
import { NewClassSubjectModal } from './NewClassSubjectModal';
import { NewTeacherAssignmentModal } from './NewTeacherAssignmentModal';

type AcademicTab =
  | 'years'
  | 'classes'
  | 'sections'
  | 'subjects'
  | 'curriculum'
  | 'teachers';

interface AcademicStructureViewProps {
  currentSchool: School;
  userRole: UserRole;
  academicYears: AcademicYear[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  classSubjects: ClassSubject[];
  teachers: Teacher[];
  teacherAssignments: TeacherAssignment[];
  onSaveAcademicYear: (year: AcademicYear) => void;
  onActivateAcademicYear: (yearId: string) => void;
  onCloseAcademicYear: (yearId: string) => void;
  onSaveClass: (classe: SchoolClass) => void;
  onToggleClassStatus: (classId: string) => void;
  onSaveSection: (section: Section) => void;
  onUpdateSectionState: (sectionId: string, newState: SectionState) => void;
  onSaveSubject: (subject: Subject) => void;
  onSaveClassSubject: (classSubject: ClassSubject) => void;
  onRemoveClassSubject: (id: string) => void;
  onSaveTeacherAssignment: (assignment: TeacherAssignment) => void;
  onRemoveTeacherAssignment: (id: string) => void;
  onSeedTemplateStructure: (schoolId: string) => void;
  onNotify: (msg: string) => void;
}

export const AcademicStructureView: React.FC<AcademicStructureViewProps> = ({
  currentSchool,
  userRole,
  academicYears,
  classes,
  sections,
  subjects,
  classSubjects,
  teachers,
  teacherAssignments,
  onSaveAcademicYear,
  onActivateAcademicYear,
  onCloseAcademicYear,
  onSaveClass,
  onToggleClassStatus,
  onSaveSection,
  onUpdateSectionState,
  onSaveSubject,
  onSaveClassSubject,
  onRemoveClassSubject,
  onSaveTeacherAssignment,
  onRemoveTeacherAssignment,
  onSeedTemplateStructure,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<AcademicTab>('sections');

  // Multi-tenant Scoped Data for Current School
  const schoolYears = useMemo(
    () => academicYears.filter((y) => y.escolaId === currentSchool.id),
    [academicYears, currentSchool.id]
  );
  const schoolClasses = useMemo(
    () =>
      classes
        .filter((c) => c.escolaId === currentSchool.id)
        .sort((a, b) => a.ordem - b.ordem),
    [classes, currentSchool.id]
  );
  const schoolSections = useMemo(
    () => sections.filter((s) => s.escolaId === currentSchool.id),
    [sections, currentSchool.id]
  );
  const schoolSubjects = useMemo(
    () => subjects.filter((sub) => sub.escolaId === currentSchool.id),
    [subjects, currentSchool.id]
  );
  const schoolClassSubjects = useMemo(
    () => classSubjects.filter((cs) => cs.escolaId === currentSchool.id),
    [classSubjects, currentSchool.id]
  );
  const schoolTeachers = useMemo(
    () => teachers.filter((t) => t.escolaId === currentSchool.id),
    [teachers, currentSchool.id]
  );
  const schoolTeacherAssignments = useMemo(
    () => teacherAssignments.filter((ta) => ta.escolaId === currentSchool.id),
    [teacherAssignments, currentSchool.id]
  );

  const activeYear = schoolYears.find((y) => y.estado === 'activo') || schoolYears[0];

  // Modals state
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isClassSubjectModalOpen, setIsClassSubjectModalOpen] = useState(false);
  const [selectedClassForCurriculum, setSelectedClassForCurriculum] = useState<string>(
    schoolClasses[0]?.id || ''
  );

  const [isTeacherAssignmentModalOpen, setIsTeacherAssignmentModalOpen] = useState(false);

  // Filters for Turmas (Sections)
  const [sectionSearch, setSectionSearch] = useState('');
  const [filterClassId, setFilterClassId] = useState('todas');
  const [filterTurno, setFilterTurno] = useState('todos');
  const [filterYearId, setFilterYearId] = useState('todos');
  const [filterSectionState, setFilterSectionState] = useState('todas');

  // Filtered Sections
  const filteredSections = useMemo(() => {
    return schoolSections.filter((s) => {
      const matchSearch =
        s.nome.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        s.sala.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        s.directorTurma.toLowerCase().includes(sectionSearch.toLowerCase());
      const matchClass = filterClassId === 'todas' || s.classeId === filterClassId;
      const matchTurno = filterTurno === 'todos' || s.turno === filterTurno;
      const matchYear = filterYearId === 'todos' || s.anoLectivoId === filterYearId;
      const matchState = filterSectionState === 'todas' || s.estado === filterSectionState;
      return matchSearch && matchClass && matchTurno && matchYear && matchState;
    });
  }, [schoolSections, sectionSearch, filterClassId, filterTurno, filterYearId, filterSectionState]);

  // Filters for Subjects
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectAreaFilter, setSubjectAreaFilter] = useState('todas');
  const filteredSubjects = useMemo(() => {
    return schoolSubjects.filter((sub) => {
      const matchSearch =
        sub.nome.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        sub.codigo.toLowerCase().includes(subjectSearch.toLowerCase());
      const matchArea = subjectAreaFilter === 'todas' || sub.areaCientifica === subjectAreaFilter;
      return matchSearch && matchArea;
    });
  }, [schoolSubjects, subjectSearch, subjectAreaFilter]);

  // Filters for Teacher Assignments
  const [teacherSearch, setTeacherSearch] = useState('');
  const [assignmentTurmaFilter, setAssignmentTurmaFilter] = useState('todas');
  const filteredAssignments = useMemo(() => {
    return schoolTeacherAssignments.filter((ta) => {
      const matchSearch =
        ta.professorNome.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        ta.subjectNome.toLowerCase().includes(teacherSearch.toLowerCase());
      const matchTurma = assignmentTurmaFilter === 'todas' || ta.turmaId === assignmentTurmaFilter;
      return matchSearch && matchTurma;
    });
  }, [schoolTeacherAssignments, teacherSearch, assignmentTurmaFilter]);

  // Curriculum for selected class
  const classCurriculum = useMemo(() => {
    const targetClassId = selectedClassForCurriculum || schoolClasses[0]?.id;
    return schoolClassSubjects.filter((cs) => cs.classeId === targetClassId);
  }, [schoolClassSubjects, selectedClassForCurriculum, schoolClasses]);

  const totalWeeklyPeriodsForClass = useMemo(() => {
    return classCurriculum.reduce((acc, curr) => acc + curr.cargaHorariaSemanal, 0);
  }, [classCurriculum]);

  // Empty state check
  const hasNoAcademicData =
    schoolYears.length === 0 && schoolClasses.length === 0 && schoolSections.length === 0;

  return (
    <div className="space-y-6">
      {/* Institutional School Context Header */}
      <div className="bg-[#012041] text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-blue-200">
              <Building2 className="w-4 h-4 text-blue-300" />
              <span className="font-semibold uppercase tracking-wider">{currentSchool.nome}</span>
              <span aria-hidden="true">·</span>
              <span>NIF: {currentSchool.nif}</span>
              <span aria-hidden="true">·</span>
              <span className="bg-[#015FC4]/60 px-2 py-0.5 rounded text-[11px] font-mono text-white">
                {activeYear ? `Ano Activo: ${activeYear.nome}` : 'Sem Ano Activo'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Módulo de Estrutura Académica
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA5B8] mt-1 max-w-2xl">
              Gestão de anos lectivos, classes curriculares, turmas por turno, catálogo de
              disciplinas, matriz curricular e alocação de corpo docente por instituição.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {hasNoAcademicData ? (
              <Button
                variant="primary"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={() => onSeedTemplateStructure(currentSchool.id)}
              >
                Inicializar Estrutura Padrão (MED)
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  size="sm"
                  icon={<Calendar className="w-4 h-4" />}
                  onClick={() => {
                    setEditingYear(null);
                    setIsYearModalOpen(true);
                  }}
                >
                  Novo Ano
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  size="sm"
                  icon={<Layers className="w-4 h-4" />}
                  onClick={() => {
                    setEditingClass(null);
                    setIsClassModalOpen(true);
                  }}
                >
                  Nova Classe
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingSection(null);
                    setIsSectionModalOpen(true);
                  }}
                >
                  Nova Turma
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quiet Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-white/10">
          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Anos Lectivos</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{schoolYears.length}</span>
            <span className="text-[10px] text-blue-300">
              {activeYear ? activeYear.nome : 'Nenhum'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Classes Activas</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {schoolClasses.filter((c) => c.estado === 'activa').length}
            </span>
            <span className="text-[10px] text-slate-300">Plano próprio</span>
          </div>

          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Total de Turmas</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {schoolSections.length}
            </span>
            <span className="text-[10px] text-emerald-400">
              {schoolSections.filter((s) => s.estado === 'Activa').length} Activas
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Disciplinas</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {schoolSubjects.length}
            </span>
            <span className="text-[10px] text-slate-300">Catálogo geral</span>
          </div>

          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Vínculos Matriz</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {schoolClassSubjects.length}
            </span>
            <span className="text-[10px] text-blue-300">Cargas horárias</span>
          </div>

          <div>
            <span className="text-[11px] text-[#8EA5B8] uppercase block">Atribuições Docentes</span>
            <span className="text-lg font-bold text-white mt-0.5 block">
              {schoolTeacherAssignments.length}
            </span>
            <span className="text-[10px] text-slate-300">Professores em turma</span>
          </div>
        </div>
      </div>

      {/* Navigation Segmented Control */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-1.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-[#012041] text-white shadow-xs'
                : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Turmas / Sections</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'sections' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {schoolSections.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-[#012041] text-white shadow-xs'
                : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Classes & Cursos</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'classes' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {schoolClasses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('years')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'years'
                ? 'bg-[#012041] text-white shadow-xs'
                : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Anos Lectivos</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'years' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {schoolYears.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-[#012041] text-white shadow-xs'
                : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Disciplinas (Subjects)</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'subjects' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {schoolSubjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'curriculum'
                ? 'bg-[#012041] text-white shadow-xs'
                : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Matriz Curricular</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'curriculum'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {schoolClassSubjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'teachers'
                ? 'bg-[#012041] text-white shadow-xs'
                : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Atribuição Docente</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'teachers' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {schoolTeacherAssignments.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: TURMAS / SECTIONS */}
      {/* ========================================================= */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card noPadding>
            <div className="p-4 bg-slate-50 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#41515D]" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome da turma, sala ou director..."
                  value={sectionSearch}
                  onChange={(e) => setSectionSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white rounded-lg border border-[#E2E8F0] text-[#012041] focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingSection(null);
                    setIsSectionModalOpen(true);
                  }}
                >
                  Criar Nova Turma
                </Button>
              </div>
            </div>

            {/* Filter Selects */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white">
              <Select
                label="Filtrar por Classe"
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
              >
                <option value="todas">Todas as Classes</option>
                {schoolClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>

              <Select
                label="Filtrar por Turno"
                value={filterTurno}
                onChange={(e) => setFilterTurno(e.target.value)}
              >
                <option value="todos">Todos os Turnos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
                <option value="Integral">Integral</option>
              </Select>

              <Select
                label="Ano Lectivo"
                value={filterYearId}
                onChange={(e) => setFilterYearId(e.target.value)}
              >
                <option value="todos">Todos os Anos</option>
                {schoolYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.nome}
                  </option>
                ))}
              </Select>

              <Select
                label="Estado da Turma"
                value={filterSectionState}
                onChange={(e) => setFilterSectionState(e.target.value)}
              >
                <option value="todas">Todos os Estados</option>
                <option value="Activa">Activa</option>
                <option value="Lotada">Lotada</option>
                <option value="Inactiva">Inactiva</option>
                <option value="Encerrada">Encerrada</option>
              </Select>
            </div>
          </Card>

          {/* Turmas Grid / Table */}
          {filteredSections.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-semibold text-[#012041]">
                Nenhuma turma encontrada
              </h3>
              <p className="text-xs text-[#41515D] max-w-sm mx-auto">
                Não existem turmas correspondentes aos filtros selecionados para{' '}
                {currentSchool.nome}.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setEditingSection(null);
                  setIsSectionModalOpen(true);
                }}
              >
                Adicionar Primeira Turma
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSections.map((sec) => {
                const occupancyRate = Math.round((sec.totalAlunos / sec.capacidade) * 100);
                const assignedTeachersCount = schoolTeacherAssignments.filter(
                  (ta) => ta.turmaId === sec.id
                ).length;

                return (
                  <div
                    key={sec.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs hover:border-[#015FC4]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold text-[#015FC4] uppercase tracking-wider block">
                            {sec.classeNome}
                          </span>
                          <h3 className="text-base font-bold text-[#012041] mt-0.5">{sec.nome}</h3>
                        </div>

                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                            sec.estado === 'Activa'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : sec.estado === 'Lotada'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {sec.estado}
                        </span>
                      </div>

                      {/* Details Meta */}
                      <div className="mt-3.5 space-y-2 text-xs text-[#41515D]">
                        <div className="flex items-center justify-between">
                          <span>Ano Lectivo:</span>
                          <span className="font-semibold text-[#012041]">
                            {sec.anoLectivoNome}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Turno:</span>
                          <span className="font-medium text-[#012041]">{sec.turno}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Sala:</span>
                          <span className="font-mono text-[#012041]">{sec.sala}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Director de Turma:</span>
                          <span className="font-semibold text-[#012041] truncate max-w-[170px]" title={sec.directorTurma}>
                            {sec.directorTurma}
                          </span>
                        </div>
                      </div>

                      {/* Vagas / Lotação Bar */}
                      <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#41515D]">Ocupação de Vagas</span>
                          <span className="font-semibold text-[#012041]">
                            {sec.totalAlunos} / {sec.capacidade} alunos ({occupancyRate}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all rounded-full ${
                              occupancyRate >= 100
                                ? 'bg-amber-500'
                                : occupancyRate >= 80
                                ? 'bg-blue-600'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[11px] text-[#41515D]">
                        {assignedTeachersCount} {assignedTeachersCount === 1 ? 'docente alocado' : 'docentes alocados'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setEditingSection(sec);
                            setIsSectionModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CLASSES & CURSOS */}
      {/* ========================================================= */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-4 bg-slate-50 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#012041]">
                  Estrutura Curricular de Classes de {currentSchool.nome}
                </h3>
                <p className="text-xs text-[#41515D]">
                  A escola define livremente a sua própria oferta pedagógica (Ex: 7ª à 12ª Classe,
                  cursos gerais e técnicos).
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setEditingClass(null);
                  setIsClassModalOpen(true);
                }}
              >
                Nova Classe
              </Button>
            </div>

            {schoolClasses.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#41515D]">
                Nenhuma classe configurada para esta instituição.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Ordem</th>
                      <th className="py-3 px-4">Classe & Código</th>
                      <th className="py-3 px-4">Ciclo de Ensino</th>
                      <th className="py-3 px-4">Curso / Área</th>
                      <th className="py-3 px-4">Turmas Existentes</th>
                      <th className="py-3 px-4">Disciplinas na Matriz</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {schoolClasses.map((c) => {
                      const turmasCount = schoolSections.filter((s) => s.classeId === c.id).length;
                      const subjectsCount = schoolClassSubjects.filter(
                        (cs) => cs.classeId === c.id
                      ).length;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#015FC4]">
                            #{c.ordem}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-[#012041] block">{c.nome}</span>
                            <span className="text-[11px] font-mono text-[#41515D]">{c.codigo}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#015FC4] border border-blue-100 font-medium">
                              {c.ciclo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {c.curso || 'Ensino Geral Regular'}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#012041]">
                            {turmasCount} {turmasCount === 1 ? 'turma' : 'turmas'}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => {
                                setSelectedClassForCurriculum(c.id);
                                setActiveTab('curriculum');
                              }}
                              className="text-xs text-[#015FC4] hover:underline font-medium"
                            >
                              {subjectsCount} disciplinas na matriz →
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                                c.estado === 'activa'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {c.estado === 'activa' ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Edit2 className="w-3.5 h-3.5" />}
                                onClick={() => {
                                  setEditingClass(c);
                                  setIsClassModalOpen(true);
                                }}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleClassStatus(c.id)}
                              >
                                {c.estado === 'activa' ? 'Desactivar' : 'Activar'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ANOS LECTIVOS */}
      {/* ========================================================= */}
      {activeTab === 'years' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#012041]">
                Anos Lectivos & Períodos de {currentSchool.nome}
              </h3>
              <p className="text-xs text-[#41515D]">
                Controle o ano activo corrente, planeie o próximo calendário e encerre períodos.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingYear(null);
                setIsYearModalOpen(true);
              }}
            >
              Criar Novo Ano Lectivo
            </Button>
          </div>

          <div className="space-y-4">
            {schoolYears.map((year) => {
              const isActive = year.estado === 'activo';
              const isPlanning = year.estado === 'planeamento';
              const isClosed = year.estado === 'encerrado';

              return (
                <div
                  key={year.id}
                  className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                    isActive
                      ? 'border-[#015FC4] ring-1 ring-[#015FC4]/20'
                      : 'border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-[#015FC4] text-white'
                            : isPlanning
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Calendar className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-[#012041]">{year.nome}</h4>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isPlanning
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isActive ? 'Activo (Corrente)' : isPlanning ? 'Em Planeamento' : 'Encerrado'}
                          </span>
                        </div>
                        <p className="text-xs text-[#41515D] mt-0.5">
                          Período: {new Date(year.dataInicio).toLocaleDateString('pt-AO')} até{' '}
                          {new Date(year.dataFim).toLocaleDateString('pt-AO')}
                          {year.descricao && ` · ${year.descricao}`}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {!isActive && !isClosed && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Power className="w-3.5 h-3.5 text-emerald-600" />}
                          onClick={() => onActivateAcademicYear(year.id)}
                        >
                          Definir como Activo
                        </Button>
                      )}

                      {isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-700 hover:bg-red-50"
                          onClick={() => onCloseAcademicYear(year.id)}
                        >
                          Encerrar Ano Lectivo
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setEditingYear(year);
                          setIsYearModalOpen(true);
                        }}
                      >
                        Editar Datas
                      </Button>
                    </div>
                  </div>

                  {/* Trimestres cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
                    {year.periodos.map((per) => (
                      <div
                        key={per.id}
                        className="p-3 bg-slate-50/70 rounded-lg border border-[#E2E8F0] text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-[#012041]">
                          <span>{per.nome}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              per.estado === 'decorrente'
                                ? 'bg-emerald-100 text-emerald-800'
                                : per.estado === 'concluido'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {per.estado === 'decorrente'
                              ? 'A decorrer'
                              : per.estado === 'concluido'
                              ? 'Concluído'
                              : 'Futuro'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#41515D] mt-1.5">
                          {new Date(per.dataInicio).toLocaleDateString('pt-AO')} -{' '}
                          {new Date(per.dataFim).toLocaleDateString('pt-AO')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: DISCIPLINAS (SUBJECTS) */}
      {/* ========================================================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-4 bg-slate-50 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#41515D]" />
                <input
                  type="text"
                  placeholder="Pesquisar disciplina por nome ou código (ex: MAT, Fís)..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white rounded-lg border border-[#E2E8F0] text-[#012041] focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
                />
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={subjectAreaFilter}
                  onChange={(e) => setSubjectAreaFilter(e.target.value)}
                >
                  <option value="todas">Todas as Áreas Científicas</option>
                  <option value="Ciências Exactas">Ciências Exactas</option>
                  <option value="Ciências Naturais">Ciências Naturais</option>
                  <option value="Línguas e Comunicação">Línguas e Comunicação</option>
                  <option value="Ciências Sociais">Ciências Sociais</option>
                  <option value="Ciências Económicas">Ciências Económicas</option>
                  <option value="Tecnologia e Informática">Tecnologia e Informática</option>
                </Select>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    setEditingSubject(null);
                    setIsSubjectModalOpen(true);
                  }}
                >
                  Nova Disciplina
                </Button>
              </div>
            </div>

            {filteredSubjects.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#41515D]">
                Nenhuma disciplina encontrada no catálogo da instituição.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Disciplina</th>
                      <th className="py-3 px-4">Área Científica</th>
                      <th className="py-3 px-4">Carga Horária Semanal</th>
                      <th className="py-3 px-4">Classes que Lecionam</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredSubjects.map((sub) => {
                      const classesUsing = schoolClassSubjects.filter(
                        (cs) => cs.subjectId === sub.id
                      );

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#015FC4]">
                            {sub.codigo}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#012041] block">{sub.nome}</span>
                            {sub.descricao && (
                              <span className="text-[11px] text-[#41515D] line-clamp-1">
                                {sub.descricao}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {sub.areaCientifica || 'Geral'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#012041]">
                            {sub.cargaHorariaSemanal} tempos semanais
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-[#41515D]">
                              {classesUsing.length}{' '}
                              {classesUsing.length === 1 ? 'classe' : 'classes'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                                sub.estado === 'activa'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {sub.estado === 'activa' ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit2 className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setEditingSubject(sub);
                                setIsSubjectModalOpen(true);
                              }}
                            >
                              Editar
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: MATRIZ CURRICULAR (CLASS_SUBJECTS) */}
      {/* ========================================================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-4 bg-slate-50 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-[#012041] uppercase tracking-wide">
                  Seleccionar Classe:
                </label>
                <select
                  value={selectedClassForCurriculum}
                  onChange={(e) => setSelectedClassForCurriculum(e.target.value)}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-semibold text-[#012041] focus:ring-2 focus:ring-[#015FC4]"
                >
                  {schoolClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.curso ? `· ${c.curso}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#41515D] font-medium">
                  Carga Total:{' '}
                  <strong className="text-[#012041]">{totalWeeklyPeriodsForClass} tempos semanais</strong>
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsClassSubjectModalOpen(true)}
                >
                  Adicionar Disciplina à Matriz
                </Button>
              </div>
            </div>

            {classCurriculum.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#012041]">
                  Nenhuma disciplina associada a esta classe
                </h4>
                <p className="text-xs text-[#41515D] max-w-sm mx-auto">
                  Adicione as disciplinas que compõem o plano de estudos desta classe e os tempos
                  semanais correspondentes.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsClassSubjectModalOpen(true)}
                >
                  Vincular Primeira Disciplina
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Disciplina</th>
                      <th className="py-3 px-4">Carga Horária Semanal</th>
                      <th className="py-3 px-4">Coeficiente / Peso</th>
                      <th className="py-3 px-4">Obrigatoriedade</th>
                      <th className="py-3 px-4 text-right">Remover da Matriz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {classCurriculum.map((cs) => (
                      <tr key={cs.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#015FC4]">
                          {cs.subjectCodigo}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#012041]">{cs.subjectNome}</td>
                        <td className="py-3 px-4 font-semibold text-[#012041]">
                          {cs.cargaHorariaSemanal} tempos / semana
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">
                          Peso {cs.coeficiente || 1}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                              cs.obrigatoria
                                ? 'bg-blue-50 text-[#015FC4]'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {cs.obrigatoria ? 'Obrigatória' : 'Optativa'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => onRemoveClassSubject(cs.id)}
                          >
                            Remover
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: ATRIBUIÇÃO DOCENTE (TEACHER ASSIGNMENTS) */}
      {/* ========================================================= */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <Card noPadding>
            <div className="p-4 bg-slate-50 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#41515D]" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome do professor ou disciplina..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white rounded-lg border border-[#E2E8F0] text-[#012041] focus:outline-none focus:ring-2 focus:ring-[#015FC4]"
                />
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={assignmentTurmaFilter}
                  onChange={(e) => setAssignmentTurmaFilter(e.target.value)}
                >
                  <option value="todas">Todas as Turmas</option>
                  {schoolSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </Select>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsTeacherAssignmentModalOpen(true)}
                >
                  Nova Atribuição
                </Button>
              </div>
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#012041]">
                  Nenhuma atribuição docente encontrada
                </h4>
                <p className="text-xs text-[#41515D] max-w-sm mx-auto">
                  Associe os professores às suas respectivas turmas e disciplinas para o ano
                  lectivo activo.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsTeacherAssignmentModalOpen(true)}
                >
                  Criar Primeira Atribuição
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Professor / Docente</th>
                      <th className="py-3 px-4">Turma</th>
                      <th className="py-3 px-4">Disciplina</th>
                      <th className="py-3 px-4">Ano Lectivo</th>
                      <th className="py-3 px-4">Carga Semanal</th>
                      <th className="py-3 px-4">Directoria de Turma</th>
                      <th className="py-3 px-4 text-right">Acções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredAssignments.map((ta) => (
                      <tr key={ta.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#012041]">
                          {ta.professorNome}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#015FC4]">{ta.turmaNome}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {ta.subjectNome}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{ta.anoLectivoNome}</td>
                        <td className="py-3 px-4 font-semibold text-[#012041]">
                          {ta.cargaHorariaSemanal} tempos
                        </td>
                        <td className="py-3 px-4">
                          {ta.isDirectorTurma ? (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold inline-flex items-center gap-1">
                              <Check className="w-3 h-3" /> Director de Turma
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Docente de Disciplina</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => onRemoveTeacherAssignment(ta.id)}
                          >
                            Desvincular
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* INTERACTIVE MODALS */}
      {/* ========================================================= */}
      <NewAcademicYearModal
        isOpen={isYearModalOpen}
        onClose={() => setIsYearModalOpen(false)}
        onSave={onSaveAcademicYear}
        initialData={editingYear}
        escolaId={currentSchool.id}
      />

      <NewClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={onSaveClass}
        initialData={editingClass}
        escolaId={currentSchool.id}
        existingClassesCount={schoolClasses.length}
      />

      <NewSectionModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSave={onSaveSection}
        initialData={editingSection}
        classes={schoolClasses}
        academicYears={schoolYears}
        teachers={schoolTeachers}
        escolaId={currentSchool.id}
      />

      <NewSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSave={onSaveSubject}
        initialData={editingSubject}
        escolaId={currentSchool.id}
      />

      <NewClassSubjectModal
        isOpen={isClassSubjectModalOpen}
        onClose={() => setIsClassSubjectModalOpen(false)}
        onSave={onSaveClassSubject}
        classes={schoolClasses}
        subjects={schoolSubjects}
        initialClassId={selectedClassForCurriculum}
        escolaId={currentSchool.id}
      />

      <NewTeacherAssignmentModal
        isOpen={isTeacherAssignmentModalOpen}
        onClose={() => setIsTeacherAssignmentModalOpen(false)}
        onSave={onSaveTeacherAssignment}
        teachers={schoolTeachers}
        sections={schoolSections}
        subjects={schoolSubjects}
        academicYears={schoolYears}
        escolaId={currentSchool.id}
      />
    </div>
  );
};
