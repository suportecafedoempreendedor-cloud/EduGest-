import React, { useState } from 'react';
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  Phone,
  History,
  UserMinus,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  MapPin,
  Clock,
  Printer,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { Employee, OffboardingRecord } from '../../types/humanResources';
import { TeacherAssignment, Section, Subject } from '../../types';
import { Button } from '../ui/Button';
import { downloadFile, defaultSchoolHeader } from '../../utils/hrDocumentGenerator';

interface HrEmployeeDetailModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Employee) => void;
  onTerminate: (offboarding: OffboardingRecord) => void;
  teacherAssignments?: TeacherAssignment[];
  sections?: Section[];
  subjects?: Subject[];
}

export const HrEmployeeDetailModal: React.FC<HrEmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  onUpdate,
  onTerminate,
  teacherAssignments = [],
  sections = [],
  subjects = [],
}) => {
  const [activeTab, setActiveTab] = useState<'pessoal' | 'profissional' | 'academico' | 'emergencia' | 'historico' | 'cessacao'>('pessoal');
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmp, setEditedEmp] = useState<Employee>(employee);

  React.useEffect(() => {
    setEditedEmp(employee);
    setIsEditing(false);
  }, [employee]);

  // Estado para processo de cessação
  const [motivoSaida, setMotivoSaida] = useState<OffboardingRecord['motivo']>('Fim de Contrato');
  const [dataSaida, setDataSaida] = useState(new Date().toISOString().split('T')[0]);
  const [responsavelSaida, setResponsavelSaida] = useState('Dr. António Bento (RH)');
  const [obsSaida, setObsSaida] = useState('');
  const [checklist, setChecklist] = useState({
    equipamentosInformaticos: true,
    chavesEInstalacoes: true,
    crachaIdentificacao: true,
    passesETelefones: true,
    pautasEDocumentacaoPedagogica: true,
  });

  if (!isOpen) return null;

  // Disciplinas atribuídas se for docente
  const docAssignments = employee.professorId
    ? teacherAssignments.filter((ta) => ta.professorId === employee.professorId)
    : [];

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editedEmp);
    setIsEditing(false);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirmTermination = () => {
    const offboarding: OffboardingRecord = {
      dataSaida,
      motivo: motivoSaida,
      responsavelSaida,
      checklistDevolucao: checklist,
      observacoes: obsSaida,
      documentoTermoQuitacao: `QUITACAO-${employee.numeroMecanografico}.pdf`,
    };
    onTerminate(offboarding);
    setShowConfirmModal(false);
    setActiveTab('pessoal');
  };

  const handlePrintProfile = () => {
    window.print();
  };

  const handleDownloadDossier = () => {
    const text = `================================================================================
REPÚBLICA DE ANGOLA · MINISTÉRIO DA EDUCAÇÃO
${defaultSchoolHeader.schoolName.toUpperCase()}
FICHA INDIVIDUAL DE CADASTRO DO COLABORADOR
================================================================================

1. DADOS DE IDENTIFICAÇÃO PESSOAL:
  Nome Completo: ${employee.nomeCompleto}
  Nº Mecanográfico: ${employee.numeroMecanografico}
  Género: ${employee.genero || 'N/A'}
  Data de Nascimento: ${employee.dataNascimento}
  Nacionalidade: ${employee.nacionalidade || 'Angolana'}
  Naturalidade: ${employee.naturalidade || 'Luanda'}
  Bilhete de Identidade (BI): ${employee.numeroDocumento}
  Validade do BI: ${employee.dataValidadeDocumento || 'N/A'}
  NIF Fiscal: ${employee.nif}
  Nº da Segurança Social (INSS): ${employee.numeroINSS}

2. CONTACTOS & MORADA:
  Telefone Principal: ${employee.telefone}
  Email Institucional: ${employee.emailInstitucional}
  Província: ${employee.provincia || 'Luanda'}
  Município: ${employee.municipio || 'Talatona'}
  Bairro / Rua: ${employee.bairro || employee.morada || 'N/A'}

3. VÍNCULO PROFISSIONAL & ENQUADRAMENTO ESCOLAR:
  Cargo: ${employee.cargoNome}
  Departamento: ${employee.departamentoNome}
  Tipo de Colaborador: ${employee.tipoColaborador}
  Vínculo Contratual: ${employee.tipoVinculo.replace('_', ' ')}
  Data de Admissão: ${employee.dataAdmissao}
  Estado Profissional: ${employee.estadoProfissional.toUpperCase()}
  Responsável Directo: ${employee.responsavelDirectoNome || 'Direcção Geral'}
  Horário de Trabalho: ${employee.horarioTrabalho}
  Saldo de Férias Regulamentares: ${employee.saldoDiasFeriasAno} Dias Úteis

4. DADOS REMUNERATÓRIOS & BANCÁRIOS:
  Retribuição Base Mensal: ${employee.salarioBaseKz.toLocaleString('pt-AO')} Kz
  Subsídio de Alimentação: ${employee.subsidioAlimentacaoKz.toLocaleString('pt-AO')} Kz
  Subsídio de Transporte: ${employee.subsidioTransporteKz.toLocaleString('pt-AO')} Kz
  Método de Pagamento: ${employee.metodoPagamento}
  IBAN: ${employee.iban || 'N/A'}

5. HABILITAÇÕES LITERÁRIAS:
  Grau Académico: ${employee.qualificacoes?.[0]?.grau || 'Licenciatura'}
  Área de Especialização: ${employee.qualificacoes?.[0]?.curso || 'Educação'}
  Instituição de Ensino: ${employee.qualificacoes?.[0]?.instituicao || 'ISCED Luanda'}

Registado e autenticado digitalmente no EduGest Angola em ${new Date().toLocaleDateString('pt-AO')}.
================================================================================`;

    downloadFile(
      text,
      `ficha_colaborador_${employee.numeroMecanografico}_${employee.nomeCompleto.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div id="hr-printable-area" className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Cabeçalho do Perfil */}
        <div className="p-6 bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 shrink-0 flex items-center justify-center">
              {employee.fotografiaUrl ? (
                <img src={employee.fotografiaUrl} alt={employee.nomeCompleto} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] bg-white/15 px-2 py-0.5 rounded text-blue-100 font-semibold">
                  {employee.numeroMecanografico}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    employee.estadoProfissional === 'activo'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                      : employee.estadoProfissional === 'periodo_experimental'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                      : employee.estadoProfissional === 'cessado'
                      ? 'bg-rose-500/30 text-rose-200 border border-rose-400/30'
                      : 'bg-blue-500/20 text-blue-200'
                  }`}
                >
                  {employee.estadoProfissional.replace('_', ' ')}
                </span>
                {employee.tipoColaborador === 'docente' && (
                  <span className="text-[10px] bg-teal-500/20 text-teal-200 px-2 py-0.5 rounded font-semibold border border-teal-400/30">
                    Corpo Docente
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold mt-1 text-white">{employee.nomeCompleto}</h2>
              <p className="text-xs text-blue-100">
                {employee.cargoNome} · {employee.departamentoNome}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center no-print">
            <button
              onClick={handleDownloadDossier}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors"
              title="Descarregar Ficha (.txt)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Descarregar</span>
            </button>
            <button
              onClick={handlePrintProfile}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors"
              title="Imprimir Ficha Completa"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Separadores do Perfil */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-6 overflow-x-auto text-xs font-semibold text-gray-600 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('pessoal')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'pessoal'
                ? 'border-[#015FC4] text-[#015FC4] bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>A. Dados Pessoais</span>
          </button>
          <button
            onClick={() => setActiveTab('profissional')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'profissional'
                ? 'border-[#015FC4] text-[#015FC4] bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>B. Profissionais & Vínculo</span>
            {docAssignments.length > 0 && (
              <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.2 rounded-full">
                {docAssignments.length} Turmas
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('academico')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'academico'
                ? 'border-[#015FC4] text-[#015FC4] bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>C. Habilitações & Cursos</span>
          </button>
          <button
            onClick={() => setActiveTab('emergencia')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'emergencia'
                ? 'border-[#015FC4] text-[#015FC4] bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>D. Emergência</span>
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'historico'
                ? 'border-[#015FC4] text-[#015FC4] bg-white'
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>E. Histórico Funcional</span>
          </button>
          <button
            onClick={() => setActiveTab('cessacao')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors text-rose-700 ${
              activeTab === 'cessacao'
                ? 'border-rose-600 text-rose-700 bg-white'
                : 'border-transparent hover:text-rose-900'
            }`}
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Cessação de Vínculo</span>
          </button>
        </div>

        {/* Conteúdo do Perfil */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* SEPARADOR A: DADOS PESSOAIS */}
          {activeTab === 'pessoal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50/75 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-500 block text-[11px]">Nome Completo</span>
                  <strong className="text-gray-900 text-sm block mt-0.5">{employee.nomeCompleto}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Género</span>
                  <strong className="text-gray-900 block mt-0.5">{employee.genero}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Data de Nascimento</span>
                  <strong className="text-gray-900 block mt-0.5">{employee.dataNascimento}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Nacionalidade</span>
                  <strong className="text-gray-900 block mt-0.5">{employee.nacionalidade}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Naturalidade / Província</span>
                  <strong className="text-gray-900 block mt-0.5">{employee.naturalidade || 'Luanda'} ({employee.provinciaNaturalidade || 'Luanda'})</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Telefone Principal</span>
                  <strong className="text-gray-900 font-mono block mt-0.5">{employee.telefone}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Email Institucional</span>
                  <strong className="text-gray-900 font-mono block mt-0.5">{employee.emailInstitucional}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Email Pessoal</span>
                  <strong className="text-gray-700 font-mono block mt-0.5">{employee.emailPessoal || 'Não registado'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Morada Residencial</span>
                  <span className="text-gray-900 block mt-0.5">{employee.morada}, {employee.municipio} ({employee.provincia})</span>
                </div>
              </div>

              {/* Documentos Oficiais Angolanos */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#015FC4]" />
                  <h4 className="font-bold text-gray-900 text-xs">Documentação Fiscal & de Identificação (Angola)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Bilhete de Identidade (BI)</span>
                    <strong className="text-gray-900 font-mono text-sm block">{employee.numeroDocumento}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Validade do Documento</span>
                    <strong className="text-gray-900 font-mono block">{employee.dataValidadeDocumento}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">NIF (Fiscal)</span>
                    <strong className="text-gray-900 font-mono block">{employee.nif}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Nº Segurança Social (INSS)</span>
                    <strong className="text-gray-900 font-mono block text-[#015FC4]">{employee.numeroINSS}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEPARADOR B: DADOS PROFISSIONAIS & VÍNCULO */}
          {activeTab === 'profissional' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50/75 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-500 block text-[11px]">Departamento</span>
                  <strong className="text-gray-900 text-sm block mt-0.5">{employee.departamentoNome}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Cargo Ocupado</span>
                  <strong className="text-gray-900 text-sm block mt-0.5">{employee.cargoNome}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Tipo de Vínculo Contratual</span>
                  <strong className="text-gray-900 block mt-0.5 capitalize">
                    {employee.tipoVinculo.replace('_', ' ')}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Data de Admissão</span>
                  <strong className="text-gray-900 block mt-0.5">{employee.dataAdmissao}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Início de Funções</span>
                  <strong className="text-gray-900 block mt-0.5">{employee.dataInicioFuncoes}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Data de Termo (Se Contrato a Termo)</span>
                  <strong className="text-gray-900 font-mono block mt-0.5">
                    {employee.dataFimContrato || 'Indeterminado (Sem termo)'}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Responsável Directo</span>
                  <span className="text-gray-900 block mt-0.5 font-semibold">{employee.responsavelDirectoNome || 'Direcção Geral'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Local de Trabalho</span>
                  <span className="text-gray-900 block mt-0.5">{employee.localTrabalho}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">Horário Semanal</span>
                  <span className="text-gray-900 block mt-0.5">{employee.horarioTrabalho}</span>
                </div>
              </div>

              {/* Se for Docente: Integração com Módulo Académico */}
              {employee.tipoColaborador === 'docente' && (
                <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-teal-700" />
                      <h4 className="font-bold text-teal-900 text-xs">
                        Atribuições Lectivas no Módulo Académico (EduGest)
                      </h4>
                    </div>
                    <span className="text-[11px] text-teal-700 font-semibold">
                      Sincronizado com Estrutura de Turmas
                    </span>
                  </div>

                  {docAssignments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white rounded-lg overflow-hidden border border-teal-100">
                        <thead className="bg-teal-100/70 text-teal-900 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Turma</th>
                            <th className="py-2 px-3">Disciplina</th>
                            <th className="py-2 px-3">Ano Lectivo</th>
                            <th className="py-2 px-3 text-center">Carga Semanal</th>
                            <th className="py-2 px-3 text-center">Director de Turma</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-teal-50">
                          {docAssignments.map((ta) => (
                            <tr key={ta.id} className="hover:bg-teal-50/40">
                              <td className="py-2 px-3 font-semibold text-gray-900">{ta.turmaNome}</td>
                              <td className="py-2 px-3 text-gray-800">{ta.subjectNome}</td>
                              <td className="py-2 px-3 text-gray-600">{ta.anoLectivoNome}</td>
                              <td className="py-2 px-3 text-center font-mono font-bold text-teal-800">
                                {ta.cargaHorariaSemanal} tempos
                              </td>
                              <td className="py-2 px-3 text-center">
                                {ta.isDirectorTurma ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                    Sim
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-[10px]">Não</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-[11px] italic bg-white p-3 rounded-lg border border-teal-100">
                      Nenhuma turma atribuída no módulo académico para o ano lectivo actual.
                    </p>
                  )}
                </div>
              )}

              {/* Informação Confidencial de Remuneração Contratual */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-emerald-900 text-xs">
                      Condições Remuneratórias de Contrato (Acesso Confidencial RH)
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                    Valores em Kwanzas (AOA)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Salário Base Mensal</span>
                    <strong className="text-gray-900 font-mono text-sm block mt-0.5">
                      {employee.salarioBaseKz.toLocaleString('pt-AO')} Kz
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Subsídio de Alimentação</span>
                    <strong className="text-gray-900 font-mono block mt-0.5">
                      {employee.subsidioAlimentacaoKz.toLocaleString('pt-AO')} Kz
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Subsídio de Transporte</span>
                    <strong className="text-gray-900 font-mono block mt-0.5">
                      {employee.subsidioTransporteKz.toLocaleString('pt-AO')} Kz
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Outros Abonos / Isenção IRT</span>
                    <span className="text-gray-900 block mt-0.5 font-mono">
                      {(employee.outrosAbonosKz || 0).toLocaleString('pt-AO')} Kz · {employee.isencaoIrt ? 'Isento IRT' : 'Sujeito a IRT'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
                  <span>Método: <strong>{employee.metodoPagamento}</strong></span>
                  <span className="font-mono">IBAN: {employee.iban || 'Registado no processamento financeiro'}</span>
                </div>
              </div>
            </div>
          )}

          {/* SEPARADOR C: HABILITAÇÕES & CURSOS */}
          {activeTab === 'academico' && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-xs">Formação Académica & Especializações</h4>
              <div className="space-y-3">
                {employee.qualificacoes.map((q, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#015FC4] uppercase">
                          {q.grau}
                        </span>
                        <h5 className="font-bold text-gray-900 text-xs mt-1">{q.curso}</h5>
                      </div>
                      <span className="font-mono font-bold text-gray-500 text-[11px]">{q.anoConclusao}</span>
                    </div>
                    <p className="text-gray-600 text-[11px]">
                      {q.instituicao} ({q.pais})
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 text-xs mb-2">Competências Principais Declaradas</h4>
                <div className="flex flex-wrap gap-2">
                  {employee.competenciasPrincipais.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEPARADOR D: CONTACTOS DE EMERGÊNCIA */}
          {activeTab === 'emergencia' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Estes contactos destinam-se exclusivamente a situações de emergência médica ou operacional e obedecem à política de confidencialidade da Lei nº 22/11 de Angola.
                </span>
              </div>

              <div className="space-y-3">
                {employee.contactosEmergencia.length > 0 ? (
                  employee.contactosEmergencia.map((ce, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div>
                        <strong className="text-gray-900 text-xs block">{ce.nome}</strong>
                        <span className="text-gray-500 text-[11px]">
                          Parentesco: <strong>{ce.parentesco}</strong> · {ce.morada || 'Luanda'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-gray-800 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                        {ce.telefone}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic p-4 text-center">Nenhum contacto de emergência registado.</p>
                )}
              </div>
            </div>
          )}

          {/* SEPARADOR E: HISTÓRICO FUNCIONAL */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <h4 className="font-bold text-gray-900 text-xs">Indicadores de Assiduidade e Férias Regulamentares</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-500 text-[11px] block">Saldo de Férias Disponível</span>
                    <strong className="text-lg font-bold text-[#015FC4] font-mono block mt-1">
                      {employee.saldoDiasFeriasAno} dias
                    </strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-500 text-[11px] block">Taxa Assiduidade Mensal</span>
                    <strong className="text-lg font-bold text-emerald-600 font-mono block mt-1">
                      {employee.taxaAssiduidadeMesPercent}%
                    </strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-gray-500 text-[11px] block">Faltas Injustificadas no Ano</span>
                    <strong className="text-lg font-bold text-gray-800 font-mono block mt-1">
                      {employee.totalFaltasInjustificadasAno}
                    </strong>
                  </div>
                </div>
              </div>

              {employee.processoSaida && (
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Registo de Cessação de Funções na Instituição</span>
                  </div>
                  <p className="text-rose-700 text-[11px]">
                    Saída em <strong>{employee.processoSaida.dataSaida}</strong> por motivo de{' '}
                    <strong>{employee.processoSaida.motivo}</strong>, homologado por{' '}
                    {employee.processoSaida.responsavelSaida}.
                  </p>
                  <p className="text-gray-600 text-[11px] italic">
                    Observações: {employee.processoSaida.observacoes || 'Sem notas adicionais.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SEPARADOR F: PROCESSO DE CESSAÇÃO / OFFBOARDING */}
          {activeTab === 'cessacao' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2 text-rose-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <strong className="text-xs">Processo Formal de Cessação de Vínculo (Offboarding)</strong>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-800">
                  A cessação de funções desactiva os acessos do colaborador à plataforma escolar, arquiva o contrato activo e emite o termo de quitação. Os registos históricos de aulas, pautas, notas e remunerações são preservados integralmente sem eliminação física de dados.
                </p>
              </div>

              {employee.estadoProfissional === 'cessado' ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <span className="font-bold text-gray-900 block">Este colaborador já se encontra com vínculo cessado.</span>
                  <p className="text-gray-600 text-[11px]">
                    Data de saída: {employee.processoSaida?.dataSaida || employee.dataFimContrato}.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Motivo Legal da Saída (LGT)</label>
                      <select
                        value={motivoSaida}
                        onChange={(e) => setMotivoSaida(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      >
                        <option value="Fim de Contrato">Fim de Contrato a Termo Certo</option>
                        <option value="Rescisão por Mútuo Acordo">Rescisão por Mútuo Acordo</option>
                        <option value="Demissão Voluntária">Demissão Voluntária pelo Trabalhador</option>
                        <option value="Despedimento com Justa Causa">Despedimento com Justa Causa</option>
                        <option value="Reforma">Reforma por Velhice</option>
                        <option value="Outro">Outro Motivo Regulamentar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Data Efetiva de Saída</label>
                      <input
                        type="date"
                        value={dataSaida}
                        onChange={(e) => setDataSaida(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Checklist de Devolução de Equipamentos */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <strong className="block text-gray-800 text-xs">Checklist de Devolução de Pertences da Escola:</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.equipamentosInformaticos}
                          onChange={(e) => setChecklist({ ...checklist, equipamentosInformaticos: e.target.checked })}
                          className="rounded text-[#015FC4]"
                        />
                        <span>Computador portátil e periféricos informáticos</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.chavesEInstalacoes}
                          onChange={(e) => setChecklist({ ...checklist, chavesEInstalacoes: e.target.checked })}
                          className="rounded text-[#015FC4]"
                        />
                        <span>Chaves de gabinetes, salas e armários</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.crachaIdentificacao}
                          onChange={(e) => setChecklist({ ...checklist, crachaIdentificacao: e.target.checked })}
                          className="rounded text-[#015FC4]"
                        />
                        <span>Cartão / crachá de identificação e acesso</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checklist.pautasEDocumentacaoPedagogica}
                          onChange={(e) => setChecklist({ ...checklist, pautasEDocumentacaoPedagogica: e.target.checked })}
                          className="rounded text-[#015FC4]"
                        />
                        <span>Pautas, livros de ponto e cadernos de notas</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Observações do Processo de Cessação</label>
                    <textarea
                      rows={2}
                      value={obsSaida}
                      onChange={(e) => setObsSaida(e.target.value)}
                      placeholder="Indique os detalhes do termo de encerramento ou compensação..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  {showConfirmModal ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                      <div className="flex items-start gap-2.5 text-rose-900">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs font-bold block">Confirmar Desligamento de {employee.nomeCompleto}?</strong>
                          <p className="text-[11px] text-rose-800 mt-0.5">
                            Esta acção irá cessar o contrato activo e revogar os acessos do colaborador ao sistema. Os históricos académicos, pautas e registros de assiduidade serão preservados para auditoria da Inspecção Geral da Educação e INSS.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowConfirmModal(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="secondary"
                          className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
                          size="sm"
                          onClick={handleConfirmTermination}
                          icon={<UserMinus className="w-4 h-4" />}
                        >
                          Sim, Confirmar e Revogar Acessos
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-3">
                      <Button
                        variant="secondary"
                        className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
                        size="sm"
                        onClick={() => setShowConfirmModal(true)}
                        icon={<UserMinus className="w-4 h-4" />}
                      >
                        Confirmar Cessação & Desactivar Acessos
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Última actualização: {employee.ultimaActualizacao} · EduGest Angola HR
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fechar Perfil
          </Button>
        </div>
      </div>
    </div>
  );
};
