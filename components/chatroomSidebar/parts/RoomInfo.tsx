import React from 'react';

interface RoomInfoProps {
  roomName: string;
  roomDescription?: string;
  isPrivate?: boolean;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ roomName, roomDescription, isPrivate }) => {
  return (
    <div className="p-4 space-y-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Room Name
          </h3>
          {isPrivate && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded uppercase tracking-wider">
              Private
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 wrap-break-word">
          {roomName}
        </p>
      </div>
      
      {roomDescription && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 wrap-break-word leading-relaxed">
            {roomDescription}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomInfo;
