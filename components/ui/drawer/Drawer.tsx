import React, { useEffect } from "react";
import { X } from "lucide-react";
import type { DrawerProps, DrawerSide } from "./types";

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  side = "right",
  title,
  children,
  className = "",
  size = "",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const sideStyles: Record<DrawerSide, string> = {
    right: `right-0 top-0 h-full w-full sm:max-w-md border-l ${isOpen ? "translate-x-0" : "translate-x-full"}`,
    left: `left-0 top-0 h-full w-full sm:max-w-md border-r ${isOpen ? "translate-x-0" : "-translate-x-full"}`,
    top: `top-0 left-0 w-full h-auto max-h-[80%] border-b ${isOpen ? "translate-y-0" : "-translate-y-full"}`,
    bottom: `bottom-0 left-0 w-full h-auto max-h-[80%] border-t ${isOpen ? "translate-y-0" : "translate-y-full"}`,
  };

  const defaultSizes: Record<DrawerSide, string> = {
    right: "sm:max-w-md",
    left: "sm:max-w-md",
    top: "h-auto",
    bottom: "h-auto",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div
        className={`absolute bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ease-in-out border-gray-200 dark:border-gray-800 flex flex-col ${
          sideStyles[side]
        } ${size || defaultSizes[side]} ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
