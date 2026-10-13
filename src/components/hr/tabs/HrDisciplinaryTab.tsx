import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Plus,
  AlertTriangle,
  FileText,
  UserCheck,
  CheckCircle2,
  Scale,
  Printer,
  Download,
  Eye,
  Search,
  Building2,
  X,
} from 'lucide-react';
import { DisciplinaryCase, Employee } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv, downloadFile, defaultSchoolHeader } from '../../../utils/hrDocumentGenerator';

interface HrDisciplinaryTabProps {
  disciplinaryCases: DisciplinaryCase[];
  employees: Employee[];
  onAddCase: (data: Omit<DisciplinaryCase, 'id' | 'numeroProcesso' | 'dataAbertura'>) => void;
  onUpdateCase: (updatedCase: DisciplinaryCase) => void;
  schoolName?: string;
}

export const HrDisciplinaryTab: React.FC<HrDisciplinaryTabProps> = ({
  disciplinaryCases,
  employees,
  onAddCase,
  onUpdateCase,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterGravidade, setFilterGravidade] = useState('todos');

  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [gravidade, setGravidade] = useState<DisciplinaryCase['gravidade']>('Leve');
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [instrutor, setInstrutor] = useState('Dr. António Bento (Instrutor Nomeado)');
  const [dataOcorrencia, setDataOcorrencia] = useState(new Date().toISOString().split('T')[0]);

  // Visualizar / Editar Processo
  const [viewingCase, setViewingCase] = useState<DisciplinaryCase | null>(null);

  // Modal: Nota de Culpa Oficial
  const [viewingNotaCulpa, setViewingNotaCulpa] = useState<DisciplinaryCase | null>(null);

  const filtered = disciplinaryCases.filter((cs) => {
    const matchSearch =
      cs.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.motivoInfracao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'todos' || cs.estado === filterEstado;
    const matchGravidade = filterGravidade === 'todos' || cs.gravidade === filterGravidade;
    return matchSearch && matchEstado && matchGravidade;
  });

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    onAddCase({
      escolaId: 'esc-001',
      colaboradorId: selectedEmpId,
      colaboradorNome: emp.nomeCompleto,
      departamentoNome: emp.departamentoNome,
      cargoNome: emp.cargoNome,
      dataOcorrencia,
      gravidade,
      motivoInfracao: motivo,
      descricaoDetalhada: descricao,
      instrutorProcesso: instrutor,
      estado: 'instrucao',
      confidencial: true,
    });

    setIsNewCaseOpen(false);
    setMotivo('');
    setDescricao('');
  };

  const handleFinalizeCase = (decisao: DisciplinaryCase['decisaoFinal']) => {
    if (!viewingCase) return;
    const updated: DisciplinaryCase = {
      ...viewingCase,
      estado: 'concluido',
      decisaoFinal: decisao,
      dataDecisao: new Date().toISOString().split('T')[0],
      responsavelDecisao: 'Dr. Paulo Sebastião Afonso (Director Geral)',
    };
    onUpdateCase(updated);
    setViewingCase(null);
  };

  const handleExportCsv = () => {
    const headers = [
      'Numero_Processo',
      'Colaborador',
      'Cargo',
      'Departamento',
      'Data_Ocorrencia',
      'Gravidade',
      'Infracao',
      'Instrutor',
      'Estado',
      'Decisao_Final',
    ];
    const rows = filtered.map((c) => [
      c.numeroProcesso,
      c.colaboradorNome,
      c.cargoNome,
      c.departamentoNome,
      c.dataOcorrencia,
      c.gravidade,
      c.motivoInfracao,
      c.instrutorProcesso,
      c.estado,
      c.decisaoFinal || 'Em instrucao',
    ]);
    exportToCsv(`processos_disciplinares_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleDownloadNotaCulpa = (cs: DisciplinaryCase) => {
    const text = `================================================================================
REPÚBLICA DE ANGOLA · MINISTÉRIO DA EDUCAÇÃO
${schoolName.toUpperCase()}
COMISSÃO DE INQUÉRITO E DISCIPLINA
================================================================================

                    NOTA DE CULPA E TERMO DE NOTIFICAÇÃO
                    PROCESSO DISCIPLINAR Nº: ${cs.numeroProcesso}

VISADO(A):
  Colaborador(a): ${cs.colaboradorNome}
  Categoria / Função: ${cs.cargoNome}
  Departamento: ${cs.departamentoNome}

INSTRUTOR NOMEADO:
  ${cs.instrutorProcesso}

ARTICULADO DA ACUSAÇÃO (TIPIFICAÇÃO DISCIPLINAR LGT):

1º FACTOS IMPUTADOS:
Na data de ${cs.dataOcorrencia}, verificou-se a ocorrência dos seguintes factos:
"${cs.motivoInfracao}".

2º DESCRITIVO E CIRCUNSTÂNCIAS:
${cs.descricaoDetalhada}

3º ENQUADRAMENTO JURÍDICO (LEI GERAL DO TRABALHO):
A conduta acima imputada consubstancia infracção disciplinar classificada como "${cs.gravidade.toUpperCase()}",
nos termos dos Artigos 46º a 54º da Lei Geral do Trabalho de Angola.

4º DIREITO À AUDIÊNCIA PRÉVIA E DEFESA (CONTRADITÓRIO):
Fica o(a) visado(a) formalmente notificado(a) de que dispõe do prazo regulamentar de 10 (dez) dias úteis
para deduzir a sua resposta à presente Nota de Culpa por escrito, podendo arrolar testemunhas
e juntar prova documental em sua defesa.

Luanda, aos ${cs.dataAbertura || new Date().toISOString().split('T')[0]}.

__________________________________________          __________________________________________
        O INSTRUTOR DO PROCESSO                                 TERMO DE RECEPÇÃO DO VISADO
      (${cs.instrutorProcesso})                               (Data: ____/____/________)
================================================================================`;

    downloadFile(text, `nota_culpa_${cs.numeroProcesso.replace(/[\/\\]/g, '_')}.txt`);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Alerta de Confidencialidade Máxima */}
      <div className="bg-rose-50/70 border-2 border-rose-200 rounded-xl p-4 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-lg shrink-0 mt-0.5">
            <Lock className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-rose-900 flex items-center gap-1.5">
              <span>Módulo Confidencial: Processos Disciplinares</span>
              <span className="text-[10px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded uppercase font-mono">
                Acesso Restrito
              </span>
            </h4>
            <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5 max-w-2xl">
              Em estrito cumprimento do regime disciplinar da Lei Geral do Trabalho de Angola (Artigos 46º a 54º), os dados de processos disciplinares, notas de culpa e sanções são confidenciais e acessíveis exclusivamente à Direcção Geral e Técnicos de RH nomeados como instrutores.
            </p>
          </div>
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
            className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
            size="sm"
            onClick={() => setIsNewCaseOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Instaurar Processo
          </Button>
        </div>
      </div>

      {/* Linha de Busca & Filtros */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar processo ou colaborador visado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg"
          />
        </div>

        <select
          value={filterGravidade}
          onChange={(e) => setFilterGravidade(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
        >
          <option value="todos">Todas as Gravidades</option>
          <option value="Leve">Infracção Leve</option>
          <option value="Grave">Infracção Grave</option>
          <option value="Muito Grave">Infracção Muito Grave</option>
        </select>

        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
        >
          <option value="todos">Todos os Estados</option>
          <option value="instrucao">Em Instrução</option>
          <option value="audiencia_previa">Audiência Prévia / Resposta</option>
          <option value="concluido">Decisão Aplicada / Concluído</option>
        </select>
      </div>

      {/* Tabela de Processos Disciplinares */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Nº Processo</th>
              <th className="py-3 px-4">Colaborador / Cargo</th>
              <th className="py-3 px-4">Ocorrência</th>
              <th className="py-3 px-4">Gravidade (LGT)</th>
              <th className="py-3 px-4">Instrutor Nomeado</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Operações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((cs) => (
              <tr key={cs.id} className="hover:bg-rose-50/20">
                <td className="py-3 px-4 font-mono font-bold text-gray-900">{cs.numeroProcesso}</td>

                <td className="py-3 px-4">
                  <strong className="text-gray-900 block font-semibold">{cs.colaboradorNome}</strong>
                  <span className="text-[10px] text-gray-400 block">{cs.cargoNome} · {cs.departamentoNome}</span>
                </td>

                <td className="py-3 px-4 max-w-xs">
                  <span className="font-semibold text-gray-800 block truncate">{cs.motivoInfracao}</span>
                  <span className="text-[10px] text-gray-400 block font-mono">{cs.dataOcorrencia}</span>
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      cs.gravidade === 'Leve'
                        ? 'bg-amber-100 text-amber-800'
                        : cs.gravidade === 'Grave'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {cs.gravidade}
                  </span>
                </td>

                <td className="py-3 px-4 text-gray-700">{cs.instrutorProcesso}</td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      cs.estado === 'concluido'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cs.estado === 'audiencia_previa'
                        ? 'bg-blue-100 text-[#015FC4]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cs.estado.replace('_', ' ')}
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setViewingNotaCulpa(cs)}
                      className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[10px] transition-colors flex items-center gap-1"
                      title="Visualizar Nota de Culpa Oficial"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Nota de Culpa</span>
                    </button>

                    <button
                      onClick={() => setViewingCase(cs)}
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[10px] transition-colors"
                    >
                      Autos
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Visualizar Nota de Culpa Oficial (LGT) */}
      {viewingNotaCulpa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2 no-print">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">
                  Nota de Culpa e Termo de Notificação
                </strong>
                <span className="text-[11px] text-gray-500">
                  {viewingNotaCulpa.numeroProcesso} · {viewingNotaCulpa.colaboradorNome}
                </span>
              </div>
              <button onClick={() => setViewingNotaCulpa(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            {/* Documento Imprimível (#hr-printable-area) */}
            <div id="hr-printable-area" className="p-5 bg-rose-50/30 border border-rose-200 rounded-xl space-y-3 text-xs leading-relaxed">
              <div className="text-center border-b border-rose-200 pb-2">
                <h4 className="font-bold text-[#012041] text-sm uppercase">{schoolName}</h4>
                <p className="text-[10px] text-gray-500">COMISSÃO DE DISCIPLINA E RECURSOS HUMANOS</p>
                <strong className="text-xs text-rose-800 block mt-1 uppercase">
                  NOTA DE CULPA Nº {viewingNotaCulpa.numeroProcesso}
                </strong>
              </div>

              <div className="p-3 bg-white rounded-lg border border-rose-100 space-y-1 text-[11px]">
                <div><strong>Trabalhador Visado:</strong> {viewingNotaCulpa.colaboradorNome}</div>
                <div><strong>Função / Cargo:</strong> {viewingNotaCulpa.cargoNome} ({viewingNotaCulpa.departamentoNome})</div>
                <div><strong>Instrutor do Processo:</strong> {viewingNotaCulpa.instrutorProcesso}</div>
                <div><strong>Classificação da Gravidade:</strong> {viewingNotaCulpa.gravidade}</div>
              </div>

              <div className="space-y-1.5 text-[11px] text-gray-800">
                <strong className="block text-gray-900">Articulado da Acusação:</strong>
                <p>
                  Imputam-se ao trabalhador visado os factos ocorridos em {viewingNotaCulpa.dataOcorrencia}:
                </p>
                <blockquote className="p-2.5 bg-rose-50 border-l-2 border-rose-400 text-rose-950 font-medium">
                  {viewingNotaCulpa.motivoInfracao}
                </blockquote>
                <p className="text-[10px] text-gray-600">
                  {viewingNotaCulpa.descricaoDetalhada}
                </p>
              </div>

              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-[10px] text-blue-900 space-y-1">
                <strong>Prazo de Resposta (Art. 50º LGT):</strong>
                <p>
                  O trabalhador dispõe de 10 dias úteis para deduzir defesa escrita e juntar provas perante o Instrutor Nomeado.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-[10px]">
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>O Instrutor do Processo</strong>
                    <span className="block text-gray-500">{viewingNotaCulpa.instrutorProcesso}</span>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>O(A) Colaborador(a) Visado(a)</strong>
                    <span className="block text-gray-500">Notificado em ___/___/______</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 no-print">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadNotaCulpa(viewingNotaCulpa)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Descarregar (.txt)
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.print()}
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Imprimir Nota de Culpa
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setViewingNotaCulpa(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Visualizar Autos / Aplicar Medida Disciplinar */}
      {viewingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4 border border-gray-200">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">
                  Autos do Processo {viewingCase.numeroProcesso}
                </strong>
                <span className="text-[11px] text-gray-500">
                  {viewingCase.colaboradorNome} ({viewingCase.cargoNome})
                </span>
              </div>
              <button onClick={() => setViewingCase(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <span className="text-gray-500 text-[11px]">Factos Infraccionais:</span>
                <p className="text-gray-900 font-semibold">{viewingCase.motivoInfracao}</p>
                <p className="text-gray-600 text-[11px] leading-relaxed">{viewingCase.descricaoDetalhada}</p>
              </div>

              {viewingCase.defesaApresentada && (
                <div className="p-3 bg-blue-50/50 rounded-lg space-y-1">
                  <span className="text-blue-800 font-semibold text-[11px]">Audiência Prévia & Defesa do Colaborador:</span>
                  <p className="text-gray-700 text-[11px]">{viewingCase.defesaApresentada}</p>
                </div>
              )}

              {viewingCase.decisaoFinal ? (
                <div className="p-3 bg-emerald-50 rounded-lg space-y-1">
                  <span className="text-emerald-800 font-semibold text-[11px]">Decisão Final Aplicada:</span>
                  <p className="text-emerald-900 font-bold text-sm">{viewingCase.decisaoFinal}</p>
                  <p className="text-gray-500 text-[10px]">
                    Despacho em {viewingCase.dataDecisao} por {viewingCase.responsavelDecisao}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-800 block text-[11px]">Aplicar Decisão / Medida Disciplinar (LGT):</span>
                  <div className="flex flex-wrap gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => handleFinalizeCase('Arquivamento')}>
                      Arquivar Autos
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleFinalizeCase('Admoestação Verbal')}>
                      Admoestação Verbal
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleFinalizeCase('Censura Registada')}>
                      Censura Registada
                    </Button>
                    <Button
                      variant="secondary"
                      className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
                      size="sm"
                      onClick={() => handleFinalizeCase('Desconto Salarial')}
                    >
                      Desconto Salarial
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => setViewingCase(null)}>
                Fechar Autos
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Abertura de Inquérito */}
      {isNewCaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Instaurar Inquérito Disciplinar (LGT Angola)</h4>
            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Colaborador Visado *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nomeCompleto} ({e.cargoNome})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Gravidade da Infracção</label>
                  <select
                    value={gravidade}
                    onChange={(e) => setGravidade(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="Leve">Infracção Leve</option>
                    <option value="Grave">Infracção Grave</option>
                    <option value="Muito Grave">Infracção Muito Grave</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data da Ocorrência</label>
                  <input
                    type="date"
                    required
                    value={dataOcorrencia}
                    onChange={(e) => setDataOcorrencia(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Motivo / Tipificação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Falta ao conselho de notas sem comunicação prévia"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Descrição Detalhada dos Factos</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Factos observados, testemunhas e consequências operacionais..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Instrutor Nomeado</label>
                <input
                  type="text"
                  value={instrutor}
                  onChange={(e) => setInstrutor(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsNewCaseOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="secondary"
                  className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
                  size="sm"
                  type="submit"
                >
                  Instaurar Autos
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
