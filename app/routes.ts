import {
  type RouteConfig,
  layout,
  route
} from "@react-router/dev/routes";
import { authMiddleware } from "./middleware/auth";
import Home from "./routes/Home";
import ChatLayout from "./routes/ChatLayout";
import SettingsPage from "./routes/SettingsPage";
import LoginPage from "./routes/LoginPage";
import ChatroomPage from "./routes/ChatroomPage";

const routes = [
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

