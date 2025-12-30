import React from "react";
import JoinRoomOverlay from "../../../../components/joinRoomOverlay";

interface JoinScreenProps {
  onNavigateToLogin: () => void;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ onNavigateToLogin }) => {
  return (
    <JoinRoomOverlay
      message="Please join anonymously to view chatrooms."
      replaceLoading={
        <div className="flex space-x-4 mt-4">
          <button
            onClick={onNavigateToLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Join Anonymously
          </button>
        </div>
      }
    />
  );
};

export default JoinScreen;
