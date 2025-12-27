import React from 'react';

interface JoinNotificationProps {
  username: string;
}

/**
 * JoinNotification displays a system message when a user joins the chatroom
 */
const JoinNotification: React.FC<JoinNotificationProps> = ({ username }) => {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm italic">
        {username} just joined
      </div>
    </div>
  );
};

export default JoinNotification;
