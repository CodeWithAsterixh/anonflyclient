import React from "react";
import { ChevronDown, Eye, EyeOff, Lock } from "lucide-react";
import ChatroomMenu from "../../../../components/chatroomMenu";
import ChatroomSkeleton from "../../../../components/chatroomSkeleton";
import Logo from "../../../../components/logo";
import ProtectedRoute from "../../../../components/protectedRoute";
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
    <ProtectedRoute>
      <div className="flex flex-col h-[100dvh] bg-gray-50 relative overflow-hidden">
        {/* Background Image with Opacity */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "url(/chatroom-bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm flex flex-col gap-1 justify-between items-center z-10">
          {isMobile && <Logo showText size={32} className="py-2" />}
          <div className="w-full flex justify-between items-center bg-neutral-200/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onBack();
                  onNavigateHome();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              <div>
                <h1 className="font-bold text-gray-900 leading-tight">
                  {displayDetail?.roomname || "Loading..."}
                </h1>
                <p className="text-xs text-gray-500">
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
              <div className="opacity-10">
                <Logo size={120} />
              </div>
            </div>
          )}

          {/* Join Overlay - Now contained within the messages area */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full mx-4 text-center">
              <h2 className="text-lg font-semibold mb-2">
                {displayDetail?.roomname || "Chatroom"}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {displayDetail?.description ||
                  "Join the room to see messages and participate."}
              </p>

              {isLocked ||
              (passwordError &&
                (passwordError.toLowerCase().includes("password") ||
                  passwordError.toLowerCase().includes("locked"))) ? (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
                    <Lock size={16} />
                    <span className="text-sm font-medium">
                      This room is password protected
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showJoinPassword ? "text" : "password"}
                      value={joinPassword}
                      onChange={(e) => onSetJoinPassword(e.target.value)}
                      placeholder="Enter room password"
                      disabled={isConnecting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 pr-10 disabled:bg-gray-50 disabled:text-gray-400"
                      onKeyDown={(e) =>
                        e.key === "Enter" && onJoinChatroom()
                      }
                    />
                    <button
                      type="button"
                      onClick={onToggleShowJoinPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 -mt-1 text-gray-400 hover:text-gray-600 transition-colors"
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
                    <p className="text-xs text-red-500 mb-2">
                      {passwordError}
                    </p>
                  )}
                  <div className="flex items-center justify-center space-x-3 mt-4">
                    <button
                      onClick={onJoinChatroom}
                      disabled={isConnecting}
                      className={`px-4 py-2 rounded font-medium text-white transition-colors ${
                        !isConnecting
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-400 cursor-not-allowed"
                      }`}
                    >
                      {isConnecting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                      className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-sm text-gray-500">
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
    </ProtectedRoute>
  );
};

export default JoinRoomScreen;
