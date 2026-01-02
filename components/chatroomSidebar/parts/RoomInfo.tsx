import React from 'react';

interface RoomInfoProps {
  roomName: string;
  roomDescription?: string;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ roomName, roomDescription }) => {
  return (
    <div className="p-4 space-y-3">
      <div>
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Room Name
        </h3>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
          {roomName}
        </p>
      </div>
      
      {roomDescription && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-words leading-relaxed">
            {roomDescription}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomInfo;
