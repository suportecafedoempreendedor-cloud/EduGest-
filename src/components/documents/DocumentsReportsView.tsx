import React, { useState, useMemo } from 'react';
import {
  FileText,
  Files,
  Sliders,
  BarChart3,
  PlusCircle,
  Search,
  Filter,
  Printer,
  Download,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit2,
  Eye,
  Copy,
  Check,
  Clock,
  Layers,
  Award,
  CreditCard,
  FileSpreadsheet,
  HardDrive,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import {
  School,
  Student,
  Turma,
  NotaItem,
  Pagamento,
  Section,
  StudentAttendanceRecord,
  Lead,
  Campaign,
  Teacher,
} from '../../types';
import {
  DocumentType,
  DocumentTypeMetadata,
  SchoolDocumentTemplate,
  EmittedDocument,
} from '../../types/documentsReports';
import {
  DOCUMENT_TYPES_CATALOG,
  DEFAULT_SCHOOL_TEMPLATES,
  INITIAL_EMITTED_DOCUMENTS,
} from '../../data/mockDocumentsData';
import {
  generateVerificationCode,
  formatarDataExtenso,
  exportToCsv,
} from '../../utils/documentExportUtils';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { DocumentTemplateEditorModal } from './DocumentTemplateEditorModal';
import { ReportsDataView } from './ReportsDataView';
import { ScheduledDataExportView } from './ScheduledDataExportView';

interface DocumentsReportsViewProps {
  currentSchool: School;
  students: Student[];
  notas: NotaItem[];
  payments: Pagamento[];
  sections: Section[];
  attendanceRecords: StudentAttendanceRecord[];
  leads?: Lead[];
  campaigns?: Campaign[];
  teachers?: Teacher[];
  onNotify?: (notification: { type: 'success' | 'error' | 'info'; title?: string; message: string }) => void;
}

export const DocumentsReportsView: React.FC<DocumentsReportsViewProps> = ({
  currentSchool,
  students,
  notas,
  payments,
  sections,
  attendanceRecords,
  leads = [],
  campaigns = [],
  teachers = [],
  onNotify,
}) => {
  // Aba principal activa: 'documentos' | 'templates' | 'relatorios' | 'exportacao'
  const [mainTab, setMainTab] = useState<'documentos' | 'templates' | 'relatorios' | 'exportacao'>('documentos');

  // Estado dos documentos emitidos
  const [emittedDocs, setEmittedDocs] = useState<EmittedDocument[]>(INITIAL_EMITTED_DOCUMENTS);

  // Estado dos templates por escola
  const [schoolTemplates, setSchoolTemplates] = useState<SchoolDocumentTemplate[]>(() => {
    return DEFAULT_SCHOOL_TEMPLATES[currentSchool.id] || DEFAULT_SCHOOL_TEMPLATES['esc-001'];
  });

  // Modais
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<EmittedDocument | null>(null);

  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [selectedTemplateToEdit, setSelectedTemplateToEdit] = useState<SchoolDocumentTemplate | null>(null);

  const [isNewEmissionOpen, setIsNewEmissionOpen] = useState(false);
  const [newEmissionType, setNewEmissionType] = useState<DocumentType>('declaracao_matricula');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>(sections[0]?.id || 'turma-1');
  const [emissionFinalidade, setEmissionFinalidade] = useState<string>('Apresentação bancária');

  // Filtros da tabela de histórico
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('todos');

  // Selecção de aluno e turma para pré-visualização
  const selectedStudentObj = useMemo(() => {
    if (!selectedPreviewDoc?.alunoId) {
      return students.find((s) => s.id === selectedStudentId) || students[0];
    }
    return students.find((s) => s.id === selectedPreviewDoc.alunoId) || students[0];
  }, [selectedPreviewDoc, selectedStudentId, students]);

  const selectedTurmaObj: Turma = useMemo(() => {
    return {
      id: 'turma-1',
      nome: selectedPreviewDoc?.turmaNome || '10ª Classe - Turma A',
      ciclo: 'IIº Ciclo',
      curso: 'Ciências Físicas e Biológicas',
      sala: 'Sala 04',
      periodo: 'Manhã',
      directorTurma: 'Prof. André Muanza',
      totalAlunos: students.length || 24,
      capacidade: 35,
    };
  }, [selectedPreviewDoc, students]);

  const activeTemplateForDoc = useMemo(() => {
    const type = selectedPreviewDoc ? selectedPreviewDoc.tipo : newEmissionType;
    return (
      schoolTemplates.find((t) => t.tipoDocumento === type) ||
      schoolTemplates[0] ||
      null
    );
  }, [selectedPreviewDoc, newEmissionType, schoolTemplates]);

  // Lista de documentos emitidos filtrada
  const filteredEmittedDocs = useMemo(() => {
    return emittedDocs.filter((d) => {
      const matchSearch =
        d.numeroDocumento.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        (d.alunoNome && d.alunoNome.toLowerCase().includes(historySearchTerm.toLowerCase())) ||
        d.codigoAutenticidade.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        d.titulo.toLowerCase().includes(historySearchTerm.toLowerCase());

      const matchType = historyTypeFilter === 'todos' || d.tipo === historyTypeFilter;

      return matchSearch && matchType;
    });
  }, [emittedDocs, historySearchTerm, historyTypeFilter]);

  // Handler para iniciar emissão de documento específico
  const handleStartEmission = (docType: DocumentType) => {
    setNewEmissionType(docType);
    setIsNewEmissionOpen(true);
  };

  // Confirmar e gerar documento com código de autenticidade
  const handleConfirmEmission = () => {
    const st = students.find((s) => s.id === selectedStudentId) || students[0];
    const docMeta = DOCUMENT_TYPES_CATALOG.find((d) => d.id === newEmissionType);
    const tmpl = schoolTemplates.find((t) => t.tipoDocumento === newEmissionType);

    const prefix = tmpl?.codigoPrefixo || 'EG-DOC';
    const numRandom = Math.floor(1000 + Math.random() * 9000);
    const numeroDoc = `${prefix}-2025/00${numRandom}`;
    const authCode = generateVerificationCode('EG-AUTH');

    const newDoc: EmittedDocument = {
      id: `doc-emit-${Date.now()}`,
      numeroDocumento: numeroDoc,
      codigoAutenticidade: authCode,
      tipo: newEmissionType,
      titulo: `${docMeta?.nome} · ${st?.nomeCompleto || 'Turma A'}`,
      escolaId: currentSchool.id,
      escolaNome: currentSchool.nome,
      alunoId: st?.id,
      alunoNome: st?.nomeCompleto,
      alunoProcesso: st?.processo,
      alunoBi: st?.documentoIdentificacao,
      turmaId: selectedTurmaId,
      turmaNome: '10ª Classe - Turma A',
      classe: '10ª Classe',
      anoLectivo: currentSchool.anoLectivoActivo,
      dataEmissao: new Date().toISOString().split('T')[0],
      emitidoPor: `${currentSchool.adminNome || 'Secretaria Geral'}`,
      finalidade: emissionFinalidade,
      estado: 'valido',
    };

    setEmittedDocs((prev) => [newDoc, ...prev]);
    setIsNewEmissionOpen(false);

    // Abre pré-visualização oficial imediatamente
    setSelectedPreviewDoc(newDoc);
    setIsPreviewOpen(true);

    onNotify?.({
      type: 'success',
      title: 'Documento Emitido',
      message: `${docMeta?.nome} gerado com sucesso sob o nº ${numeroDoc}.`,
    });
  };

  // Salvar template editado
  const handleSaveTemplate = (updated: SchoolDocumentTemplate) => {
    setSchoolTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    onNotify?.({
      type: 'success',
      title: 'Template Actualizado',
      message: `O template "${updated.nomeTemplate}" foi guardado para esta escola.`,
    });
  };

  // Exportar histórico para Excel
  const handleExportHistoryToExcel = () => {
    const headers = [
      'Nº Documento',
      'Código Autenticidade',
      'Tipo',
      'Aluno / Alvo',
      'Processo',
      'Data Emissão',
      'Emitido Por',
      'Finalidade',
      'Estado',
    ];

    const rows = filteredEmittedDocs.map((d) => [
      d.numeroDocumento,
      d.codigoAutenticidade,
      d.tipo,
      d.alunoNome || d.turmaNome || 'Geral',
      d.alunoProcesso || '---',
      d.dataEmissao,
      d.emitidoPor,
      d.finalidade,
      d.estado,
    ]);

    exportToCsv(
      `documentos_emitidos_${currentSchool.id}_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );

    onNotify?.({
      type: 'success',
      title: 'Exportação Concluída',
      message: `${rows.length} documentos exportados para Excel com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          CABEÇALHO DO MÓDULO
         ======================================================== */}
      <div className="bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] rounded-xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
            <Building2 className="w-4 h-4 text-blue-300" />
            <span>{currentSchool.nome} · Módulo Oficial</span>
            <span aria-hidden="true">·</span>
            <span>NIF: {currentSchool.nif}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Documentos Oficiais & Relatórios de Gestão
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Emissão informatizada de declarações, boletins trimestrais, pautas, certificados e facturas com carimbo digital, selo branco e código de verificação institucional. Relatórios executivos analíticos de todas as dimensões da escola.
          </p>

          {/* Abas Superiores de Navegação */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button
              onClick={() => setMainTab('documentos')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                mainTab === 'documentos'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Files className="w-4 h-4" />
              <span>Emissão de Documentos ({emittedDocs.length})</span>
            </button>

            <button
              onClick={() => setMainTab('templates')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                mainTab === 'templates'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Templates & Timbre da Escola ({schoolTemplates.length})</span>
            </button>

            <button
              onClick={() => setMainTab('relatorios')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                mainTab === 'relatorios'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Relatórios de Gestão & Métricas</span>
            </button>

            <button
              onClick={() => setMainTab('exportacao')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                mainTab === 'exportacao'
                  ? 'bg-white text-[#012041] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <HardDrive className="w-4 h-4 text-emerald-300" />
              <span>Exportação Agendada & Storage Seguro</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          ABA 1: EMISSÃO DE DOCUMENTOS OFICIAIS
         ======================================================== */}
      {mainTab === 'documentos' && (
        <div className="space-y-6">
          {/* Grade com os 9 Documentos Oficiais */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#012041]">
                  Catálogo de Documentos Emitíveis
                </h2>
                <p className="text-xs text-slate-500">
                  Documentos padronizados com os dados reais do aluno, turma e escola
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {DOCUMENT_TYPES_CATALOG.length} Modelos Disponíveis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DOCUMENT_TYPES_CATALOG.map((docMeta) => {
                const categoryColor =
                  docMeta.categoria === 'Academico'
                    ? 'border-l-blue-600'
                    : docMeta.categoria === 'Financeiro'
                    ? 'border-l-emerald-600'
                    : 'border-l-indigo-600';

                return (
                  <Card
                    key={docMeta.id}
                    className={`p-4 border-slate-200 border-l-4 ${categoryColor} flex flex-col justify-between hover:shadow-md transition-shadow`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {docMeta.categoria}
                        </span>
                        {docMeta.prazoValidadeDias && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Validade {docMeta.prazoValidadeDias} dias
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-[#012041] mb-1">
                        {docMeta.nome}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {docMeta.descricao}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          const tmpl = schoolTemplates.find(
                            (t) => t.tipoDocumento === docMeta.id
                          );
                          if (tmpl) {
                            setSelectedTemplateToEdit(tmpl);
                            setIsTemplateEditorOpen(true);
                          }
                        }}
                        className="text-xs text-slate-500 hover:text-[#015FC4] flex items-center gap-1 font-medium transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Configurar</span>
                      </button>

                      <Button
                        variant="primary"
                        size="sm"
                        icon={<PlusCircle className="w-3.5 h-3.5" />}
                        onClick={() => handleStartEmission(docMeta.id)}
                      >
                        Emitir
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Histórico de Documentos Emitidos */}
          <Card className="border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#012041]">
                  Histórico de Documentos Emitidos
                </h3>
                <p className="text-xs text-slate-500">
                  Rastreabilidade e arquivo digital com código de autenticidade por documento
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />}
                  onClick={handleExportHistoryToExcel}
                >
                  Exportar Histórico
                </Button>
              </div>
            </div>

            {/* Barra de Filtros da Tabela */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nº, aluno ou código..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#015FC4]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">Filtrar Tipo:</span>
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#015FC4]"
                >
                  <option value="todos">Todos os Documentos</option>
                  {DOCUMENT_TYPES_CATALOG.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabela de Documentos Emitidos */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-3">Nº Documento</th>
                    <th className="p-3">Código Validação</th>
                    <th className="p-3">Tipo / Título</th>
                    <th className="p-3">Aluno / Alvo</th>
                    <th className="p-3">Data Emissão</th>
                    <th className="p-3">Finalidade</th>
                    <th className="p-3 text-center">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmittedDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-semibold text-slate-900">
                        {doc.numeroDocumento}
                      </td>
                      <td className="p-3">
                        <code className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-slate-700">
                          {doc.codigoAutenticidade}
                        </code>
                      </td>
                      <td className="p-3 font-medium text-slate-800 max-w-xs truncate">
                        {doc.titulo}
                      </td>
                      <td className="p-3 text-slate-700">
                        {doc.alunoNome || doc.turmaNome || '---'}
                      </td>
                      <td className="p-3 text-slate-500">{doc.dataEmissao}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate text-[11px]">
                        {doc.finalidade}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setSelectedPreviewDoc(doc);
                            setIsPreviewOpen(true);
                          }}
                        >
                          Ver / Imprimir
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmittedDocs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Nenhum documento encontrado com os filtros actuais.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================
          ABA 2: CONFIGURAÇÃO DE TEMPLATES POR ESCOLA
         ======================================================== */}
      {mainTab === 'templates' && (
        <div className="space-y-6">
          <Card className="p-4 sm:p-5 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#012041]">
                  Templates de Documentos da Escola: {currentSchool.nome}
                </h2>
                <p className="text-xs text-slate-500">
                  Personalize o cabeçalho oficial, texto introdutório, placeholders dinâmicos, carimbos e assinaturas dos responsáveis
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Homologado para {currentSchool.nome}
                </span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schoolTemplates.map((tmpl) => (
              <Card key={tmpl.id} className="p-5 border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#015FC4] uppercase tracking-wide">
                      {tmpl.codigoPrefixo}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Actualizado a {tmpl.ultimaActualizacao}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#012041] mb-2">
                    {tmpl.nomeTemplate}
                  </h3>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs font-serif text-slate-700 italic line-clamp-3 mb-4">
                    "{tmpl.textoCorpo}"
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-2">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400">Director:</span>
                      <span className="font-medium text-slate-800">{tmpl.nomeDirector}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400">Secretário:</span>
                      <span className="font-medium text-slate-800">{tmpl.nomeSecretario}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {tmpl.mostrarSeloBranco && <span>Selo Branco</span>}
                    {tmpl.mostrarSeloBranco && tmpl.mostrarQrCodeVerificacao && <span>·</span>}
                    {tmpl.mostrarQrCodeVerificacao && <span>QR Code</span>}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Sliders className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setSelectedTemplateToEdit(tmpl);
                      setIsTemplateEditorOpen(true);
                    }}
                  >
                    Personalizar Modelo
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 3: RELATÓRIOS DE GESTÃO & MÉTRICAS
         ======================================================== */}
      {mainTab === 'relatorios' && (
        <ReportsDataView
          currentSchool={currentSchool}
          students={students}
          notas={notas}
          payments={payments}
          sections={sections}
          attendanceRecords={attendanceRecords}
          leads={leads}
          campaigns={campaigns}
          teachers={teachers}
          onNotify={onNotify}
        />
      )}

      {/* ========================================================
          ABA 4: EXPORTAÇÃO AGENDADA DIÁRIA & STORAGE SEGURO
         ======================================================== */}
      {mainTab === 'exportacao' && (
        <ScheduledDataExportView
          currentSchool={currentSchool}
          students={students}
          notas={notas}
          sections={sections}
          attendanceRecords={attendanceRecords}
          userRole="school_admin"
          onNotify={onNotify}
        />
      )}

      {/* ========================================================
          MODAL DE NOVA EMISSÃO
         ======================================================== */}
      <Modal
        isOpen={isNewEmissionOpen}
        onClose={() => setIsNewEmissionOpen(false)}
        title="Emitir Novo Documento Oficial"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Tipo de Documento
            </label>
            <select
              value={newEmissionType}
              onChange={(e) => setNewEmissionType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#015FC4]"
            >
              {DOCUMENT_TYPES_CATALOG.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} ({m.categoria})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Seleccionar Aluno Real
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#015FC4]"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.nomeCompleto} · Processo {st.processo} ({st.documentoIdentificacao})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Turma Atribuída
              </label>
              <select
                value={selectedTurmaId}
                onChange={(e) => setSelectedTurmaId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ano Lectivo
              </label>
              <input
                type="text"
                disabled
                value={currentSchool.anoLectivoActivo}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Finalidade da Emissão
            </label>
            <input
              type="text"
              value={emissionFinalidade}
              onChange={(e) => setEmissionFinalidade(e.target.value)}
              placeholder="Ex: Abertura de conta bancária no Banco BAI, INSS, Visto, etc."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#015FC4]"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900">
            <strong>Garantia de Autenticidade:</strong> O documento será gerado com código único e registado no livro de arquivo institucional para verificação digital.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNewEmissionOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={handleConfirmEmission}
            >
              Gerar e Visualizar Documento
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================
          MODAIS DE VISUALIZAÇÃO E EDITOR DE TEMPLATES
         ======================================================== */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={selectedPreviewDoc}
        template={activeTemplateForDoc}
        currentSchool={currentSchool}
        student={selectedStudentObj}
        turma={selectedTurmaObj}
        notas={notas}
        payments={payments}
        allStudentsInTurma={students}
      />

      <DocumentTemplateEditorModal
        isOpen={isTemplateEditorOpen}
        onClose={() => setIsTemplateEditorOpen(false)}
        template={selectedTemplateToEdit}
        onSaveTemplate={handleSaveTemplate}
        schoolName={currentSchool.nome}
      />
    </div>
  );
};
