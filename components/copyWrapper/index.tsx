import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useClipboard } from '../../hooks';

interface CopyWrapperContextType {
  hasCopied: boolean;
  copy: (text: string) => void;
}

const CopyWrapperContext = createContext<CopyWrapperContextType | undefined>(undefined);

export const useCopyWrapperContext = () => {
  const context = useContext(CopyWrapperContext);
  if (!context) {
    throw new Error('CopyWrapper subcomponents must be used within a CopyWrapper component');
  }
  return context;
};

interface CopyWrapperProps {
  children: ReactNode;
  className?: string;
  timeout?: number;
}

export const CopyWrapper: React.FC<CopyWrapperProps> & {
  Trigger: React.FC<{ children: ReactNode; text: string; className?: string }>;
  Content: React.FC<{ children: (hasCopied: boolean) => ReactNode }>;
} = ({ children, className = '', timeout = 2000 }) => {
  const { hasCopied, copy } = useClipboard(timeout);

  const contextValue = useMemo(() => ({ hasCopied, copy }), [hasCopied, copy]);

  return (
    <CopyWrapperContext.Provider value={contextValue}>
      <div 
        className={className} 
        data-copied={hasCopied}
      >
        {children}
      </div>
    </CopyWrapperContext.Provider>
  );
};

const Trigger: React.FC<{ children: ReactNode; text: string; className?: string }> = ({ 
  children, 
  text, 
  className = '' 
}) => {
  const { copy } = useCopyWrapperContext();
  
  return (
    <button 
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        copy(text);
      }}
      className={`cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit ${className}`}
    >
      {children}
    </button>
  );
};

const Content: React.FC<{ children: (hasCopied: boolean) => ReactNode }> = ({ children }) => {
  const { hasCopied } = useCopyWrapperContext();
  return <>{children(hasCopied)}</>;
};

CopyWrapper.Trigger = Trigger;
CopyWrapper.Content = Content;

export default CopyWrapper;
