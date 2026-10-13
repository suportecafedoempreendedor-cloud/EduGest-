import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Printer,
  Calendar,
  Layers,
  Search,
  DollarSign,
  ArrowRightLeft,
  X,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ContaBancaria, LinhaExtratoBancario } from '../../types/accountingFinance';
import { getStoredExtratos, conciliarMovimentoBancario } from '../../services/accountingFinanceService';

interface BankReconciliationTabProps {
  contasBancarias: ContaBancaria[];
  schoolName: string;
}

export const BankReconciliationTab: React.FC<BankReconciliationTabProps> = ({
  contasBancarias,
  schoolName,
}) => {
  const [selectedContaId, setSelectedContaId] = useState(contasBancarias[0]?.id || 'bnc-01');
  const [extratos, setExtratos] = useState<LinhaExtratoBancario[]>(() =>
    getStoredExtratos('esc-001', selectedContaId)
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedConta = contasBancarias.find((c) => c.id === selectedContaId) || contasBancarias[0];

  const handleSelectConta = (id: string) => {
    setSelectedContaId(id);
    setExtratos(getStoredExtratos('esc-001', id));
  };

  const handleConciliarLinha = (linhaId: string) => {
    const res = conciliarMovimentoBancario(
      'esc-001',
      selectedContaId,
      linhaId,
      'Dr. António Bento (Contabilista)'
    );
    if (res.success) {
      setExtratos(getStoredExtratos('esc-001', selectedContaId));
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const pendentesConciliacao = extratos.filter((e) => !e.conciliado);

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selecção de Contas Bancárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contasBancarias.map((bnc) => {
          const isSelected = bnc.id === selectedContaId;
          return (
            <div
              key={bnc.id}
              onClick={() => handleSelectConta(bnc.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#015FC4] bg-blue-50/40 shadow-sm ring-2 ring-[#015FC4]/20'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-[#015FC4] uppercase block">
                    {bnc.siglaBanco} · Moeda: {bnc.moeda}
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">{bnc.bancoNome}</h4>
                </div>
                <Building2 className="w-5 h-5 text-[#015FC4]" />
              </div>

              <div className="space-y-1 text-xs pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Saldo Razão Contábil:</span>
                  <strong className="font-mono text-gray-900">
                    {bnc.saldoContabilisticoKz.toLocaleString('pt-AO')} Kz
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Saldo Extracto Banco:</span>
                  <strong className="font-mono text-emerald-700">
                    {bnc.saldoExtratoBancarioKz.toLocaleString('pt-AO')} Kz
                  </strong>
                </div>
                <div className="text-[10px] text-gray-400 font-mono pt-1">
                  IBAN: {bnc.iban}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel da Conciliação Activa */}
      <div id="hr-printable-area" className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#015FC4] uppercase tracking-wider block">
                Extracto & Conciliação Bancária Assistida
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-0.5">
              {selectedConta?.bancoNome} — Conta nº {selectedConta?.numeroConta}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              IBAN Oficial: {selectedConta?.iban} · Última conciliação: {selectedConta?.dataUltimaConciliacao}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto no-print">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => alert('Para importar extractos em formato OFX ou CSV, utilize a ferramenta de importação no submódulo de Migração de Dados.')}
              icon={<Upload className="w-4 h-4" />}
            >
              Importar Extracto
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              icon={<Printer className="w-4 h-4" />}
            >
              Imprimir Mapa
            </Button>
          </div>
        </div>

        {/* Resumo de Conciliação */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
          <div>
            <span className="text-gray-500 block text-[11px]">Saldo no Extracto Bancário:</span>
            <strong className="font-mono text-gray-900 text-sm">
              {selectedConta?.saldoExtratoBancarioKz.toLocaleString('pt-AO')} Kz
            </strong>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">Saldo no Livro Razão (Conta {selectedConta?.contaContabilisticaPGC}):</span>
            <strong className="font-mono text-gray-900 text-sm">
              {selectedConta?.saldoContabilisticoKz.toLocaleString('pt-AO')} Kz
            </strong>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">Divergência / Movimentos Pendentes:</span>
            <strong className={`font-mono text-sm ${pendentesConciliacao.length === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {pendentesConciliacao.length === 0 ? '0 Kz (100% Conciliado)' : `${pendentesConciliacao.length} movimento(s) pendente(s)`}
            </strong>
          </div>
        </div>

        {/* Tabela de Movimentos do Extracto */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Data Mov.</th>
                <th className="py-2.5 px-3">Data Valor</th>
                <th className="py-2.5 px-3">Descrição no Extracto Bancário</th>
                <th className="py-2.5 px-3">Referência</th>
                <th className="py-2.5 px-3 text-right font-mono">Débito Kz</th>
                <th className="py-2.5 px-3 text-right font-mono">Crédito Kz</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center no-print">Operação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {extratos.map((lin) => (
                <tr key={lin.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-gray-600">{lin.dataMovimento}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-500">{lin.dataValor}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-900">{lin.descricaoExtrato}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-500">{lin.documentoReferencia}</td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-rose-700">
                    {lin.debitoKz > 0 ? `-${lin.debitoKz.toLocaleString('pt-AO')} Kz` : '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-bold text-emerald-700">
                    {lin.creditoKz > 0 ? `+${lin.creditoKz.toLocaleString('pt-AO')} Kz` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        lin.conciliado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {lin.conciliado ? 'Conciliado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center no-print">
                    {!lin.conciliado ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleConciliarLinha(lin.id)}
                        className="text-[11px] py-1"
                      >
                        Conciliar
                      </Button>
                    ) : (
                      <span className="text-[10px] text-gray-400">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
