import { authMiddleware } from "./middleware/auth";
import ChatLayout from "./routes/ChatLayout";
import ChatroomPage from "./routes/ChatroomPage";
import Home from "./routes/Home";
import LoginPage from "./routes/LoginPage";
import SettingsPage from "./routes/SettingsPage";

export default [
  {
    path: "/login",
    file: "./routes/LoginPage/index.tsx",
    Component: LoginPage,
  },
  {
    path: "/settings",
    file: "./routes/SettingsPage/index.tsx",
    middleware: [authMiddleware],
    Component: SettingsPage,
  },
  {
    path: "/",
    file: "./routes/ChatLayout/index.tsx",
    middleware: [authMiddleware],
    Component: ChatLayout,
    children: [
      {
        path: "/",
        file: "./routes/Home/index.tsx",
        Component: Home,
      },
      {
        path: "/:chatroomId",
        file: "./routes/ChatroomPage/index.tsx",
        Component: ChatroomPage,
      },
    ],
  },
];
