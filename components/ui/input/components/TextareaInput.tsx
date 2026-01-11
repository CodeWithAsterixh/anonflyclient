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
          bg-white/5
          border border-border
          rounded-xl text-foreground
          placeholder:text-muted/60
          focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          min-h-[100px]
          resize-none
          ${error ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
          ${className}
        `}
      />
    );
  }
);

TextareaInput.displayName = "TextareaInput";
