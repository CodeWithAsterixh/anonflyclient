import React from 'react';
import { X } from 'lucide-react';

interface PreviewProps {
  content: string;
  title: string;
  onCancel: () => void;
  isEdit?: boolean;
}

export const MessagePreview: React.FC<PreviewProps> = ({ content, title, onCancel, isEdit }) => (
  <div className={`flex items-center gap-2 ${isEdit ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500' : 'bg-gray-50 dark:bg-gray-800 border-blue-500 dark:border-blue-400'} border-l-4 p-2 rounded-r-lg animate-in slide-in-from-bottom-2 duration-200`}>
    <div className="flex-1 min-w-0">
      <p className={`text-xs font-bold ${isEdit ? 'text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'} truncate`}>
        {title}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate line-clamp-2 whitespace-pre-wrap">
        {content}
      </p>
    </div>
    <button 
      onClick={onCancel}
      className={`p-1 ${isEdit ? 'hover:bg-blue-100 dark:hover:bg-blue-800/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} rounded-full transition-colors`}
      aria-label="Cancel"
    >
      <X className={`w-4 h-4 ${isEdit ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
    </button>
  </div>
);
