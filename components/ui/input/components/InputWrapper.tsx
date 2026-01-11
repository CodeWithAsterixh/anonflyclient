import React from "react";
import type { BaseProps } from "../types";

interface InputWrapperProps extends BaseProps {
  id?: string;
  children: React.ReactNode;
}

export const InputWrapper: React.FC<InputWrapperProps> = ({
  label,
  error,
  helperText,
  id,
  containerClassName = "",
  labelClassName = "",
  children,
}) => {
  const renderMessage = () => {
    if (error) {
      return (
        <p className="text-xs text-destructive mt-0.5">
          {error}
        </p>
      );
    }
    
    if (helperText) {
      return (
        <p className="text-xs text-muted mt-0.5">
          {helperText}
        </p>
      );
    }

    return null;
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium text-foreground ${labelClassName}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {children}
      </div>

      {renderMessage()}
    </div>
  );
};
