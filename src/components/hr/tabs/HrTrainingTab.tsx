import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Users,
  Plus,
  CheckCircle2,
  Award,
  BookOpen,
  Printer,
  Download,
  Eye,
  Search,
  Building2,
  X,
} from 'lucide-react';
import { TrainingRecord, Employee } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv, downloadFile, defaultSchoolHeader } from '../../../utils/hrDocumentGenerator';

interface HrTrainingTabProps {
  trainings: TrainingRecord[];
  employees: Employee[];
  onAddTraining: (training: Omit<TrainingRecord, 'id'>) => void;
  onToggleAttendance: (trainingId: string, colaboradorId: string) => void;
  onIssueCertificate?: (trainingId: string, colaboradorId: string) => void;
  schoolName?: string;
}

export const HrTrainingTab: React.FC<HrTrainingTabProps> = ({
  trainings,
  employees,
  onAddTraining,
  onToggleAttendance,
  onIssueCertificate,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tema, setTema] = useState('');
  const [entidade, setEntidade] = useState('');
  const [formador, setFormador] = useState('');
  const [horas, setHoras] = useState(20);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [local, setLocal] = useState('Auditório Central do Colégio');
  const [descricao, setDescricao] = useState('');

  // Modal: Visualizar Certificado
  const [viewingCertificate, setViewingCertificate] = useState<{
    training: TrainingRecord;
    participant: { colaboradorId: string; colaboradorNome: string; departamentoNome: string };
  } | null>(null);

  const filteredTrainings = trainings.filter((t) => {
    return (
      t.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.entidadeFormadora.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.formadorNome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tema) return;

    const initialParticipants = employees.slice(0, 4).map((emp) => ({
      colaboradorId: emp.id,
      colaboradorNome: emp.nomeCompleto,
      departamentoNome: emp.departamentoNome,
      presencaConfirmada: true,
      certificadoEmitido: true,
    }));

    onAddTraining({
      escolaId: 'esc-001',
      tema,
      entidadeFormadora: entidade || 'Centro de Formação Pedagógica',
      formadorNome: formador || 'Especialista Convidado',
      cargaHorariaHoras: Number(horas) || 20,
      dataInicio,
      dataFim,
      local,
      descricao,
      estado: 'agendada',
      participantes: initialParticipants,
    });

    setIsModalOpen(false);
    setTema('');
    setDescricao('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Tema_Formacao',
      'Entidade',
      'Formador',
      'Carga_Horaria_Horas',
      'Data_Inicio',
      'Data_Fim',
      'Total_Participantes',
      'Estado',
    ];
    const rows = filteredTrainings.map((t) => [
      t.tema,
      t.entidadeFormadora,
      t.formadorNome,
      t.cargaHorariaHoras,
      t.dataInicio,
      t.dataFim,
      t.participantes.length,
      t.estado,
    ]);
    exportToCsv(`plano_formacao_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleDownloadCertificateText = (
    training: TrainingRecord,
    participant: { colaboradorNome: string; departamentoNome: string }
  ) => {
    const text = `================================================================================
REPÚBLICA DE ANGOLA · MINISTÉRIO DA EDUCAÇÃO
${schoolName.toUpperCase()}
CENTRO DE DESENVOLVIMENTO DOCENTE E CAPACITAÇÃO PEDAGÓGICA
================================================================================

                    CERTIFICADO OFICIAL DE FORMAÇÃO PROFISSIONAL
                    Nº REGISTO: CERT-RH/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}

Certifica-se que:

                      ${participant.colaboradorNome.toUpperCase()}
             Departamento: ${participant.departamentoNome}

participou com aproveitamento e assiduidade comprovada na acção de capacitação intitulada:

                     "${training.tema.toUpperCase()}"

com uma carga horária lectiva total de ${training.cargaHorariaHoras} horas, ministrada por:
  Formador(a): ${training.formadorNome}
  Entidade Responsável: ${training.entidadeFormadora}
  Período: De ${training.dataInicio} a ${training.dataFim}
  Local: ${training.local}

Por ser verdade e para os devidos efeitos de mérito na carreira docente e técnico-administrativa,
emite-se o presente Certificado, homologado pela Direcção Pedagógica e Direcção de RH.

Luanda, aos ${training.dataFim || new Date().toLocaleDateString('pt-AO')}.

__________________________________________          __________________________________________
        A DIRECÇÃO DA ESCOLA                                    O(A) FORMADOR(A)
     (Carimbo Oficial EduGest)                               (${training.formadorNome})
================================================================================`;

    downloadFile(
      text,
      `certificado_${participant.colaboradorNome.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`
    );
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#015FC4]" />
              <span>Plano de Formação Contínua & Desenvolvimento Docente</span>
            </h3>
            <p className="text-gray-500 text-[11px] mt-0.5">
              Capacitação técnica e pedagógica, workshops do MED, controlo de presenças e emissão de certificados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Exportar Plano (CSV)
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Agendar Formação
            </Button>
          </div>
        </div>

        {/* Linha de Busca */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar formação por tema, entidade ou formador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTrainings.map((trn) => (
          <div key={trn.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {trn.cargaHorariaHoras} Horas Lectivas
                </span>
                <h4 className="font-bold text-gray-900 text-sm mt-1">{trn.tema}</h4>
                <span className="text-[11px] text-gray-500">{trn.entidadeFormadora} · {trn.formadorNome}</span>
              </div>

              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  trn.estado === 'concluida'
                    ? 'bg-emerald-100 text-emerald-800'
                    : trn.estado === 'em_curso'
                    ? 'bg-blue-100 text-[#015FC4]'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {trn.estado.replace('_', ' ')}
              </span>
            </div>

            <p className="text-gray-600 text-[11px] leading-snug">{trn.descricao}</p>

            <div className="p-2.5 bg-gray-50 rounded-lg space-y-1.5 border border-gray-100">
              <span className="font-bold text-gray-800 text-[10px] block">
                Colaboradores Participantes ({trn.participantes.length}):
              </span>
              <div className="space-y-1">
                {trn.participantes.map((part) => (
                  <div key={part.colaboradorId} className="flex justify-between items-center text-[11px] bg-white p-1.5 rounded border border-gray-100">
                    <div>
                      <strong className="text-gray-900 block">{part.colaboradorNome}</strong>
                      <span className="text-[10px] text-gray-400">{part.departamentoNome}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleAttendance(trn.id, part.colaboradorId)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded transition-colors ${
                          part.presencaConfirmada
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Alternar Confirmação de Presença"
                      >
                        {part.presencaConfirmada ? '✓ Presença OK' : 'Marcar Presença'}
                      </button>

                      <button
                        onClick={() =>
                          setViewingCertificate({
                            training: trn,
                            participant: part,
                          })
                        }
                        className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#015FC4]/10 text-[#015FC4] hover:bg-[#015FC4] hover:text-white transition-colors flex items-center gap-1"
                        title="Emitir / Visualizar Certificado Oficial"
                      >
                        <Award className="w-3 h-3" />
                        <span>Certificado</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
              <span>Local: {trn.local}</span>
              <span>Datas: {trn.dataInicio} a {trn.dataFim}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Visualizar Certificado Oficial de Formação (#hr-printable-area) */}
      {viewingCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-2 no-print">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">
                  Certificado Oficial de Formação e Capacitação
                </strong>
                <span className="text-[11px] text-gray-500">
                  {viewingCertificate.participant.colaboradorNome}
                </span>
              </div>
              <button onClick={() => setViewingCertificate(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            {/* Certificado Imprimível (#hr-printable-area) */}
            <div
              id="hr-printable-area"
              className="p-8 border-4 border-double border-[#015FC4]/30 rounded-2xl bg-amber-50/20 text-center space-y-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#015FC4]">
                  República de Angola · Ministério da Educação
                </span>
                <h3 className="font-extrabold text-[#012041] text-base uppercase">
                  {schoolName}
                </h3>
                <span className="text-[10px] text-gray-500 block">
                  Centro Integrado de Desenvolvimento e Formação Contínua
                </span>
              </div>

              <div className="py-2">
                <span className="text-xs uppercase tracking-widest text-amber-800 font-bold block">
                  CERTIFICADO DE CAPACITAÇÃO PEDAGÓGICA
                </span>
                <p className="text-[11px] text-gray-600 mt-2">
                  Certifica-se que o(a) docente / colaborador(a)
                </p>
                <strong className="text-base text-gray-900 font-extrabold block my-2 underline decoration-[#015FC4] decoration-2">
                  {viewingCertificate.participant.colaboradorNome}
                </strong>
                <p className="text-[11px] text-gray-700 leading-relaxed max-w-md mx-auto">
                  concluiu com êxito a acção de formação profissional sob o tema:
                  <br />
                  <strong className="text-sm text-[#012041] block mt-1">
                    "{viewingCertificate.training.tema}"
                  </strong>
                  com a duração total de <strong>{viewingCertificate.training.cargaHorariaHoras} horas lectivas</strong>, ministrada por <strong>{viewingCertificate.training.formadorNome}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-[10px] border-t border-gray-200">
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>Pela Direcção Pedagógica</strong>
                    <span className="block text-gray-500">{schoolName}</span>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>O(A) Formador(a)</strong>
                    <span className="block text-gray-500">{viewingCertificate.training.formadorNome}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 no-print">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleDownloadCertificateText(
                    viewingCertificate.training,
                    viewingCertificate.participant
                  )
                }
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
                  Imprimir Certificado
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setViewingCertificate(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Agendar Formação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Agendar Nova Acção de Formação</h4>
            <form onSubmit={handleCreateTraining} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tema da Formação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Metodologias Activas de Avaliação e Inclusão Escolar"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Entidade Formadora</label>
                  <input
                    type="text"
                    value={entidade}
                    onChange={(e) => setEntidade(e.target.value)}
                    placeholder="Ex: ISCED / MED Luanda"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Formador / Facilitador</label>
                  <input
                    type="text"
                    value={formador}
                    onChange={(e) => setFormador(e.target.value)}
                    placeholder="Ex: Prof. Dr. Mateus Manuel"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Carga Horária</label>
                  <input
                    type="number"
                    min="1"
                    value={horas}
                    onChange={(e) => setHoras(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    required
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    required
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Local da Realização</label>
                <input
                  type="text"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Objectivos Pedagógicos</label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Objectivos formativos e competências a desenvolver..."
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Gravar Formação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
