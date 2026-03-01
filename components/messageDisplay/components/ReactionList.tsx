import React from 'react';

export interface Reaction {
  emojiValue: string;
  username: string;
  userAid: string;
  emojiId: string;
  emojiType: string;
}

export interface ReactionListProps {
  reactions: Reaction[];
  onShowDetails?: (reactions: Reaction[], messageId: string) => void;
  messageId: string;
}

const ReactionList: React.FC<ReactionListProps> = ({ reactions, onShowDetails, messageId }) => {
  if (!reactions || reactions.length === 0) return null;

  const groupedReactions = reactions.reduce((acc: { emoji: string; count: number; users: string[] }[], curr) => {
    const existing = acc.find((a) => a.emoji === curr.emojiValue);
    if (existing) {
      existing.count++;
      existing.users.push(curr.username);
    } else {
      acc.push({
        emoji: curr.emojiValue,
        count: 1,
        users: [curr.username],
      });
    }
    return acc;
  }, []);

  // Display max 3 emojis individually, then the total count
  const displayEmojis = groupedReactions.slice(0, 3).map(r => r.emoji);
  const totalCount = reactions.length;

  return (
    <button
      className="absolute -bottom-3 flex items-center z-20 focus:outline-none"
      onClick={(e) => {
        e.stopPropagation();
        if (onShowDetails) onShowDetails(reactions, messageId);
      }}
      aria-label="View reactions"
    >
      <div className="bg-background/90 backdrop-blur-sm border border-border rounded-full px-2 py-0.5 shadow-sm text-[11px] flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer active:scale-95 group">
        <div className="flex -space-x-1">
          {displayEmojis.map((emoji) => (
            <span key={`${messageId}-${emoji}`} className="relative z-1 group-hover:scale-110 transition-transform">
              {emoji}
            </span>
          ))}
        </div>
        <span className="font-bold text-muted/80 text-[10px] ml-0.5">
          {totalCount > 0 ? totalCount : ""}
        </span>
      </div>
    </button>
  );
};

export default ReactionList;
