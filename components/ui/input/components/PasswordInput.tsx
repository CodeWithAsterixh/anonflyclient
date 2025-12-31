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
          <div className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`
            w-full px-4 py-2.5 
            bg-gray-50 dark:bg-gray-800/50 
            border border-gray-200 dark:border-gray-700 
            rounded-xl text-gray-900 dark:text-gray-100 
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            dark:focus:ring-blue-500/20 dark:focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${leftIcon ? "pl-10" : ""}
            pr-10
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500" : ""}
            ${className}
          `}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
