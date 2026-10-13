import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantClasses = {
    primary:
      'bg-[#015FC4] hover:bg-[#014FA5] active:bg-[#013f87] text-white border border-transparent shadow-xs font-medium',
    secondary:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-[#012041] border border-[#015FC4] shadow-xs font-medium',
    ghost:
      'bg-transparent hover:bg-slate-100 text-[#012041] border border-transparent font-medium',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#015FC4] ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
