import React from "react";
import JoinRoomOverlay from "../../../../components/joinRoomOverlay";

const ConnectingScreen: React.FC = () => {
  return <JoinRoomOverlay message="Connecting to chat service..." />;
};

export default ConnectingScreen;
