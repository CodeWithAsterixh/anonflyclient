import React from 'react';
import { X } from 'lucide-react';
import { formatMessage } from "~/shared/utils/markdown";

interface PreviewProps {
  content: string;
  title: string;
  onCancel: () => void;
  isEdit?: boolean;
}

export const MessagePreview: React.FC<PreviewProps> = ({ content, title, onCancel, isEdit }) => (
  <div className={`flex items-center gap-2 ${isEdit ? 'bg-primary/10 border-primary' : 'bg-white/5 border-primary'} border-l-4 p-2 rounded-r-lg animate-in slide-in-from-bottom-2 duration-200`}>
    <div className="flex-1 min-w-0">
      <p className={`text-xs font-bold text-primary truncate`}>
        {title}
      </p>
      <div className="text-xs text-muted truncate line-clamp-2 whitespace-pre-wrap">
        {formatMessage(content)}
      </div>
    </div>
    <button
      onClick={onCancel}
      className={`p-1 ${isEdit ? 'hover:bg-primary/20' : 'hover:bg-white/10'} rounded-full transition-colors`}
      aria-label="Cancel"
    >
      <X className={`w-4 h-4 ${isEdit ? 'text-primary' : 'text-muted'}`} />
    </button>
  </div>
);
