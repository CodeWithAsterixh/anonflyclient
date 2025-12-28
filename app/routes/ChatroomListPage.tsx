import { Plus, Users, ChevronDown, Check, LogOut, UserPlus } from "lucide-react";
import React, { useState } from "react";
import ChatListSkeleton from '../../components/ChatListSkeleton';
import ChatroomCard from "../../components/ChatroomCard";
import CreateChatroomModal from "../../components/CreateChatroomModal";
import Logo from "../../components/Logo";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useChatroomList } from "../../hooks/useChatroomList";
import { useAuth } from "../../hooks/useAuth";
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ChatroomListPageProps {
  onChatroomSelect?: (chatroomId: string) => void;
}

const ChatroomListPage: React.FC<ChatroomListPageProps> = ({ onChatroomSelect }) => {
  const { chatrooms, loading, error } = useChatroomList();
  const { user, identities, switchAccount, logout } = useAuth();
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
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white/80 backdrop-blur-md z-20 border-b border-gray-100 pb-3">
          <Logo showText size={32} />
          
          <div className="flex items-center gap-2">
            {/* Account Switcher */}
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors group">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-white shadow-sm group-hover:bg-blue-200 transition-colors">
                  {user?.username?.[0].toUpperCase() || '?'}
                </div>
                <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-30 p-1.5 border border-gray-100">
                  <div className="px-3 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Switch Account</p>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                    {identities.map((identity) => (
                      <Menu.Item key={identity.aid}>
                        {({ active }) => (
                          <button
                            onClick={() => switchAccount(identity.aid)}
                            className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                              active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            } ${user?.userId === identity.aid ? 'bg-gray-50' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                user?.userId === identity.aid ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {identity.username[0].toUpperCase()}
                              </div>
                              <span className="font-medium truncate max-w-[120px]">{identity.username}</span>
                            </div>
                            {user?.userId === identity.aid && (
                              <Check size={16} className="text-blue-600" />
                            )}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>

                  <div className="mt-1 pt-1 border-t border-gray-50 flex flex-col gap-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => window.location.href = '/login'}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            active ? 'bg-gray-50 text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          <UserPlus size={18} />
                          <span>Add Account</span>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            active ? 'bg-red-50 text-red-600' : 'text-red-600'
                          }`}
                        >
                          <LogOut size={18} />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              aria-label="Create new chatroom"
            >
              <Plus size={28} />
            </button>
          </div>
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
