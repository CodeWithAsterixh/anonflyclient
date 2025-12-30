import React from 'react';
import { X } from 'lucide-react';

interface PreviewProps {
  content: string;
  title: string;
  onCancel: () => void;
  isEdit?: boolean;
}

export const MessagePreview: React.FC<PreviewProps> = ({ content, title, onCancel, isEdit }) => (
  <div className={`flex items-center gap-2 ${isEdit ? 'bg-blue-50 border-blue-600' : 'bg-gray-50 border-blue-500'} border-l-4 p-2 rounded-r-lg animate-in slide-in-from-bottom-2 duration-200`}>
    <div className="flex-1 min-w-0">
      <p className={`text-xs font-bold ${isEdit ? 'text-blue-700' : 'text-blue-600'} truncate`}>
        {title}
      </p>
      <p className="text-xs text-gray-500 truncate line-clamp-2 whitespace-pre-wrap">
        {content}
      </p>
    </div>
    <button 
      onClick={onCancel}
      className={`p-1 ${isEdit ? 'hover:bg-blue-100' : 'hover:bg-gray-200'} rounded-full transition-colors`}
      aria-label="Cancel"
    >
      <X className={`w-4 h-4 ${isEdit ? 'text-blue-600' : 'text-gray-400'}`} />
    </button>
  </div>
);
