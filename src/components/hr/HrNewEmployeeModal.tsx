import React, { useState } from 'react';
import { X, UserPlus, Building2, Briefcase, CreditCard, User } from 'lucide-react';
import { Employee, HrDepartment, HrJobPosition, EmploymentContractType, EmployeeType } from '../../types/humanResources';
import { Button } from '../ui/Button';

interface HrNewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: Omit<Employee, 'id' | 'dataCriacao' | 'ultimaActualizacao'>) => void;
  departments: HrDepartment[];
  jobPositions: HrJobPosition[];
}

export const HrNewEmployeeModal: React.FC<HrNewEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departments,
  jobPositions,
}) => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [genero, setGenero] = useState<'Masculino' | 'Feminino' | 'Outro'>('Masculino');
  const [dataNascimento, setDataNascimento] = useState('1990-01-01');
  const [tipoDocumento, setTipoDocumento] = useState<'BI' | 'Passaporte' | 'Cartão de Residente'>('BI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [dataValidadeDocumento, setDataValidadeDocumento] = useState('2032-12-31');
  const [nif, setNif] = useState('');
  const [numeroINSS, setNumeroINSS] = useState('');
  const [telefone, setTelefone] = useState('+244 9');
  const [emailInstitucional, setEmailInstitucional] = useState('');
  const [morada, setMorada] = useState('');
  const [municipio, setMunicipio] = useState('Maianga');
  const [provincia, setProvincia] = useState('Luanda');

  // Dados Profissionais
  const [departamentoId, setDepartamentoId] = useState(departments[0]?.id || 'hr-dep-doc');
  const [cargoId, setCargoId] = useState(jobPositions[0]?.id || 'job-003');
  const [tipoColaborador, setTipoColaborador] = useState<EmployeeType>('docente');
  const [tipoVinculo, setTipoVinculo] = useState<EmploymentContractType>('tempo_indeterminado');
  const [dataAdmissao, setDataAdmissao] = useState(new Date().toISOString().split('T')[0]);
  const [dataFimContrato, setDataFimContrato] = useState('');
  const [salarioBaseKz, setSalarioBaseKz] = useState<number>(350000);
  const [subsidioAlimentacaoKz, setSubsidioAlimentacaoKz] = useState<number>(30000);
  const [subsidioTransporteKz, setSubsidioTransporteKz] = useState<number>(30000);
  const [metodoPagamento, setMetodoPagamento] = useState<Employee['metodoPagamento']>('Transferência Bancária BAI');
  const [iban, setIban] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto || !numeroDocumento || !telefone) {
      setFormError('Por favor preencha os campos obrigatórios (Nome, BI e Telefone).');
      return;
    }
    setFormError('');

    const dept = departments.find((d) => d.id === departamentoId);
    const cargo = jobPositions.find((j) => j.id === cargoId);
    const mecanografico = `RH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    onSave({
      escolaId: 'esc-001',
      numeroMecanografico: mecanografico,
      nomeCompleto,
      genero,
      dataNascimento,
      nacionalidade: 'Angolana',
      tipoDocumento,
      numeroDocumento,
      dataValidadeDocumento,
      nif: nif || '5400000000',
      numeroINSS: numeroINSS || `INSS-${Math.floor(100000 + Math.random() * 900000)}-AO`,
      telefone,
      emailInstitucional: emailInstitucional || `${nomeCompleto.toLowerCase().replace(/\s+/g, '.')}@escola.edu.ao`,
      morada: morada || 'Luanda, Angola',
      municipio,
      provincia,
      contactosEmergencia: [],
      departamentoId,
      departamentoNome: dept?.nome || 'Geral',
      cargoId,
      cargoNome: cargo?.titulo || 'Colaborador',
      tipoColaborador,
      tipoVinculo,
      dataAdmissao,
      dataInicioFuncoes: dataAdmissao,
      dataFimContrato: tipoVinculo === 'termo_certo' ? dataFimContrato : undefined,
      estadoProfissional: 'activo',
      localTrabalho: 'Campus Central',
      horarioTrabalho: '07:30 - 15:30 (40h semanais)',
      qualificacoes: [
        {
          grau: 'Licenciatura',
          curso: 'Ensino / Especialidade',
          instituicao: 'Instituição de Ensino Superior',
          anoConclusao: 2018,
          pais: 'Angola',
        },
      ],
      competenciasPrincipais: ['Competências Profissionais Globais'],
      salarioBaseKz: Number(salarioBaseKz) || 300000,
      subsidioAlimentacaoKz: Number(subsidioAlimentacaoKz) || 30000,
      subsidioTransporteKz: Number(subsidioTransporteKz) || 30000,
      metodoPagamento,
      iban,
      saldoDiasFeriasAno: 22,
      taxaAssiduidadeMesPercent: 100,
      totalFaltasInjustificadasAno: 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
        <div className="p-5 bg-gradient-to-r from-[#012041] via-[#013366] to-[#015FC4] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="font-bold text-base text-white">Admitir Novo Colaborador</h3>
              <p className="text-xs text-blue-100">Registo de docentes, técnicos e funcionários administrativos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* 1. Dados Pessoais & BI */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#015FC4]" />
              <span>1. Identificação Pessoal</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  placeholder="Ex: Prof. André Manuel Muanza"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#015FC4]/20 focus:border-[#015FC4]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Género</label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Bilhete de Identidade (BI) *</label>
                <input
                  type="text"
                  required
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value.toUpperCase())}
                  placeholder="004128934LA045"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Validade do BI</label>
                <input
                  type="date"
                  value={dataValidadeDocumento}
                  onChange={(e) => setDataValidadeDocumento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Telefone Principal *</label>
                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="+244 923 000 000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Institucional</label>
                <input
                  type="email"
                  value={emailInstitucional}
                  onChange={(e) => setEmailInstitucional(e.target.value)}
                  placeholder="andre.muanza@escola.edu.ao"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* 2. Dados Profissionais */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#015FC4]" />
              <span>2. Atribuição de Departamento, Cargo & Vínculo</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Departamento</label>
                <select
                  value={departamentoId}
                  onChange={(e) => setDepartamentoId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Cargo a Exercer</label>
                <select
                  value={cargoId}
                  onChange={(e) => setCargoId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  {jobPositions.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.titulo} ({j.departamentoNome})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tipo de Colaborador</label>
                <select
                  value={tipoColaborador}
                  onChange={(e) => setTipoColaborador(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="docente">Docente / Professor</option>
                  <option value="administrativo">Administrativo / Secretaria / Finanças</option>
                  <option value="direccao">Direcção / Coordenação</option>
                  <option value="tecnico">Técnico Especialista / TI</option>
                  <option value="apoio">Apoio Geral / Limpeza / Portaria</option>
                  <option value="motorista">Motorista de Transporte Escolar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tipo de Vínculo Contratual</label>
                <select
                  value={tipoVinculo}
                  onChange={(e) => setTipoVinculo(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="tempo_indeterminado">Tempo Indeterminado (Efectivo)</option>
                  <option value="termo_certo">Termo Certo Resolutivo</option>
                  <option value="tempo_parcial">Tempo Parcial (Part-Time)</option>
                  <option value="prestacao_servicos">Prestação de Serviços</option>
                  <option value="estagio_profissional">Estágio Profissional</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Data de Admissão</label>
                <input
                  type="date"
                  value={dataAdmissao}
                  onChange={(e) => setDataAdmissao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              {tipoVinculo === 'termo_certo' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Data de Termo de Contrato</label>
                  <input
                    type="date"
                    value={dataFimContrato}
                    onChange={(e) => setDataFimContrato(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. Condições Remuneratórias */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Condições Remuneratórias (Kwanzas)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Salário Base Mensal (Kz) *</label>
                <input
                  type="number"
                  min="50000"
                  step="5000"
                  value={salarioBaseKz}
                  onChange={(e) => setSalarioBaseKz(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subsídio de Alimentação (Kz)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={subsidioAlimentacaoKz}
                  onChange={(e) => setSubsidioAlimentacaoKz(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subsídio de Transporte (Kz)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={subsidioTransporteKz}
                  onChange={(e) => setSubsidioTransporteKz(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<UserPlus className="w-3.5 h-3.5" />}>
              Admitir & Criar Ficha de Colaborador
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
