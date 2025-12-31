import React, { forwardRef } from "react";
import type { TextareaProps } from "../types";

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <textarea
        {...props}
        ref={ref}
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
          min-h-[100px]
          resize-none
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500" : ""}
          ${className}
        `}
      />
    );
  }
);

TextareaInput.displayName = "TextareaInput";
