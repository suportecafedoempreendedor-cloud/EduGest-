import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  noPadding = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-xl shadow-xs ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <div>
            {title && <h3 className="text-base font-semibold text-[#012041]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#41515D] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
};
