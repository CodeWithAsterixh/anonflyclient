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
          w-4 h-4 text-primary border-gray-300 focus:ring-primary disabled:opacity-50
          ${className}
        `}
      />
    );
  }
);

CheckableInput.displayName = "CheckableInput";
