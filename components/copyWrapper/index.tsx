import React, { createContext, useContext, type ReactNode } from 'react';
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

  return (
    <CopyWrapperContext.Provider value={{ hasCopied, copy }}>
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
    <div 
      onClick={(e) => {
        e.stopPropagation();
        copy(text);
      }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
};

const Content: React.FC<{ children: (hasCopied: boolean) => ReactNode }> = ({ children }) => {
  const { hasCopied } = useCopyWrapperContext();
  return <>{children(hasCopied)}</>;
};

CopyWrapper.Trigger = Trigger;
CopyWrapper.Content = Content;

export default CopyWrapper;
