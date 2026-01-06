import React from 'react';
import type { LogoProps } from './types';

const Logo: React.FC<LogoProps> = ({ className = "", size = 40, showText = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 512 512" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
        role="img"
        aria-label="Anonfly Logo - Secure and Anonymous Messaging"
      >
        <defs>
          <linearGradient id="logo-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        
        {/* Lock Shackle (Security) */}
        <path 
          d="M176 192V144C176 99.8172 211.817 64 256 64C300.183 64 336 99.8172 336 144V192" 
          stroke="#3b82f6" 
          strokeWidth="32" 
          strokeLinecap="round"
        />
        
        {/* Shield Body (Security) */}
        <path 
          d="M128 160C128 160 128 280 128 320C128 400 256 464 256 464C256 464 384 400 384 320C384 280 384 160 384 160H128Z" 
          fill="url(#logo-shield-grad)" 
        />
        
        {/* Mask Eyes (Anonymity) */}
        <rect x="180" y="260" width="60" height="20" rx="10" fill="white" />
        <rect x="272" y="260" width="60" height="20" rx="10" fill="white" />
        
        {/* Wings (Free/Fly/Speed) */}
        <path d="M128 200L32 280L128 320" fill="#3b82f6" fillOpacity="0.6" />
        <path d="M384 200L480 280L384 320" fill="#3b82f6" fillOpacity="0.6" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Anonfly
          </span>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
            Free • Secure • Anon
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
