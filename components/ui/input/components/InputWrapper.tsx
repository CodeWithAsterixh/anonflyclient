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
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {children}
      </div>

      {error ? (
        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
