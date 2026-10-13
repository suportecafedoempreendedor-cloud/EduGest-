import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#012041]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-[#41515D] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#012041] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#015FC4] focus:border-[#015FC4] ${
            icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-500 focus:ring-red-400 focus:border-red-500'
              : 'border-[#E2E8F0] hover:border-slate-300'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
      {hint && !error && <span className="text-xs text-[#41515D]">{hint}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  hint,
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[#012041]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#012041] transition-colors focus:outline-none focus:ring-2 focus:ring-[#015FC4] focus:border-[#015FC4] ${
          error
            ? 'border-red-500 focus:ring-red-400 focus:border-red-500'
            : 'border-[#E2E8F0] hover:border-slate-300'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
      {hint && !error && <span className="text-xs text-[#41515D]">{hint}</span>}
    </div>
  );
};
