import React from 'react';

interface EduGestLogoProps {
  variant?: 'light' | 'dark';
  collapsed?: boolean;
}

export const EduGestLogo: React.FC<EduGestLogoProps> = ({ variant = 'dark', collapsed = false }) => {
  const isLight = variant === 'light'; // Light text for dark navy background

  return (
    <div className="flex items-center gap-3">
      {/* Brand Icon Mark */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#015FC4] shadow-sm">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Graduation Cap / Book Crest with Tech Nodes */}
          <path
            d="M12 3L2 8L12 13L22 8L12 3Z"
            fill="#FFFFFF"
          />
          <path
            d="M5 10.5V15.5C5 17.5 8.134 19.5 12 19.5C15.866 19.5 19 17.5 19 15.5V10.5"
            stroke="#FFFFFF"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 8V15"
            stroke="#FFFFFF"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="12" cy="13" r="2" fill="#012041" />
        </svg>
      </div>

      {/* Brand Typography */}
      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`text-xl font-bold tracking-tight ${isLight ? 'text-white' : 'text-[#012041]'}`}>
              Edu<span className="text-[#015FC4]">Gest</span>
            </span>
          </div>
          <span className={`text-[10px] font-semibold tracking-wider uppercase mt-1 ${isLight ? 'text-[#8EA5B8]' : 'text-[#41515D]'}`}>
            Angola · Gestão Escolar
          </span>
        </div>
      )}
    </div>
  );
};
