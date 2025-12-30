import React from "react";
import { Reply, Edit2, Trash2 } from "lucide-react";

interface ActionMenuProps {
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable: boolean;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  onReply,
  onEdit,
  onDelete,
  isEditable,
}) => (
  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl p-1 shadow-2xl min-w-[200px] animate-in slide-in-from-top-2 duration-300">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onReply();
      }}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-200 rounded-xl"
    >
      <Reply className="w-4 h-4" />
      <span className="text-sm font-medium">Reply</span>
    </button>

    {isEditable && (
      <>
        <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-blue-600 dark:text-blue-400 rounded-xl"
        >
          <Edit2 className="w-4 h-4" />
          <span className="text-sm font-medium">Edit Message</span>
        </button>
        <div className="h-px bg-gray-100 dark:bg-gray-700 mx-2" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-red-600 dark:text-red-400 rounded-xl"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Delete</span>
        </button>
      </>
    )}
  </div>
);
