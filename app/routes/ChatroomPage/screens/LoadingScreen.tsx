import React from "react";
import JoinRoomOverlay from "~/features/messages/components/joinRoomOverlay";

const LoadingScreen: React.FC = () => {
  return <JoinRoomOverlay message="Loading chatroom content..." />;
};

export default LoadingScreen;
