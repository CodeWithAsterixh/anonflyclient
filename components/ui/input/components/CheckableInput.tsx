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
          w-4 h-4 text-primary border-border focus:ring-primary disabled:opacity-50
          bg-white/5
          ${className}
        `}
      />
    );
  }
);

CheckableInput.displayName = "CheckableInput";
