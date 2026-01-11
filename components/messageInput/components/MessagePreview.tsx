import React from 'react';
import { X } from 'lucide-react';
import { formatMessage } from '../../../lib/helpers/markdown';

interface PreviewProps {
  content: string;
  title: string;
  onCancel: () => void;
  isEdit?: boolean;
}

export const MessagePreview: React.FC<PreviewProps> = ({ content, title, onCancel, isEdit }) => (
  <div className={`flex items-center gap-2 ${isEdit ? 'bg-primary/10 border-primary' : 'bg-gray-50 dark:bg-gray-800 border-primary'} border-l-4 p-2 rounded-r-lg animate-in slide-in-from-bottom-2 duration-200`}>
    <div className="flex-1 min-w-0">
      <p className={`text-xs font-bold text-primary truncate`}>
        {title}
      </p>
      <div className="text-xs text-gray-500 dark:text-gray-400 truncate line-clamp-2 whitespace-pre-wrap">
        {formatMessage(content)}
      </div>
    </div>
    <button 
      onClick={onCancel}
      className={`p-1 ${isEdit ? 'hover:bg-primary/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} rounded-full transition-colors`}
      aria-label="Cancel"
    >
      <X className={`w-4 h-4 ${isEdit ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
    </button>
  </div>
);
