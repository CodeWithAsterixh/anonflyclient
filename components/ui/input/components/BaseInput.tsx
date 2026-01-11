import React, { forwardRef } from "react";
import type { InputProps } from "../types";

export const BaseInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", leftIcon, rightIcon, error, type = "text", ...props }, ref) => {
    return (
      <>
        {leftIcon && (
          <div className="absolute left-3 text-muted pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          {...props}
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-2.5 
            bg-white/5
            border border-border
            rounded-xl text-foreground
            placeholder:text-muted/60
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon ? "pr-10" : ""}
            ${error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
            ${className}
          `}
        />

        {rightIcon && (
          <div className="absolute right-3 text-muted">
            {rightIcon}
          </div>
        )}
      </>
    );
  }
);

BaseInput.displayName = "BaseInput";
