import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronDown, Lock, Settings } from "lucide-react";
import ChatroomSidebar from "~/features/messages/components/chatroomSidebar";
import Drawer from "~/shared/components/ui/drawer/Drawer";
import Logo from "~/shared/components/logo";
import Input from "~/shared/components/ui/input";
import type { ChatroomDetail } from "~/shared/types/chat";
import type { User } from "~/shared/types/User";
import { authorizedFetch } from "~/shared/utils/apiHelper";
import { checkAccess, removeParticipant, banParticipant, unbanParticipant } from "~/shared/utils/controllers/chatroomController";
import { cryptSessionStorage } from "~/shared/utils/cryptSessionStorage";
import type { ReplyingTo } from "~/routes/ChatroomPage/types";

interface JoinRoomScreenProps {
  isMobile: boolean;
  displayDetail: ChatroomDetail | null;
  isConnected: boolean;
  isSubmitting: boolean;
  isHost: boolean;
  isCreator: boolean;
  isAlreadyParticipant: boolean;
  hasStoredCredentials?: boolean;
  joinPassword: string;
  passwordError: string | null;
  onBack: () => void;
  onNavigateHome: () => void;
  onLeaveRoom: () => void;
  onDeleteRoom: () => void;
  onEditRoom: () => void;
  onGenerateShareLink: () => Promise<void>;
  onSetJoinPassword: (password: string) => void;
  onJoinChatroom: () => void;
  onRemoveParticipant: (aid: string) => Promise<void>;
  onBanParticipant: (aid: string) => Promise<void>;
  onUnbanParticipant: (aid: string) => Promise<void>;
}

const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({
  isMobile,
  displayDetail,
  isConnected,
  isSubmitting,
  isHost,
  isCreator,
  isAlreadyParticipant,
  hasStoredCredentials,
  joinPassword,
  passwordError,
  onBack,
  onNavigateHome,
  onLeaveRoom,
  onDeleteRoom,
  onEditRoom,
  onGenerateShareLink,
  onSetJoinPassword,
  onJoinChatroom,
  onRemoveParticipant,
  onBanParticipant,
  onUnbanParticipant,
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const isLocked = displayDetail?.isLocked;
  const isConnecting = isLocked && !isConnected && isSubmitting;

  const connectionStatus = isConnected ? "connected" : "ready";
  const statusText = displayDetail?.participantCount === undefined
    ? connectionStatus
    : `${displayDetail.participantCount} participants • ${connectionStatus}`;

  return (
    <div className="flex h-dvh bg-transparent relative overflow-hidden transition-colors duration-300 w-full">
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Header */}
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
                <h1 className="font-bold text-foreground leading-tight">
                  {displayDetail?.roomname || "Loading..."}
                </h1>
                <p className="text-xs text-muted">
                  {statusText}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className={`p-2 rounded-full transition-all ${isOptionsOpen
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-white/5"
                }`}
              title="Room Options"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Messages Area - No skeleton for locked rooms until connecting */}
        <div className="flex-1 overflow-y-hidden p-4 space-y-4 relative z-10 flex flex-col">
          {/* Join Overlay - Now contained within the messages area */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px] z-20 transition-colors">
            <div className="bg-background p-8 rounded-3xl shadow-2xl border border-border max-w-sm w-full mx-4 text-center">
              <h2 className="text-xl font-bold mb-2 text-foreground">
                {displayDetail?.roomname || "Chatroom"}
              </h2>
              <p className="text-sm text-muted mb-6">
                {displayDetail?.description ||
                  "Join the room to see messages and participate."}
              </p>

              {((isLocked && !isCreator && !isAlreadyParticipant && !hasStoredCredentials)) ||
                (passwordError &&
                  (passwordError.toLowerCase().includes("password") ||
                    passwordError.toLowerCase().includes("locked"))) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-amber-500 mb-2">
                    <Lock size={18} />
                    <span className="text-sm font-semibold">
                      Password Protected
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="password"
                      value={joinPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSetJoinPassword(e.target.value)}
                      placeholder="Enter room password"
                      disabled={isConnecting}
                      error={passwordError || undefined}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && onJoinChatroom()}
                    />
                  </div>
                  <div className="flex flex-col gap-3 mt-6">
                    <button
                      onClick={onJoinChatroom}
                      disabled={isConnecting}
                      className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${isConnecting
                        ? "bg-primary/50 cursor-not-allowed"
                        : "bg-primary hover:opacity-90 shadow-primary/20"
                        }`}
                    >
                      {isConnecting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </div>
                      ) : (
                        "Enter Room"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onBack();
                        onNavigateHome();
                      }}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-xl font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mb-6"></div>
                  </div>
                  <p className="text-sm font-medium text-muted">
                    {isConnected
                      ? "Joining room..."
                      : "Connecting to service..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isMobile && (
        <>
          {/* Backdrop for screens between 768px and 1024px */}
          <button
            type="button"
            aria-label="Close options"
            className={`fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 lg:hidden transition-opacity duration-300 border-none outline-none ${isOptionsOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
              }`}
            onClick={() => setIsOptionsOpen(false)}
          />
          <div
            className={`z-50 lg:z-auto transition-all duration-300 ease-in-out absolute right-0 top-0 h-full lg:relative lg:h-auto overflow-hidden ${isOptionsOpen
              ? "translate-x-0 w-80 opacity-100 shadow-2xl lg:shadow-none"
              : "translate-x-full lg:translate-x-0 w-0 lg:w-0 opacity-0"
              }`}
          >
            <div className="w-80 h-full">
              <ChatroomSidebar
                participants={[]}
                isHost={isHost}
                hostAid={displayDetail?.hostAid || ""}
                creatorAid={displayDetail?.creatorAid || ""}
                roomName={displayDetail?.roomname || ""}
                roomDescription={displayDetail?.description}
                allowedFeatures={displayDetail?.allowedFeatures}
                onRemoveParticipant={onRemoveParticipant}
                onBanParticipant={onBanParticipant}
                onUnbanParticipant={onUnbanParticipant}
                onLeaveRoom={onLeaveRoom}
                onEditRoom={onEditRoom}
                onDeleteRoom={onDeleteRoom}
                onGenerateShareLink={onGenerateShareLink}
                isConnected={isConnected}
              />
            </div>
          </div>
        </>
      )}

      {isMobile && (
        <Drawer
          isOpen={isOptionsOpen}
          onClose={() => setIsOptionsOpen(false)}
          side="bottom"
          height="95dvh"
        >
          <Drawer.Header
            title="Room Options"
            onClose={() => setIsOptionsOpen(false)}
          />
          <Drawer.Content className="p-0">
            <ChatroomSidebar
              participants={[]}
              isHost={isHost}
              creatorAid={displayDetail?.creatorAid || ""}
              hostAid={displayDetail?.hostAid || ""}
              roomName={displayDetail?.roomname || ""}
              roomDescription={displayDetail?.description}
              allowedFeatures={displayDetail?.allowedFeatures}
              onRemoveParticipant={onRemoveParticipant}
              onBanParticipant={onBanParticipant}
              onUnbanParticipant={onUnbanParticipant}
              onLeaveRoom={onLeaveRoom}
              onEditRoom={onEditRoom}
              onDeleteRoom={onDeleteRoom}
              onGenerateShareLink={onGenerateShareLink}
              isConnected={isConnected}
              hideHeader={true}
            />
          </Drawer.Content>
        </Drawer>
      )}
    </div>
  );
};

export default JoinRoomScreen;
