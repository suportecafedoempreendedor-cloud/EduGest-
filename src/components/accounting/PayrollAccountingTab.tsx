import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building2,
  DollarSign,
  FileText,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LancamentoContabilistico } from '../../types/accountingFinance';

interface PayrollAccountingTabProps {
  onPostPayrollToLedger: (
    mesAno: string,
    totalBase: number,
    totalIrt: number,
    totalInssTrab: number,
    totalInssPat: number,
    totalLiquido: number
  ) => { success: boolean; message: string };
  lancamentos: LancamentoContabilistico[];
  schoolName: string;
}

export const PayrollAccountingTab: React.FC<PayrollAccountingTabProps> = ({
  onPostPayrollToLedger,
  lancamentos,
  schoolName,
}) => {
  const [folhaMes, setFolhaMes] = useState('2026-03');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dados simulados da folha de RH de Março/2026
  const totalSalariosBaseKz = 6000000;
  const totalSubsidiosKz = 450000;
  const totalIrtRetidoKz = 650000;
  const inssTrabalhador3Kz = 180000;
  const inssPatronal8Kz = 480000;
  const totalLiquidoAPagarKz = 5170000;

  // Verificar se já existe lançamento de salários para Março/2026
  const lancamentoJaExiste = lancamentos.some(
    (l) => l.diarioCodigo === 'DIA-SAL' && l.periodoMes === 3 && l.estado === 'contabilizado'
  );

  const handleContabilizarFolha = () => {
    const res = onPostPayrollToLedger(
      folhaMes,
      totalSalariosBaseKz,
      totalIrtRetidoKz,
      inssTrabalhador3Kz,
      inssPatronal8Kz,
      totalLiquidoAPagarKz
    );

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner de Integração RH + Contabilidade */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-sm text-gray-900">
            Apropriação Contabilística da Folha de Salários (Integração RH)
          </h3>
        </div>
        <p className="text-xs text-gray-500">
          Integração automática dos processamentos salariais de professores e pessoal administrativo validados no módulo de Recursos Humanos do EduGest.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Resumo da Folha Salarial Validada */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase text-purple-600 tracking-wider">
              Folha de Março / 2026 (RH Homologada)
            </span>
            <h4 className="font-bold text-base text-gray-900 mt-0.5">
              Corpo Docente, Coordenação & Pessoal de Apoio (28 Colaboradores)
            </h4>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              lancamentoJaExiste
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {lancamentoJaExiste ? 'Contabilizada no Diário' : 'Pendente de Apropriação'}
          </span>
        </div>

        {/* Linhas de Partidas Dobradas Pré-visualizadas */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-700 block">
            Estrutura do Lançamento Contabilístico em Partidas Dobradas (PGC Angola):
          </span>

          <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px]">
                  <th className="py-2 px-3">Conta PGC</th>
                  <th className="py-2 px-3">Designação</th>
                  <th className="py-2 px-3 text-right font-mono">Débito (Kz)</th>
                  <th className="py-2 px-3 text-right font-mono">Crédito (Kz)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">72.1.1</td>
                  <td className="py-2.5 px-3 text-gray-800">Remunerações Base dos Professores e Funcionários</td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">{totalSalariosBaseKz.toLocaleString('pt-AO')} Kz</td>
                  <td className="py-2.5 px-3 font-mono text-right">-</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">72.3.1</td>
                  <td className="py-2.5 px-3 text-gray-800">Encargos Sociais Obrigatórios (INSS Patronal 8%)</td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-gray-900">{inssPatronal8Kz.toLocaleString('pt-AO')} Kz</td>
                  <td className="py-2.5 px-3 font-mono text-right">-</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">34.2.1</td>
                  <td className="py-2.5 px-3 text-gray-800">IRT Retido na Fonte (Grupo A - Pessoal a Entregar à AGT)</td>
                  <td className="py-2.5 px-3 font-mono text-right">-</td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-rose-700">{totalIrtRetidoKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">34.3.1</td>
                  <td className="py-2.5 px-3 text-gray-800">Segurança Social (INSS 3% Trabalhador + 8% Patronal = 11%)</td>
                  <td className="py-2.5 px-3 font-mono text-right">-</td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-rose-700">{(inssTrabalhador3Kz + inssPatronal8Kz).toLocaleString('pt-AO')} Kz</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#015FC4]">36</td>
                  <td className="py-2.5 px-3 text-gray-800">Pessoal (Salários Líquidos a Transferir via Banco BAI)</td>
                  <td className="py-2.5 px-3 font-mono text-right">-</td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-emerald-700">{totalLiquidoAPagarKz.toLocaleString('pt-AO')} Kz</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t border-gray-300">
                  <td colSpan={2} className="py-2 px-3 text-right uppercase text-[10px] text-gray-600">
                    Total Balanceado em Partidas Dobradas:
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-800 font-bold">
                    6.480.000 Kz
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-800 font-bold">
                    6.480.000 Kz
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={handleContabilizarFolha}
            disabled={lancamentoJaExiste}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {lancamentoJaExiste
              ? 'Folha Já Contabilizada no Diário de Salários'
              : 'Apropriar e Contabilizar no Razão Geral'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
