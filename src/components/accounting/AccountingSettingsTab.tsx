import React, { useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  ShieldCheck,
  Building2,
  DollarSign,
  Lock,
  Calendar,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConfiguracaoFiscalAGT } from '../../types/accountingFinance';

interface AccountingSettingsTabProps {
  configFiscal: ConfiguracaoFiscalAGT;
  onSaveConfig: (config: ConfiguracaoFiscalAGT) => void;
  schoolName: string;
}

export const AccountingSettingsTab: React.FC<AccountingSettingsTabProps> = ({
  configFiscal,
  onSaveConfig,
  schoolName,
}) => {
  const [nif, setNif] = useState(configFiscal.nifInstituicao);
  const [razaoSocial, setRazaoSocial] = useState(configFiscal.razaoSocial);
  const [reparticao, setReparticao] = useState(configFiscal.reparticaoFiscal);
  const [regimeIva, setRegimeIva] = useState(configFiscal.regimeIva);
  const [taxaIva, setTaxaIva] = useState(configFiscal.taxaIvaPadraoPercent);
  const [taxaRetencao, setTaxaRetencao] = useState(configFiscal.taxaRetencaoPrestacaoServicosPercent);
  const [taxaInssTrab, setTaxaInssTrab] = useState(configFiscal.taxaInssTrabalhadorPercent);
  const [taxaInssPat, setTaxaInssPat] = useState(configFiscal.taxaInssPatronalPercent);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...configFiscal,
      nifInstituicao: nif,
      razaoSocial,
      reparticaoFiscal: reparticao,
      regimeIva,
      taxaIvaPadraoPercent: Number(taxaIva),
      taxaRetencaoPrestacaoServicosPercent: Number(taxaRetencao),
      taxaInssTrabalhadorPercent: Number(taxaInssTrab),
      taxaInssPatronalPercent: Number(taxaInssPat),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#015FC4]" />
          <span>Configurações Contabilísticas, Fiscais & Parâmetros do Sistema</span>
        </h3>
        <p className="text-xs text-gray-500">
          Definição dos identificadores fiscais da AGT, moeda funcional e parametrização das contas de integração PGC Angola.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-6 text-xs">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configurações contabilísticas gravadas com sucesso!</span>
          </div>
        )}

        {/* 1. Identificação Fiscal da Instituição */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#015FC4]" />
            <span>1. Identificação Fiscal & Legal (AGT Angola)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">NIF da Instituição *</label>
              <input
                type="text"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Razão Social / Denominação Oficial *</label>
              <input
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Repartição Fiscal da AGT *</label>
            <input
              type="text"
              value={reparticao}
              onChange={(e) => setReparticao(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
              required
            />
          </div>
        </div>

        {/* 2. Fiscalidade & Regime de IVA */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>2. Parâmetros Fiscais (IVA, Retenções e INSS)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Regime de IVA</label>
              <select
                value={regimeIva}
                onChange={(e) => setRegimeIva(e.target.value as any)}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs font-semibold"
              >
                <option value="isento_ensino">Isento (Artigo 12º do CIVA - Ensino)</option>
                <option value="geral">Regime Geral (14%)</option>
                <option value="simplificado">Regime Simplificado (7%)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Taxa Retenção Fonte (Fornecedores)</label>
              <input
                type="number"
                value={taxaRetencao}
                onChange={(e) => setTaxaRetencao(Number(e.target.value))}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">INSS Trabalhador (%)</label>
              <input
                type="number"
                value={taxaInssTrab}
                onChange={(e) => setTaxaInssTrab(Number(e.target.value))}
                className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Contas Padrão PGC */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>3. Contas Padrão de Integração (PGC Angola)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-gray-500 block uppercase">Conta Caixa Padrão:</span>
              <strong className="font-mono text-gray-800">41.1.1 (Caixa Central)</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase">Conta Propinas Padrão:</span>
              <strong className="font-mono text-gray-800">61.1.1 / 61.1.2</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block uppercase">Conta Fornecedores Padrão:</span>
              <strong className="font-mono text-gray-800">32.1.1 (Fornecedores Gerais)</strong>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <Button type="submit" variant="primary" size="sm" icon={<Save className="w-4 h-4" />}>
            Gravar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
};
