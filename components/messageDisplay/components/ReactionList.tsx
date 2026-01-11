import React from 'react';

interface Reaction {
  emojiValue: string;
  username: string;
}

interface ReactionListProps {
  reactions: Reaction[];
}

const ReactionList: React.FC<ReactionListProps> = ({ reactions }) => {
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

  return (
    <div className="absolute -bottom-3 flex flex-wrap gap-1 z-20 px-1">
      {groupedReactions.map((reaction, i) => (
        <div
          key={i+1}
          title={reaction.users.join(", ")}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-full px-1.5 py-0.5 shadow-sm text-[10px] flex items-center gap-1 hover:scale-110 transition-transform cursor-default"
        >
          <span>{reaction.emoji}</span>
          <span className="font-bold text-gray-600 dark:text-gray-300">{reaction.count}</span>
        </div>
      ))}
    </div>
  );
};

export default ReactionList;
