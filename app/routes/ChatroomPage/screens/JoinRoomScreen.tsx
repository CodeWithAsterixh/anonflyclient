import React, { useState } from "react";
import { ChevronDown, Lock, Settings } from "lucide-react";
import ChatroomSidebar from "../../../../components/chatroomSidebar";
import Drawer from "../../../../components/ui/drawer/Drawer";
import Logo from "../../../../components/logo";
import Input from "../../../../components/ui/input";
import type { ChatroomDetail } from "../../../../lib/types/chat";

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
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-1 justify-between items-center z-10">
          {isMobile && <Logo showText size={32} className="py-2" />}
          <div className="w-full flex justify-between items-center bg-neutral-200/30 dark:bg-gray-800/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onBack();
                  onNavigateHome();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
              >
                <ChevronDown className="w-5 h-5 rotate-90 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </button>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {displayDetail?.roomname || "Loading..."}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {statusText}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className={`p-2 rounded-full transition-all ${
                isOptionsOpen
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
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
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-[2px] z-20 transition-colors">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-sm w-full mx-4 text-center">
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                {displayDetail?.roomname || "Chatroom"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {displayDetail?.description ||
                  "Join the room to see messages and participate."}
              </p>

              {((isLocked && !isCreator && !isAlreadyParticipant && !hasStoredCredentials)) ||
                (passwordError &&
                (passwordError.toLowerCase().includes("password") ||
                  passwordError.toLowerCase().includes("locked"))) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-500 mb-2">
                    <Lock size={18} />
                    <span className="text-sm font-semibold">
                      Password Protected
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="password"
                      value={joinPassword}
                      onChange={(e) => onSetJoinPassword(e.target.value)}
                      placeholder="Enter room password"
                      disabled={isConnecting}
                      error={passwordError || undefined}
                      onKeyDown={(e) => e.key === "Enter" && onJoinChatroom()}
                    />
                  </div>
                  <div className="flex flex-col gap-3 mt-6">
                    <button
                      onClick={onJoinChatroom}
                      disabled={isConnecting}
                      className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                        isConnecting
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-blue-500/20"
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
                      className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600/20 border-t-blue-600 mb-6"></div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
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
            className={`fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 lg:hidden transition-opacity duration-300 border-none outline-none ${
              isOptionsOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsOptionsOpen(false)}
          />
          <div
            className={`z-50 lg:z-auto transition-all duration-300 ease-in-out absolute right-0 top-0 h-full lg:relative lg:h-auto overflow-hidden ${
              isOptionsOpen
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
