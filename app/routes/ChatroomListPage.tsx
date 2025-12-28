import { Plus } from "lucide-react";
import React, { useState } from "react";
import ChatListSkeleton from '../../components/ChatListSkeleton';
import ChatroomCard from "../../components/ChatroomCard";
import CreateChatroomModal from "../../components/CreateChatroomModal";
import Logo from "../../components/Logo";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useChatroomList } from "../../hooks/useChatroomList";

interface ChatroomListPageProps {
  onChatroomSelect?: (chatroomId: string) => void;
}

const ChatroomListPage: React.FC<ChatroomListPageProps> = ({ onChatroomSelect }) => {
  const { chatrooms, loading, error } = useChatroomList();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsModalOpen(false);
  };

  const handleChatroomClick = (chatroomId: string) => {
    onChatroomSelect?.(chatroomId);
  };

  return (
    <ProtectedRoute>
      <div className="p-4 h-full overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 pb-3">
          <Logo showText size={32} />
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
            aria-label="Create new chatroom"
          >
            <Plus size={28} />
          </button>
        </div>
        <div className="space-y-2 flex-1">
          {loading ? (
            <ChatListSkeleton />
          ) : error ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <p className="text-lg text-red-600">Error: {error}</p>
            </div>
          ) : chatrooms.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No chatrooms available. Create one!
            </p>
          ) : (
            chatrooms.map((room) => (
              <ChatroomCard
                key={room.id}
                id={room.id}
                roomname={room.roomname}
                description={room.description || ""}
                participantCount={room.participantCount}
                lastMessage={room.lastMessage}
                isLocked={room.isLocked}
                onClick={() => handleChatroomClick(room.id)}
              />
            ))
          )}
        </div>
      </div>
      <CreateChatroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </ProtectedRoute>
  );
};

export default ChatroomListPage;
