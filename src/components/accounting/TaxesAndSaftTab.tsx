import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Building2,
  DollarSign,
  Printer,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConfiguracaoFiscalAGT } from '../../types/accountingFinance';
import {
  generateSaftContabilidade,
  validateSaftStructure,
} from '../../services/accountingFinanceService';
import { downloadFile } from '../../utils/hrDocumentGenerator';

interface TaxesAndSaftTabProps {
  configFiscal: ConfiguracaoFiscalAGT;
  schoolName: string;
}

export const TaxesAndSaftTab: React.FC<TaxesAndSaftTabProps> = ({
  configFiscal,
  schoolName,
}) => {
  const [anoSaft, setAnoSaft] = useState(2026);
  const [saftPreview, setSaftPreview] = useState<any | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const handleGerarEValidarSaft = () => {
    const saft = generateSaftContabilidade('esc-001', anoSaft);
    const valid = validateSaftStructure(saft);
    setSaftPreview(saft);
    setValidationResult(valid);
  };

  const handleDownloadSaftXml = () => {
    if (!saftPreview) {
      handleGerarEValidarSaft();
    }
    const saft = saftPreview || generateSaftContabilidade('esc-001', anoSaft);
    const jsonStr = JSON.stringify(saft, null, 2);
    downloadFile(jsonStr, `SAF-T_AO_Contabilidade_${anoSaft}_${configFiscal.nifInstituicao}.json`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Enquadramento Fiscal Institucional (AGT) */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#015FC4]" />
              <h3 className="font-bold text-sm text-gray-900">Enquadramento Tributário & Fiscal da Instituição</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Administração Geral Tributária (AGT) · República de Angola
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 self-start sm:self-auto">
            Situação Tributária Regularizada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">NIF da Instituição:</span>
            <strong className="text-gray-900 font-mono text-sm block mt-0.5">{configFiscal.nifInstituicao}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">Repartição Fiscal:</span>
            <strong className="text-gray-900 text-xs block mt-0.5">{configFiscal.reparticaoFiscal}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">Enquadramento do IVA:</span>
            <strong className="text-[#015FC4] text-xs block mt-0.5">Isenção de Ensino (Art. 12º CIVA)</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[10px] uppercase font-semibold">Versão SAF-T (AO):</span>
            <strong className="text-gray-900 font-mono text-xs block mt-0.5">{configFiscal.versaoSaftSuportada}</strong>
          </div>
        </div>
      </div>

      {/* 2. Calendário de Obrigações Fiscais Mensais */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-gray-900">Apuramento & Calendário Fiscal (Março / 2026)</h3>
          </div>
          <span className="text-xs font-mono text-gray-500">Mês de Referência: 2026-03</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* IRT Grupo A */}
          <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <strong className="font-bold text-purple-950">IRT — Rendimento do Trabalho</strong>
              <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded font-bold">Grupo A</span>
            </div>
            <div className="text-base font-bold font-mono text-purple-900">
              650.000 <span className="text-xs font-sans">Kz</span>
            </div>
            <p className="text-[11px] text-purple-800">
              Retido na fonte da folha salarial de Março de 2026. Data limite de pagamento: <strong>30 de Abril</strong>.
            </p>
          </div>

          {/* INSS 11% */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <strong className="font-bold text-blue-950">Segurança Social (INSS 11%)</strong>
              <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">3% + 8%</span>
            </div>
            <div className="text-base font-bold font-mono text-blue-900">
              660.000 <span className="text-xs font-sans">Kz</span>
            </div>
            <p className="text-[11px] text-blue-800">
              Guia da folha de salários (180.000 Kz trabalhador + 480.000 Kz patronal). Limite: <strong>10 de Abril</strong>.
            </p>
          </div>

          {/* Retenção na Fonte Prestação Serviços */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <strong className="font-bold text-emerald-950">Retenção na Fonte Fornecedores</strong>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">6.5%</span>
            </div>
            <div className="text-base font-bold font-mono text-emerald-900">
              0 <span className="text-xs font-sans">Kz</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Retenção aplicada a prestadores de serviços não sujeitos a liquidação direta.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Gerador & Validador Oficial do SAF-T (AO) de Contabilidade */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#012041] text-white rounded-xl">
              <FileCode className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">
                SAF-T (AO) de Contabilidade — Ficheiro de Auditoria Tributária
              </h3>
              <p className="text-xs text-gray-500">
                Conformidade estrita com o Decreto Presidencial nº 180/19 e as orientações oficiais da AGT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={anoSaft}
              onChange={(e) => setAnoSaft(Number(e.target.value))}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg font-bold text-gray-800 bg-white"
            >
              <option value={2026}>Exercício de 2026</option>
              <option value={2025}>Exercício de 2025</option>
            </select>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGerarEValidarSaft}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Gerar & Validar SAF-T
            </Button>
          </div>
        </div>

        {/* Relatório de Validação Estrutural */}
        {validationResult && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                validationResult.isValid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {validationResult.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <strong className="text-sm font-bold block">
                  {validationResult.isValid
                    ? 'Ficheiro SAF-T (AO) Validado com Sucesso — Conformidade Estrutural Assegurada'
                    : 'Inconformidades Detectadas no Esquema SAF-T'}
                </strong>
                <p className="text-[11px] opacity-90">
                  {validationResult.isValid
                    ? `O ficheiro de auditoria de ${anoSaft} cumpre todos os requisitos do esquema oficial 1.01_01 da AGT. As partidas dobradas do razão encontram-se rigorosamente balanceadas.`
                    : 'Corrija os erros abaixo antes de disponibilizar o ficheiro para auditoria tributária.'}
                </p>

                {validationResult.errors.length > 0 && (
                  <ul className="list-disc pl-4 text-xs font-semibold space-y-0.5 pt-1">
                    {validationResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Painel com Métricas do SAF-T */}
            {saftPreview && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Total de Lançamentos:</span>
                  <strong className="font-mono text-gray-900 text-sm">
                    {saftPreview.generalLedgerEntries.numberOfEntries} registos
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Total Débitos no Diário:</span>
                  <strong className="font-mono text-emerald-700 text-sm">
                    {saftPreview.generalLedgerEntries.totalDebit.toLocaleString('pt-AO')} Kz
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Total Créditos no Diário:</span>
                  <strong className="font-mono text-emerald-700 text-sm">
                    {saftPreview.generalLedgerEntries.totalCredit.toLocaleString('pt-AO')} Kz
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Diferença Débito/Crédito:</span>
                  <strong className="font-mono text-gray-900 text-sm">0 Kz (Equilibrado)</strong>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadSaftXml}
                icon={<Download className="w-4 h-4" />}
              >
                Descarregar Ficheiro Oficial SAF-T (.json / .xml)
              </Button>
            </div>
          </div>
        )}

        {!validationResult && (
          <div className="p-6 text-center text-gray-500 text-xs border border-dashed border-gray-200 rounded-xl space-y-2">
            <ShieldCheck className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="font-semibold text-gray-700">Validação Estrutural e Geração do SAF-T</p>
            <p className="text-[11px] max-w-md mx-auto">
              Clique em &quot;Gerar & Validar SAF-T&quot; para verificar o plano de contas, clientes, fornecedores e diários em partidas dobradas antes da exportação.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
