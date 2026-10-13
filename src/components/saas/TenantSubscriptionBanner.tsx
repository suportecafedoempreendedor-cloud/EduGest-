import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Calendar,
  X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SaaSSubscription } from '../../types/saasCommercial';

interface TenantSubscriptionBannerProps {
  subscription?: SaaSSubscription;
  onReactivate?: (subscriptionId: string) => void;
  onPayInvoice?: (subscriptionId: string) => void;
  isSuperAdmin?: boolean;
}

export const TenantSubscriptionBanner: React.FC<TenantSubscriptionBannerProps> = ({
  subscription,
  onReactivate,
  onPayInvoice,
  isSuperAdmin = false,
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reactivatedSuccess, setReactivatedSuccess] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  if (!subscription) return null;

  const { estado, escolaNome, planoNome, valorKz, dataRenovacao, ultimaReferenciaMulticaixa, entidadeMulticaixa } =
    subscription;

  // Se a subscrição está activa ou em trial normal, não mostra alerta crítico
  if (estado === 'active' || estado === 'trial') {
    return null;
  }

  const handleExecuteReactivation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setReactivatedSuccess(true);
      if (onReactivate) {
        onReactivate(subscription.id);
      }
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setReactivatedSuccess(false);
      }, 1500);
    }, 1000);
  };

  // Se o estado for 'past_due' (Período de tolerância amigável)
  if (estado === 'past_due' && !dismissBanner) {
    return (
      <>
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 px-4 py-3 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-md bg-amber-500/20 text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <div className="font-semibold text-amber-950 flex items-center gap-2">
                  <span>Subscrição em Atraso (Past Due) — {escolaNome}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                    Tolerância Operacional
                  </span>
                </div>
                <p className="text-amber-800 text-xs mt-0.5">
                  A renovação venceu em <span className="font-medium">{dataRenovacao}</span>. Seus dados e operações continuam 100% seguros. Regularize o valor de <span className="font-bold">{valorKz.toLocaleString('pt-AO')} Kz</span> para evitar restrições graduais.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="primary"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs border-amber-600"
                onClick={() => setIsPaymentModalOpen(true)}
                icon={<CreditCard className="w-3.5 h-3.5" />}
              >
                Regularizar via Multicaixa
              </Button>
              <button
                onClick={() => setDismissBanner(true)}
                className="p-1 text-amber-700 hover:text-amber-950 rounded"
                title="Fechar aviso temporariamente"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Pagamento e Regularização */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Regularização de Subscrição SaaS"
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold">Plano {planoNome} — {escolaNome}</p>
                <p>Após a liquidação da referência, a subscrição será reactivada automaticamente sem interrupção de serviços.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Entidade GPO Multicaixa:</span>
                <span className="font-mono font-bold text-slate-800">{entidadeMulticaixa || '00982'}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Referência de Pagamento:</span>
                <span className="font-mono font-bold text-[#015FC4] text-base tracking-wider">
                  {ultimaReferenciaMulticaixa || '921 789 443'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Montante a Liquidar:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {valorKz.toLocaleString('pt-AO')} Kz
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Garantia Ética:</strong> Os registos de alunos, avaliações e pautas nunca são eliminados por falta de pagamento.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
                Fechar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteReactivation}
                disabled={isProcessing}
                icon={reactivatedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <RefreshCw className="w-4 h-4" />}
              >
                {reactivatedSuccess ? 'Subscrição Regularizada!' : 'Confirmar Pagamento / Reactivar'}
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Se o estado for 'suspended' ou 'cancelled' (Bloqueio Total / Suspensão)
  if (estado === 'suspended' || estado === 'cancelled') {
    return (
      <div className="bg-red-500/10 border-b border-red-500/30 text-red-950 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-red-100 text-red-700 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="font-bold text-red-950 text-base">
                  {estado === 'suspended'
                    ? 'Acesso da Escola Temporariamente Suspenso'
                    : 'Subscrição Cancelada'}
                </h4>
                <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-red-200 text-red-800">
                  {estado === 'suspended' ? 'Subscrição Vencida' : 'Cancelada'}
                </span>
              </div>
              <p className="text-red-900/90 text-xs sm:text-sm mt-1 max-w-3xl">
                O período de carência do <strong>{planoNome}</strong> expirou. Para salvaguarda institucional, o acesso ao tenant está em modo de suspensão temporária.
              </p>
              {/* Notificação Obrigatória de Proteção de Dados */}
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 rounded-md px-3 py-1.5 inline-flex">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Garantia de Preservação:</strong> Nenhum dado da escola foi eliminado. Todos os processos, notas e cadastros estão preservados e serão restaurados instantaneamente na reactivação.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium border-emerald-600"
              onClick={() => setIsPaymentModalOpen(true)}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Reactivar Subscrição Imediatamente
            </Button>
          </div>
        </div>

        {/* Modal de Reactivação Instantânea */}
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Reactivar Subscrição da Escola"
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs space-y-1">
              <p className="font-bold text-sm text-emerald-950">
                Processo de Reactivação Segura
              </p>
              <p>
                A reactivação restabelece o acesso pleno a todos os utilizadores, professores e encarregados sem perda de qualquer registo ou histórico.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Instituição:</span>
                <span className="font-semibold text-slate-800">{escolaNome}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Plano Selecionado:</span>
                <span className="font-semibold text-[#015FC4]">{planoNome}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Valor da Regularização:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {valorKz.toLocaleString('pt-AO')} Kz
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-600">Referência Multicaixa:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {ultimaReferenciaMulticaixa || '921 332 991'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleExecuteReactivation}
                disabled={isProcessing}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {reactivatedSuccess ? 'Reactivado com Sucesso!' : 'Reactivar e Desbloquear Acesso'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return null;
};
