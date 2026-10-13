import React from 'react';

export type StatusVariant = 'success' | 'warning' | 'error' | 'primary' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = true,
}) => {
  const variantStyles: Record<StatusVariant, { bg: string; text: string; dotColor: string; border: string }> = {
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      dotColor: 'bg-emerald-600',
      border: 'border-emerald-200',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      dotColor: 'bg-amber-600',
      border: 'border-amber-200',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      dotColor: 'bg-red-600',
      border: 'border-red-200',
    },
    primary: {
      bg: 'bg-blue-50',
      text: 'text-[#015FC4]',
      dotColor: 'bg-[#015FC4]',
      border: 'border-blue-200',
    },
    neutral: {
      bg: 'bg-slate-100',
      text: 'text-[#41515D]',
      dotColor: 'bg-[#41515D]',
      border: 'border-slate-200',
    },
  };

  const style = variantStyles[variant];
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${style.bg} ${style.text} ${style.border} ${sizeClasses} tabular-nums`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotColor}`} />}
      <span>{children}</span>
    </span>
  );
};
