import React, { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { LogOut, Settings, UserMinus, Trash2, MoreVertical } from 'lucide-react';

interface ChatroomMenuProps {
  onLeaveRoom: () => void;
  onRemoveParticipant: () => void; // This will need to be more complex later
  onDeleteRoom: () => void;
  onEditRoom: () => void;
  isHost: boolean;
}

const ChatroomMenu: React.FC<ChatroomMenuProps> = ({
  onLeaveRoom,
  onRemoveParticipant,
  onDeleteRoom,
  onEditRoom,
  isHost,
}) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
          <MoreVertical className="h-6 w-6" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none p-1.5 border border-gray-100">
          <div className="flex flex-col gap-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onLeaveRoom}
                  className={`flex w-full items-center gap-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                  }`}
                >
                  <LogOut size={18} />
                  <span>Leave Room</span>
                </button>
              )}
            </Menu.Item>
            {isHost && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onEditRoom}
                    className={`flex w-full items-center gap-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    <Settings size={18} />
                    <span>Room Settings</span>
                  </button>
                )}
              </Menu.Item>
            )}
            {isHost && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onRemoveParticipant}
                    className={`flex w-full items-center gap-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    <UserMinus size={18} />
                    <span>Manage Users</span>
                  </button>
                )}
              </Menu.Item>
            )}
            {isHost && (
              <div className="h-px bg-gray-100 my-0.5 mx-2" />
            )}
            {isHost && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onDeleteRoom}
                    className={`flex w-full items-center gap-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      active ? 'bg-red-50 text-red-600' : 'text-red-600'
                    }`}
                  >
                    <Trash2 size={18} />
                    <span>Delete Room</span>
                  </button>
                )}
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ChatroomMenu;
