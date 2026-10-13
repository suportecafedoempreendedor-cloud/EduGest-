import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  CreditCard,
  ShieldCheck,
  Eye,
  Printer,
  Download,
  Building2,
  X,
} from 'lucide-react';
import { EmploymentContract, Employee } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv, downloadFile, defaultSchoolHeader } from '../../../utils/hrDocumentGenerator';

interface HrContractsTabProps {
  contracts: EmploymentContract[];
  employees: Employee[];
  onAddContractAdenda: (contractId: string, descricao: string) => void;
  onRenewContract: (contractId: string, novaDataTermo: string) => void;
  onAddContract?: (contract: Omit<EmploymentContract, 'id' | 'adendas'>) => void;
  schoolName?: string;
}

export const HrContractsTab: React.FC<HrContractsTabProps> = ({
  contracts,
  employees,
  onAddContractAdenda,
  onRenewContract,
  onAddContract,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');

  // Modal de Adenda / Renovação
  const [selectedContract, setSelectedContract] = useState<EmploymentContract | null>(null);
  const [modalAction, setModalAction] = useState<'adenda' | 'renovacao'>('adenda');
  const [adendaDesc, setAdendaDesc] = useState('');
  const [novaDataTermo, setNovaDataTermo] = useState('2027-11-30');

  // Modal de Visualização da Minuta do Contrato (LGT)
  const [viewingContract, setViewingContract] = useState<EmploymentContract | null>(null);

  // Modal de Novo Contrato
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [newEmpId, setNewEmpId] = useState(employees[0]?.id || '');
  const [newTipo, setNewTipo] = useState<EmploymentContract['tipo']>('termo_certo');
  const [newDataInicio, setNewDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [newDataTermo, setNewDataTermo] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newSalario, setNewSalario] = useState(300000);

  const filtered = contracts.filter((c) => {
    const matchSearch =
      c.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numeroContrato.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cargoNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'todos' || c.tipo === filterTipo;
    const matchEstado = filterEstado === 'todos' || c.estado === filterEstado;
    return matchSearch && matchTipo && matchEstado;
  });

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    if (modalAction === 'adenda') {
      if (!adendaDesc) return;
      onAddContractAdenda(selectedContract.id, adendaDesc);
    } else {
      if (!novaDataTermo) return;
      onRenewContract(selectedContract.id, novaDataTermo);
    }

    setSelectedContract(null);
    setAdendaDesc('');
  };

  const handleCreateNewContract = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === newEmpId);
    if (!emp) return;

    if (onAddContract) {
      onAddContract({
        escolaId: 'esc-001',
        colaboradorId: emp.id,
        colaboradorNome: emp.nomeCompleto,
        departamentoNome: emp.departamentoNome,
        cargoNome: emp.cargoNome,
        numeroContrato: `CTR-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        tipo: newTipo,
        dataInicio: newDataInicio,
        dataTermo: newTipo === 'tempo_indeterminado' ? undefined : newDataTermo,
        salarioMensalKz: Number(newSalario) || 250000,
        estado: 'activo',
        registadoPor: 'Direcção de Recursos Humanos',
      });
    }

    setIsNewContractOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'N_Contrato',
      'Colaborador',
      'Cargo',
      'Departamento',
      'Tipo_Vinculo',
      'Data_Inicio',
      'Data_Termo',
      'Salario_Mensal_Kz',
      'Estado',
    ];
    const rows = filtered.map((c) => [
      c.numeroContrato,
      c.colaboradorNome,
      c.cargoNome,
      c.departamentoNome,
      c.tipo,
      c.dataInicio,
      c.dataTermo || 'Sem termo fixo',
      c.salarioMensalKz,
      c.estado,
    ]);
    exportToCsv(`contratos_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handlePrintContract = () => {
    window.print();
  };

  const handleDownloadContractText = (ctr: EmploymentContract) => {
    const text = `================================================================================
REPÚBLICA DE ANGOLA · LEI GERAL DO TRABALHO
${schoolName.toUpperCase()}
================================================================================

                         CONTRATO DE TRABALHO (${ctr.tipo.toUpperCase().replace('_', ' ')})
                               Nº REGISTO: ${ctr.numeroContrato}

ENTRE AS PARTES:

PRIMEIRO CONTRAENTE:
  ${schoolName}, com NIF ${defaultSchoolHeader.nif}, com sede em ${defaultSchoolHeader.municipio},
  ${defaultSchoolHeader.provincia}, aqui representada pela sua Direcção de Recursos Humanos.

SEGUNDO CONTRAENTE:
  Trabalhador(a): ${ctr.colaboradorNome}
  Categoria / Cargo: ${ctr.cargoNome}
  Departamento: ${ctr.departamentoNome}

CLÁUSULAS CONTRATUAIS:

CLÁUSULA 1ª (OBJECTO E FUNÇÃO):
O Segundo Contraente compromete-se a prestar a sua actividade profissional com zelo, pontualidade
e dedicação, exercendo as funções inerentes ao cargo de ${ctr.cargoNome}.

CLÁUSULA 2ª (REGIME E DURAÇÃO):
O presente contrato é celebrado sob o regime de ${ctr.tipo.replace('_', ' ')}, iniciando os seus
efeitos a ${ctr.dataInicio}${ctr.dataTermo ? `, com termo previsto para ${ctr.dataTermo}` : ' por tempo indeterminado'}.

CLÁUSULA 3ª (RETRIBUIÇÃO MENSAL):
A título de retribuição base mensal, o Primeiro Contraente pagará ao Segundo Contraente a quantia de:
  ${ctr.salarioMensalKz.toLocaleString('pt-AO')} Kz (Kwanzas),
sujeita às retenções fiscais de IRT e encargos da Segurança Social (INSS 3%) legalmente aplicáveis.

CLÁUSULA 4ª (DIREITOS A FÉRIAS E PROTECÇÃO SOCIAL):
O trabalhador goza do direito a 22 dias úteis de férias anuais remuneradas, subsídio de férias
e de Natal, e inscrição regular no Instituto Nacional de Segurança Social (INSS).

CLÁUSULA 5ª (FORO E REGIME SUPLETIVO):
Em tudo o que for omisso, aplicam-se as disposições da Lei Geral do Trabalho de Angola e regulamento interno.

Luanda, aos ${ctr.dataInicio}.

__________________________________________          __________________________________________
        PELO PRIMEIRO CONTRAENTE                                 O SEGUNDO CONTRAENTE
     (A Direcção / Carimbo Oficial)                          (${ctr.colaboradorNome})
================================================================================`;

    downloadFile(text, `contrato_${ctr.numeroContrato.replace(/[\/\\]/g, '_')}.txt`);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Topo Informativo & Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#015FC4]" />
              <span>Gestão de Contratos de Trabalho & Vínculos Laborais (LGT)</span>
            </h3>
            <p className="text-gray-500 text-[11px] mt-0.5">
              Acompanhamento de prazos de vigência, adendas salariais, emissão de minutas e renovações contratuais.
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
              onClick={() => setIsNewContractOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Novo Contrato
            </Button>
          </div>
        </div>

        {/* Linha de Filtros */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar contrato ou colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
            />
          </div>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
          >
            <option value="todos">Todos os Vínculos</option>
            <option value="tempo_indeterminado">Tempo Indeterminado (Efectivo)</option>
            <option value="termo_certo">Termo Certo Resolutivo</option>
            <option value="prestacao_servicos">Prestação de Serviços</option>
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
          >
            <option value="todos">Todos os Estados</option>
            <option value="activo">Activo</option>
            <option value="a_renovar">A Renovar / Próximo do Fim</option>
            <option value="renovado">Renovado</option>
            <option value="cessado">Cessado</option>
          </select>
        </div>
      </div>

      {/* Lista de Contratos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Nº Contrato</th>
              <th className="py-3 px-4">Colaborador & Cargo</th>
              <th className="py-3 px-4">Vínculo Contratual</th>
              <th className="py-3 px-4">Início</th>
              <th className="py-3 px-4">Termo / Vigência</th>
              <th className="py-3 px-4 font-mono text-right">Remuneração Mensal</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Operações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((ctr) => {
              const isTermEnding = ctr.estado === 'a_renovar';
              return (
                <tr key={ctr.id} className={`hover:bg-blue-50/20 ${isTermEnding ? 'bg-amber-50/30' : ''}`}>
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    {ctr.numeroContrato}
                  </td>

                  <td className="py-3 px-4">
                    <strong className="text-gray-900 block font-semibold">{ctr.colaboradorNome}</strong>
                    <span className="text-[10px] text-gray-400 block">
                      {ctr.cargoNome} · {ctr.departamentoNome}
                    </span>
                  </td>

                  <td className="py-3 px-4 capitalize text-gray-700">
                    {ctr.tipo.replace('_', ' ')}
                  </td>

                  <td className="py-3 px-4 font-mono text-gray-600">{ctr.dataInicio}</td>

                  <td className="py-3 px-4 font-mono">
                    {ctr.dataTermo ? (
                      <span className={isTermEnding ? 'text-amber-700 font-bold flex items-center gap-1' : 'text-gray-800'}>
                        {isTermEnding && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {ctr.dataTermo}
                      </span>
                    ) : (
                      <span className="text-gray-400">Sem termo fixo</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-gray-900 text-right">
                    {ctr.salarioMensalKz.toLocaleString('pt-AO')} Kz
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ctr.estado === 'activo'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ctr.estado === 'a_renovar'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : ctr.estado === 'renovado'
                          ? 'bg-blue-100 text-[#015FC4]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ctr.estado === 'a_renovar' ? 'Expira em < 35 dias' : ctr.estado}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewingContract(ctr)}
                        className="px-2 py-1 rounded bg-[#015FC4]/10 hover:bg-[#015FC4] text-[#015FC4] hover:text-white font-semibold text-[10px] transition-colors flex items-center gap-1"
                        title="Visualizar Minuta do Contrato"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Minuta</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedContract(ctr);
                          setModalAction('adenda');
                        }}
                        className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[10px] transition-colors"
                        title="Registar Adenda Contratual"
                      >
                        + Adenda
                      </button>

                      {ctr.tipo === 'termo_certo' && (
                        <button
                          onClick={() => {
                            setSelectedContract(ctr);
                            setModalAction('renovacao');
                          }}
                          className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold text-[10px] transition-colors flex items-center gap-1"
                          title="Renovar Contrato de Trabalho"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Renovar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Visualizar Minuta Oficial do Contrato de Trabalho */}
      {viewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3 no-print">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#015FC4]">
                  República de Angola · Lei Geral do Trabalho
                </span>
                <h3 className="text-base font-extrabold text-[#012041]">
                  Minuta Oficial de Contrato de Trabalho
                </h3>
                <span className="text-[11px] font-mono text-gray-500 font-bold">
                  Registo: {viewingContract.numeroContrato}
                </span>
              </div>
              <button
                onClick={() => setViewingContract(null)}
                className="text-gray-400 hover:text-gray-700 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Documento Imprimível (#hr-printable-area) */}
            <div id="hr-printable-area" className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4 text-xs">
              <div className="text-center border-b border-gray-200 pb-3">
                <h4 className="font-bold text-[#012041] text-sm uppercase">{schoolName}</h4>
                <p className="text-[11px] text-gray-600">
                  NIF: {defaultSchoolHeader.nif} · {defaultSchoolHeader.municipio}, {defaultSchoolHeader.provincia}
                </p>
                <strong className="text-xs text-[#015FC4] block mt-1">
                  CONTRATO INDIVIDUAL DE TRABALHO ({viewingContract.tipo.toUpperCase().replace('_', ' ')})
                </strong>
              </div>

              <div className="space-y-2 text-[11px] leading-relaxed text-gray-800">
                <p>
                  <strong>PRIMEIRO CONTRAENTE:</strong> {schoolName}, pessoa colectiva com NIF {defaultSchoolHeader.nif}, com sede em {defaultSchoolHeader.municipio}, Luanda.
                </p>
                <p>
                  <strong>SEGUNDO CONTRAENTE:</strong> {viewingContract.colaboradorNome}, admitido para o cargo de <strong>{viewingContract.cargoNome}</strong> no Departamento de {viewingContract.departamentoNome}.
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-2 text-[11px]">
                <strong className="text-gray-900 block font-bold">Resumo das Condições Contratadas:</strong>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div><strong>Vínculo:</strong> {viewingContract.tipo.replace('_', ' ')}</div>
                  <div><strong>Início de Funções:</strong> {viewingContract.dataInicio}</div>
                  <div><strong>Data de Termo:</strong> {viewingContract.dataTermo || 'Sem termo fixo'}</div>
                  <div><strong>Remuneração Base:</strong> {viewingContract.salarioMensalKz.toLocaleString('pt-AO')} Kz / mês</div>
                </div>
              </div>

              <div className="space-y-1.5 text-[10px] text-gray-600 leading-normal">
                <p>
                  <strong>Cláusula 1ª:</strong> O colaborador obriga-se a desempenhar as actividades pedagógicas ou administrativas inerentes ao seu cargo com assiduidade e sigilo profissional.
                </p>
                <p>
                  <strong>Cláusula 2ª:</strong> O trabalhador tem direito a férias anuais remuneradas de 22 dias úteis, subsídio de férias e protecção social (INSS).
                </p>
                <p>
                  <strong>Cláusula 3ª:</strong> Em caso de cessação contratual, aplicam-se as normas de aviso prévio e indemnização previstas na Lei Geral do Trabalho de Angola.
                </p>
              </div>

              {/* Adendas registadas */}
              {viewingContract.adendas && viewingContract.adendas.length > 0 && (
                <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200 text-[10px] space-y-1">
                  <strong className="text-blue-900 block">Adendas Contratuais Homologadas:</strong>
                  {viewingContract.adendas.map((ad) => (
                    <div key={ad.id} className="text-blue-800">
                      • {ad.dataAdenda}: {ad.descricao} (por {ad.registadoPor})
                    </div>
                  ))}
                </div>
              )}

              {/* Assinaturas */}
              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-[10px]">
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>Pela Entidade Patronal</strong>
                    <span className="block text-gray-500">{schoolName}</span>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-400 pt-1">
                    <strong>O(A) Trabalhador(a)</strong>
                    <span className="block text-gray-500">{viewingContract.colaboradorNome}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 no-print">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadContractText(viewingContract)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Descarregar (.txt)
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePrintContract}
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Imprimir Minuta
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setViewingContract(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Contrato */}
      {isNewContractOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <strong className="text-sm font-bold text-gray-900 block">Emitir Novo Contrato de Trabalho</strong>
              <button onClick={() => setIsNewContractOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewContract} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Colaborador Titular *</label>
                <select
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
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
                  <label className="block font-semibold text-gray-700 mb-1">Vínculo Contratual</label>
                  <select
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="termo_certo">Termo Certo</option>
                    <option value="tempo_indeterminado">Tempo Indeterminado (Efectivo)</option>
                    <option value="prestacao_servicos">Prestação de Serviços</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Salário Mensal (Kz) *</label>
                  <input
                    type="number"
                    min="50000"
                    step="5000"
                    required
                    value={newSalario}
                    onChange={(e) => setNewSalario(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    required
                    value={newDataInicio}
                    onChange={(e) => setNewDataInicio(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                {newTipo === 'termo_certo' && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Data de Termo</label>
                    <input
                      type="date"
                      required
                      value={newDataTermo}
                      onChange={(e) => setNewDataTermo(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsNewContractOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Gerar Contrato
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adenda ou Renovação Contratual */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div>
                <strong className="text-sm font-bold text-gray-900 block">
                  {modalAction === 'adenda' ? 'Registar Adenda ao Contrato' : 'Renovação de Contrato a Termo Certo'}
                </strong>
                <span className="text-[11px] text-gray-500">
                  {selectedContract.colaboradorNome} ({selectedContract.numeroContrato})
                </span>
              </div>
              <button onClick={() => setSelectedContract(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-3">
              {modalAction === 'renovacao' ? (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nova Data de Termo (Renovação LGT) *</label>
                  <input
                    type="date"
                    required
                    value={novaDataTermo}
                    onChange={(e) => setNovaDataTermo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Conforme o artigo 16º da Lei Geral do Trabalho de Angola, o contrato renovado prolonga os efeitos jurídicos e direitos adquiridos de antiguidade.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Descrição do Objeto da Adenda *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ex: Actualização salarial para 450.000 Kz e atribuição do cargo de Director de Turma..."
                    value={adendaDesc}
                    onChange={(e) => setAdendaDesc(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setSelectedContract(null)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  {modalAction === 'adenda' ? 'Gravar Adenda' : 'Confirmar Renovação'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
