import React from "react";
import { Plus } from "lucide-react";
import { defaultEmojis, type Emoji } from "../../../lib/assets/emojis";

interface ReactionPickerProps {
  onReact: (emoji: Emoji) => void;
  onShowAll: () => void;
  showAllEmojis: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onReact,
  onShowAll,
  showAllEmojis,
}) => (
  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full px-2 py-1.5 shadow-2xl flex items-center gap-1">
    {defaultEmojis.map((emoji) => (
      <button
        key={emoji.id}
        onClick={(e) => {
          e.stopPropagation();
          onReact(emoji);
        }}
        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-xl transition-all hover:scale-125 active:scale-90"
      >
        {emoji.value}
      </button>
    ))}
    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
    <button
      onClick={(e) => {
        e.stopPropagation();
        onShowAll();
      }}
      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-all hover:scale-110 active:scale-90"
    >
      <Plus
        className={`w-5 h-5 transition-transform duration-300 ${
          showAllEmojis ? "rotate-45" : ""
        }`}
      />
    </button>
  </div>
);
