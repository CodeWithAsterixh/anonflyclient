import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { DrawerProps, DrawerSide } from "./types";

const DrawerRoot: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  side = "right",
  title,
  children,
  className = "",
  size = "",
  height = "",
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger the transition after the initial render
      const timer = setTimeout(() => setIsActive(true), 10);
      document.body.style.overflow = "hidden";
      return () => clearTimeout(timer);
    } else {
      setIsActive(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const sideStyles: Record<DrawerSide, string> = {
    right: `right-0 top-0 h-full w-full sm:max-w-md border-l ${isActive ? "translate-x-0" : "translate-x-full"}`,
    left: `left-0 top-0 h-full w-full sm:max-w-md border-r ${isActive ? "translate-x-0" : "-translate-x-full"}`,
    top: `top-0 left-0 w-full h-auto max-h-[80%] border-b ${isActive ? "translate-y-0" : "-translate-y-full"}`,
    bottom: `bottom-0 left-0 w-full rounded-t-3xl border-t ${isActive ? "translate-y-0" : "translate-y-full"}`,
  };

  const defaultSizes: Record<DrawerSide, string> = {
    right: "sm:max-w-md",
    left: "sm:max-w-md",
    top: "h-auto",
    bottom: height || "h-auto max-h-[95dvh]",
  };

  if (!shouldRender && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${isActive ? "visible" : "invisible delay-300"}`}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close drawer"
        className={`absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm transition-opacity duration-300 border-none cursor-default ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div
        className={`absolute bg-background shadow-2xl transition-transform duration-300 ease-in-out border-border flex flex-col ${
          sideStyles[side]
        } ${size || defaultSizes[side]} ${className}`}
        style={side === "bottom" && height ? { height } : {}}
      >
        {children}
      </div>
    </div>
  );
};

const DrawerHeader: React.FC<{ title?: string; onClose: () => void; children?: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
    {title && <h2 className="text-lg font-bold text-foreground">{title}</h2>}
    {children}
    <button
      onClick={onClose}
      className="p-2 text-muted hover:text-foreground hover:bg-white/5 rounded-full transition-all ml-auto"
      aria-label="Close drawer"
    >
      <X size={20} />
    </button>
  </div>
);

const DrawerContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`flex-1 overflow-y-auto p-4 ${className}`}>
    {children}
  </div>
);

const DrawerFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`p-4 border-t border-border shrink-0 ${className}`}>
    {children}
  </div>
);

export const Drawer = Object.assign(DrawerRoot, {
  Header: DrawerHeader,
  Content: DrawerContent,
  Footer: DrawerFooter,
});

export default Drawer;
