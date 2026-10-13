import React, { useState } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck,
  Info,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ExercicioEconomico, PeriodoContabilistico } from '../../types/accountingFinance';

interface EconomicPeriodsTabProps {
  exercicio: ExercicioEconomico;
  onEncerrarPeriodo: (mes: number) => { success: boolean; message: string };
  onReabrirPeriodo: (mes: number, justificacao: string) => { success: boolean; message: string };
}

export const EconomicPeriodsTab: React.FC<EconomicPeriodsTabProps> = ({
  exercicio,
  onEncerrarPeriodo,
  onReabrirPeriodo,
}) => {
  const [reabrindoMes, setReabrindoMes] = useState<number | null>(null);
  const [justificacao, setJustificacao] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleEncerrar = (mes: number) => {
    const res = onEncerrarPeriodo(mes);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleConfirmarReabertura = () => {
    if (!reabrindoMes) return;
    const res = onReabrirPeriodo(reabrindoMes, justificacao);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setReabrindoMes(null);
      setJustificacao('');
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Banner de Estado do Exercício */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#015FC4] uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4 text-[#015FC4]" />
            <span>Exercício Económico de {exercicio.ano} (Angola)</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{exercicio.designacao}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Vigência: 01/01/{exercicio.ano} a 31/12/{exercicio.ano} · Moeda Funcional: Kwanza (AOA) · Referencial: PGC Angola
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Exercício Activo & Aberto
          </span>
        </div>
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

      {/* Regra de Ouro Contabilística */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-[#015FC4]" />
          <span>Regra de Controlo Interno & Integridade de Balanço:</span>
        </div>
        <p className="text-blue-800 text-[11px] leading-relaxed">
          Os períodos encerrados bloqueiam a inserção de novos lançamentos em partidas dobradas. Quaisquer ajustamentos a períodos encerrados exigem autorização formal, justificação expressa e deixam registo de auditoria indelével.
        </p>
      </div>

      {/* Lista dos 12 Períodos Mensais + Período 13 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercicio.periodos.map((per) => {
          const isEncerrado = per.estado === 'encerrado';
          return (
            <div
              key={per.id}
              className={`p-4 rounded-xl border transition-all ${
                isEncerrado
                  ? 'bg-gray-50/80 border-gray-200 text-gray-600'
                  : 'bg-white border-blue-200 shadow-2xs hover:border-[#015FC4]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-[#015FC4] uppercase block">
                    Período {per.mes}
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">{per.designacao}</h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                    isEncerrado ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isEncerrado ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  {per.estado}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>Datas:</span>
                  <span className="font-mono text-gray-700">{per.dataInicio} a {per.dataFim}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lançamentos Registados:</span>
                  <span className="font-mono font-bold text-gray-900">{per.totalLancamentos}</span>
                </div>
                {per.encerradoPor && (
                  <div className="text-[10px] text-gray-400 pt-1">
                    Encerrado por: {per.encerradoPor}
                  </div>
                )}
                {per.justificacaoReabertura && (
                  <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded">
                    Reaberto: {per.justificacaoReabertura}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                {isEncerrado ? (
                  <button
                    onClick={() => setReabrindoMes(per.mes)}
                    className="text-xs text-[#015FC4] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Reabrir com Justificação
                  </button>
                ) : (
                  <button
                    onClick={() => handleEncerrar(per.mes)}
                    className="text-xs text-rose-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" /> Encerrar Período Oficialmente
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Reabertura de Período */}
      {reabrindoMes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#012041] font-bold text-sm border-b border-gray-100 pb-2">
              <Unlock className="w-5 h-5 text-[#015FC4]" />
              <span>Reabrir Período Contabilístico {reabrindoMes}</span>
            </div>

            <p className="text-xs text-gray-600">
              A reabertura de um período previamente fechado requer justificação legal e deixará um registo nos logs de auditoria da instituição.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Justificação da Reabertura * (mínimo 10 caracteres)
              </label>
              <textarea
                rows={3}
                value={justificacao}
                onChange={(e) => setJustificacao(e.target.value)}
                placeholder="Ex: Rectificação de lançamento de fornecedor com suporte em nota de crédito emitida pela AGT..."
                className="w-full p-2.5 border border-gray-200 rounded-lg text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setReabrindoMes(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmarReabertura}>
                Confirmar Reabertura
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
