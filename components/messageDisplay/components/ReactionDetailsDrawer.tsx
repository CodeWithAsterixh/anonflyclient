
import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import Drawer from "../../ui/drawer/Drawer";
import Avatar from "../../ui/avatar";
import { useIsMobile } from "../../../hooks";
import { type Reaction } from "./ReactionList";

interface ReactionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reactions: Reaction[];
  currentUserId?: string | null;
  onUnreact?: (emojiId: string) => void;
}

export const ReactionDetailsDrawer: React.FC<ReactionDetailsDrawerProps> = ({
  isOpen,
  onClose,
  reactions,
  currentUserId,
  onUnreact,
}) => {
  const [activeTab, setActiveTab] = useState<string>("All");
  const isMobile = useIsMobile();

  const groupedReactions = useMemo(() => {
    const groups: Record<string, Reaction[]> = {
      All: reactions,
    };

    reactions.forEach((r) => {
      if (!groups[r.emojiValue]) {
        groups[r.emojiValue] = [];
      }
      groups[r.emojiValue].push(r);
    });

    return groups;
  }, [reactions]);

  const tabs = Object.keys(groupedReactions).sort((a, b) => {
    if (a === "All") return -1;
    if (b === "All") return 1;
    return 0;
  });

  // Reset active tab when drawer opens if current tab doesn't exist anymore
  React.useEffect(() => {
    if (isOpen && !groupedReactions[activeTab]) {
      setActiveTab("All");
    }
  }, [isOpen, groupedReactions, activeTab]);

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      side={isMobile ? "bottom" : "right"} 
      height={isMobile ? "50vh" : ""}
    >
      <div className="flex flex-col h-full bg-background overflow-hidden">
        <Drawer.Header title="Reactions" onClose={onClose} />

        {/* Tabs */}
        <div className="flex gap-2 p-2 border-b border-border overflow-x-auto no-scrollbar bg-background/50">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-white/5 text-muted hover:bg-white/10"
              }`}
            >
              <span>{tab === "All" ? "All" : tab}</span>
              <span className={`text-[10px] ${activeTab === tab ? "opacity-90" : "opacity-50"}`}>
                {groupedReactions[tab].length}
              </span>
            </button>
          ))}
        </div>

        {/* User List */}
        <Drawer.Content className="custom-scrollbar">
          <div className="space-y-4">
            {groupedReactions[activeTab]?.map((reaction, index) => (
              <div
                key={`${reaction.userAid}-${index}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <Avatar 
                  userAid={reaction.userAid} 
                  name={reaction.username} 
                  size="md" 
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {reaction.username}
                  </p>
                  <p className="text-[10px] text-muted font-mono opacity-50">
                    {reaction.userAid.substring(0, 8)}...
                  </p>
                </div>
                {activeTab === "All" ? (
                  <div className="flex items-center gap-2">
                    <div className="text-xl bg-white/5 w-10 h-10 flex items-center justify-center rounded-lg border border-white/5 group-hover:bg-white/10 transition-all">
                      {reaction.emojiValue}
                    </div>
                    {reaction.userAid === currentUserId && (
                      <button
                        onClick={() => onUnreact?.(reaction.emojiId)}
                        className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                        aria-label="Remove reaction"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  reaction.userAid === currentUserId && (
                    <button
                      onClick={() => onUnreact?.(reaction.emojiId)}
                      className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                      aria-label="Remove reaction"
                    >
                      <X size={16} />
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </Drawer.Content>
      </div>
    </Drawer>
  );
};
