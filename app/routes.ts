import ChatLayout from "./routes/ChatLayout";
import ChatroomPage from "./routes/ChatroomPage";
import Home from "./routes/Home";
import LoginPage from "./routes/LoginPage";
import JoinLinkPage from "./routes/JoinLinkPage";
import SettingsPage from "./routes/SettingsPage";
import PrivacyPage from "./routes/PrivacyPage";
import TermsPage from "./routes/TermsPage";

export default [
  {
    path: "/login",
    file: "./routes/LoginPage/index.tsx",
    Component: LoginPage,
  },
  {
    path: "/join/:token",
    file: "./routes/JoinLinkPage/index.tsx",
    Component: JoinLinkPage,
  },
  {
    path: "/",
    file: "./routes/ChatLayout/index.tsx",
    Component: ChatLayout,
    children: [
      {
        path: "/",
        file: "./routes/Home/index.tsx",
        Component: Home,
      },
      {
        path: "/settings",
        file: "./routes/SettingsPage/index.tsx",
        Component: SettingsPage,
      },
      {
        path: "/privacy",
        file: "./routes/PrivacyPage/index.tsx",
        Component: PrivacyPage,
      },
      {
        path: "/terms",
        file: "./routes/TermsPage/index.tsx",
        Component: TermsPage,
      },
      {
        path: "/:chatroomId",
        file: "./routes/ChatroomPage/index.tsx",
        Component: ChatroomPage,
      },
    ],
  },
];
