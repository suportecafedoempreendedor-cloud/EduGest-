import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Download,
  Calendar,
  Search,
  Printer,
  Eye,
  FileCheck,
  Building2,
  X,
} from 'lucide-react';
import { EmployeeDocument, Employee } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import {
  exportToCsv,
  downloadFile,
  generateDeclarationText,
  defaultSchoolHeader,
} from '../../../utils/hrDocumentGenerator';

interface HrDocumentsTabProps {
  documents: EmployeeDocument[];
  employees: Employee[];
  onUploadDocument: (doc: Omit<EmployeeDocument, 'id' | 'dataUpload'>) => void;
  schoolName?: string;
}

export const HrDocumentsTab: React.FC<HrDocumentsTabProps> = ({
  documents,
  employees,
  onUploadDocument,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form de Upload
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<EmployeeDocument['tipo']>('BI');
  const [dataEmissao, setDataEmissao] = useState('2024-01-15');
  const [dataValidade, setDataValidade] = useState('2034-01-15');
  const [confidencial, setConfidencial] = useState(true);

  // Modal: Visualizar Documento
  const [viewingDoc, setViewingDoc] = useState<EmployeeDocument | null>(null);

  // Modal: Gerador de Declarações Institucionais (Efectividade, Vencimento, Certificado)
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [declEmpId, setDeclEmpId] = useState(employees[0]?.id || '');
  const [declTipo, setDeclTipo] = useState<'efectividade' | 'vencimento' | 'certificado_trabalho'>('efectividade');
  const [declFinalidade, setDeclFinalidade] = useState('Abertura de Conta Bancária / Concessão de Crédito');
  const [declIncluirSalario, setDeclIncluirSalario] = useState(true);
  const [generatedDeclaration, setGeneratedDeclaration] = useState<string | null>(null);

  const filtered = documents.filter((d) => {
    const matchSearch =
      d.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'todos' || d.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp || !titulo) return;

    onUploadDocument({
      escolaId: 'esc-001',
      colaboradorId: selectedEmpId,
      colaboradorNome: emp.nomeCompleto,
      titulo,
      tipo,
      dataEmissao,
      dataValidade,
      estado: 'valido',
      tamanho: '1.2 MB (Ficheiro Digital)',
      confidencial,
    });

    setIsUploadModalOpen(false);
    setTitulo('');
  };

  const handleDownloadDoc = (doc: EmployeeDocument) => {
    const textContent = `================================================================================
REPÚBLICA DE ANGOLA · MINISTÉRIO DA EDUCAÇÃO
${schoolName.toUpperCase()}
ARQUIVO DIGITAL SEGURO DE DOCUMENTOS DE RECURSOS HUMANOS
================================================================================

DOCUMENTO ARQUIVADO: ${doc.titulo}
TIPO: ${doc.tipo}
COLABORADOR TITULAR: ${doc.colaboradorNome}
DATA DE EMISSÃO: ${doc.dataEmissao || 'N/A'}
DATA DE VALIDADE: ${doc.dataValidade || 'Sem prazo de caducidade'}
ESTADO DE CONFORMIDADE: ${doc.estado.toUpperCase()}
CARIMBO DE AUDITORIA: Registado em ${doc.dataUpload}
CLASSIFICAÇÃO: ${doc.confidencial ? 'CONFIDENCIAL (Acesso Restrito ao RH)' : 'PÚBLICO INSTITUCIONAL'}

Este registo digital é cópia autenticada e indexada no processo individual do colaborador
no sistema integrado de gestão escolar EduGest Angola.
================================================================================`;

    downloadFile(textContent, `${doc.titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`);
  };

  const handleGenerateDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === declEmpId);
    if (!emp) return;

    const text = generateDeclarationText({
      school: {
        ...defaultSchoolHeader,
        schoolName,
      },
      colaboradorNome: emp.nomeCompleto,
      biNumero: emp.numeroDocumento || '001234567LA042',
      cargo: emp.cargoNome,
      departamento: emp.departamentoNome,
      dataAdmissao: emp.dataAdmissao,
      vinculo: emp.tipoVinculo.replace('_', ' '),
      finalidade: declFinalidade,
      incluirSalario: declTipo === 'vencimento' || declIncluirSalario,
      salarioBaseKz: emp.salarioBaseKz,
    });

    setGeneratedDeclaration(text);
  };

  const handleExportCsv = () => {
    const headers = [
      'Titulo',
      'Colaborador',
      'Tipo',
      'Data_Upload',
      'Data_Validade',
      'Estado',
      'Confidencial',
    ];
    const rows = filtered.map((d) => [
      d.titulo,
      d.colaboradorNome,
      d.tipo,
      d.dataUpload,
      d.dataValidade || 'Sem validade',
      d.estado,
      d.confidencial ? 'Sim' : 'Nao',
    ]);
    exportToCsv(`documentos_rh_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#015FC4]" />
            <span>Repositório Documental dos Colaboradores & Emissão de Declarações</span>
          </h3>
          <p className="text-gray-500 text-[11px] mt-0.5">
            Arquivo digital seguro de BIs, certificados de habilitações, atestados médicos e gerador de declarações de serviço.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Exportar CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setGeneratedDeclaration(null);
              setIsDeclarationModalOpen(true);
            }}
            icon={<FileCheck className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Emitir Declaração
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Anexar Documento
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar documento ou colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg"
          />
        </div>

        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
        >
          <option value="todos">Todos os Tipos de Documento</option>
          <option value="BI">Bilhete de Identidade (BI)</option>
          <option value="Contrato Assinado">Contrato Assinado</option>
          <option value="Certificado Habilitações">Certificado de Habilitações</option>
          <option value="Atestado Médico">Atestado Médico</option>
          <option value="Registo Criminal">Registo Criminal</option>
        </select>
      </div>

      {/* Tabela de Documentos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Documento / Título</th>
              <th className="py-3 px-4">Colaborador Titular</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4 font-mono">Data Validade</th>
              <th className="py-3 px-4">Tamanho</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Operações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-blue-50/20">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <strong className="text-gray-900 block font-semibold">{doc.titulo}</strong>
                      <span className="text-[10px] text-gray-400">Anexado em {doc.dataUpload}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 font-semibold text-gray-800">{doc.colaboradorNome}</td>

                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                    {doc.tipo}
                  </span>
                </td>

                <td className="py-3 px-4 font-mono">
                  {doc.dataValidade ? (
                    <span
                      className={
                        doc.estado === 'caducado'
                          ? 'text-rose-700 font-bold flex items-center gap-1'
                          : doc.estado === 'a_expirar'
                          ? 'text-amber-700 font-bold flex items-center gap-1'
                          : 'text-gray-800'
                      }
                    >
                      {doc.estado === 'caducado' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                      {doc.dataValidade}
                    </span>
                  ) : (
                    <span className="text-gray-400">Sem validade</span>
                  )}
                </td>

                <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{doc.tamanho}</td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      doc.estado === 'valido'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.estado === 'a_expirar'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {doc.estado}
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#015FC4]/10 hover:bg-[#015FC4] text-[#015FC4] hover:text-white font-semibold text-[10px] transition-colors"
                      title="Visualizar Detalhes do Documento"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver</span>
                    </button>

                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[10px] transition-colors"
                      title="Descarregar Ficheiro Seguro"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Visualizar Detalhes do Documento */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">{viewingDoc.titulo}</strong>
                <span className="text-[11px] text-gray-500">
                  {viewingDoc.colaboradorNome} · {viewingDoc.tipo}
                </span>
              </div>
              <button onClick={() => setViewingDoc(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo de Documento:</span>
                <strong className="text-gray-900">{viewingDoc.tipo}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data de Emissão:</span>
                <span className="font-mono text-gray-800">{viewingDoc.dataEmissao || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data de Validade:</span>
                <span className="font-mono text-gray-800">{viewingDoc.dataValidade || 'Sem caducidade'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data de Upload:</span>
                <span className="font-mono text-gray-800">{viewingDoc.dataUpload}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Classificação:</span>
                <span className="font-bold text-rose-700">
                  {viewingDoc.confidencial ? 'Confidencial (Acesso Restrito)' : 'Geral'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadDoc(viewingDoc)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Descarregar Ficheiro
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewingDoc(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gerador de Declarações Institucionais */}
      {isDeclarationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2 no-print">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">
                  Emissão Oficial de Declarações & Certificados de Trabalho
                </strong>
                <span className="text-[11px] text-gray-500">
                  Documentos institucionais com chancela oficial do {schoolName}
                </span>
              </div>
              <button onClick={() => setIsDeclarationModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            {!generatedDeclaration ? (
              <form onSubmit={handleGenerateDeclaration} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Colaborador Titular *</label>
                  <select
                    value={declEmpId}
                    onChange={(e) => setDeclEmpId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nomeCompleto} ({e.cargoNome} - {e.departamentoNome})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Tipo de Declaração</label>
                    <select
                      value={declTipo}
                      onChange={(e) => setDeclTipo(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                    >
                      <option value="efectividade">Declaração de Efectividade / Serviço</option>
                      <option value="vencimento">Declaração com Menção de Vencimento</option>
                      <option value="certificado_trabalho">Certificado de Tempo de Serviço</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Finalidade da Declaração</label>
                    <input
                      type="text"
                      required
                      value={declFinalidade}
                      onChange={(e) => setDeclFinalidade(e.target.value)}
                      placeholder="Ex: Abertura de Conta Bancária / Concessão de Visto"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                {declTipo !== 'vencimento' && (
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={declIncluirSalario}
                      onChange={(e) => setDeclIncluirSalario(e.target.checked)}
                      className="rounded text-[#015FC4]"
                    />
                    <span className="text-gray-700 font-semibold">
                      Discriminar montante da remuneração base mensal auferida
                    </span>
                  </label>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setIsDeclarationModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Gerar e Pré-visualizar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Visualização da Declaração (#hr-printable-area) */}
                <div id="hr-printable-area" className="p-5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-gray-900">
                  {generatedDeclaration}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100 no-print">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setGeneratedDeclaration(null)}
                  >
                    Voltar / Editar
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        downloadFile(
                          generatedDeclaration,
                          `declaracao_${new Date().toISOString().slice(0, 10)}.txt`
                        )
                      }
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      Descarregar (.txt)
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.print()}
                      icon={<Printer className="w-3.5 h-3.5" />}
                    >
                      Imprimir Declaração
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Upload de Documento */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Carregar Documento no Processo Individual</h4>
            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Colaborador *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nomeCompleto} ({e.cargoNome})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cópia Autenticada do BI"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tipo de Documento</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                  >
                    <option value="BI">Bilhete de Identidade (BI)</option>
                    <option value="Contrato Assinado">Contrato de Trabalho</option>
                    <option value="Certificado Habilitações">Certificado de Habilitações</option>
                    <option value="Atestado Médico">Atestado Médico</option>
                    <option value="Registo Criminal">Registo Criminal</option>
                    <option value="Curriculum">Curriculum Vitae (CV)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data de Validade</label>
                  <input
                    type="date"
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="conf"
                  checked={confidencial}
                  onChange={(e) => setConfidencial(e.target.checked)}
                  className="rounded text-[#015FC4]"
                />
                <label htmlFor="conf" className="text-gray-700 font-semibold cursor-pointer">
                  Documento Confidencial (Acesso restrito ao RH e Direcção)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsUploadModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Gravar Ficheiro
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
