import React from "react";
import type { JoinRoomOverlayProps } from "./types";

/**
 * JoinRoomOverlay component displays a blocking overlay with a message.
 * This is used to indicate loading states or when a user needs to perform an action before proceeding.
 */
const JoinRoomOverlay: React.FC<JoinRoomOverlayProps> = ({
  message,
  replaceLoading,
}) => {
  return (
    <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl text-center border border-gray-100 dark:border-gray-700 max-w-sm w-full mx-4">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{message}</p>
        {replaceLoading || (
          <div className="mt-4 animate-spin rounded-full h-12 w-12 border-4 border-gray-100 dark:border-gray-700 border-t-primary mx-auto"></div>
        )}
      </div>
    </div>
  );
};

export default JoinRoomOverlay;
