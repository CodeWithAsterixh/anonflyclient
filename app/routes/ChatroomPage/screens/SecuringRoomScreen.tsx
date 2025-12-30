import React from "react";
import { ChevronDown, Lock } from "lucide-react";
import Logo from "../../../../components/logo";
import ProtectedRoute from "../../../../components/protectedRoute";
import type { ChatroomDetail } from "../../../../lib/types/chat";

interface SecuringRoomScreenProps {
  isMobile: boolean;
  onBack: () => void;
  onNavigateHome: () => void;
  displayDetail: ChatroomDetail | null;
}

const SecuringRoomScreen: React.FC<SecuringRoomScreenProps> = ({
  isMobile,
  onBack,
  onNavigateHome,
  displayDetail,
}) => {
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
                    ? `${displayDetail.participantCount} participants • Securing room...`
                    : "Securing room..."}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Establishing Secure Connection
          </h2>
          <p className="text-gray-600 max-w-xs">
            Waiting for other participants to securely share the room key.
            This ensures your messages remain private.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SecuringRoomScreen;
