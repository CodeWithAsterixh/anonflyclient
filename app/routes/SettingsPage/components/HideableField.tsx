import React, { useState } from 'react';
import { Eye, EyeOff, Check, Copy } from 'lucide-react';
import CopyWrapper from '../../../../components/copyWrapper';

interface HideableFieldProps {
  label?: string;
  value: string;
  className?: string;
  labelClassName?: string;
  mono?: boolean;
  showLabelOnHidden?: boolean;
}

const HideableField: React.FC<HideableFieldProps> = ({
  label,
  value,
  className = "",
  labelClassName = "",
  mono = true,
  showLabelOnHidden = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const labelElement = label ? (
    <span className={`shrink-0 ${labelClassName}`}>
      {label}:
    </span>
  ) : null;

  if (!isVisible) {
    return (
      <div className={`flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 ${mono ? 'font-mono' : ''} ${className}`}>
        {showLabelOnHidden && labelElement}
        <span className="truncate tracking-widest opacity-50">••••••••••••••••</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(true);
          }}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-blue-500 shrink-0"
          title="Show"
        >
          <Eye size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 min-w-0 w-full ${className}`}>
      <CopyWrapper className="min-w-0 flex-1">
        <CopyWrapper.Trigger text={value} className={`flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 ${mono ? 'font-mono' : ''} hover:text-blue-500 transition-colors group min-w-0 w-full`}>
          {labelElement}
          <span className="truncate text-blue-600 dark:text-blue-400">{value}</span>
          <CopyWrapper.Content>
            {(hasCopied) => (
              hasCopied ? <Check size={12} className="text-green-500 shrink-0" /> : <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            )}
          </CopyWrapper.Content>
        </CopyWrapper.Trigger>
      </CopyWrapper>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-blue-500 shrink-0"
        title="Hide"
      >
        <EyeOff size={14} />
      </button>
    </div>
  );
};

export default HideableField;
