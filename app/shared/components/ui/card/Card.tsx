import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={`w-full text-left bg-background border border-border shadow-sm rounded-2xl cursor-pointer hover:bg-white/5 transition-colors ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      className={`bg-background border border-border shadow-sm rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
