import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'blue' | 'amber' | 'green' | 'red' | 'gray';
  icon?: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gray', 
  icon,
  className = ''
}) => {
  const variants = {
    primary: 'bg-primary/20 text-primary',
    blue: 'bg-blue-500/20 text-blue-500',
    amber: 'bg-amber-500/20 text-amber-500',
    green: 'bg-green-500/20 text-green-500',
    red: 'bg-destructive/20 text-destructive',
    gray: 'bg-white/10 text-muted',
  };

  return (
    <span className={`text-xs ${variants[variant]} flex items-center justify-center gap-1 py-1 px-2 scale-[0.8] rounded-full font-medium ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
