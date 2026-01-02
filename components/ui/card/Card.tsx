import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
