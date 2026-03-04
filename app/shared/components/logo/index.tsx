import React from 'react';
import type { LogoProps } from './types';

const Logo: React.FC<LogoProps> = ({ className = "", size = 40, showText = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        width={size}
        height={size}
        alt="Anonfly Logo"
        className="drop-shadow-md object-contain"
      />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-xl tracking-tight text-primary">
            Anonfly
          </span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Free • Secure • Anon
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
