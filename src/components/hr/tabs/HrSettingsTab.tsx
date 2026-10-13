import React, { useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Calendar,
  CreditCard,
  Building2,
  Palmtree,
  Info,
} from 'lucide-react';
import { HrSettingsConfig } from '../../../types/humanResources';
import { Button } from '../../ui/Button';

interface HrSettingsTabProps {
  settings: HrSettingsConfig;
  onSaveSettings: (settings: HrSettingsConfig) => void;
}

export const HrSettingsTab: React.FC<HrSettingsTabProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [diasFerias, setDiasFerias] = useState(settings.diasFeriasAnuaisPadrao || 22);
  const [tolerancia, setTolerancia] = useState(settings.limiteToleranciaAtrasoMinutos || 15);
  const [inssTrab, setInssTrab] = useState(settings.taxaInssTrabalhadorPercent || 3);
  const [inssPat, setInssPat] = useState(settings.taxaInssPatronalPercent || 8);
  const [salariosConf, setSalariosConf] = useState(settings.moduloSalariosConfidencial ?? true);
  const [discConf, setDiscConf] = useState(settings.moduloDisciplinarConfidencial ?? true);
  const [diasAviso, setDiasAviso] = useState(settings.notificarContratosVencimentoDias || 30);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      escolaId: settings.escolaId,
      diasFeriasAnuaisPadrao: Number(diasFerias),
      limiteToleranciaAtrasoMinutos: Number(tolerancia),
      taxaInssTrabalhadorPercent: Number(inssTrab),
      taxaInssPatronalPercent: Number(inssPat),
      moduloSalariosConfidencial: salariosConf,
      moduloDisciplinarConfidencial: discConf,
      notificarContratosVencimentoDias: Number(diasAviso),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const feriadosNacionaisAngola = [
    { data: '01 de Janeiro', designacao: 'Dia de Ano Novo', tipo: 'Feriado Nacional' },
    { data: '04 de Fevereiro', designacao: 'Dia do Início da Luta Armada de Libertação Nacional', tipo: 'Feriado Nacional' },
    { data: '08 de Março', designacao: 'Dia Internacional da Mulher', tipo: 'Data de Celebração Nacional' },
    { data: '04 de Abril', designacao: 'Dia da Paz e da Reconciliação Nacional', tipo: 'Feriado Nacional' },
    { data: '01 de Maio', designacao: 'Dia Mundial do Trabalhador', tipo: 'Feriado Nacional' },
    { data: '17 de Setembro', designacao: 'Dia do Fundador da Nação e do Herói Nacional', tipo: 'Feriado Nacional' },
    { data: '02 de Novembro', designacao: 'Dia dos Finados', tipo: 'Feriado Nacional' },
    { data: '11 de Novembro', designacao: 'Dia da Independência Nacional', tipo: 'Feriado Nacional' },
    { data: '25 de Dezembro', designacao: 'Dia de Natal e da Família', tipo: 'Feriado Nacional' },
  ];

  const escaloesIrtGrupoA = [
    { escalao: 'Até 100.000 Kz', parcelaFixa: '0 Kz', taxa: 'Isento', excesso: '0 Kz' },
    { escalao: '100.001 a 150.000 Kz', parcelaFixa: '0 Kz', taxa: '13%', excesso: '100.000 Kz' },
    { escalao: '150.001 a 200.000 Kz', parcelaFixa: '6.500 Kz', taxa: '16%', excesso: '150.000 Kz' },
    { escalao: '200.001 a 300.000 Kz', parcelaFixa: '14.500 Kz', taxa: '18%', excesso: '200.000 Kz' },
    { escalao: '300.001 a 500.000 Kz', parcelaFixa: '32.500 Kz', taxa: '19%', excesso: '300.000 Kz' },
    { escalao: '500.001 a 1.000.000 Kz', parcelaFixa: '70.500 Kz', taxa: '20%', excesso: '500.000 Kz' },
    { escalao: '1.000.001 a 1.500.000 Kz', parcelaFixa: '170.500 Kz', taxa: '21%', excesso: '1.000.000 Kz' },
    { escalao: '1.500.001 a 2.000.000 Kz', parcelaFixa: '275.500 Kz', taxa: '22%', excesso: '1.500.000 Kz' },
    { escalao: '2.000.001 a 2.500.000 Kz', parcelaFixa: '385.500 Kz', taxa: '23%', excesso: '2.000.000 Kz' },
    { escalao: '2.500.001 a 3.000.000 Kz', parcelaFixa: '500.500 Kz', taxa: '24%', excesso: '2.500.000 Kz' },
    { escalao: 'Superior a 3.000.000 Kz', parcelaFixa: '620.500 Kz', taxa: '25%', excesso: '3.000.000 Kz' },
  ];

  return (
    <div className="space-y-6 text-xs max-w-4xl">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#015FC4]" />
          <span>Configurações & Parâmetros do Módulo de Recursos Humanos</span>
        </h3>
        <p className="text-gray-500 text-[11px] mt-0.5">
          Definição das regras de negócio, limites legais de férias e directrizes de retenção e privacidade.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-5">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configurações de RH gravadas com sucesso!</span>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#015FC4]" />
            <span>1. Parâmetros de Férias & Assiduidade Escolar</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Dias Úteis de Férias Anuais (LGT Angola)
              </label>
              <input
                type="number"
                min="10"
                max="30"
                value={diasFerias}
                onChange={(e) => setDiasFerias(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Artigo 127º da Lei Geral do Trabalho (Padrão: 22 dias úteis)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Tolerância de Atraso no Ponto (Minutos)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={tolerancia}
                onChange={(e) => setTolerancia(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Tolerância antes de registrar atraso nos relatórios (Padrão: 15 min)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>2. Contratos & Notificações de Vencimento</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Aviso Prévio de Contratos a Termo (Dias)
              </label>
              <input
                type="number"
                min="15"
                max="90"
                value={diasAviso}
                onChange={(e) => setDiasAviso(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-mono font-bold text-xs"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Gera alertas no dashboard com esta antecedência (Padrão: 30 dias)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>3. Directrizes de Confidencialidade (Lei nº 22/11)</span>
          </h4>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <input
                type="checkbox"
                checked={salariosConf}
                onChange={(e) => setSalariosConf(e.target.checked)}
                className="rounded text-[#015FC4]"
              />
              <div>
                <strong className="text-gray-900 block font-semibold">
                  Módulo de Remunerações & Salários Estritamente Confidencial
                </strong>
                <span className="text-[10px] text-gray-500">
                  Acessível exclusivamente pelo Administrador da Escola e Director de RH
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <input
                type="checkbox"
                checked={discConf}
                onChange={(e) => setDiscConf(e.target.checked)}
                className="rounded text-[#015FC4]"
              />
              <div>
                <strong className="text-gray-900 block font-semibold">
                  Módulo Disciplinar com Acesso Restrito
                </strong>
                <span className="text-[10px] text-gray-500">
                  Protege dados pessoais e direito ao bom nome conforme o Artigo 47º da LGT
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <Button variant="primary" size="sm" type="submit" icon={<Save className="w-3.5 h-3.5" />}>
            Gravar Configurações de RH
          </Button>
        </div>
      </form>

      {/* Referência Oficial: Feriados Nacionais de Angola */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <Palmtree className="w-4 h-4 text-teal-600" />
              <span>Tabela Oficial de Feriados Nacionais de Angola</span>
            </h4>
            <span className="text-gray-400 text-[10px]">
              Lei nº 11/18 (Lei sobre Feriados Nacionais e Datas de Celebração Nacional)
            </span>
          </div>
          <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded">
            Actualizada
          </span>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-2 px-3">Data</th>
                <th className="py-2 px-3">Designação Oficial</th>
                <th className="py-2 px-3 text-right">Classificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feriadosNacionaisAngola.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-1.5 px-3 font-mono font-semibold text-gray-900">{f.data}</td>
                  <td className="py-1.5 px-3 text-gray-800">{f.designacao}</td>
                  <td className="py-1.5 px-3 text-right">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        f.tipo === 'Feriado Nacional'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {f.tipo}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referência Oficial: Tabela de Escalões de IRT do Grupo A (Lei 28/20) */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#015FC4]" />
              <span>Tabela de Retenção de IRT (Grupo A - Trabalho por Conta de Outrem)</span>
            </h4>
            <span className="text-gray-400 text-[10px]">
              Lei nº 28/20 de 22 de Julho · República de Angola / AGT
            </span>
          </div>
          <span className="text-[10px] bg-blue-50 text-[#015FC4] font-bold px-2 py-0.5 rounded">
            Grupo A
          </span>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-2 px-3">Escalão de Rendimento Mensal</th>
                <th className="py-2 px-3 font-mono text-right">Parcela Fixa</th>
                <th className="py-2 px-3 text-right">Taxa Marginal</th>
                <th className="py-2 px-3 font-mono text-right">Sobre o Excesso de</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {escaloesIrtGrupoA.map((esc, i) => (
                <tr key={i} className="hover:bg-blue-50/20">
                  <td className="py-1.5 px-3 font-medium text-gray-900">{esc.escalao}</td>
                  <td className="py-1.5 px-3 font-mono text-right text-gray-700">{esc.parcelaFixa}</td>
                  <td className="py-1.5 px-3 text-right font-bold text-rose-700">{esc.taxa}</td>
                  <td className="py-1.5 px-3 font-mono text-right text-gray-500">{esc.excesso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
