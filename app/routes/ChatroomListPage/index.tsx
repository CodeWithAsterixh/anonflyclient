import {
  Plus,
  ChevronDown,
  Check,
  LogOut,
  Sun,
  Moon,
  Settings,
} from "lucide-react";
import React, { useState, useContext,Fragment } from "react";
import { useNavigate } from "react-router";
import ChatListSkeleton from "../../../components/chatListSkeleton";
import CreateChatroomModal from "../../../components/createChatroomModal";
import Logo from "../../../components/logo";
import ErrorDisplay from "./components/errorDisplay";
import { useTheme } from "../../../hooks";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import type { ChatroomListPageProps } from "./types";
import { ChatLayoutContext } from "../../contexts/ChatLayoutContext";

const ChatroomListPage: React.FC<ChatroomListPageProps> = ({
  onChatroomSelect,
}) => {
  const navigate = useNavigate();
  const context = useContext(ChatLayoutContext);
  
  if (!context) {
    throw new Error("ChatroomListPage must be used within ChatLayoutContext");
  }

  const { 
    user, 
    identities, 
    chatrooms, 
    loadingChatrooms: loading, 
    chatroomError: error, 
    retryCountdown,
    switchAccount, 
    logout 
  } = context;
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsModalOpen(false);
  };

  const handleChatroomClick = (chatroomId: string) => {
    onChatroomSelect?.(chatroomId);
  };
  

  return (
    <>
      <div className="isolate p-4 h-full overflow-y-auto flex flex-col bg-background transition-colors duration-300">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-background/80 backdrop-blur-md z-20 border-b border-border pb-3">
          <Logo showText size={32} />

          <div className="flex items-center gap-2">
            {/* Account Switcher */}
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border-2 border-border shadow-sm group-hover:bg-primary/20 transition-colors">
                  {user?.username?.[0].toUpperCase() || "?"}
                </div>
                <ChevronDown
                  size={16}
                  className="text-muted group-hover:text-foreground"
                />
              </MenuButton>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-background shadow-2xl ring-1 ring-border focus:outline-none z-30 p-1.5 border border-border">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Switch Account
                    </p>
                  </div>

                  <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                    {identities.map((identity) => (
                      <MenuItem key={identity.aid}>
                        {({ focus }) => (
                          <button
                            onClick={() => switchAccount(identity.aid)}
                            className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                              focus
                                ? "bg-primary/10 text-primary"
                                : "text-foreground"
                            } ${
                              user?.userId === identity.aid
                                ? "bg-white/5"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  user?.userId === identity.aid
                                    ? "bg-primary text-white"
                                    : "bg-white/10 text-muted"
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
                                className="text-primary"
                              />
                            )}
                          </button>
                        )}
                      </MenuItem>
                    ))}
                  </div>

                  <div className="mt-1 pt-1 border-t border-border flex flex-col gap-1">
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            focus
                              ? "bg-primary/10 text-primary"
                              : "text-foreground"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Plus size={18} />
                          </div>
                          <span className="font-medium">Create Chatroom</span>
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={toggleTheme}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            focus
                              ? "bg-primary/10 text-primary"
                              : "text-foreground"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary`}
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
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => navigate("/settings")}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            focus
                              ? "bg-primary/10 text-primary"
                              : "text-foreground"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Settings size={18} />
                          </div>
                          <span className="font-medium">Settings</span>
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={logout}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            focus
                              ? "bg-destructive/10 text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <LogOut size={18} />
                          </div>
                          <span className="font-medium">Logout</span>
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <ChatListSkeleton />
          ) : (
            <ErrorDisplay
              error={error}
              chatrooms={chatrooms}
              retryCountdown={retryCountdown}
              setIsModalOpen={setIsModalOpen}
              handleChatroomClick={handleChatroomClick}
            />
          )}
        </div>
      </div>
      <CreateChatroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

export default ChatroomListPage;
