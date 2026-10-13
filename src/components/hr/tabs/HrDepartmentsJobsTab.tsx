import React, { useState } from 'react';
import {
  Building2,
  Briefcase,
  Layers,
  Users,
  Plus,
  ShieldCheck,
  ChevronRight,
  Info,
  Download,
  Printer,
} from 'lucide-react';
import { HrDepartment, HrJobPosition, Employee } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv } from '../../../utils/hrDocumentGenerator';

interface HrDepartmentsJobsTabProps {
  departments: HrDepartment[];
  jobPositions: HrJobPosition[];
  employees: Employee[];
  onAddDepartment: (dept: Omit<HrDepartment, 'id' | 'totalColaboradores'>) => void;
  onAddJobPosition: (job: Omit<HrJobPosition, 'id' | 'totalOcupantes'>) => void;
}

export const HrDepartmentsJobsTab: React.FC<HrDepartmentsJobsTabProps> = ({
  departments,
  jobPositions,
  employees,
  onAddDepartment,
  onAddJobPosition,
}) => {
  const [subTab, setSubTab] = useState<'departamentos' | 'cargos' | 'organograma'>('departamentos');
  const [isNewDeptOpen, setIsNewDeptOpen] = useState(false);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);

  // Form Dept
  const [deptNome, setDeptNome] = useState('');
  const [deptSigla, setDeptSigla] = useState('');
  const [deptResp, setDeptResp] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Form Job
  const [jobTitulo, setJobTitulo] = useState('');
  const [jobDeptId, setJobDeptId] = useState(departments[0]?.id || '');
  const [jobNivel, setJobNivel] = useState<HrJobPosition['nivelHierarquico']>('Docência');
  const [jobMinSal, setJobMinSal] = useState(250000);
  const [jobMaxSal, setJobMaxSal] = useState(400000);
  const [jobReq, setJobReq] = useState('');

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptNome) return;
    onAddDepartment({
      escolaId: 'esc-001',
      codigo: `DEP-${deptSigla.toUpperCase() || 'NOVO'}`,
      nome: deptNome,
      sigla: deptSigla.toUpperCase() || 'DEP',
      descricao: deptDesc,
      responsavelNome: deptResp || 'Por designar',
      activo: true,
    });
    setIsNewDeptOpen(false);
    setDeptNome('');
    setDeptSigla('');
    setDeptResp('');
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitulo) return;
    const dept = departments.find((d) => d.id === jobDeptId);
    onAddJobPosition({
      escolaId: 'esc-001',
      departamentoId: jobDeptId,
      departamentoNome: dept?.nome || 'Geral',
      titulo: jobTitulo,
      nivelHierarquico: jobNivel,
      descricaoFuncoes: 'Atribuições e responsabilidades operacionais e pedagógicas.',
      requisitosMinimos: jobReq || 'Habilitações literárias adequadas à função.',
      faixaSalarialMinKz: Number(jobMinSal) || 200000,
      faixaSalarialMaxKz: Number(jobMaxSal) || 350000,
      activo: true,
    });
    setIsNewJobOpen(false);
    setJobTitulo('');
    setJobReq('');
  };

  const handleExportDeptCsv = () => {
    const headers = ['Codigo', 'Sigla', 'Nome', 'Responsavel', 'Descricao', 'Total_Colaboradores'];
    const rows = departments.map((d) => {
      const count = employees.filter((e) => e.departamentoId === d.id && e.estadoProfissional !== 'cessado').length;
      return [d.codigo, d.sigla, d.nome, d.responsavelNome, d.descricao, count];
    });
    exportToCsv(`departamentos_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleExportJobCsv = () => {
    const headers = ['Cargo', 'Departamento', 'Nivel_Hierarquico', 'Salario_Min_Kz', 'Salario_Max_Kz', 'Requisitos'];
    const rows = jobPositions.map((j) => [
      j.titulo,
      j.departamentoNome,
      j.nivelHierarquico,
      j.faixaSalarialMinKz,
      j.faixaSalarialMaxKz,
      j.requisitosMinimos,
    ]);
    exportToCsv(`catalogo_cargos_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Sub-abas de Navegação */}
      <div className="flex border-b border-gray-200 bg-white px-4 pt-2 rounded-t-xl gap-4">
        <button
          onClick={() => setSubTab('departamentos')}
          className={`pb-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            subTab === 'departamentos'
              ? 'border-[#015FC4] text-[#015FC4]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departamentos da Escola ({departments.length})</span>
        </button>

        <button
          onClick={() => setSubTab('cargos')}
          className={`pb-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            subTab === 'cargos'
              ? 'border-[#015FC4] text-[#015FC4]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Catálogo de Cargos & Funções ({jobPositions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('organograma')}
          className={`pb-3 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            subTab === 'organograma'
              ? 'border-[#015FC4] text-[#015FC4]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Organograma Institucional</span>
        </button>
      </div>

      {/* Nota de distinção entre Cargo e Acesso Técnico */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#015FC4] shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Directriz Institucional de Segurança:</strong> Os cargos profissionais descrevem funções e competências no âmbito da instituição escolar. As permissões de acesso ao sistema de software são geridas separadamente pela matriz RBAC para garantir o princípio do menor privilégio.
        </span>
      </div>

      {/* ABA 1: DEPARTAMENTOS */}
      {subTab === 'departamentos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Estrutura de Departamentos Escolares</h4>
              <p className="text-gray-500 text-[11px]">
                Organização por direcção, áreas académicas, financeiras e apoio aos estudantes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportDeptCsv}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Exportar CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewDeptOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Criar Departamento
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const staffInDept = employees.filter(
                (e) => e.departamentoId === dept.id && e.estadoProfissional !== 'cessado'
              );
              return (
                <div key={dept.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold bg-[#015FC4]/10 text-[#015FC4] px-2 py-0.5 rounded">
                        {dept.sigla} · {dept.codigo}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Activo
                      </span>
                    </div>
                    <h5 className="font-bold text-gray-900 text-sm">{dept.nome}</h5>
                    <p className="text-gray-500 text-[11px] leading-snug">{dept.descricao}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Responsável:</span>
                      <strong className="text-gray-900 truncate max-w-[170px]">{dept.responsavelNome}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Colaboradores:</span>
                      <strong className="text-[#015FC4] font-mono">{staffInDept.length} pessoas</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: CARGOS & FUNÇÕES */}
      {subTab === 'cargos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Catálogo de Cargos, Funções & Enquadramento Salarial</h4>
              <p className="text-gray-500 text-[11px]">
                Definição de perfis de competência, requisitos e tabelas de referência remuneratória.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportJobCsv}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Exportar CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewJobOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Criar Cargo
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Cargo / Título</th>
                  <th className="py-3 px-4">Departamento</th>
                  <th className="py-3 px-4">Nível Hierárquico</th>
                  <th className="py-3 px-4 font-mono">Faixa Salarial de Referência (Kz)</th>
                  <th className="py-3 px-4 text-center">Ocupantes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobPositions.map((job) => {
                  const ocupantes = employees.filter(
                    (e) => e.cargoId === job.id && e.estadoProfissional !== 'cessado'
                  ).length;
                  return (
                    <tr key={job.id} className="hover:bg-blue-50/20">
                      <td className="py-3 px-4">
                        <strong className="text-gray-900 block font-semibold">{job.titulo}</strong>
                        <span className="text-[10px] text-gray-400 block line-clamp-1">{job.requisitosMinimos}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{job.departamentoNome}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                          {job.nivelHierarquico}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-800">
                        {job.faixaSalarialMinKz.toLocaleString('pt-AO')} - {job.faixaSalarialMaxKz.toLocaleString('pt-AO')} Kz
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono text-[#015FC4]">
                        {ocupantes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: ORGANOGRAMA INSTITUCIONAL */}
      {subTab === 'organograma' && (
        <div id="hr-printable-area" className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Organograma Funcional da Instituição de Ensino</h4>
              <p className="text-gray-500 text-[11px]">
                Hierarquia de coordenação executiva e reporte funcional dos departamentos.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              icon={<Printer className="w-3.5 h-3.5" />}
              className="no-print"
            >
              Imprimir Organograma
            </Button>
          </div>

          {/* Nível 1: Direcção Geral */}
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-r from-[#012041] to-[#015FC4] text-white rounded-xl shadow-md text-center min-w-[280px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Nível Superior</span>
              <strong className="text-sm block mt-0.5">Direcção Geral & Administração</strong>
              <span className="text-[11px] text-blue-100 block">Dr. Paulo Sebastião Afonso</span>
            </div>
          </div>

          <div className="w-0.5 h-6 bg-gray-300 mx-auto" />

          {/* Nível 2: Coordenação Pedagógica & Direcção Financeira/RH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="p-4 bg-teal-50 border-2 border-teal-500 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-teal-800 block">Pelouro Pedagógico</span>
              <strong className="text-xs text-teal-950 block">Coordenação Pedagógica & Académica</strong>
              <span className="text-[11px] text-teal-700 block">Prof.ª Teresa Samakaka</span>
              <div className="pt-2 text-[10px] text-gray-600 border-t border-teal-200 mt-2">
                Supervisão de: Corpo Docente (42 Professores) & Avaliações
              </div>
            </div>

            <div className="p-4 bg-purple-50 border-2 border-purple-500 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-purple-800 block">Pelouro Administrativo & Apoio</span>
              <strong className="text-xs text-purple-950 block">Secretaria, Tesouraria & RH</strong>
              <span className="text-[11px] text-purple-700 block">Dra. Maria Vunge / Dr. António Bento</span>
              <div className="pt-2 text-[10px] text-gray-600 border-t border-purple-200 mt-2">
                Supervisão de: Matrículas, Cobranças, Folha Salarial & Manutenção
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Departamento */}
      {isNewDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Criar Novo Departamento</h4>
            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nome do Departamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Biblioteca & Recursos Multimédia"
                  value={deptNome}
                  onChange={(e) => setDeptNome(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sigla</label>
                  <input
                    type="text"
                    placeholder="BIB"
                    value={deptSigla}
                    onChange={(e) => setDeptSigla(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Responsável Directo</label>
                  <input
                    type="text"
                    placeholder="Nome do Responsável"
                    value={deptResp}
                    onChange={(e) => setDeptResp(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Finalidade e âmbito de actuação..."
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsNewDeptOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Gravar Departamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Cargo */}
      {isNewJobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4">
            <h4 className="font-bold text-gray-900 text-sm">Criar Cargo no Catálogo</h4>
            <form onSubmit={handleCreateJob} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Título do Cargo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Professor de Informática"
                  value={jobTitulo}
                  onChange={(e) => setJobTitulo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Departamento</label>
                  <select
                    value={jobDeptId}
                    onChange={(e) => setJobDeptId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nível</label>
                  <select
                    value={jobNivel}
                    onChange={(e) => setJobNivel(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg"
                  >
                    <option value="Direcção">Direcção</option>
                    <option value="Coordenação">Coordenação</option>
                    <option value="Docência">Docência</option>
                    <option value="Técnico Especialista">Técnico Especialista</option>
                    <option value="Operacional & Apoio">Operacional & Apoio</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Salário Mínimo (Kz)</label>
                  <input
                    type="number"
                    value={jobMinSal}
                    onChange={(e) => setJobMinSal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Salário Máximo (Kz)</label>
                  <input
                    type="number"
                    value={jobMaxSal}
                    onChange={(e) => setJobMaxSal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsNewJobOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Gravar Cargo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
