import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  UserMinus,
  Download,
  GraduationCap,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Printer,
  X,
  Calendar,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { Employee, HrDepartment, HrJobPosition, OffboardingRecord } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { Badge, StatusVariant } from '../../ui/Badge';
import { Card } from '../../ui/Card';

interface HrEmployeesTabProps {
  employees: Employee[];
  departments: HrDepartment[];
  jobPositions: HrJobPosition[];
  onSelectEmployee: (emp: Employee) => void;
  onOpenNewModal: () => void;
  onQuickClock?: (colaboradorId: string, tipo: 'entrada' | 'saida') => void;
  onQuickTerminate?: (colaboradorId: string, offboarding: OffboardingRecord) => void;
  schoolName?: string;
}

export const HrEmployeesTab: React.FC<HrEmployeesTabProps> = ({
  employees,
  departments,
  jobPositions,
  onSelectEmployee,
  onOpenNewModal,
  onQuickClock,
  onQuickTerminate,
  schoolName = 'EduGest Angola',
}) => {
  // Estados de Filtros e Pesquisa
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('todos');
  const [selectedCargo, setSelectedCargo] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedType, setSelectedType] = useState('todos');
  const [selectedVinculo, setSelectedVinculo] = useState('todos');

  // Paginação e Ordenação
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [sortField, setSortField] = useState<'nome' | 'numeroMecanografico' | 'dataAdmissao'>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modais rápidos e dropdown de acções
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [quickClockEmp, setQuickClockEmp] = useState<Employee | null>(null);
  const [clockType, setClockType] = useState<'entrada' | 'saida'>('entrada');
  const [quickCessationEmp, setQuickCessationEmp] = useState<Employee | null>(null);
  const [cessationMotivo, setCessationMotivo] = useState<OffboardingRecord['motivo']>('Fim de Contrato');
  const [cessationData, setCessationData] = useState(new Date().toISOString().split('T')[0]);
  const [cessationObs, setCessationObs] = useState('');

  // Lista dinâmica de cargos filtrados pelo departamento seleccionado
  const availablePositions = useMemo(() => {
    if (selectedDept === 'todos') {
      return jobPositions;
    }
    return jobPositions.filter((pos) => pos.departamentoId === selectedDept);
  }, [jobPositions, selectedDept]);

  // Contadores para chips rápidos de estado no padrão visual do EduGest
  const counts = useMemo(() => {
    return {
      todos: employees.length,
      activos: employees.filter((e) => e.estadoProfissional === 'activo').length,
      docentes: employees.filter((e) => e.tipoColaborador === 'docente').length,
      naoDocentes: employees.filter((e) => e.tipoColaborador !== 'docente').length,
      experimental: employees.filter((e) => e.estadoProfissional === 'periodo_experimental').length,
      cessados: employees.filter((e) => e.estadoProfissional === 'cessado').length,
    };
  }, [employees]);

  // Handler de mudança de departamento que actualiza os cargos disponíveis
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDept(deptId);
    setCurrentPage(1);
    // Se o cargo seleccionado anteriormente não pertence ao novo departamento, resetar para 'todos'
    if (deptId !== 'todos') {
      const existsInDept = jobPositions.some(
        (pos) => pos.departamentoId === deptId && (pos.id === selectedCargo || pos.titulo === selectedCargo)
      );
      if (!existsInDept) {
        setSelectedCargo('todos');
      }
    }
  };

  // Filtragem composta
  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Pesquisa por texto
      const cleanSearch = searchTerm.trim().toLowerCase();
      const matchSearch =
        !cleanSearch ||
        emp.nomeCompleto.toLowerCase().includes(cleanSearch) ||
        emp.numeroMecanografico.toLowerCase().includes(cleanSearch) ||
        emp.numeroDocumento.toLowerCase().includes(cleanSearch) ||
        emp.telefone.includes(cleanSearch) ||
        emp.emailInstitucional.toLowerCase().includes(cleanSearch);

      // 2. Filtro por Departamento
      const matchDept = selectedDept === 'todos' || emp.departamentoId === selectedDept;

      // 3. Filtro por Cargo
      const matchCargo =
        selectedCargo === 'todos' ||
        emp.cargoId === selectedCargo ||
        emp.cargoNome.toLowerCase() === selectedCargo.toLowerCase();

      // 4. Filtro por Estado
      const matchStatus = selectedStatus === 'todos' || emp.estadoProfissional === selectedStatus;

      // 5. Filtro por Tipo de Colaborador (Docente / Não Docente)
      const matchType =
        selectedType === 'todos'
          ? true
          : selectedType === 'docente'
          ? emp.tipoColaborador === 'docente'
          : emp.tipoColaborador !== 'docente';

      // 6. Filtro por Vínculo Contratual
      const matchVinculo = selectedVinculo === 'todos' || emp.tipoVinculo === selectedVinculo;

      return matchSearch && matchDept && matchCargo && matchStatus && matchType && matchVinculo;
    });
  }, [employees, searchTerm, selectedDept, selectedCargo, selectedStatus, selectedType, selectedVinculo]);

  // Ordenação dos dados filtrados
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: string = '';
      let valB: string = '';

      if (sortField === 'nome') {
        valA = a.nomeCompleto.toLowerCase();
        valB = b.nomeCompleto.toLowerCase();
      } else if (sortField === 'numeroMecanografico') {
        valA = a.numeroMecanografico.toLowerCase();
        valB = b.numeroMecanografico.toLowerCase();
      } else if (sortField === 'dataAdmissao') {
        valA = a.dataAdmissao;
        valB = b.dataAdmissao;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // Reset de todos os filtros
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDept('todos');
    setSelectedCargo('todos');
    setSelectedStatus('todos');
    setSelectedType('todos');
    setSelectedVinculo('todos');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedDept !== 'todos' ||
    selectedCargo !== 'todos' ||
    selectedStatus !== 'todos' ||
    selectedType !== 'todos' ||
    selectedVinculo !== 'todos';

  // Cálculo da antiguidade a partir da data de admissão
  const calculateAntiquity = (dataAdmissao: string) => {
    try {
      const start = new Date(dataAdmissao);
      const now = new Date();
      if (isNaN(start.getTime())) return '-';
      const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      if (months < 1) return 'Menos de 1 mês';
      if (months < 12) return `${months} m${months === 1 ? 'ês' : 'eses'}`;
      const years = Math.floor(months / 12);
      const remMonths = months % 12;
      return remMonths > 0 ? `${years} a, ${remMonths} m` : `${years} ano${years > 1 ? 's' : ''}`;
    } catch {
      return '-';
    }
  };

  // Mapeamento de variantes do Badge para Estado Profissional
  const getStatusBadge = (estado: Employee['estadoProfissional']) => {
    switch (estado) {
      case 'activo':
        return <Badge variant="success" size="sm">Activo</Badge>;
      case 'periodo_experimental':
        return <Badge variant="warning" size="sm">Em Experiência</Badge>;
      case 'ferias':
        return <Badge variant="primary" size="sm">Em Férias</Badge>;
      case 'suspenso':
        return <Badge variant="error" size="sm">Suspenso</Badge>;
      case 'cessado':
        return <Badge variant="neutral" size="sm">Cessado</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{estado}</Badge>;
    }
  };

  // Exportação para formato CSV compatível com Angola e Excel
  const exportCsv = () => {
    const headers = [
      'Nº Mecanográfico',
      'Nome Completo',
      'Departamento',
      'Cargo / Função',
      'Tipo de Perfil',
      'Vínculo Contratual',
      'BI / Documento',
      'Nº INSS',
      'Telefone',
      'Email Institucional',
      'Data de Admissão',
      'Salário Base (Kz)',
      'Estado Profissional',
    ];

    const rows = sorted.map((e) => [
      `"${e.numeroMecanografico}"`,
      `"${e.nomeCompleto.replace(/"/g, '""')}"`,
      `"${e.departamentoNome.replace(/"/g, '""')}"`,
      `"${e.cargoNome.replace(/"/g, '""')}"`,
      `"${e.tipoColaborador === 'docente' ? 'Docente' : 'Não Docente'}"`,
      `"${e.tipoVinculo.replace('_', ' ')}"`,
      `"${e.numeroDocumento}"`,
      `"${e.numeroINSS}"`,
      `"${e.telefone}"`,
      `"${e.emailInstitucional}"`,
      `"${e.dataAdmissao}"`,
      e.salarioBaseKz,
      `"${e.estadoProfissional}"`,
    ]);

    // BOM UTF-8 (\uFEFF) para visualização correta de acentos no Excel
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `edugest_colaboradores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Impressão da listagem actual
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* 1. Chips de Filtragem Rápida no Padrão EduGest */}
      <div className="flex border-b border-[#E2E8F0] gap-2 overflow-x-auto bg-white rounded-xl p-2 shadow-2xs">
        <button
          onClick={() => {
            setSelectedStatus('todos');
            setSelectedType('todos');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedStatus === 'todos' && selectedType === 'todos'
              ? 'bg-[#012041] text-white shadow-xs'
              : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-100'
          }`}
        >
          <span>Todos Colaboradores</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedStatus === 'todos' && selectedType === 'todos'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-[#41515D]'
            }`}
          >
            {counts.todos}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedStatus('activo');
            setSelectedType('todos');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedStatus === 'activo'
              ? 'bg-[#015FC4] text-white shadow-xs'
              : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Activos</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedStatus === 'activo' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            {counts.activos}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedType('docente');
            setSelectedStatus('todos');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedType === 'docente'
              ? 'bg-[#015FC4] text-white shadow-xs'
              : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Corpo Docente (Professores)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedType === 'docente' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#41515D]'
            }`}
          >
            {counts.docentes}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedType('nao_docente');
            setSelectedStatus('todos');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedType === 'nao_docente'
              ? 'bg-[#015FC4] text-white shadow-xs'
              : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Não Docentes (Apoio & Adm.)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedType === 'nao_docente' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#41515D]'
            }`}
          >
            {counts.naoDocentes}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedStatus('periodo_experimental');
            setSelectedType('todos');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedStatus === 'periodo_experimental'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Período Experimental</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedStatus === 'periodo_experimental' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {counts.experimental}
          </span>
        </button>

        <button
          onClick={() => {
            setSelectedStatus('cessado');
            setSelectedType('todos');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedStatus === 'cessado'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-[#41515D] hover:text-[#012041] hover:bg-slate-100'
          }`}
        >
          <UserMinus className="w-3.5 h-3.5" />
          <span>Cessados / Histórico</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedStatus === 'cessado' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-800'
            }`}
          >
            {counts.cessados}
          </span>
        </button>
      </div>

      {/* 2. Barra de Filtros e Pesquisa Estruturada */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
        {/* Linha 1: Pesquisa + Botões de Acção Primária */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, nº mecanográfico, BI ou contacto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-9 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] text-[#012041] placeholder:text-[#8EA5B8]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={exportCsv}
              icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />}
              title="Exportar dados filtrados em formato CSV/Excel"
            >
              Exportar CSV
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer className="w-3.5 h-3.5 text-slate-700" />}
              title="Imprimir grelha filtrada"
            >
              Imprimir
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onOpenNewModal}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Admitir Colaborador
            </Button>
          </div>
        </div>

        {/* Linha 2: Dropdowns de Filtro com Departamento e Cargo em destaque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Filtro por Departamento */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#41515D] mb-1">
              Departamento
            </label>
            <select
              value={selectedDept}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] text-[#012041] bg-white cursor-pointer"
            >
              <option value="todos">Todos os Departamentos ({departments.length})</option>
              {departments.map((d) => {
                const count = employees.filter((e) => e.departamentoId === d.id).length;
                return (
                  <option key={d.id} value={d.id}>
                    {d.nome} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filtro por Cargo / Função (Conectado ao Departamento) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#41515D] mb-1">
              Cargo / Função
            </label>
            <select
              value={selectedCargo}
              onChange={(e) => {
                setSelectedCargo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-semibold border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] text-[#012041] bg-white cursor-pointer"
            >
              <option value="todos">
                {selectedDept === 'todos' ? 'Todos os Cargos' : 'Todos do Departamento'}
              </option>
              {availablePositions.map((pos) => {
                const count = employees.filter((e) => e.cargoId === pos.id || e.cargoNome === pos.titulo).length;
                return (
                  <option key={pos.id} value={pos.id}>
                    {pos.titulo} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filtro por Perfil (Docente / Não Docente) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#41515D] mb-1">
              Perfil Institucional
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-semibold border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] text-[#012041] bg-white cursor-pointer"
            >
              <option value="todos">Todos os Perfis</option>
              <option value="docente">Professores (Corpo Docente)</option>
              <option value="nao_docente">Pessoal Não Docente</option>
            </select>
          </div>

          {/* Filtro por Vínculo Contratual */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#41515D] mb-1">
              Vínculo Contratual
            </label>
            <select
              value={selectedVinculo}
              onChange={(e) => {
                setSelectedVinculo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-semibold border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] text-[#012041] bg-white cursor-pointer"
            >
              <option value="todos">Todos os Vínculos</option>
              <option value="tempo_indeterminado">Tempo Indeterminado (Efectivo)</option>
              <option value="termo_certo">Termo Certo Resolutivo</option>
              <option value="comissao_servico">Comissão de Serviço</option>
              <option value="estagio">Estágio Profissional</option>
            </select>
          </div>

          {/* Filtro por Estado Profissional */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#41515D] mb-1">
              Estado Profissional
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs font-semibold border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4] text-[#012041] bg-white cursor-pointer"
              >
                <option value="todos">Todos os Estados</option>
                <option value="activo">Activo</option>
                <option value="periodo_experimental">Período Experimental</option>
                <option value="ferias">Em Férias</option>
                <option value="suspenso">Suspenso</option>
                <option value="cessado">Cessado / Desligado</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-2 py-1.5 text-xs rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1 shrink-0 font-medium cursor-pointer"
                  title="Limpar todos os filtros"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de Pesquisa ou Filtros Activos */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-[#015FC4] gap-2">
            <span>
              A mostrar <strong>{filtered.length}</strong> de <strong>{employees.length}</strong> colaboradores que correspondem aos critérios seleccionados.
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#015FC4] hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Limpar filtros activos
            </button>
          </div>
        )}
      </div>

      {/* 3. Tabela Principal de Colaboradores (Desktop) e Cards (Mobile) */}
      <div id="hr-printable-area" className="space-y-4">
        {/* Cabeçalho oficial exclusivo para impressão */}
        <div className="hidden print:block mb-4 pb-3 border-b-2 border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">República de Angola · Ministério da Educação</p>
              <h2 className="text-base font-bold text-gray-900">{schoolName}</h2>
              <p className="text-xs text-gray-700 font-medium">Direcção de Recursos Humanos · Relação Nominal do Quadro de Pessoal</p>
            </div>
            <div className="text-right text-[10px] text-gray-600 font-mono">
              Data de Emissão: {new Date().toLocaleDateString('pt-AO')}
              <br />
              Total Listado: {filtered.length} Colaboradores
            </div>
          </div>
        </div>

        <Card noPadding className="overflow-hidden">
        {/* Vista Desktop (Tabela no padrão EduGest) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-[#E2E8F0] text-[#012041]">
                <th
                  onClick={() => {
                    if (sortField === 'numeroMecanografico') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('numeroMecanografico');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-200/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Nº Mec. & Colaborador</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Departamento & Cargo</th>
                <th className="py-3 px-4 font-semibold">Vínculo Contratual</th>
                <th className="py-3 px-4 font-semibold">Contactos</th>
                <th className="py-3 px-4 font-semibold">BI / NIF & INSS</th>
                <th
                  onClick={() => {
                    if (sortField === 'dataAdmissao') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('dataAdmissao');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-200/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Admissão & Antiguidade</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Responsável Directo</th>
                <th className="py-3 px-4 font-semibold text-center">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Operações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginated.length > 0 ? (
                paginated.map((emp) => {
                  const initials = emp.nomeCompleto
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  const isMenuOpen = activeActionMenuId === emp.id;

                  return (
                    <tr key={emp.id} className="hover:bg-blue-50/20 transition-colors group">
                      {/* Coluna 1: Foto, Nome e Mecanográfico */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#012041] to-[#015FC4] text-white shrink-0 flex items-center justify-center font-bold text-xs border border-white shadow-2xs">
                            {emp.fotografiaUrl ? (
                              <img src={emp.fotografiaUrl} alt={emp.nomeCompleto} className="w-full h-full object-cover" />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectEmployee(emp)}
                              className="text-left font-bold text-[#012041] hover:text-[#015FC4] transition-colors cursor-pointer block leading-tight"
                            >
                              {emp.nomeCompleto}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                {emp.numeroMecanografico}
                              </span>
                              {emp.genero && (
                                <span className="text-[10px] text-slate-400 capitalize">
                                  {emp.genero === 'Masculino' ? 'M' : 'F'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Coluna 2: Cargo e Departamento */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#012041] block leading-tight">
                          {emp.cargoNome}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-[#41515D] mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{emp.departamentoNome}</span>
                        </div>
                      </td>

                      {/* Coluna 3: Vínculo Contratual & Regime */}
                      <td className="py-3 px-4">
                        <span className="text-[#012041] font-medium capitalize block">
                          {emp.tipoVinculo.replace('_', ' ')}
                        </span>
                        <div className="mt-1 flex items-center gap-1">
                          {emp.tipoColaborador === 'docente' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] text-teal-800 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              <GraduationCap className="w-2.5 h-2.5 text-teal-600" /> Corpo Docente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] text-slate-700 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              <Briefcase className="w-2.5 h-2.5 text-slate-500" /> Não Docente
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Coluna 4: Contactos */}
                      <td className="py-3 px-4 text-[#41515D]">
                        <div className="flex items-center gap-1 text-[11px] font-medium">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <a href={`tel:${emp.telefone}`} className="hover:text-[#015FC4]">
                            {emp.telefone}
                          </a>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span title={emp.emailInstitucional}>{emp.emailInstitucional}</span>
                        </div>
                      </td>

                      {/* Coluna 5: BI / NIF e INSS */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <span className="block font-semibold text-[11px]">{emp.numeroDocumento}</span>
                        <span className="block text-[10px] text-slate-400">INSS: {emp.numeroINSS || '-'}</span>
                      </td>

                      {/* Coluna 6: Admissão e Antiguidade */}
                      <td className="py-3 px-4 text-slate-700">
                        <span className="block font-mono text-[11px]">{emp.dataAdmissao}</span>
                        <span className="block text-[10px] text-slate-500 font-medium">
                          {calculateAntiquity(emp.dataAdmissao)}
                        </span>
                      </td>

                      {/* Coluna 7: Responsável Directo */}
                      <td className="py-3 px-4 text-[#41515D] text-[11px]">
                        <span className="font-medium text-[#012041] block">
                          {emp.responsavelDirectoNome || 'Chefia de Departamento'}
                        </span>
                      </td>

                      {/* Coluna 8: Estado */}
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(emp.estadoProfissional)}
                      </td>

                      {/* Coluna 9: Operações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 relative">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onSelectEmployee(emp)}
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Ficha
                          </Button>

                          {/* Botão de Menu de Acções Rápidas */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveActionMenuId(isMenuOpen ? null : emp.id)
                              }
                              className="p-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-100 text-[#012041] transition-colors cursor-pointer"
                              title="Mais opções rápidas"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Popover */}
                            {isMenuOpen && (
                              <div
                                onMouseLeave={() => setActiveActionMenuId(null)}
                                className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-20 py-1 text-left text-xs"
                              >
                                <button
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    onSelectEmployee(emp);
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-[#012041] cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#015FC4]" />
                                  <span>Ver Ficha Completa</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setQuickClockEmp(emp);
                                    setClockType('entrada');
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-[#012041] cursor-pointer"
                                >
                                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Registar Ponto Rápido</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    window.print();
                                  }}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-[#012041] cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Imprimir Ficha</span>
                                </button>

                                {emp.estadoProfissional !== 'cessado' && (
                                  <button
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      setQuickCessationEmp(emp);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-700 cursor-pointer border-t border-slate-100"
                                  >
                                    <UserMinus className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Cessar Funções</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#41515D]">
                    <div className="max-w-xs mx-auto space-y-2">
                      <AlertCircle className="w-8 h-8 text-[#8EA5B8] mx-auto" />
                      <p className="font-semibold text-[#012041]">Nenhum colaborador encontrado</p>
                      <p className="text-[11px] text-[#41515D]">
                        Tente ajustar a pesquisa ou seleccionar outro departamento/cargo nos filtros acima.
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResetFilters}
                          icon={<RotateCcw className="w-3 h-3" />}
                        >
                          Limpar Todos os Filtros
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Mobile: Cartões com o mesmo padrão e riqueza de informação */}
        <div className="md:hidden divide-y divide-[#E2E8F0]">
          {paginated.length > 0 ? (
            paginated.map((emp) => {
              const initials = emp.nomeCompleto
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0])
                .join('')
                .toUpperCase();

              return (
                <div key={emp.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#012041] to-[#015FC4] text-white shrink-0 flex items-center justify-center font-bold text-xs border border-white shadow-2xs">
                        {emp.fotografiaUrl ? (
                          <img src={emp.fotografiaUrl} alt={emp.nomeCompleto} className="w-full h-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-[#012041] block">
                          {emp.nomeCompleto}
                        </strong>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#41515D]">
                          <span className="font-mono bg-slate-100 px-1 rounded text-[11px]">
                            {emp.numeroMecanografico}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-[#015FC4]">{emp.cargoNome}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(emp.estadoProfissional)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#41515D] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Departamento</span>
                      <span className="font-semibold text-[#012041]">{emp.departamentoNome}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Vínculo</span>
                      <span className="capitalize">{emp.tipoVinculo.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Contacto</span>
                      <a href={`tel:${emp.telefone}`} className="font-mono text-[#015FC4]">
                        {emp.telefone}
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Admissão</span>
                      <span className="font-mono">{emp.dataAdmissao}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setQuickClockEmp(emp);
                        setClockType('entrada');
                      }}
                      icon={<Clock className="w-3.5 h-3.5" />}
                    >
                      Ponto
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectEmployee(emp)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Ver Ficha Completa
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[#41515D] text-xs">
              <AlertCircle className="w-8 h-8 text-[#8EA5B8] mx-auto mb-2" />
              <p className="font-semibold text-[#012041]">Nenhum colaborador encontrado</p>
            </div>
          )}
        </div>

        {/* 4. Rodapé e Controlo de Paginação Oficial EduGest */}
        <div className="p-4 bg-slate-50/80 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#41515D]">
          <div className="flex items-center gap-3">
            <span>
              A mostrar <strong>{paginated.length}</strong> de <strong>{sorted.length}</strong> colaboradores filtrados (Total registado: <strong>{employees.length}</strong>)
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-[11px] text-slate-500">Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-xs border border-[#E2E8F0] rounded-md bg-white font-semibold text-[#012041] cursor-pointer"
              >
                <option value={8}>8</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1 font-medium text-[#012041] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="font-mono text-xs px-2.5 py-1 rounded bg-white border border-[#E2E8F0] text-[#012041] font-bold">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1 font-medium text-[#012041] cursor-pointer"
            >
              <span>Seguinte</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Assinaturas na Impressão Oficial */}
      <div className="hidden print:grid grid-cols-2 gap-8 text-center text-xs mt-8 pt-6 border-t border-gray-300">
        <div>
          <div className="border-b border-gray-400 w-48 mx-auto mb-1.5" />
          <p className="font-bold text-gray-900">O Técnico de Recursos Humanos</p>
          <p className="text-[10px] text-gray-500">EduGest Angola</p>
        </div>
        <div>
          <div className="border-b border-gray-400 w-48 mx-auto mb-1.5" />
          <p className="font-bold text-gray-900">A Direcção da Instituição</p>
          <p className="text-[10px] text-gray-500">Visto & Homologação</p>
        </div>
      </div>
    </div>

      {/* 5. Modal Rápido de Registo de Ponto / Presença */}
      {quickClockEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden">
            <div className="p-4 bg-[#012041] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold">Registar Ponto Rápido</h3>
              </div>
              <button
                onClick={() => setQuickClockEmp(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#015FC4] text-white flex items-center justify-center font-bold">
                  {quickClockEmp.nomeCompleto.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-[#012041] text-sm">{quickClockEmp.nomeCompleto}</div>
                  <div className="text-[11px] text-[#41515D]">
                    {quickClockEmp.numeroMecanografico} · {quickClockEmp.cargoNome}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#012041] mb-1">Tipo de Marcação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClockType('entrada')}
                    className={`py-2 rounded-lg font-bold text-xs border cursor-pointer transition-all ${
                      clockType === 'entrada'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Entrada no Turno
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockType('saida')}
                    className={`py-2 rounded-lg font-bold text-xs border cursor-pointer transition-all ${
                      clockType === 'saida'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Saída do Turno
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Horário registado: <strong>{new Date().toLocaleTimeString('pt-AO')}</strong> de hoje ({new Date().toLocaleDateString('pt-AO')}). A marcação ficará imediatamente vinculada ao histórico de assiduidade do colaborador.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setQuickClockEmp(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onQuickClock) {
                      onQuickClock(quickClockEmp.id, clockType);
                    }
                    setQuickClockEmp(null);
                  }}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Confirmar Marcação
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal de Cessação Rápida com Registo de Motivo Legal */}
      {quickCessationEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="p-4 bg-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-rose-200" />
                <h3 className="text-sm font-bold">Processo de Cessação de Colaboração</h3>
              </div>
              <button
                onClick={() => setQuickCessationEmp(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-700 text-white flex items-center justify-center font-bold">
                  {quickCessationEmp.nomeCompleto.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-rose-950 text-sm">{quickCessationEmp.nomeCompleto}</div>
                  <div className="text-[11px] text-rose-700 font-mono">
                    Nº Mec: {quickCessationEmp.numeroMecanografico} · {quickCessationEmp.cargoNome}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#012041] mb-1">Motivo Legal da Desvinculação</label>
                <select
                  value={cessationMotivo}
                  onChange={(e) => setCessationMotivo(e.target.value as OffboardingRecord['motivo'])}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#012041] bg-white cursor-pointer"
                >
                  <option value="Fim de Contrato">Fim de Contrato a Termo Certo</option>
                  <option value="Rescisão pelo Colaborador">Rescisão por Iniciativa do Colaborador (Demissão)</option>
                  <option value="Rescisão por Justa Causa">Despedimento com Justa Causa (Processo Disciplinar)</option>
                  <option value="Mútuo Acordo">Revogação por Mútuo Acordo das Partes</option>
                  <option value="Reforma">Aposentação / Reforma por Velhice</option>
                  <option value="Outro">Outro Motivo Legalmente Previsto</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#012041] mb-1">Data Efetiva de Saída</label>
                <input
                  type="date"
                  value={cessationData}
                  onChange={(e) => setCessationData(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#012041] bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#012041] mb-1">Observações e Registo de Quitação</label>
                <textarea
                  rows={2}
                  value={cessationObs}
                  onChange={(e) => setCessationObs(e.target.value)}
                  placeholder="Informações sobre entrega de material escolar, termos de quitação e revogação de acessos..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs text-[#012041]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => setQuickCessationEmp(null)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onQuickTerminate) {
                      const offboarding: OffboardingRecord = {
                        dataSaida: cessationData,
                        motivo: cessationMotivo,
                        responsavelSaida: 'Direcção de Recursos Humanos',
                        checklistDevolucao: {
                          equipamentosInformaticos: true,
                          chavesEInstalacoes: true,
                          crachaIdentificacao: true,
                          passesETelefones: true,
                          pautasEDocumentacaoPedagogica: true,
                        },
                        observacoes: cessationObs,
                        documentoTermoQuitacao: `QUITACAO-${quickCessationEmp.numeroMecanografico}.pdf`,
                      };
                      onQuickTerminate(quickCessationEmp.id, offboarding);
                    }
                    setQuickCessationEmp(null);
                  }}
                  className="bg-rose-700 hover:bg-rose-800"
                >
                  Confirmar Cessação
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
