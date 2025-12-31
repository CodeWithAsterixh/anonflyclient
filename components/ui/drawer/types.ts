import type { ReactNode } from "react";

export type DrawerSide = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: DrawerSide;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: string; // e.g., "max-w-md", "h-1/2", etc.
}
