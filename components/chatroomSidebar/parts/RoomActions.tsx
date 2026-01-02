import React from 'react';
import { LogOut, Settings2, Trash2 } from 'lucide-react';

interface RoomActionsProps {
  isHost: boolean;
  onLeaveRoom: () => void;
  onEditRoom: () => void;
  onDeleteRoom: () => void;
}

const RoomActions: React.FC<RoomActionsProps> = ({
  isHost,
  onLeaveRoom,
  onEditRoom,
  onDeleteRoom,
}) => {
  return (
    <div className="p-4 space-y-2">
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={onLeaveRoom}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 rounded-xl transition-all"
        >
          <LogOut size={16} />
          <span>Leave Room</span>
        </button>

        {isHost && (
          <>
            <button
              onClick={onEditRoom}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <Settings2 size={16} />
              <span>Room Settings</span>
            </button>
            <button
              onClick={onDeleteRoom}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <Trash2 size={16} />
              <span>Delete Room</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomActions;
