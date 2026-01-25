import React from "react";
import ChatroomSidebar from "../../../../../components/chatroomSidebar";
import Drawer from "../../../../../components/ui/drawer/Drawer";
import type { ChatroomDetail, Participant } from "../../../../../lib/types/chat";

interface ChatSidebarAreaProps {
  isMobile: boolean;
  isOptionsOpen: boolean;
  setIsOptionsOpen: (isOpen: boolean) => void;
  participants: Participant[];
  isHost: boolean;
  displayDetail: ChatroomDetail | null;
  currentUserId?: string | null;
  isConnected: boolean;
  onRemoveParticipant: (userAid: string) => Promise<void>;
  onBanParticipant: (userAid: string, reason?: string) => Promise<void>;
  onUnbanParticipant: (userAid: string) => Promise<void>;
  onLeaveRoom: () => void;
  onOpenEditModal: () => void;
  onDeleteRoom: () => void;
  onGenerateShareLink: () => Promise<any>;
}

export const ChatSidebarArea: React.FC<ChatSidebarAreaProps> = ({
  isMobile,
  isOptionsOpen,
  setIsOptionsOpen,
  participants,
  isHost,
  displayDetail,
  currentUserId,
  isConnected,
  onRemoveParticipant,
  onBanParticipant,
  onUnbanParticipant,
  onLeaveRoom,
  onOpenEditModal,
  onDeleteRoom,
  onGenerateShareLink,
}) => {
  return (
    <>
      {!isMobile && (
        <>
          {/* Backdrop for screens between 768px and 1024px */}
          <input 
            type="button"
            tabIndex={0}
            className={`fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 lg:hidden transition-opacity duration-300 ${
              isOptionsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsOptionsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOptionsOpen(false);
              }
            }}
            aria-label="Close room options overlay"
          />
          <div 
            className={`z-50 lg:z-auto transition-all duration-300 ease-in-out absolute right-0 top-0 h-full lg:relative lg:h-auto overflow-hidden ${
              isOptionsOpen 
                ? "translate-x-0 w-80 opacity-100 shadow-2xl lg:shadow-none" 
                : "translate-x-full lg:translate-x-0 w-0 lg:w-0 opacity-0"
            }`}
          >
            <div className="w-80 h-full">
              <ChatroomSidebar
                participants={participants}
                isHost={isHost}
                creatorAid={displayDetail?.creatorAid || ""}
                hostAid={displayDetail?.hostAid || ""}
                currentUserId={currentUserId}
                roomName={displayDetail?.roomname || ""}
                roomDescription={displayDetail?.description}
                allowedFeatures={displayDetail?.allowedFeatures}
                onRemoveParticipant={onRemoveParticipant}
                onBanParticipant={onBanParticipant}
                onUnbanParticipant={onUnbanParticipant}
                onLeaveRoom={onLeaveRoom}
                onEditRoom={onOpenEditModal}
                onDeleteRoom={onDeleteRoom}
                onGenerateShareLink={onGenerateShareLink}
                isConnected={isConnected}
              />
            </div>
          </div>
        </>
      )}

      {isMobile && (
        <Drawer
          isOpen={isOptionsOpen}
          onClose={() => setIsOptionsOpen(false)}
          side="bottom"
          height="95dvh"
        >
          <Drawer.Header
            title="Room Options"
            onClose={() => setIsOptionsOpen(false)}
          />
          <Drawer.Content className="p-0">
            <ChatroomSidebar
              participants={participants}
              isHost={isHost}
              hostAid={displayDetail?.hostAid || ""}
              creatorAid={displayDetail?.creatorAid || ""}
              currentUserId={currentUserId}
              roomName={displayDetail?.roomname || ""}
              roomDescription={displayDetail?.description || ""}
              isPrivate={displayDetail?.isPrivate}
              allowedFeatures={displayDetail?.allowedFeatures}
              onRemoveParticipant={onRemoveParticipant}
              onBanParticipant={onBanParticipant}
              onUnbanParticipant={onUnbanParticipant}
              onLeaveRoom={onLeaveRoom}
              onEditRoom={onOpenEditModal}
              onDeleteRoom={onDeleteRoom}
              onGenerateShareLink={onGenerateShareLink}
              isConnected={isConnected}
              hideHeader={true}
            />
          </Drawer.Content>
        </Drawer>
      )}
    </>
  );
};
