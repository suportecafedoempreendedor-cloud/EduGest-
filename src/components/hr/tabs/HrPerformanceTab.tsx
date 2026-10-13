import React, { useState } from 'react';
import {
  Award,
  Star,
  Plus,
  CheckCircle2,
  TrendingUp,
  FileText,
  UserCheck,
  Printer,
  Download,
  Eye,
  Search,
  Building2,
  X,
} from 'lucide-react';
import { PerformanceReview, Employee } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv, downloadFile, defaultSchoolHeader } from '../../../utils/hrDocumentGenerator';

interface HrPerformanceTabProps {
  performanceReviews: PerformanceReview[];
  employees: Employee[];
  onAddReview: (review: Omit<PerformanceReview, 'id'>) => void;
  schoolName?: string;
}

export const HrPerformanceTab: React.FC<HrPerformanceTabProps> = ({
  performanceReviews,
  employees,
  onAddReview,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassificacao, setFilterClassificacao] = useState('todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [cicloNome, setCicloNome] = useState('Ano Lectivo 2025/2026 - 1º Trimestre');
  const [notaTecnica, setNotaTecnica] = useState(9.0);
  const [notaAssiduidade, setNotaAssiduidade] = useState(9.5);
  const [notaEquipa, setNotaEquipa] = useState(9.0);
  const [notaIniciativa, setNotaIniciativa] = useState(8.5);
  const [notaObjectivos, setNotaObjectivos] = useState(9.0);
  const [comentarios, setComentarios] = useState('');
  const [planoMelhoria, setPlanoMelhoria] = useState('');

  // Visualizar Ficha de Avaliação Completa
  const [viewingReview, setViewingReview] = useState<PerformanceReview | null>(null);

  const filtered = performanceReviews.filter((rev) => {
    const matchSearch =
      rev.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.cargoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.ciclo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass =
      filterClassificacao === 'todos' || rev.classificacao.toLowerCase() === filterClassificacao.toLowerCase();
    return matchSearch && matchClass;
  });

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    const media = Number(
      ((notaTecnica + notaAssiduidade + notaEquipa + notaIniciativa + notaObjectivos) / 5).toFixed(1)
    );

    let classificacao: PerformanceReview['classificacao'] = 'Bom';
    if (media >= 9.0) classificacao = 'Excelente';
    else if (media >= 7.0) classificacao = 'Bom';
    else if (media >= 5.0) classificacao = 'Satisfatório';
    else classificacao = 'Insuficiente';

    onAddReview({
      escolaId: 'esc-001',
      ciclo: cicloNome,
      ano: '2026',
      colaboradorId: selectedEmpId,
      colaboradorNome: emp.nomeCompleto,
      departamentoNome: emp.departamentoNome,
      cargoNome: emp.cargoNome,
      avaliadorId: 'emp-004',
      avaliadorNome: 'Prof.ª Teresa Samakaka (Coordenação)',
      dataAvaliacao: new Date().toISOString().split('T')[0],
      pontuacaoCompetenciaTecnica: notaTecnica,
      pontuacaoAssiduidadePontualidade: notaAssiduidade,
      pontuacaoTrabalhoEquipa: notaEquipa,
      pontuacaoIniciativaCriatividade: notaIniciativa,
      pontuacaoCumprimentoObjectivos: notaObjectivos,
      mediaFinal: media,
      classificacao,
      comentariosAvaliador: comentarios || 'Desempenho avaliado positivamente com base em evidências.',
      planoMelhoria: planoMelhoria || 'Continuidade nas acções pedagógicas de mérito e formação.',
      estado: 'homologada',
    });

    setIsModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'Colaborador',
      'Cargo',
      'Departamento',
      'Ciclo',
      'Competencia_Tecnica',
      'Assiduidade',
      'Trabalho_Equipa',
      'Iniciativa',
      'Objectivos',
      'Media_Final',
      'Classificacao',
      'Avaliador',
      'Data',
    ];
    const rows = filtered.map((r) => [
      r.colaboradorNome,
      r.cargoNome,
      r.departamentoNome,
      r.ciclo,
      r.pontuacaoCompetenciaTecnica,
      r.pontuacaoAssiduidadePontualidade,
      r.pontuacaoTrabalhoEquipa,
      r.pontuacaoIniciativaCriatividade,
      r.pontuacaoCumprimentoObjectivos,
      r.mediaFinal,
      r.classificacao,
      r.avaliadorNome,
      r.dataAvaliacao,
    ]);
    exportToCsv(`avaliacoes_desempenho_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleDownloadReviewText = (rev: PerformanceReview) => {
    const text = `================================================================================
REPÚBLICA DE ANGOLA · MINISTÉRIO DA EDUCAÇÃO
${schoolName.toUpperCase()}
COMISSÃO DE AVALIAÇÃO DE DESEMPENHO DOCENTE E ADMINISTRATIVO
================================================================================

                    FICHA OFICIAL DE AVALIAÇÃO DE DESEMPENHO
                    CICLO: ${rev.ciclo.toUpperCase()}

DADOS DO AVALIADO:
  Nome: ${rev.colaboradorNome}
  Cargo / Função: ${rev.cargoNome}
  Departamento: ${rev.departamentoNome}

DADOS DO AVALIADOR:
  Nome do Avaliador: ${rev.avaliadorNome}
  Data da Homologação: ${rev.dataAvaliacao}

PONTUAÇÕES OBTIDAS (ESCALA DE 0 A 10):
  1. Competência Técnica / Prática Pedagógica:   ${rev.pontuacaoCompetenciaTecnica.toFixed(1)} / 10
  2. Assiduidade e Pontualidade:                 ${rev.pontuacaoAssiduidadePontualidade.toFixed(1)} / 10
  3. Trabalho em Equipa e Relacionamento:        ${rev.pontuacaoTrabalhoEquipa.toFixed(1)} / 10
  4. Iniciativa, Inovação e Criatividade:        ${rev.pontuacaoIniciativaCriatividade.toFixed(1)} / 10
  5. Cumprimento do Plano Curricular / Metas:    ${rev.pontuacaoCumprimentoObjectivos.toFixed(1)} / 10

RESULTADO FINAL CONSOLIDADO:
  MÉDIA FINAL PONDERADA: ${rev.mediaFinal.toFixed(1)} VALORES
  CLASSIFICAÇÃO QUALITATIVA: ${rev.classificacao.toUpperCase()}

PARECER QUALITATIVO E FEEDBACK DO AVALIADOR:
  ${rev.comentariosAvaliador}

PLANO DE DESENVOLVIMENTO INDIVIDUAL (PDI):
  ${rev.planoMelhoria || 'Manter o elevado padrão de efectividade pedagógica.'}

Luanda, aos ${rev.dataAvaliacao}.

__________________________________________          __________________________________________
              O AVALIADOR                                       O COLABORADOR AVALIADO
       (${rev.avaliadorNome})                                 (${rev.colaboradorNome})
================================================================================`;

    downloadFile(text, `avaliacao_${rev.colaboradorNome.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-[#015FC4]" />
              <span>Sistema de Avaliação de Desempenho & Mérito Profissional</span>
            </h3>
            <p className="text-gray-500 text-[11px] mt-0.5">
              Critérios pedagógicos e operacionais, feedback fundamentado e planos de desenvolvimento contínuo.
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
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Nova Avaliação
            </Button>
          </div>
        </div>

        {/* Linha de Busca & Filtro */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por colaborador, cargo ou ciclo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
          </div>

          <select
            value={filterClassificacao}
            onChange={(e) => setFilterClassificacao(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
          >
            <option value="todos">Todas as Classificações</option>
            <option value="Excelente">Excelente (&gt;= 9.0)</option>
            <option value="Bom">Bom (7.0 - 8.9)</option>
            <option value="Satisfatório">Satisfatório (5.0 - 6.9)</option>
            <option value="Insuficiente">Insuficiente (&lt; 5.0)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rev) => (
          <div key={rev.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-gray-400 font-mono">{rev.ciclo}</span>
                <h4 className="font-bold text-gray-900 text-sm mt-0.5">{rev.colaboradorNome}</h4>
                <span className="text-[11px] text-gray-500">{rev.cargoNome} · {rev.departamentoNome}</span>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    rev.classificacao === 'Excelente'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rev.classificacao === 'Bom'
                      ? 'bg-blue-100 text-[#015FC4]'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {rev.classificacao}
                </span>
                <strong className="block font-mono text-lg font-bold text-gray-900 mt-0.5">
                  {rev.mediaFinal} <span className="text-xs text-gray-400">/ 10</span>
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center pt-2 border-t border-gray-100">
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="text-[9px] text-gray-400 block truncate">Técnica</span>
                <strong className="text-gray-800 font-mono text-xs">{rev.pontuacaoCompetenciaTecnica}</strong>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="text-[9px] text-gray-400 block truncate">Pontualidade</span>
                <strong className="text-gray-800 font-mono text-xs">{rev.pontuacaoAssiduidadePontualidade}</strong>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="text-[9px] text-gray-400 block truncate">Equipa</span>
                <strong className="text-gray-800 font-mono text-xs">{rev.pontuacaoTrabalhoEquipa}</strong>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="text-[9px] text-gray-400 block truncate">Iniciativa</span>
                <strong className="text-gray-800 font-mono text-xs">{rev.pontuacaoIniciativaCriatividade}</strong>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="text-[9px] text-gray-400 block truncate">Objectivos</span>
                <strong className="text-gray-800 font-mono text-xs">{rev.pontuacaoCumprimentoObjectivos}</strong>
              </div>
            </div>

            <p className="text-gray-600 text-[11px] leading-snug bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
              {rev.comentariosAvaliador}
            </p>

            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
              <span>Avaliador: {rev.avaliadorNome}</span>
              <button
                onClick={() => setViewingReview(rev)}
                className="inline-flex items-center gap-1 text-[#015FC4] hover:underline font-bold text-[11px]"
              >
                <Eye className="w-3 h-3" />
                <span>Ver Ficha Completa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Visualizar Ficha de Avaliação Completa (#hr-printable-area) */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2 no-print">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">
                  Ficha Homologada de Avaliação de Desempenho
                </strong>
                <span className="text-[11px] text-gray-500">
                  {viewingReview.colaboradorNome} · {viewingReview.ciclo}
                </span>
              </div>
              <button onClick={() => setViewingReview(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            {/* Documento Imprimível (#hr-printable-area) */}
            <div id="hr-printable-area" className="p-5 bg-gray-50/50 border border-gray-200 rounded-xl space-y-3 text-xs">
              <div className="text-center border-b border-gray-200 pb-2">
                <h4 className="font-bold text-[#012041] text-sm uppercase">{schoolName}</h4>
                <p className="text-[10px] text-gray-500">COMISSÃO DE AVALIAÇÃO DE DESEMPENHO E MÉRITO</p>
                <strong className="text-xs text-[#015FC4] block mt-1 uppercase">
                  AVALIAÇÃO DE DESEMPENHO · {viewingReview.ciclo.toUpperCase()}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-gray-200 text-[11px]">
                <div>
                  <span className="text-gray-400 text-[10px] block">Colaborador:</span>
                  <strong className="text-gray-900 block">{viewingReview.colaboradorNome}</strong>
                  <span className="text-gray-600 block">{viewingReview.cargoNome} · {viewingReview.departamentoNome}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] block">Classificação Final:</span>
                  <strong className="text-base text-emerald-700 block font-bold font-mono">
                    {viewingReview.mediaFinal} / 10 ({viewingReview.classificacao})
                  </strong>
                </div>
              </div>

              {/* Critérios discriminados */}
              <div className="border border-gray-200 rounded-lg overflow-hidden text-[11px] bg-white">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-gray-700 font-bold">
                    <tr>
                      <th className="p-2">Eixo de Competência Avaliado</th>
                      <th className="p-2 text-right">Nota (0 a 10)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-2">1. Competência Técnica e Prática Pedagógica</td>
                      <td className="p-2 text-right font-mono font-bold">{viewingReview.pontuacaoCompetenciaTecnica}</td>
                    </tr>
                    <tr>
                      <td className="p-2">2. Assiduidade, Pontualidade e Cumprimento de Prazos</td>
                      <td className="p-2 text-right font-mono font-bold">{viewingReview.pontuacaoAssiduidadePontualidade}</td>
                    </tr>
                    <tr>
                      <td className="p-2">3. Trabalho em Equipa e Relações Interpessoais</td>
                      <td className="p-2 text-right font-mono font-bold">{viewingReview.pontuacaoTrabalhoEquipa}</td>
                    </tr>
                    <tr>
                      <td className="p-2">4. Iniciativa, Inovação e Criatividade</td>
                      <td className="p-2 text-right font-mono font-bold">{viewingReview.pontuacaoIniciativaCriatividade}</td>
                    </tr>
                    <tr>
                      <td className="p-2">5. Cumprimento do Plano Curricular e Objectivos</td>
                      <td className="p-2 text-right font-mono font-bold">{viewingReview.pontuacaoCumprimentoObjectivos}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1 text-[11px]">
                <strong className="text-gray-900 block">Feedback e Parecer do Avaliador:</strong>
                <p className="text-gray-700 leading-relaxed">{viewingReview.comentariosAvaliador}</p>
                {viewingReview.planoMelhoria && (
                  <div className="pt-2 border-t border-gray-100">
                    <strong className="text-[#015FC4] block">Plano de Desenvolvimento Individual (PDI):</strong>
                    <p className="text-gray-600">{viewingReview.planoMelhoria}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-[10px]">
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>O Avaliador</strong>
                    <span className="block text-gray-500">{viewingReview.avaliadorNome}</span>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>O Colaborador Avaliado</strong>
                    <span className="block text-gray-500">{viewingReview.colaboradorNome}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 no-print">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadReviewText(viewingReview)}
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
                  Imprimir Ficha
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setViewingReview(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Avaliação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h4 className="font-bold text-gray-900 text-sm">Preencher Ficha de Avaliação de Desempenho</h4>
            <form onSubmit={handleSaveReview} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Colaborador Avaliado *</label>
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

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Ciclo Avaliativo</label>
                <input
                  type="text"
                  value={cicloNome}
                  onChange={(e) => setCicloNome(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800 block text-xs">Pontuações de Critérios (0 a 10):</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 text-[11px]">Competência Técnica</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={notaTecnica}
                      onChange={(e) => setNotaTecnica(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-[11px]">Assiduidade & Pontualidade</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={notaAssiduidade}
                      onChange={(e) => setNotaAssiduidade(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-[11px]">Trabalho em Equipa</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={notaEquipa}
                      onChange={(e) => setNotaEquipa(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-[11px]">Iniciativa & Criatividade</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={notaIniciativa}
                      onChange={(e) => setNotaIniciativa(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Parecer & Comentários do Avaliador</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Justificativa da pontuação e desempenho observado..."
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Gravar Avaliação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
