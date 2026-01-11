import React from "react";
import { ChevronDown, Lock } from "lucide-react";
import Logo from "../../../../components/logo";
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
    <div className="flex flex-col h-dvh bg-transparent relative overflow-hidden transition-colors duration-300">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-1 justify-between items-center z-10">
        {isMobile && <Logo showText size={32} className="py-2" />}
        <div className="w-full flex justify-between items-center bg-neutral-200/50 dark:bg-gray-800/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onBack();
                onNavigateHome();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
            >
              <ChevronDown className="w-5 h-5 rotate-90 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {displayDetail?.roomname || "Loading..."}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {displayDetail?.participantCount === undefined
                  ? "Securing room..."
                  : `${displayDetail.participantCount} participants • Securing room...`}
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 animate-pulse shadow-lg shadow-primary/10">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Establishing Secure Connection
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-xs">
          Waiting for other participants to securely share the room key.
          This ensures your messages remain private.
        </p>
      </div>
    </div>
  );
};

export default SecuringRoomScreen;
