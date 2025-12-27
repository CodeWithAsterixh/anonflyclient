import React from "react";
import { useChatroomList } from "../../hooks/useChatroomList";
import ChatroomCard from "../../components/ChatroomCard";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useNavigate } from "react-router";
import ChatListSkeleton from '../../components/ChatListSkeleton';

interface ChatroomListPageProps {
  onChatroomSelect?: (chatroomId: string) => void;
}

const ChatroomListPage: React.FC<ChatroomListPageProps> = ({ onChatroomSelect }) => {
  const { chatrooms, loading, error } = useChatroomList();
  const navigate = useNavigate();

  const handleChatroomClick = (chatroomId: string) => {
    onChatroomSelect?.(chatroomId);
    navigate(`/${chatroomId}`);
  };

  return (
    <ProtectedRoute>
      <div className="p-4 h-full overflow-y-auto flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-left border-b-gray-300 border-b-2 pb-3 sticky top-0 bg-white z-10">
          Chats
        </h1>
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
              <div
                key={room.id}
                onClick={() => handleChatroomClick(room.id)}
                className="cursor-pointer hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                <ChatroomCard
                  id={room.id}
                  roomname={room.roomname}
                  description={room.description || ""}
                  participantCount={room.participantCount}
                  lastMessage={room.lastMessage}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ChatroomListPage;
