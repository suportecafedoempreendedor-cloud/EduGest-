import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Users,
  CreditCard,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Employee, EmploymentContract, PayrollPeriod, LeaveRequest } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv, defaultSchoolHeader } from '../../../utils/hrDocumentGenerator';

interface HrReportsTabProps {
  employees: Employee[];
  contracts: EmploymentContract[];
  payrollPeriods: PayrollPeriod[];
  leaves: LeaveRequest[];
  schoolName?: string;
}

export const HrReportsTab: React.FC<HrReportsTabProps> = ({
  employees,
  contracts,
  payrollPeriods,
  leaves,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [selectedReport, setSelectedReport] = useState<'quadro' | 'ferias' | 'fiscal_irt' | 'assiduidade'>('quadro');

  const activeEmployees = employees.filter((e) => e.estadoProfissional !== 'cessado');
  const latestPayroll = payrollPeriods[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'quadro') {
      headers = [
        'Numero_Mecanografico',
        'Nome',
        'Cargo',
        'Departamento',
        'Vinculo',
        'BI',
        'Telefone',
        'Salario_Base_Kz',
        'Estado',
      ];
      rows = activeEmployees.map((e) => [
        e.numeroMecanografico,
        e.nomeCompleto,
        e.cargoNome,
        e.departamentoNome,
        e.tipoVinculo,
        e.numeroDocumento,
        e.telefone,
        e.salarioBaseKz,
        e.estadoProfissional,
      ]);
    } else if (selectedReport === 'ferias') {
      headers = ['Colaborador', 'Cargo', 'Tipo', 'Data_Inicio', 'Data_Fim', 'Dias_Uteis', 'Estado'];
      rows = leaves.map((l) => [
        l.colaboradorNome,
        l.cargoNome,
        l.tipo,
        l.dataInicio,
        l.dataFim,
        l.totalDiasUteis,
        l.estado,
      ]);
    } else if (selectedReport === 'fiscal_irt' && latestPayroll) {
      headers = [
        'Colaborador',
        'Numero_INSS',
        'NIF',
        'Salario_Base_Kz',
        'INSS_Trabalhador_3_Kz',
        'IRT_Retido_Kz',
        'Salario_Liquido_Kz',
      ];
      rows = latestPayroll.recibos.map((r) => [
        r.colaboradorNome,
        r.numeroINSS,
        r.nif,
        r.salarioBaseKz,
        r.inssTrabalhador3PercentKz,
        r.irtRetidoKz,
        r.salarioLiquidoKz,
      ]);
    } else {
      headers = ['Colaborador', 'Cargo', 'Departamento', 'Taxa_Assiduidade_Percent', 'Faltas_Ano'];
      rows = activeEmployees.map((e) => [
        e.nomeCompleto,
        e.cargoNome,
        e.departamentoNome,
        `${e.taxaAssiduidadeMesPercent}%`,
        e.totalFaltasInjustificadasAno,
      ]);
    }

    exportToCsv(`relatorio_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Selector de Relatório */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#015FC4]" />
            <span>Centro de Relatórios & Mapas Estatísticos de Recursos Humanos</span>
          </h3>
          <p className="text-gray-500 text-[11px] mt-0.5">
            Emissão de mapas regulamentares do MED, mapas de IRT/INSS e quadros de pessoal para auditoria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleDownloadCsv} icon={<Download className="w-3.5 h-3.5" />}>
            Exportar CSV
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer className="w-3.5 h-3.5" />}>
            Imprimir Relatório
          </Button>
        </div>
      </div>

      {/* Cartões Selecionáveis de Tipos de Relatório */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedReport('quadro')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === 'quadro'
              ? 'border-[#015FC4] bg-blue-50/50 shadow-xs'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5 text-[#015FC4] mb-1.5" />
          <strong className="block text-gray-900 font-bold">1. Quadro de Pessoal</strong>
          <span className="text-[10px] text-gray-500">Docentes, técnicos e vínculos</span>
        </button>

        <button
          onClick={() => setSelectedReport('ferias')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === 'ferias'
              ? 'border-[#015FC4] bg-blue-50/50 shadow-xs'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-5 h-5 text-emerald-600 mb-1.5" />
          <strong className="block text-gray-900 font-bold">2. Mapa Anual de Férias</strong>
          <span className="text-[10px] text-gray-500">Escala de 22 dias úteis LGT</span>
        </button>

        <button
          onClick={() => setSelectedReport('fiscal_irt')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === 'fiscal_irt'
              ? 'border-[#015FC4] bg-blue-50/50 shadow-xs'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <CreditCard className="w-5 h-5 text-purple-600 mb-1.5" />
          <strong className="block text-gray-900 font-bold">3. Mapa IRT & INSS</strong>
          <span className="text-[10px] text-gray-500">Retenções tributárias mensais</span>
        </button>

        <button
          onClick={() => setSelectedReport('assiduidade')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === 'assiduidade'
              ? 'border-[#015FC4] bg-blue-50/50 shadow-xs'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <Building2 className="w-5 h-5 text-amber-600 mb-1.5" />
          <strong className="block text-gray-900 font-bold">4. Mapa de Assiduidade</strong>
          <span className="text-[10px] text-gray-500">Absentismo e pontualidade</span>
        </button>
      </div>

      {/* Pré-visualização do Relatório Activo (#hr-printable-area para impressão limpa) */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs p-5 space-y-4">
        <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#015FC4] tracking-wider block">
              {schoolName} · Ministério da Educação
            </span>
            <h4 className="font-bold text-gray-900 text-sm mt-0.5">
              {selectedReport === 'quadro' && 'Quadro Geral de Pessoal & Distribuição Docente'}
              {selectedReport === 'ferias' && 'Mapa Geral de Marcação de Férias Regulamentares (LGT)'}
              {selectedReport === 'fiscal_irt' && 'Mapa Fiscal de Deduções de IRT e Segurança Social (INSS)'}
              {selectedReport === 'assiduidade' && 'Relatório Consolidado de Assiduidade e Pontualidade'}
            </h4>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Gerado em {new Date().toLocaleDateString('pt-AO')}
          </span>
        </div>

        {/* Tabela do Relatório */}
        <div className="overflow-x-auto">
          {selectedReport === 'quadro' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Nº Mec.</th>
                  <th className="py-2.5 px-3">Colaborador</th>
                  <th className="py-2.5 px-3">Cargo</th>
                  <th className="py-2.5 px-3">Departamento</th>
                  <th className="py-2.5 px-3">Vínculo</th>
                  <th className="py-2.5 px-3 font-mono">BI Angolano</th>
                  <th className="py-2.5 px-3 font-mono text-right">Salário Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeEmployees.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 px-3 font-mono text-gray-500">{e.numeroMecanografico}</td>
                    <td className="py-2 px-3 font-semibold text-gray-900">{e.nomeCompleto}</td>
                    <td className="py-2 px-3 text-gray-800">{e.cargoNome}</td>
                    <td className="py-2 px-3 text-gray-600">{e.departamentoNome}</td>
                    <td className="py-2 px-3 capitalize">{e.tipoVinculo.replace('_', ' ')}</td>
                    <td className="py-2 px-3 font-mono">{e.numeroDocumento}</td>
                    <td className="py-2 px-3 font-mono text-right font-bold text-gray-900">
                      {e.salarioBaseKz.toLocaleString('pt-AO')} Kz
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'fiscal_irt' && latestPayroll && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Colaborador</th>
                  <th className="py-2.5 px-3 font-mono">Nº INSS</th>
                  <th className="py-2.5 px-3 font-mono">NIF</th>
                  <th className="py-2.5 px-3 font-mono text-right">Salário Base</th>
                  <th className="py-2.5 px-3 font-mono text-right text-blue-700">INSS (3%)</th>
                  <th className="py-2.5 px-3 font-mono text-right text-rose-700">IRT Retido</th>
                  <th className="py-2.5 px-3 font-mono text-right text-emerald-700">Líquido Kz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {latestPayroll.recibos.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 px-3 font-semibold text-gray-900">{r.colaboradorNome}</td>
                    <td className="py-2 px-3 font-mono text-gray-600">{r.numeroINSS}</td>
                    <td className="py-2 px-3 font-mono text-gray-600">{r.nif}</td>
                    <td className="py-2 px-3 font-mono text-right">{r.salarioBaseKz.toLocaleString('pt-AO')} Kz</td>
                    <td className="py-2 px-3 font-mono text-right text-blue-700">-{r.inssTrabalhador3PercentKz.toLocaleString('pt-AO')} Kz</td>
                    <td className="py-2 px-3 font-mono text-right text-rose-700 font-bold">-{r.irtRetidoKz.toLocaleString('pt-AO')} Kz</td>
                    <td className="py-2 px-3 font-mono text-right font-bold text-emerald-700">{r.salarioLiquidoKz.toLocaleString('pt-AO')} Kz</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'ferias' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Colaborador</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Data Início</th>
                  <th className="py-2.5 px-3">Data Fim</th>
                  <th className="py-2.5 px-3 text-center">Dias Úteis</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 px-3 font-semibold text-gray-900">{l.colaboradorNome}</td>
                    <td className="py-2 px-3 capitalize">{l.tipo.replace('_', ' ')}</td>
                    <td className="py-2 px-3 font-mono">{l.dataInicio}</td>
                    <td className="py-2 px-3 font-mono">{l.dataFim}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-[#015FC4]">{l.totalDiasUteis}</td>
                    <td className="py-2 px-3 text-center uppercase font-bold text-[10px] text-emerald-700">{l.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'assiduidade' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Colaborador</th>
                  <th className="py-2.5 px-3">Cargo</th>
                  <th className="py-2.5 px-3">Departamento</th>
                  <th className="py-2.5 px-3 text-center">Taxa Assiduidade</th>
                  <th className="py-2.5 px-3 text-center">Faltas no Ano</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeEmployees.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 px-3 font-semibold text-gray-900">{e.nomeCompleto}</td>
                    <td className="py-2 px-3 text-gray-800">{e.cargoNome}</td>
                    <td className="py-2 px-3 text-gray-600">{e.departamentoNome}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">{e.taxaAssiduidadeMesPercent}%</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-gray-700">{e.totalFaltasInjustificadasAno}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Rodapé Institucional com Assinaturas para Impressão */}
        <div className="pt-6 border-t border-gray-200 mt-4 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-gray-400 w-48 mx-auto mb-1.5" />
            <p className="font-bold text-gray-900">A Direcção de Recursos Humanos</p>
            <p className="text-[10px] text-gray-500">EduGest Angola · Gestão de Pessoal</p>
          </div>
          <div>
            <div className="border-b border-gray-400 w-48 mx-auto mb-1.5" />
            <p className="font-bold text-gray-900">A Direcção Geral da Instituição</p>
            <p className="text-[10px] text-gray-500">Homologação & Visto Oficial</p>
          </div>
        </div>
      </div>
    </div>
  );
};
