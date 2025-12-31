import {
  Plus,
  Users,
  ChevronDown,
  Check,
  LogOut,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router";
import ChatListSkeleton from "../../../components/chatListSkeleton";
import ChatroomCard from "../../../components/chatroomCard";
import CreateChatroomModal from "../../../components/createChatroomModal";
import Logo from "../../../components/logo";
import { useChatroomList } from "../../../hooks/useChatroomList/index";
import { useTheme } from "../../../hooks/useTheme/index";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import type { ChatroomListPageProps } from "./types";
import { ChatLayoutContext } from "../ChatLayout";

const ChatroomListPage: React.FC<ChatroomListPageProps> = ({
  onChatroomSelect,
}) => {
  const navigate = useNavigate();
  const context = useContext(ChatLayoutContext);
  
  if (!context) {
    throw new Error("ChatroomListPage must be used within ChatLayoutContext");
  }

  const { user, identities, switchAccount, logout } = context;
  const { chatrooms, loading, error, retryCountdown } = useChatroomList();
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsModalOpen(false);
  };

  const handleChatroomClick = (chatroomId: string) => {
    onChatroomSelect?.(chatroomId);
  };

  return (
    <div>
      <div className="p-4 h-full overflow-y-auto flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-20 border-b border-gray-100 dark:border-gray-800 pb-3">
          <Logo showText size={32} />

          <div className="flex items-center gap-2">
            {/* Account Switcher */}
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm border-2 border-white dark:border-gray-700 shadow-sm group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  {user?.username?.[0].toUpperCase() || "?"}
                </div>
                <ChevronDown
                  size={16}
                  className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                />
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
                <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-30 p-1.5 border border-gray-100 dark:border-gray-700">
                  <div className="px-3 py-2 border-b border-gray-50 dark:border-gray-700 mb-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Switch Account
                    </p>
                  </div>

                  <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                    {identities.map((identity) => (
                      <Menu.Item key={identity.aid}>
                        {({ active }) => (
                          <button
                            onClick={() => switchAccount(identity.aid)}
                            className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                              active
                                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "text-gray-700 dark:text-gray-300"
                            } ${
                              user?.userId === identity.aid
                                ? "bg-gray-50 dark:bg-gray-700/50"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  user?.userId === identity.aid
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {identity.username[0].toUpperCase()}
                              </div>
                              <span className="font-medium truncate max-w-[120px]">
                                {identity.username}
                              </span>
                            </div>
                            {user?.userId === identity.aid && (
                              <Check
                                size={16}
                                className="text-blue-600 dark:text-blue-400"
                              />
                            )}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>

                  <div className="mt-1 pt-1 border-t border-gray-50 dark:border-gray-700 flex flex-col gap-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            active
                              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Plus size={18} />
                          </div>
                          <span className="font-medium">Create Chatroom</span>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={toggleTheme}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            active
                              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              theme === "dark"
                                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {theme === "dark" ? (
                              <Moon size={18} />
                            ) : (
                              <Sun size={18} />
                            )}
                          </div>
                          <span className="font-medium">
                            {theme === "dark" ? "Dark Mode" : "Light Mode"}
                          </span>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate("/settings")}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            active
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Settings size={18} />
                          </div>
                          <span className="font-medium">Settings</span>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            active
                              ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                            <LogOut size={18} />
                          </div>
                          <span className="font-medium">Logout</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <ChatListSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <Users size={32} />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {error}
              </p>
              {retryCountdown !== null && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Retrying in{" "}
                  <span className="font-bold text-blue-500">
                    {retryCountdown}s
                  </span>
                  ...
                </p>
              )}
            </div>
          ) : chatrooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-4">
                <Users size={32} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No chatrooms found
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Create the first one!
              </button>
            </div>
          ) : (
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
                  onClick={() => handleChatroomClick(room.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <CreateChatroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default ChatroomListPage;
