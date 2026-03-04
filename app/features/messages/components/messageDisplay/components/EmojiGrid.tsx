import React from "react";
import { allEmojis, type Emoji } from "~/shared/assets/emojis";

interface EmojiGridProps {
  onReact: (emoji: Emoji) => void;
  userReactions?: string[];
}

export const EmojiGrid: React.FC<EmojiGridProps> = ({
  onReact,
  userReactions = [],
}) => (
  <div className="bg-background/95 backdrop-blur-md border border-border rounded-2xl p-3 shadow-2xl w-64 grid grid-cols-5 gap-2 animate-in slide-in-from-top-2 duration-200">
    {allEmojis.map((emoji) => {
      const isSelected = userReactions.includes(emoji.id);
      return (
        <button
          key={emoji.id}
          onClick={(e) => {
            e.stopPropagation();
            onReact(emoji);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all hover:scale-110 active:scale-90 ${isSelected ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-white/5"
            }`}
        >
          {emoji.value}
        </button>
      );
    })}
  </div>
);
