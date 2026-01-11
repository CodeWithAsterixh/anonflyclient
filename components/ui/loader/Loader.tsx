import React from "react";
import type { LoaderProps } from "./types";
import Logo from "../../logo";

const Loader: React.FC<LoaderProps> = ({
  message = "Loading...",
  description,
  progress,
  maxProgress = 5,
  fullScreen = true,
  className = "",
  error,
  animateText = true,
}) => {
  const containerClasses = `
    ${fullScreen ? "min-h-dvh" : "w-full py-12"} 
    bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-300
    ${className}
  `.trim();

  const textPulseClass = animateText ? "animate-pulse" : "";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-fit p-2 border border-primary/50 rounded-full relative isolate overflow-hidden">
            <span className="-z-10 size-full block absolute inset-0 bg-primary/50 rounded-full animate-pulse"/>
              <Logo size={32}/>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <p className={`text-gray-500 dark:text-gray-400 font-medium ${textPulseClass}`}>
            {message}
          </p>
          
          {(description || error) && (
            <p className={`text-sm ${error ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"}`}>
              {error || description}
            </p>
          )}
        </div>

        {/* Progress Bar (if provided) */}
        {progress !== undefined && (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(progress / maxProgress) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Retrying in <span className="font-bold text-primary">{Math.ceil(progress)}s</span>...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
