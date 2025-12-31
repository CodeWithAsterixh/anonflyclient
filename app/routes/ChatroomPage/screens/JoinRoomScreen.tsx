import React from "react";
import { ChevronDown, Eye, EyeOff, Lock } from "lucide-react";
import ChatroomMenu from "../../../../components/chatroomMenu";
import ChatroomSkeleton from "../../../../components/chatroomSkeleton";
import Logo from "../../../../components/logo";
import type { ChatroomDetail } from "../../../../lib/types/chat";

interface JoinRoomScreenProps {
  isMobile: boolean;
  displayDetail: ChatroomDetail | null;
  isConnected: boolean;
  isSubmitting: boolean;
  isHost: boolean;
  joinPassword: string;
  showJoinPassword: boolean;
  passwordError: string | null;
  onBack: () => void;
  onNavigateHome: () => void;
  onLeaveRoom: () => void;
  onDeleteRoom: () => void;
  onEditRoom: () => void;
  onSetJoinPassword: (password: string) => void;
  onToggleShowJoinPassword: () => void;
  onJoinChatroom: () => void;
}

const JoinRoomScreen: React.FC<JoinRoomScreenProps> = ({
  isMobile,
  displayDetail,
  isConnected,
  isSubmitting,
  isHost,
  joinPassword,
  showJoinPassword,
  passwordError,
  onBack,
  onNavigateHome,
  onLeaveRoom,
  onDeleteRoom,
  onEditRoom,
  onSetJoinPassword,
  onToggleShowJoinPassword,
  onJoinChatroom,
}) => {
  const isLocked = displayDetail?.isLocked;
  const isConnecting = isLocked && !isConnected && isSubmitting;

  return (
    <div className="flex flex-col h-[100dvh] bg-transparent relative overflow-hidden transition-colors duration-300">
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
                  {displayDetail?.participantCount !== undefined
                    ? `${displayDetail.participantCount} participants • ${
                        isConnected ? "connected" : "ready"
                      }`
                    : isConnected
                    ? "connected"
                    : "ready"}
                </p>
              </div>
            </div>

            <ChatroomMenu
              onLeaveRoom={onLeaveRoom}
              onRemoveParticipant={() => {}}
              onDeleteRoom={onDeleteRoom}
              onEditRoom={onEditRoom}
              isHost={isHost}
            />
          </div>
        </header>

        {/* Messages Area - No skeleton for locked rooms until connecting */}
        <div className="flex-1 overflow-y-hidden p-4 space-y-4 relative z-10 flex flex-col">
          {!isLocked || isConnecting ? (
            <ChatroomSkeleton />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              {/* Empty space or decorative element for locked state */}
              <div className="opacity-10 dark:opacity-20 grayscale dark:invert">
                <Logo size={120} />
              </div>
            </div>
          )}

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

              {isLocked ||
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
                    <input
                      type={showJoinPassword ? "text" : "password"}
                      value={joinPassword}
                      onChange={(e) => onSetJoinPassword(e.target.value)}
                      placeholder="Enter room password"
                      disabled={isConnecting}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all pr-12 disabled:opacity-50"
                      onKeyDown={(e) =>
                        e.key === "Enter" && onJoinChatroom()
                      }
                    />
                    <button
                      type="button"
                      onClick={onToggleShowJoinPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      aria-label={
                        showJoinPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showJoinPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                      {passwordError}
                    </p>
                  )}
                  <div className="flex flex-col gap-3 mt-6">
                    <button
                      onClick={onJoinChatroom}
                      disabled={isConnecting}
                      className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                        !isConnecting
                          ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-blue-500/20"
                          : "bg-blue-400 cursor-not-allowed"
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
  );
};

export default JoinRoomScreen;
