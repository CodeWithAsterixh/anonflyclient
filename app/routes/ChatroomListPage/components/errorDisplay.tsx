import React from "react";
import { Users } from "lucide-react";
import ChatroomCard from "../../../../components/chatroomCard";
import type { Chatroom } from "../../../../hooks";

type Props = {
  error: string | null;
  chatrooms: Chatroom[];
  retryCountdown: number | null;
  setIsModalOpen: (isOpen: boolean) => void;
  handleChatroomClick: (chatroomId: string) => void;
};

export default function ErrorDisplay({
  error,
  chatrooms,
  retryCountdown,
  setIsModalOpen,
  handleChatroomClick,
}: Readonly<Props>) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
          <Users size={32} />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">{error}</p>
        {retryCountdown !== null && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Retrying in{" "}
            <span className="font-bold text-primary">{retryCountdown}s</span>...
          </p>
        )}
      </div>
    );
  }

  if (chatrooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-4">
          <Users size={32} />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          No chatrooms found
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 text-primary font-semibold hover:opacity-80 transition-all"
        >
          Create the first one!
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {chatrooms.map((room) => (
        <ChatroomCard
          key={room.id}
          id={room.id}
          roomname={room.roomname}
          description={room.description || ""}
          participantCount={room.participantCount}
          lastMessage={room.lastMessage}
          isLocked={room.isLocked}
          isPrivate={room.isPrivate}
          onClick={() => handleChatroomClick(room.id)}
        />
      ))}
    </div>
  );
}
