import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { ToastNotification, ToastType } from '../../types';

interface ToastProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, type, title, message, duration = 4500, action } = toast;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const configMap: Record<
    ToastType,
    {
      borderColor: string;
      accentBg: string;
      icon: React.ReactNode;
      defaultTitle: string;
      badgeColor: string;
    }
  > = {
    error: {
      borderColor: 'border-red-200',
      accentBg: 'bg-red-50 text-red-600',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
      defaultTitle: 'Erro no Processamento',
      badgeColor: 'bg-red-100 text-red-700',
    },
    success: {
      borderColor: 'border-emerald-200',
      accentBg: 'bg-emerald-50 text-emerald-600',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      defaultTitle: 'Sucesso',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    warning: {
      borderColor: 'border-amber-200',
      accentBg: 'bg-amber-50 text-amber-600',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      defaultTitle: 'Alerta Operacional',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    info: {
      borderColor: 'border-blue-200',
      accentBg: 'bg-blue-50 text-[#015FC4]',
      icon: <Info className="w-5 h-5 text-[#015FC4] shrink-0" />,
      defaultTitle: 'Informação',
      badgeColor: 'bg-blue-100 text-[#015FC4]',
    },
  };

  const current = configMap[type] || configMap.info;

  // Check if message indicates network issue
  const isNetworkIssue =
    message.toLowerCase().includes('rede') ||
    message.toLowerCase().includes('conex') ||
    message.toLowerCase().includes('timeout') ||
    message.toLowerCase().includes('offline');

  return (
    <div
      role="alert"
      className={`w-full max-w-md bg-white rounded-xl shadow-xl border ${current.borderColor} p-4 flex items-start gap-3.5 text-xs transition-all duration-200 transform translate-y-0 animate-in slide-in-from-bottom-3`}
    >
      {/* Icon with soft functional container */}
      <div className={`p-2 rounded-lg ${current.accentBg} shrink-0`}>
        {isNetworkIssue && type === 'error' ? (
          <WifiOff className="w-5 h-5 text-red-600" />
        ) : (
          current.icon
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-bold text-[#012041] text-sm leading-tight">
            {title || current.defaultTitle}
          </h4>
          <span
            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${current.badgeColor}`}
          >
            {type === 'error'
              ? 'Falha'
              : type === 'success'
              ? 'Concluído'
              : type === 'warning'
              ? 'Atenção'
              : 'SaaS'}
          </span>
        </div>

        <p className="text-[#41515D] text-xs leading-relaxed mt-1 break-words">
          {message}
        </p>

        {/* Optional Action Button */}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onDismiss(id);
            }}
            className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#012041] text-white hover:bg-[#015FC4] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(id)}
        className="text-[#41515D] hover:text-[#012041] p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
