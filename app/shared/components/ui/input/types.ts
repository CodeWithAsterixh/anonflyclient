import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export interface BaseProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  helperText?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {
  multiline?: boolean;
  rows?: number;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseProps {}
