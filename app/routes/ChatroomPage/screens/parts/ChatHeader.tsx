import React from "react";
import { ChevronDown, Settings, LogOutIcon } from "lucide-react";
import Logo from "~/shared/components/logo";
import type { ChatroomDetail, Participant } from "~/shared/types/chat";

interface ChatHeaderProps {
  isMobile: boolean;
  displayDetail: ChatroomDetail | null;
  isConnected: boolean;
  participants: Participant[];
  isOptionsOpen: boolean;
  setIsOptionsOpen: (isOpen: boolean) => void;
  onBack: () => void;
  onNavigateHome: () => void;
  onLeaveRoom: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isMobile,
  displayDetail,
  isConnected,
  participants,
  isOptionsOpen,
  setIsOptionsOpen,
  onBack,
  onNavigateHome,
  onLeaveRoom,
}) => {
  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border shadow-sm flex flex-col gap-1 justify-between items-center z-10">
      {isMobile && <Logo showText size={32} className="py-2" />}
      <div className="w-full flex justify-between items-center bg-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onBack();
              onNavigateHome();
            }}
            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
          >
            <ChevronDown className="w-5 h-5 rotate-90 text-muted group-hover:text-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-foreground leading-tight">
                {displayDetail?.roomname || "Loading..."}
              </h1>
              {displayDetail?.isPrivate && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded uppercase tracking-wider">
                  Private
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOptionsOpen(true)}
              className={`text-xs text-muted transition-colors text-left hover:text-primary`}
            >
              {participants.length} participant
              {participants.length === 1 ? "" : "s"} •{" "}
              {isConnected ? (
                <span className="text-primary font-medium">
                  connected
                </span>
              ) : (
                "connecting..."
              )}
              {displayDetail?.creatorAid && (
                <>
                  {" • "}
                  <span className={`font-medium ${displayDetail.isCreatorOnline ? 'text-primary' : 'text-muted'}`}>
                    creator {displayDetail.isCreatorOnline ? 'online' : 'offline'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="w-fit flex gap-2 items-center justify-end">
          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className={`p-2 rounded-full transition-all ${isOptionsOpen
              ? "bg-primary/10 text-primary"
              : "text-muted hover:bg-white/5"
              }`}
            title="Room Options"
            aria-label="Room options"
          >
            <Settings size={20} />
          </button>

          {isMobile ? (
            <button
              onClick={onLeaveRoom}
              className={`p-2 rounded-full transition-all text-destructive hover:bg-destructive/10`}
              title="Leave Room"
            >
              <LogOutIcon size={20} />
            </button>
          ) : (
            !isOptionsOpen && (
              <button
                onClick={onLeaveRoom}
                className={`p-2 rounded-full transition-all text-destructive hover:bg-destructive/10`}
                title="Leave Room"
              >
                <LogOutIcon size={20} />
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};
