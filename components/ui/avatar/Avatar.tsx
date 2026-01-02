import React from 'react';
import { getUserColor } from '../../../lib/controllers/colorsProcessors/userAvatar';

export interface AvatarProps {
  name: string;
  userAid?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  userAid,
  size = 'md', 
  className = '',
  isOnline 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initial = name.charAt(0).toUpperCase();
  const backgroundColor = userAid ? getUserColor(userAid) : undefined;

  return (
    <div className="relative shrink-0">
      <div 
        className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white ${!backgroundColor ? 'bg-blue-600 dark:bg-blue-500' : ''} ${className}`}
        style={backgroundColor ? { backgroundColor } : {}}
      >
        {initial}
      </div>
      {isOnline !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white dark:border-gray-900 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      )}
    </div>
  );
};

export default Avatar;
