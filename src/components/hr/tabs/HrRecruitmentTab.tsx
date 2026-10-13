import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Calendar,
  Sparkles,
  Printer,
  Download,
  Eye,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { JobVacancy, JobApplication, HrDepartment, HrJobPosition } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv, defaultSchoolHeader } from '../../../utils/hrDocumentGenerator';

interface HrRecruitmentTabProps {
  vacancies: JobVacancy[];
  applications: JobApplication[];
  departments: HrDepartment[];
  jobPositions: HrJobPosition[];
  onConvertApplication: (appId: string) => void;
  onAddVacancy: (vacancy: Omit<JobVacancy, 'id' | 'totalCandidaturas'>) => void;
  onUpdateApplication?: (app: JobApplication) => void;
  onAddApplication?: (app: Omit<JobApplication, 'id' | 'convertidoEmColaborador'>) => void;
  schoolName?: string;
}

export const HrRecruitmentTab: React.FC<HrRecruitmentTabProps> = ({
  vacancies,
  applications,
  departments,
  jobPositions,
  onConvertApplication,
  onAddVacancy,
  onUpdateApplication,
  onAddApplication,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [selectedVagaId, setSelectedVagaId] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewVagaOpen, setIsNewVagaOpen] = useState(false);
  const [isNewCandidateOpen, setIsNewCandidateOpen] = useState(false);

  // Visualizar Candidato
  const [viewingApp, setViewingApp] = useState<JobApplication | null>(null);

  // Formulário de Nova Vaga
  const [tituloVaga, setTituloVaga] = useState('');
  const [deptId, setDeptId] = useState(departments[0]?.id || '');
  const [cargoId, setCargoId] = useState(jobPositions[0]?.id || '');
  const [vagasQtd, setVagasQtd] = useState(1);
  const [descricao, setDescricao] = useState('');
  const [requisitos, setRequisitos] = useState('');
  const [dataFim, setDataFim] = useState('2026-11-30');

  // Formulário de Novo Candidato
  const [candNome, setCandNome] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candTel, setCandTel] = useState('');
  const [candHab, setCandHab] = useState('Licenciatura em Ensino / Pedagogia');
  const [candVagaId, setCandVagaId] = useState(vacancies[0]?.id || '');

  const filteredApps = applications.filter((app) => {
    const matchVaga = selectedVagaId === 'todos' || app.vagaId === selectedVagaId;
    const matchSearch =
      app.candidatoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.vagaTitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.habilitacoes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchVaga && matchSearch;
  });

  const handleSaveVacancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloVaga) return;
    const dept = departments.find((d) => d.id === deptId);
    const cargo = jobPositions.find((j) => j.id === cargoId);

    onAddVacancy({
      escolaId: 'esc-001',
      codigoVaga: `VAG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      titulo: tituloVaga,
      departamentoId: deptId,
      departamentoNome: dept?.nome || 'Geral',
      cargoId: cargoId,
      cargoNome: cargo?.titulo || 'Colaborador',
      tipoVinculo: 'tempo_indeterminado',
      vagasDisponiveis: Number(vagasQtd) || 1,
      descricaoFuncoes: descricao,
      requisitosObrigatorios: requisitos,
      dataAbertura: new Date().toISOString().split('T')[0],
      dataEncerramento: dataFim,
      estado: 'aberta',
    });

    setIsNewVagaOpen(false);
    setTituloVaga('');
    setDescricao('');
    setRequisitos('');
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candNome || !onAddApplication) return;
    const targetVaga = vacancies.find((v) => v.id === candVagaId) || vacancies[0];

    onAddApplication({
      escolaId: 'esc-001',
      vagaId: targetVaga?.id || 'vag-001',
      vagaTitulo: targetVaga?.titulo || 'Docente',
      candidatoNome: candNome,
      email: candEmail,
      telefone: candTel,
      biNumero: '000000000LA000',
      habilitacoes: candHab,
      experienciaAnos: 2,
      dataCandidatura: new Date().toISOString().split('T')[0],
      etapaProcesso: 'triagem',
    });

    setIsNewCandidateOpen(false);
    setCandNome('');
    setCandEmail('');
    setCandTel('');
  };

  const handleAdvanceStage = (app: JobApplication, newStage: JobApplication['etapaProcesso']) => {
    if (!onUpdateApplication) return;
    const updated = { ...app, etapaProcesso: newStage };
    onUpdateApplication(updated);
    setViewingApp(updated);
  };

  const handleExportCsv = () => {
    const headers = [
      'Candidato',
      'Vaga',
      'Email',
      'Telefone',
      'Habilitacoes',
      'Data_Candidatura',
      'Etapa',
      'Pontuacao',
      'Admitido',
    ];
    const rows = filteredApps.map((a) => [
      a.candidatoNome,
      a.vagaTitulo,
      a.email,
      a.telefone,
      a.habilitacoes,
      a.dataCandidatura,
      a.etapaProcesso,
      a.pontuacaoEntrevista || '--',
      a.convertidoEmColaborador ? 'Sim' : 'Nao',
    ]);
    exportToCsv(`recrutamento_candidatos_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const etapas: Array<{ key: JobApplication['etapaProcesso']; label: string; cor: string }> = [
    { key: 'triagem', label: '1. Triagem Curricular', cor: 'bg-gray-100 text-gray-700' },
    { key: 'entrevista', label: '2. Entrevista', cor: 'bg-blue-100 text-[#015FC4]' },
    { key: 'teste_pratico', label: '3. Teste / Avaliação', cor: 'bg-purple-100 text-purple-700' },
    { key: 'finalista', label: '4. Finalistas', cor: 'bg-amber-100 text-amber-800' },
    { key: 'aprovado', label: '5. Aprovado (Admissão)', cor: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Topo: Vagas Abertas & Acções */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#015FC4]" />
            <span>Processos de Recrutamento & Selecção Escolar</span>
          </h3>
          <p className="text-gray-500 text-[11px] mt-0.5">
            Acompanhe o funil de candidatos a docentes e corpo não docente com conversão directa em colaborador.
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
            onClick={() => window.print()}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Imprimir Funil
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsNewCandidateOpen(true)}
            icon={<Users className="w-3.5 h-3.5" />}
          >
            Novo Candidato
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewVagaOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Abrir Vaga
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar candidato por nome, cargo ou habilitações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg"
          />
        </div>

        <select
          value={selectedVagaId}
          onChange={(e) => setSelectedVagaId(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
        >
          <option value="todos">Todas as Vagas Activas</option>
          {vacancies.map((v) => (
            <option key={v.id} value={v.id}>
              {v.titulo} ({v.codigoVaga})
            </option>
          ))}
        </select>
      </div>

      {/* Cartões de Vagas em Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vacancies.map((v) => (
          <div key={v.id} className="p-4 bg-white rounded-xl border border-gray-200 space-y-2 shadow-2xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  {v.codigoVaga}
                </span>
                <h4 className="font-bold text-gray-900 text-sm mt-1">{v.titulo}</h4>
                <span className="text-[11px] text-gray-500">{v.departamentoNome}</span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                {v.estado}
              </span>
            </div>

            <p className="text-gray-600 text-[11px] leading-snug">{v.descricaoFuncoes}</p>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>{v.vagasDisponiveis} vaga(s) · Prazo até {v.dataEncerramento}</span>
              <strong className="text-[#015FC4]">{v.totalCandidaturas} candidaturas recebidas</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Funil Kanban de Candidaturas por Etapa (Área com suporte a Impressão #hr-printable-area) */}
      <div id="hr-printable-area" className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-gray-900 text-xs">Funil de Avaliação dos Candidatos</h4>
          <span className="text-[10px] text-gray-400 font-mono">
            Total Candidatos: {filteredApps.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {etapas.map((etapa) => {
            const appsInEtapa = filteredApps.filter((a) => a.etapaProcesso === etapa.key);
            return (
              <div key={etapa.key} className="bg-gray-50/80 rounded-xl p-3 border border-gray-200 flex flex-col space-y-2 min-h-[220px]">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${etapa.cor}`}>
                    {etapa.label}
                  </span>
                  <span className="font-mono font-bold text-gray-600 text-[11px]">{appsInEtapa.length}</span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {appsInEtapa.length > 0 ? (
                    appsInEtapa.map((app) => (
                      <div key={app.id} className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs space-y-1.5">
                        <div className="flex justify-between items-start">
                          <strong className="text-gray-900 block font-bold text-[11px]">{app.candidatoNome}</strong>
                          <button
                            onClick={() => setViewingApp(app)}
                            className="text-[#015FC4] hover:text-blue-800 text-[10px] font-bold no-print"
                          >
                            Dossier
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-500 block truncate">{app.habilitacoes}</span>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                          <span>{app.telefone}</span>
                          {app.pontuacaoEntrevista && (
                            <span className="font-bold text-[#015FC4]">{app.pontuacaoEntrevista} pts</span>
                          )}
                        </div>

                        {/* Se Aprovado: Botão de Conversão em Colaborador */}
                        {etapa.key === 'aprovado' && !app.convertidoEmColaborador && (
                          <button
                            onClick={() => onConvertApplication(app.id)}
                            className="w-full mt-1.5 py-1 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-colors no-print"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Admitir Colaborador</span>
                          </button>
                        )}

                        {app.convertidoEmColaborador && (
                          <div className="mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 p-1 rounded text-center">
                            ✓ Colaborador Admitido
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-[10px] italic py-4">
                      Vazio
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Visualizar Dossier do Candidato */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">{viewingApp.candidatoNome}</strong>
                <span className="text-[11px] text-gray-500">Candidato a: {viewingApp.vagaTitulo}</span>
              </div>
              <button onClick={() => setViewingApp(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                <div><span className="text-gray-400">Email:</span> <strong className="text-gray-800">{viewingApp.email}</strong></div>
                <div><span className="text-gray-400">Telefone:</span> <span className="font-mono text-gray-800">{viewingApp.telefone}</span></div>
                <div><span className="text-gray-400">Habilitações:</span> <span className="text-gray-800">{viewingApp.habilitacoes}</span></div>
                <div><span className="text-gray-400">Data Candidatura:</span> <span className="font-mono text-gray-800">{viewingApp.dataCandidatura}</span></div>
              </div>

              {/* Mudar de Etapa */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800 block text-[11px]">Avançar para Etapa:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleAdvanceStage(viewingApp, 'entrevista')}
                    className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-[#015FC4] font-semibold text-[10px]"
                  >
                    ➔ 2. Entrevista
                  </button>
                  <button
                    onClick={() => handleAdvanceStage(viewingApp, 'teste_pratico')}
                    className="p-1.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[10px]"
                  >
                    ➔ 3. Teste Prático
                  </button>
                  <button
                    onClick={() => handleAdvanceStage(viewingApp, 'finalista')}
                    className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[10px]"
                  >
                    ➔ 4. Finalista
                  </button>
                  <button
                    onClick={() => handleAdvanceStage(viewingApp, 'aprovado')}
                    className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[10px]"
                  >
                    ➔ 5. Aprovado
                  </button>
                </div>
              </div>

              {viewingApp.etapaProcesso === 'aprovado' && !viewingApp.convertidoEmColaborador && (
                <Button
                  variant="primary"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                  onClick={() => {
                    onConvertApplication(viewingApp.id);
                    setViewingApp(null);
                  }}
                  icon={<UserCheck className="w-3.5 h-3.5" />}
                >
                  Admitir Directamente como Colaborador
                </Button>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => setViewingApp(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Abertura de Nova Vaga */}
      {isNewVagaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <strong className="text-sm font-bold text-gray-900">Abrir Nova Vaga de Emprego</strong>
              <button onClick={() => setIsNewVagaOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVacancy} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Título da Vaga *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Professor de Biologia do IIº Ciclo"
                  value={tituloVaga}
                  onChange={(e) => setTituloVaga(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Departamento</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cargo</label>
                  <select
                    value={cargoId}
                    onChange={(e) => setCargoId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  >
                    {jobPositions.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Vagas Abertas</label>
                  <input
                    type="number"
                    min="1"
                    value={vagasQtd}
                    onChange={(e) => setVagasQtd(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data Limite de Candidatura</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Descrição das Responsabilidades</label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Funções principais e carga horária..."
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsNewVagaOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Publicar Vaga
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registar Novo Candidato */}
      {isNewCandidateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Registar Candidato a Vaga</h4>
            <form onSubmit={handleSaveCandidate} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Vaga Pretendida *</label>
                <select
                  value={candVagaId}
                  onChange={(e) => setCandVagaId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                >
                  {vacancies.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.titulo} ({v.codigoVaga})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nome Completo do Candidato *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Baptista Sambongo"
                  value={candNome}
                  onChange={(e) => setCandNome(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    required
                    placeholder="+244 923 000 000"
                    value={candTel}
                    onChange={(e) => setCandTel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="candidato@email.com"
                    value={candEmail}
                    onChange={(e) => setCandEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Habilitações Literárias</label>
                <input
                  type="text"
                  value={candHab}
                  onChange={(e) => setCandHab(e.target.value)}
                  placeholder="Ex: Licenciatura em Ensino da Matemática (ISCED)"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsNewCandidateOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Registar Candidato
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
