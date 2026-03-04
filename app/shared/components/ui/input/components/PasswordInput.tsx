import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { InputProps } from "../types";

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", leftIcon, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

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
          type={showPassword ? "text" : "password"}
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
            pr-10
            ${error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
            ${className}
          `}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 p-1 text-muted hover:text-foreground transition-colors focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
