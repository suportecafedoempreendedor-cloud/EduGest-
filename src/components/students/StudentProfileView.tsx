import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Printer,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Building2,
  Plus,
  BookOpen,
  Award,
  DollarSign,
  FileCheck,
  Download,
  Trash2,
  Heart,
  Briefcase,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Student,
  Guardian,
  GuardianStudentRelation,
  HistoricoAcademico,
  MatriculaRecord,
  AssiduidadeRecord,
  ContaCorrenteItem,
  DocumentoItem,
  NotaItem,
  StudentState,
  GrauParentesco,
  UserRole,
} from '../../types';

interface StudentProfileViewProps {
  student: Student;
  allGuardians: Guardian[];
  allRelations: GuardianStudentRelation[];
  allNotas: NotaItem[];
  historicoList: HistoricoAcademico[];
  matriculasList: MatriculaRecord[];
  assiduidadeList: AssiduidadeRecord[];
  contaCorrenteList: ContaCorrenteItem[];
  documentosList: DocumentoItem[];
  userRole?: UserRole;
  currentSchoolName?: string;
  onBack: () => void;
  onEditStudent: (student: Student) => void;
  onUpdateStudentState: (studentId: string, newState: StudentState) => void;
  onOpenAssociateGuardian: (studentId: string) => void;
  onOpenNewPayment: (student: Student) => void;
  onEmitDeclaration: (student: Student) => void;
  onRemoveRelation?: (relationId: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  allGuardians,
  allRelations,
  allNotas,
  historicoList,
  matriculasList,
  assiduidadeList,
  contaCorrenteList,
  documentosList,
  userRole = 'super_admin',
  currentSchoolName,
  onBack,
  onEditStudent,
  onUpdateStudentState,
  onOpenAssociateGuardian,
  onOpenNewPayment,
  onEmitDeclaration,
  onRemoveRelation,
}) => {
  // Verificação de permissões do tenant
  const isSchoolAdmin = userRole === 'school_admin';
  const hasAccessPermission =
    !isSchoolAdmin ||
    !currentSchoolName ||
    student.escolaNome.trim().toLowerCase() === currentSchoolName.trim().toLowerCase();

  const [activeTab, setActiveTab] = useState<
    | 'pessoais'
    | 'encarregados'
    | 'historico'
    | 'matriculas'
    | 'assiduidade'
    | 'financeiro'
    | 'documentos'
    | 'notas'
  >('pessoais');

  if (!hasAccessPermission) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#015FC4] hover:text-[#012041] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Lista Geral de Alunos
        </button>

        <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border-2 border-red-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#012041]">
              Acesso Restrito ao Tenant Escolar
            </h2>
            <p className="text-xs text-[#41515D] max-w-md mx-auto leading-relaxed">
              O seu perfil está configurado como <strong>Administrador da Escola ({currentSchoolName})</strong>. O estudante <strong>{student.nomeCompleto}</strong> ({student.numeroMatricula}) está formalmente matriculado na instituição <strong>{student.escolaNome}</strong>.
            </p>
          </div>
          <div className="p-3 bg-red-50/70 rounded-xl max-w-lg mx-auto text-xs text-red-800 border border-red-200">
            <strong>Política de Segurança EduGest:</strong> Por exigência do subsistema de ensino e protecção de dados discentes, um administrador de escola só tem autorização para consultar e gerir alunos pertencentes à sua respectiva instituição.
          </div>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={onBack}>
              Voltar aos Meus Alunos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Encarregados associados a este aluno
  const studentRelations = allRelations.filter((r) => r.studentId === student.id);
  const studentGuardiansWithRel = studentRelations.map((rel) => {
    const guardian = allGuardians.find((g) => g.id === rel.guardianId);
    return {
      guardian,
      relation: rel,
    };
  }).filter((item): item is { guardian: Guardian; relation: GuardianStudentRelation } => !!item.guardian);

  // Notas deste aluno
  const studentNotas = allNotas.filter((n) => n.alunoId === student.id);

  // Totais de assiduidade
  const totalAulas = assiduidadeList.reduce((acc, curr) => acc + curr.totalAulas, 0);
  const totalPresencas = assiduidadeList.reduce((acc, curr) => acc + curr.presencas, 0);
  const totalFaltasJustificadas = assiduidadeList.reduce((acc, curr) => acc + curr.faltasJustificadas, 0);
  const totalFaltasInjustificadas = assiduidadeList.reduce((acc, curr) => acc + curr.faltasInjustificadas, 0);
  const mediaFrequencia = totalAulas > 0 ? ((totalPresencas / totalAulas) * 100).toFixed(1) : '100';

  // Totais de conta corrente
  const totalFacturado = contaCorrenteList
    .filter((c) => c.tipo === 'debito')
    .reduce((acc, curr) => acc + curr.valorKz, 0);
  const totalPago = contaCorrenteList
    .filter((c) => c.tipo === 'credito')
    .reduce((acc, curr) => acc + curr.valorKz, 0);
  const saldoPendente = Math.max(0, totalFacturado - totalPago);

  // Cores de estado do aluno
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

  const tabs = [
    { id: 'pessoais', label: 'Dados Pessoais', icon: <User className="w-4 h-4" /> },
    {
      id: 'encarregados',
      label: `Encarregados (${studentGuardiansWithRel.length})`,
      icon: <Users className="w-4 h-4" />,
    },
    { id: 'historico', label: 'Histórico Académico', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'matriculas', label: 'Matrículas', icon: <Calendar className="w-4 h-4" /> },
    { id: 'assiduidade', label: `Assiduidade (${mediaFrequencia}%)`, icon: <Clock className="w-4 h-4" /> },
    {
      id: 'financeiro',
      label: 'Conta Corrente',
      icon: <CreditCard className="w-4 h-4" />,
    },
    { id: 'documentos', label: `Documentos (${documentosList.length})`, icon: <FileText className="w-4 h-4" /> },
    { id: 'notas', label: `Notas & Pauta (${studentNotas.length})`, icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#015FC4] hover:text-[#012041] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Lista Geral de Alunos
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => onEmitDeclaration(student)}
          >
            Emitir Declaração
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Edit2 className="w-4 h-4" />}
            onClick={() => onEditStudent(student)}
          >
            Editar Ficha
          </Button>
        </div>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-[#012041] text-white rounded-xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Student Photo */}
            <div className="relative shrink-0">
              {student.fotografia || student.foto ? (
                <img
                  src={student.fotografia || student.foto}
                  alt={student.nomeCompleto}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#015FC4] text-white font-bold text-2xl flex items-center justify-center border-2 border-white/20 shadow-md">
                  {student.nomeCompleto.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1">
                <span className="w-4 h-4 rounded-full border-2 border-[#012041] bg-emerald-400 block" />
              </div>
            </div>

            {/* Student Identity Information */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#015FC4] text-white">
                  {student.numeroMatricula || student.processo}
                </span>
                {renderStateBadge(student.estado)}
                <span className="text-xs text-[#8EA5B8]">·</span>
                <span className="text-xs text-[#8EA5B8]">{student.anoLectivo}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                {student.nomeCompleto}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8EA5B8]">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#015FC4]" />
                  {student.escolaNome}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <GraduationCap className="w-3.5 h-3.5 text-[#0263CB]" />
                  {student.classe} ({student.turmaNome})
                </span>
                <span>•</span>
                <span>Nº BI: <strong className="text-white font-mono">{student.documentoIdentificacao || student.bi}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:border-l md:border-white/10 md:pl-6 shrink-0">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[10px] text-[#8EA5B8] uppercase block">Média Geral</span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {student.mediaGeral ? student.mediaGeral.toFixed(1) : '15.0'} <span className="text-xs font-normal text-white/70">/ 20</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[10px] text-[#8EA5B8] uppercase block">Frequência</span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {mediaFrequencia}%
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#8EA5B8] uppercase block">Propinas</span>
              <span className={`text-sm font-bold block mt-0.5 ${saldoPendente > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {saldoPendente > 0 ? 'Sob Débito' : 'Em Dia'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E2E8F0] gap-1 overflow-x-auto pb-px bg-white rounded-t-xl px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#015FC4] text-[#015FC4] font-semibold bg-blue-50/40'
                  : 'border-transparent text-[#41515D] hover:text-[#012041]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Dados Pessoais */}
      {activeTab === 'pessoais' && (
        <div className="space-y-6">
          <Card
            title="Identificação & Informações Biográficas"
            subtitle="Registo civil e dados cadastrais oficiais do estudante angolano"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-[#41515D] font-medium block">Nome Completo</span>
                <span className="text-sm font-semibold text-[#012041] block mt-0.5">
                  {student.nomeCompleto}
                </span>
              </div>

              <div>
                <span className="text-[#41515D] font-medium block">Documento de Identificação</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-mono font-semibold text-[#012041]">
                    {student.documentoIdentificacao || student.bi}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-[#41515D]">
                    {student.tipoDocumento || 'BI'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[#41515D] font-medium block">Data de Nascimento</span>
                <span className="text-sm font-semibold text-[#012041] block mt-0.5">
                  {student.dataNascimento}
                </span>
              </div>

              <div>
                <span className="text-[#41515D] font-medium block">Sexo / Género</span>
                <span className="text-sm font-semibold text-[#012041] block mt-0.5">
                  {student.sexo === 'F' || student.genero === 'F' ? 'Feminino (F)' : 'Masculino (M)'}
                </span>
              </div>

              <div>
                <span className="text-[#41515D] font-medium block">Nacionalidade</span>
                <span className="text-sm font-semibold text-[#012041] block mt-0.5">
                  {student.nacionalidade || 'Angolana'}
                </span>
              </div>

              <div>
                <span className="text-[#41515D] font-medium block">Número de Matrícula</span>
                <span className="text-sm font-mono font-bold text-[#015FC4] block mt-0.5">
                  {student.numeroMatricula || student.processo}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[#41515D] font-medium block">Morada de Residência</span>
                <span className="text-sm text-[#012041] block mt-0.5">
                  {student.morada} {student.municipio && `· ${student.municipio}`} ({student.provincia})
                </span>
              </div>

              <div>
                <span className="text-[#41515D] font-medium block">Contacto Telefónico</span>
                <span className="text-sm font-mono font-semibold text-[#012041] block mt-0.5">
                  {student.telefone || student.contactos?.telefone || 'Não registado'}
                </span>
              </div>

              {student.email && (
                <div>
                  <span className="text-[#41515D] font-medium block">Correio Electrónico</span>
                  <span className="text-sm text-[#012041] block mt-0.5">
                    {student.email}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[#41515D] font-medium block">Data de Inscrição</span>
                <span className="text-sm text-[#012041] block mt-0.5">
                  {student.dataCadastro || '2024-09-02'}
                </span>
              </div>

              <div>
                <span className="text-[#41515D] font-medium block">Estado no Sistema</span>
                <div className="mt-1 flex items-center gap-2">
                  {renderStateBadge(student.estado)}
                </div>
              </div>
            </div>

            {student.observacoes && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <strong className="text-[#012041] block mb-1">Notas Administrativas:</strong>
                <p className="text-[#41515D] leading-relaxed">{student.observacoes}</p>
              </div>
            )}
          </Card>

          {/* Alterar Estado do Aluno */}
          <Card
            title="Gestão de Estado & Ciclo Escolar"
            subtitle="Permite transitar o aluno entre estados operacionais com registo imediato de auditoria"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              {(
                [
                  'activo',
                  'inscrito',
                  'pre_inscrito',
                  'suspenso',
                  'transferido',
                  'concluido',
                  'inactivo',
                ] as StudentState[]
              ).map((est) => {
                const isCurrent = student.estado === est;
                return (
                  <button
                    key={est}
                    onClick={() => onUpdateStudentState(student.id, est)}
                    disabled={isCurrent}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      isCurrent
                        ? 'bg-[#012041] text-white border-[#012041] cursor-default opacity-90'
                        : 'bg-white text-[#012041] border-[#E2E8F0] hover:bg-slate-50'
                    }`}
                  >
                    {isCurrent ? '✓ ' : ''}
                    {est === 'activo'
                      ? 'Activo'
                      : est === 'inscrito'
                      ? 'Inscrito'
                      : est === 'pre_inscrito'
                      ? 'Pré inscrito'
                      : est === 'suspenso'
                      ? 'Suspender'
                      : est === 'transferido'
                      ? 'Transferir'
                      : est === 'concluido'
                      ? 'Concluído'
                      : 'Inactivar'}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Encarregados de Educação (guardian_students) */}
      {activeTab === 'encarregados' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#012041]">
                Encarregados de Educação & Tutores Legais
              </h3>
              <p className="text-xs text-[#41515D]">
                Relação multi-tutor (`guardian_students`) com permissões para buscar o educando e contactos prioritários.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => onOpenAssociateGuardian(student.id)}
            >
              Associar Encarregado
            </Button>
          </div>

          {studentGuardiansWithRel.length === 0 ? (
            <Card noPadding>
              <div className="p-8 text-center text-[#41515D] text-xs">
                Nenhum encarregado associado a este aluno no cadastro integrado.
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentGuardiansWithRel.map(({ guardian, relation }) => (
                <Card key={guardian.id} className="relative">
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#012041]">{guardian.nome}</h4>
                          {relation.isPrincipal && (
                            <Badge variant="primary">Principal</Badge>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-[#015FC4] block mt-0.5">
                          {relation.grauParentesco}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <span className="text-[10px] text-[#41515D] block">BI / Documento</span>
                          <span className="font-mono font-semibold text-[#012041]">{guardian.documento}</span>
                        </div>
                        {onRemoveRelation && (
                          <button
                            onClick={() => onRemoveRelation(relation.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
                            title="Remover vínculo deste encarregado com o educando"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[#41515D] text-[11px] block">Contacto Principal</span>
                        <span className="font-mono font-medium text-[#012041] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#015FC4]" />
                          {guardian.telefone}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#41515D] text-[11px] block">Profissão</span>
                        <span className="font-medium text-[#012041] flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 text-[#41515D]" />
                          {guardian.profissao}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[#41515D] text-[11px] block">Correio Electrónico</span>
                        <span className="text-[#012041] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#015FC4]" />
                          {guardian.email}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[#41515D] text-[11px] block">Morada</span>
                        <span className="text-[#012041] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#41515D]" />
                          {guardian.morada}
                        </span>
                      </div>
                    </div>

                    {/* Permissions Badges */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[10px]">
                      {relation.autorizadoBuscarAluno && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Autorizado a Buscar Aluno
                        </span>
                      )}
                      {relation.contactoEmergencia && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#015FC4] font-semibold border border-blue-200 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Contacto de Emergência
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Histórico Académico */}
      {activeTab === 'historico' && (
        <Card
          title="Histórico Escolar & Percurso Pedagógico"
          subtitle="Registo de anos lectivos concluídos, escolas de origem e médias anuais homologadas"
          noPadding
        >
          {historicoList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#41515D]">
              Sem histórico de anos lectivos anteriores registado para este educando.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041]">
                    <th className="py-3 px-4 font-semibold">Ano Lectivo</th>
                    <th className="py-3 px-4 font-semibold">Classe</th>
                    <th className="py-3 px-4 font-semibold">Instituição de Ensino</th>
                    <th className="py-3 px-4 font-semibold text-center">Média Final</th>
                    <th className="py-3 px-4 font-semibold text-center">Resultado</th>
                    <th className="py-3 px-4 font-semibold">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {historicoList.map((hist) => (
                    <tr key={hist.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-[#012041]">{hist.anoLectivo}</td>
                      <td className="py-3 px-4 text-[#012041] font-medium">{hist.classe}</td>
                      <td className="py-3 px-4 text-[#41515D]">{hist.escola}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                        {hist.mediaFinal.toFixed(1)} / 20
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={hist.resultado === 'Aprovado' ? 'success' : 'neutral'}>
                          {hist.resultado}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[#41515D]">{hist.observacoes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Matrículas */}
      {activeTab === 'matriculas' && (
        <Card
          title="Registo de Matrículas & Renovações"
          subtitle="Processos homologados pela secretaria escolar com emolumentos anexados"
          noPadding
        >
          {matriculasList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#41515D]">
              Sem matrículas adicionais registadas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041]">
                    <th className="py-3 px-4 font-semibold">Nº Matrícula</th>
                    <th className="py-3 px-4 font-semibold">Ano Lectivo</th>
                    <th className="py-3 px-4 font-semibold">Classe & Turma</th>
                    <th className="py-3 px-4 font-semibold">Data Homologação</th>
                    <th className="py-3 px-4 font-semibold">Responsável</th>
                    <th className="py-3 px-4 font-semibold text-center">Estado</th>
                    <th className="py-3 px-4 font-semibold text-right">Recibo Emolumentos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {matriculasList.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-[#015FC4]">
                        {mat.numeroMatricula}
                      </td>
                      <td className="py-3 px-4 text-[#012041] font-medium">{mat.anoLectivo}</td>
                      <td className="py-3 px-4 text-[#41515D]">
                        {mat.classe} · {mat.turma}
                      </td>
                      <td className="py-3 px-4 text-[#41515D]">{mat.dataMatricula}</td>
                      <td className="py-3 px-4 text-[#41515D]">{mat.responsavelRegisto}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success">{mat.estado}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#012041]">
                        {mat.reciboEmolumentos || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Assiduidade */}
      {activeTab === 'assiduidade' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <span className="text-xs text-[#41515D] block">Frequência Global</span>
              <span className="text-2xl font-bold font-mono text-emerald-600 block mt-1">
                {mediaFrequencia}%
              </span>
              <span className="text-[11px] text-[#41515D] mt-1 block">Conforme o limiar do MED (75%)</span>
            </Card>

            <Card>
              <span className="text-xs text-[#41515D] block">Total de Aulas</span>
              <span className="text-2xl font-bold font-mono text-[#012041] block mt-1">
                {totalAulas}
              </span>
              <span className="text-[11px] text-[#41515D] mt-1 block">Carga horária acumulada</span>
            </Card>

            <Card>
              <span className="text-xs text-[#41515D] block">Faltas Justificadas</span>
              <span className="text-2xl font-bold font-mono text-[#015FC4] block mt-1">
                {totalFaltasJustificadas}
              </span>
              <span className="text-[11px] text-[#41515D] mt-1 block">Com atestado / aviso prévio</span>
            </Card>

            <Card>
              <span className="text-xs text-[#41515D] block">Faltas Injustificadas</span>
              <span className={`text-2xl font-bold font-mono block mt-1 ${totalFaltasInjustificadas > 4 ? 'text-red-600' : 'text-[#012041]'}`}>
                {totalFaltasInjustificadas}
              </span>
              <span className="text-[11px] text-[#41515D] mt-1 block">Passíveis de advertência</span>
            </Card>
          </div>

          <Card
            title="Discriminação Mensal de Presenças"
            subtitle="Registo de frequência por mês lectivo"
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041]">
                    <th className="py-3 px-4 font-semibold">Mês de Referência</th>
                    <th className="py-3 px-4 font-semibold text-center">Aulas Previstas</th>
                    <th className="py-3 px-4 font-semibold text-center">Presenças</th>
                    <th className="py-3 px-4 font-semibold text-center">Justificadas</th>
                    <th className="py-3 px-4 font-semibold text-center">Injustificadas</th>
                    <th className="py-3 px-4 font-semibold text-right">Taxa de Assiduidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {assiduidadeList.map((ass) => (
                    <tr key={ass.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-[#012041]">{ass.mes}</td>
                      <td className="py-3 px-4 text-center font-mono">{ass.totalAulas}</td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-600 font-semibold">{ass.presencas}</td>
                      <td className="py-3 px-4 text-center font-mono text-[#015FC4]">{ass.faltasJustificadas}</td>
                      <td className="py-3 px-4 text-center font-mono text-red-600">{ass.faltasInjustificadas}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        {ass.percentagemFrequencia}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 6: Conta Corrente */}
      {activeTab === 'financeiro' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <span className="text-xs text-[#41515D] block">Total Facturado</span>
              <span className="text-xl font-bold font-mono text-[#012041] block mt-1">
                {totalFacturado.toLocaleString('pt-AO')} Kz
              </span>
              <span className="text-[11px] text-[#41515D] block mt-0.5">Mensalidades do ano corrente</span>
            </Card>

            <Card>
              <span className="text-xs text-[#41515D] block">Total Liquidado</span>
              <span className="text-xl font-bold font-mono text-emerald-600 block mt-1">
                {totalPago.toLocaleString('pt-AO')} Kz
              </span>
              <span className="text-[11px] text-emerald-700 block mt-0.5">Pagamentos confirmados</span>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#41515D] block">Saldo em Aberto</span>
                  <span className={`text-xl font-bold font-mono block mt-1 ${saldoPendente > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {saldoPendente.toLocaleString('pt-AO')} Kz
                  </span>
                  <span className="text-[11px] text-[#41515D] block mt-0.5">
                    {saldoPendente > 0 ? 'Aguardando liquidação' : 'Situação regularizada'}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenNewPayment(student)}
                >
                  Lançar Pagamento
                </Button>
              </div>
            </Card>
          </div>

          <Card
            title="Extracto da Conta Corrente Discente"
            subtitle="Histórico de débitos (facturas) e créditos (recibos Multicaixa/TPA)"
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041]">
                    <th className="py-3 px-4 font-semibold">Data</th>
                    <th className="py-3 px-4 font-semibold">Descrição do Movimento</th>
                    <th className="py-3 px-4 font-semibold">Tipo</th>
                    <th className="py-3 px-4 font-semibold text-right">Valor Movimentado</th>
                    <th className="py-3 px-4 font-semibold">Documento / Recibo</th>
                    <th className="py-3 px-4 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {contaCorrenteList.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-[#41515D]">{mov.data}</td>
                      <td className="py-3 px-4 font-medium text-[#012041]">{mov.descricao}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${mov.tipo === 'credito' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#015FC4]'}`}>
                          {mov.tipo === 'credito' ? 'Crédito' : 'Débito'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${mov.tipo === 'credito' ? 'text-emerald-600' : 'text-[#012041]'}`}>
                        {mov.tipo === 'credito' ? '+ ' : '- '}
                        {mov.valorKz.toLocaleString('pt-AO')} Kz
                      </td>
                      <td className="py-3 px-4 font-mono text-[#015FC4]">
                        {mov.referenciaDoc || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={mov.status === 'pago' ? 'success' : 'warning'}>
                          {mov.status === 'pago' ? 'Liquidado' : 'Pendente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 7: Documentos Digitais */}
      {activeTab === 'documentos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#012041]">
                Repositório de Documentos Oficiais
              </h3>
              <p className="text-xs text-[#41515D]">
                Arquivo digital com validação para fins de matrícula e verificação no MED.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => onEmitDeclaration(student)}
            >
              Gerar Nova Declaração de Matrícula
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentosList.map((doc) => (
              <Card key={doc.id} className="hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#015FC4] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <h4 className="font-bold text-[#012041] truncate">{doc.titulo}</h4>
                    <p className="text-[#41515D] text-[11px] mt-0.5">
                      Emitido em {doc.dataEmissao} · {doc.tamanho}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <Badge variant="success">{doc.estado}</Badge>
                      <button
                        onClick={() => onEmitDeclaration(student)}
                        className="text-[#015FC4] font-semibold text-xs hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Visualizar
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Notas & Pauta */}
      {activeTab === 'notas' && (
        <Card
          title="Pauta Oficial de Avaliação Trimestral"
          subtitle="Subsistema Geral de Ensino do MED: MAC (Média Avaliação Contínua), NPP (Prova do Professor), NPT (Prova Trimestral) e MT (Média Trimestral)"
          noPadding
        >
          {studentNotas.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#41515D]">
              Sem notas lançadas no trimestre activo para este aluno.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#012041]">
                    <th className="py-3 px-4 font-semibold">Disciplina Curricular</th>
                    <th className="py-3 px-4 font-semibold text-center">Trimestre</th>
                    <th className="py-3 px-4 font-semibold text-center">MAC (0-20)</th>
                    <th className="py-3 px-4 font-semibold text-center">NPP (0-20)</th>
                    <th className="py-3 px-4 font-semibold text-center">NPT (0-20)</th>
                    <th className="py-3 px-4 font-semibold text-center">Média Trimestral (MT)</th>
                    <th className="py-3 px-4 font-semibold text-center">Apreciação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {studentNotas.map((nota) => {
                    const isPositiva = nota.mt >= 10;
                    return (
                      <tr key={nota.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-[#012041]">{nota.disciplina}</td>
                        <td className="py-3 px-4 text-center font-medium">{nota.trimestre}º Trimestre</td>
                        <td className="py-3 px-4 text-center font-mono">{nota.mac.toFixed(1)}</td>
                        <td className="py-3 px-4 text-center font-mono">{nota.npp.toFixed(1)}</td>
                        <td className="py-3 px-4 text-center font-mono">{nota.npt.toFixed(1)}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span className={isPositiva ? 'text-emerald-600' : 'text-red-600'}>
                            {nota.mt.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={isPositiva ? 'success' : 'error'}>
                            {isPositiva ? 'Aprovado' : 'Não Aprovado'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
