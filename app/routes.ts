import { authMiddleware } from "./middleware/auth";
import ChatLayout from "./routes/ChatLayout";
import ChatroomPage from "./routes/ChatroomPage";
import Home from "./routes/Home";
import LoginPage from "./routes/LoginPage";
import SettingsPage from "./routes/SettingsPage";

export default [
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/settings",
    middleware: [authMiddleware],
    Component: SettingsPage,
  },
  {
    path: "/",
    middleware: [authMiddleware],
    Component: ChatLayout,
    children: [
      {
        path: "/",
        Component: Home,
      },
      {
        path: "/:chatroomId",
        Component: ChatroomPage,
      },
    ],
  },
];

