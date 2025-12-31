import React, { forwardRef } from "react";
import type { InputProps } from "../types";

export const CheckableInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => {
    return (
      <input
        {...props}
        ref={ref}
        type={type}
        className={`
          w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50
          ${className}
        `}
      />
    );
  }
);

CheckableInput.displayName = "CheckableInput";
