import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const configs = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      titleColor: 'text-emerald-950',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      titleColor: 'text-amber-950',
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
      titleColor: 'text-red-950',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-[#012041]',
      icon: <Info className="w-5 h-5 text-[#015FC4] shrink-0" />,
      titleColor: 'text-[#012041]',
    },
  };

  const current = configs[type];

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${current.bg} ${className}`}>
      {current.icon}
      <div className="flex-1 text-sm">
        {title && <h4 className={`font-semibold mb-1 ${current.titleColor}`}>{title}</h4>}
        <div className="leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-sm font-semibold ml-2 cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  );
};
