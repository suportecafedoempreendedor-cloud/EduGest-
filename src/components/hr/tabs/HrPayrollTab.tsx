import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Building2,
  RefreshCw,
  Eye,
  ShieldCheck,
  X,
} from 'lucide-react';
import { PayrollPeriod, PayrollPayslip, Employee } from '../../../types/humanResources';
import { Button } from '../../ui/Button';
import { exportToCsv, downloadFile, defaultSchoolHeader } from '../../../utils/hrDocumentGenerator';

interface HrPayrollTabProps {
  payrollPeriods: PayrollPeriod[];
  employees: Employee[];
  onGeneratePayroll: (mesNome: string, mesNumero: number, ano: number) => void;
  schoolName?: string;
}

export const HrPayrollTab: React.FC<HrPayrollTabProps> = ({
  payrollPeriods,
  employees,
  onGeneratePayroll,
  schoolName = defaultSchoolHeader.schoolName,
}) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    payrollPeriods[0]?.id || 'pay-2026-10'
  );
  const [viewingPayslip, setViewingPayslip] = useState<PayrollPayslip | null>(null);

  const activePeriod = payrollPeriods.find((p) => p.id === selectedPeriodId) || payrollPeriods[0];

  const handleRunNewPayroll = () => {
    const mesNome = 'Novembro';
    const mesNum = 11;
    const ano = 2026;
    if (
      window.confirm(
        `Deseja processar a folha de remunerações de ${mesNome} de ${ano} para todos os colaboradores activos?`
      )
    ) {
      onGeneratePayroll(mesNome, mesNum, ano);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPayrollCsv = () => {
    if (!activePeriod) return;
    const headers = [
      'N_Mecanografico',
      'Colaborador',
      'Cargo',
      'Departamento',
      'NIF',
      'Numero_INSS',
      'Salario_Base_Kz',
      'Subsidio_Alimentacao_Kz',
      'Subsidio_Transporte_Kz',
      'Outros_Abonos_Kz',
      'Vencimento_Bruto_Kz',
      'INSS_Trabalhador_3_Kz',
      'IRT_Retido_Kz',
      'Total_Descontos_Kz',
      'Salario_Liquido_Kz',
      'INSS_Patronal_8_Kz',
      'IBAN',
    ];
    const rows = activePeriod.recibos.map((r) => [
      r.numeroMecanografico,
      r.colaboradorNome,
      r.cargoNome,
      r.departamentoNome,
      r.nif,
      r.numeroINSS,
      r.salarioBaseKz,
      r.subsidioAlimentacaoKz,
      r.subsidioTransporteKz,
      r.outrosAbonosKz,
      r.totalVencimentoBrutoKz,
      r.inssTrabalhador3PercentKz,
      r.irtRetidoKz,
      r.totalDescontosKz,
      r.salarioLiquidoKz,
      r.inssPatronal8PercentKz,
      r.iban || 'N/A',
    ]);
    exportToCsv(`folha_salarios_${activePeriod.mes}_${activePeriod.ano}.csv`, headers, rows);
  };

  const handleExportInssReport = () => {
    if (!activePeriod) return;
    const headers = [
      'Numero_INSS',
      'Nome_Trabalhador',
      'NIF',
      'Remuneracao_Base_Kz',
      'Contribuicao_Segurado_3_Kz',
      'Contribuicao_Empresa_8_Kz',
      'Total_Entregue_INSS_11_Kz',
    ];
    const rows = activePeriod.recibos.map((r) => [
      r.numeroINSS,
      r.colaboradorNome,
      r.nif,
      r.salarioBaseKz,
      r.inssTrabalhador3PercentKz,
      r.inssPatronal8PercentKz,
      r.inssTrabalhador3PercentKz + r.inssPatronal8PercentKz,
    ]);
    exportToCsv(`declaracao_inss_${activePeriod.mes}_${activePeriod.ano}.csv`, headers, rows);
  };

  const handleDownloadPayslipText = (rcb: PayrollPayslip) => {
    const text = `================================================================================
REPÚBLICA DE ANGOLA · MINISTÉRIO DA EDUCAÇÃO
${schoolName.toUpperCase()}
NIF: ${defaultSchoolHeader.nif}
================================================================================

                    RECIBO OFICIAL DE VENCIMENTO / HOLERITE
                    Nº RECIBO: ${rcb.reciboNumero}
                    PERÍODO: ${rcb.mes.toUpperCase()} DE ${rcb.ano}

DADOS DO COLABORADOR:
  Nome Completo: ${rcb.colaboradorNome}
  Nº Mecanográfico: ${rcb.numeroMecanografico}
  Cargo: ${rcb.cargoNome}
  Departamento: ${rcb.departamentoNome}
  NIF do Trabalhador: ${rcb.nif}
  Nº da Segurança Social (INSS): ${rcb.numeroINSS}
  IBAN Bancário: ${rcb.iban || 'Registado em ficheiro bancário'}

DISCRIMINAÇÃO DAS RUBRICAS SALARIAIS:
--------------------------------------------------------------------------------
CÓDIGO / RUBRICA                                    RENDIMENTOS        DESCONTOS
--------------------------------------------------------------------------------
101 - Vencimento Base Mensal                  ${rcb.salarioBaseKz.toLocaleString('pt-AO')} Kz              --
201 - Subsídio de Alimentação (Isento)        ${rcb.subsidioAlimentacaoKz.toLocaleString('pt-AO')} Kz              --
202 - Subsídio de Transporte (Isento)         ${rcb.subsidioTransporteKz.toLocaleString('pt-AO')} Kz              --
${rcb.outrosAbonosKz > 0 ? `203 - Abono de Direcção / Coordenação         ${rcb.outrosAbonosKz.toLocaleString('pt-AO')} Kz              --\n` : ''}301 - INSS Trabalhador (Taxa 3%)                         --    -${rcb.inssTrabalhador3PercentKz.toLocaleString('pt-AO')} Kz
401 - Retenção IRT Angola (Lei 28/20 Grupo A)             --    -${rcb.irtRetidoKz.toLocaleString('pt-AO')} Kz
--------------------------------------------------------------------------------
TOTAIS:                                       ${rcb.totalVencimentoBrutoKz.toLocaleString('pt-AO')} Kz    -${rcb.totalDescontosKz.toLocaleString('pt-AO')} Kz
--------------------------------------------------------------------------------

TOTAL LÍQUIDO A RECEBER PELO COLABORADOR:
  ${rcb.salarioLiquidoKz.toLocaleString('pt-AO')} Kz (Kwanzas)

Encargo Patronal (INSS 8% suportado pela Escola): ${rcb.inssPatronal8PercentKz.toLocaleString('pt-AO')} Kz

Data de Processamento: ${rcb.dataProcessamento}
Emitido pelo Sistema EduGest Angola

_________________________________________          _________________________________________
        PELA DIRECÇÃO DA ESCOLA                                   O COLABORADOR
================================================================================`;

    downloadFile(text, `recibo_${rcb.reciboNumero.replace(/[\/\\]/g, '_')}.txt`);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Aviso de Confidencialidade Salarial */}
      <div className="bg-emerald-50/60 border-2 border-emerald-300 rounded-xl p-4 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg shrink-0 mt-0.5">
            <Lock className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
              <span>Folha Salarial & Remunerações (Acesso Confidencial)</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded uppercase font-mono font-bold">
                Lei nº 28/20 (IRT) & INSS
              </span>
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5 max-w-2xl">
              Cálculo legal rigoroso segundo os escalões tributários do IRT (Grupo A) de Angola e contribuição para a Segurança Social (3% trabalhador / 8% patronal). Os valores remuneratórios estão estritamente isolados da gestão académica.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="px-3 py-1.5 border border-emerald-300 rounded-lg text-xs bg-white text-emerald-900 font-semibold"
          >
            {payrollPeriods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.mes} de {p.ano} ({p.estado.toUpperCase()})
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunNewPayroll}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Processar Mês
          </Button>
        </div>
      </div>

      {/* Resumo Consolidado do Período Seleccionado */}
      {activePeriod && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-gray-500 text-[11px] block">Colaboradores Processados</span>
            <strong className="text-xl font-bold font-mono text-gray-900 block mt-0.5">
              {activePeriod.totalColaboradores}
            </strong>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-gray-500 text-[11px] block">Massa Salarial Bruta</span>
            <strong className="text-lg font-bold font-mono text-gray-900 block mt-0.5">
              {activePeriod.totalBrutoGeralKz.toLocaleString('pt-AO')} Kz
            </strong>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-gray-500 text-[11px] block">Total Retenção IRT (AGT)</span>
            <strong className="text-lg font-bold font-mono text-rose-600 block mt-0.5">
              {activePeriod.totalIrtGeralKz.toLocaleString('pt-AO')} Kz
            </strong>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-gray-500 text-[11px] block">INSS (3% Trab. + 8% Pat.)</span>
            <strong className="text-lg font-bold font-mono text-blue-600 block mt-0.5">
              {(activePeriod.totalInss3GeralKz + activePeriod.totalInss8GeralKz).toLocaleString('pt-AO')} Kz
            </strong>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
            <span className="text-gray-500 text-[11px] block text-emerald-800">Total Líquido a Transferir</span>
            <strong className="text-lg font-bold font-mono text-emerald-700 block mt-0.5">
              {activePeriod.totalLiquidoGeralKz.toLocaleString('pt-AO')} Kz
            </strong>
          </div>
        </div>
      )}

      {/* Tabela de Folha de Vencimento do Mês (Suporta Impressão Geral via #hr-printable-area) */}
      {activePeriod && (
        <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="text-gray-900 text-xs">
                Mapa Detalhado de Vencimentos · {activePeriod.mes} {activePeriod.ano}
              </strong>
              <span className="text-gray-400 text-[11px] block">
                Homologado por: {activePeriod.aprovadoPor || 'Administração'} · {schoolName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportInssReport}
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
              >
                Mapa INSS (CSV)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPayrollCsv}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Exportar Folha (CSV)
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Imprimir Mapa
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Nº Mec. & Colaborador</th>
                  <th className="py-3 px-4">Cargo / Departamento</th>
                  <th className="py-3 px-4 font-mono text-right">Salário Base</th>
                  <th className="py-3 px-4 font-mono text-right">Subsídios</th>
                  <th className="py-3 px-4 font-mono text-right text-blue-700">INSS (3%)</th>
                  <th className="py-3 px-4 font-mono text-right text-rose-700">IRT (Lei 28/20)</th>
                  <th className="py-3 px-4 font-mono text-right text-emerald-700">Venc. Líquido</th>
                  <th className="py-3 px-4 text-center no-print">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activePeriod.recibos.map((rcb) => (
                  <tr key={rcb.id} className="hover:bg-blue-50/20">
                    <td className="py-3 px-4">
                      <strong className="text-gray-900 block font-semibold">{rcb.colaboradorNome}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">{rcb.numeroMecanografico}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800 block">{rcb.cargoNome}</span>
                      <span className="text-[10px] text-gray-400 block">{rcb.departamentoNome}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-right font-semibold text-gray-900">
                      {rcb.salarioBaseKz.toLocaleString('pt-AO')} Kz
                    </td>

                    <td className="py-3 px-4 font-mono text-right text-gray-700">
                      {(rcb.subsidioAlimentacaoKz + rcb.subsidioTransporteKz).toLocaleString('pt-AO')} Kz
                    </td>

                    <td className="py-3 px-4 font-mono text-right text-blue-700">
                      -{rcb.inssTrabalhador3PercentKz.toLocaleString('pt-AO')} Kz
                    </td>

                    <td className="py-3 px-4 font-mono text-right text-rose-700 font-bold">
                      -{rcb.irtRetidoKz.toLocaleString('pt-AO')} Kz
                    </td>

                    <td className="py-3 px-4 font-mono text-right font-bold text-emerald-700 text-sm">
                      {rcb.salarioLiquidoKz.toLocaleString('pt-AO')} Kz
                    </td>

                    <td className="py-3 px-4 text-center no-print">
                      <button
                        onClick={() => setViewingPayslip(rcb)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#015FC4]/10 hover:bg-[#015FC4] text-[#015FC4] hover:text-white font-semibold text-[10px] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Holerite</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Recibo Oficial de Vencimento (Payslip / Holerite) */}
      {viewingPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3 no-print">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  República de Angola · Ministério da Educação
                </span>
                <h3 className="text-base font-extrabold text-[#012041]">
                  Recibo Oficial de Vencimento / Folha de Salário
                </h3>
                <span className="text-[11px] font-mono text-gray-500 font-bold">
                  {viewingPayslip.reciboNumero} · Período: {viewingPayslip.mes} {viewingPayslip.ano}
                </span>
              </div>
              <button
                onClick={() => setViewingPayslip(null)}
                className="text-gray-400 hover:text-gray-700 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Recibo Estruturado para Impressão */}
            <div id="hr-printable-area" className="space-y-4">
              <div className="text-center border-b border-gray-200 pb-2">
                <strong className="text-sm font-bold text-[#012041] uppercase">{schoolName}</strong>
                <p className="text-[10px] text-gray-500">
                  NIF: {defaultSchoolHeader.nif} · {defaultSchoolHeader.municipio}, Luanda
                </p>
                <span className="text-xs font-bold text-blue-700 block mt-0.5">
                  RECIBO DE VENCIMENTO · {viewingPayslip.mes.toUpperCase()} / {viewingPayslip.ano}
                </span>
              </div>

              {/* Dados do Colaborador & Escola */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block">Colaborador:</span>
                  <strong className="text-gray-900 block font-bold text-sm">{viewingPayslip.colaboradorNome}</strong>
                  <span className="text-gray-600 block mt-0.5">{viewingPayslip.cargoNome} · {viewingPayslip.departamentoNome}</span>
                  <span className="text-gray-500 font-mono text-[11px]">Nº Mec.: {viewingPayslip.numeroMecanografico}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-[10px] block">Dados de Identificação:</span>
                  <strong className="text-gray-900 font-mono block">NIF: {viewingPayslip.nif}</strong>
                  <span className="text-gray-700 font-mono block">INSS: {viewingPayslip.numeroINSS}</span>
                  <span className="text-gray-500 font-mono text-[10px]">IBAN: {viewingPayslip.iban || 'Registado em ficheiro bancário'}</span>
                </div>
              </div>

              {/* Tabela de Rubricas Vencimentos e Descontos */}
              <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Código & Descrição da Rubrica</th>
                      <th className="py-2 px-3 text-right">Rendimentos (Kz)</th>
                      <th className="py-2 px-3 text-right text-rose-700">Descontos (Kz)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[11px]">
                    <tr>
                      <td className="py-1.5 px-3">101 - Vencimento Base Mensal</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold">
                        {viewingPayslip.salarioBaseKz.toLocaleString('pt-AO')} Kz
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-400 font-mono">--</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3">201 - Subsídio de Alimentação (Isento)</td>
                      <td className="py-1.5 px-3 text-right font-mono">
                        {viewingPayslip.subsidioAlimentacaoKz.toLocaleString('pt-AO')} Kz
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-400 font-mono">--</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3">202 - Subsídio de Transporte (Isento)</td>
                      <td className="py-1.5 px-3 text-right font-mono">
                        {viewingPayslip.subsidioTransporteKz.toLocaleString('pt-AO')} Kz
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-400 font-mono">--</td>
                    </tr>
                    {viewingPayslip.outrosAbonosKz > 0 && (
                      <tr>
                        <td className="py-1.5 px-3">203 - Abono de Coordenação / Direcção</td>
                        <td className="py-1.5 px-3 text-right font-mono">
                          {viewingPayslip.outrosAbonosKz.toLocaleString('pt-AO')} Kz
                        </td>
                        <td className="py-1.5 px-3 text-right text-gray-400 font-mono">--</td>
                      </tr>
                    )}
                    <tr className="bg-blue-50/30">
                      <td className="py-1.5 px-3 text-blue-900 font-medium">301 - Segurança Social de Angola (INSS Trabalhador 3%)</td>
                      <td className="py-1.5 px-3 text-right text-gray-400 font-mono">--</td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold text-blue-800">
                        -{viewingPayslip.inssTrabalhador3PercentKz.toLocaleString('pt-AO')} Kz
                      </td>
                    </tr>
                    <tr className="bg-rose-50/30">
                      <td className="py-1.5 px-3 text-rose-900 font-medium">401 - Retenção IRT Angola (Lei nº 28/20 - Grupo A)</td>
                      <td className="py-1.5 px-3 text-right text-gray-400 font-mono">--</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-rose-700">
                        -{viewingPayslip.irtRetidoKz.toLocaleString('pt-AO')} Kz
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-100/80 font-bold border-t border-gray-200">
                    <tr>
                      <td className="py-2.5 px-3">TOTAIS (Vencimentos Brutos / Descontos Legais)</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-900">
                        {viewingPayslip.totalVencimentoBrutoKz.toLocaleString('pt-AO')} Kz
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                        -{viewingPayslip.totalDescontosKz.toLocaleString('pt-AO')} Kz
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Total Líquido em Destaque */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between">
                <div>
                  <span className="text-emerald-800 font-semibold text-[11px] block">
                    Total Líquido Transferido a Favor do Colaborador:
                  </span>
                  <span className="text-emerald-600 text-[10px]">
                    Processado via Transferência Bancária
                  </span>
                </div>
                <strong className="text-xl font-bold font-mono text-emerald-800">
                  {viewingPayslip.salarioLiquidoKz.toLocaleString('pt-AO')} Kz
                </strong>
              </div>

              {/* Carimbo Digital */}
              <div className="pt-2 text-[10px] text-gray-400 flex justify-between items-center border-t border-gray-100">
                <span>Carimbo Digital EduGest · Emitido em {viewingPayslip.dataProcessamento}</span>
                <span className="font-mono">{viewingPayslip.reciboNumero}</span>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 no-print">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadPayslipText(viewingPayslip)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Descarregar (.txt)
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePrint}
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Imprimir Recibo
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setViewingPayslip(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
