import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("login", "./routes/LoginPage/index.tsx"),
  route("join/*", "./routes/JoinLinkPage/index.tsx"),
  route("proxy/*", "./routes/proxy.ts"),
  layout("./routes/ChatLayout/index.tsx", [
    index("./routes/Home/index.tsx"),
    route("settings", "./routes/SettingsPage/index.tsx"),
    route("privacy", "./routes/PrivacyPage/index.tsx"),
    route("terms", "./routes/TermsPage/index.tsx"),
    route(":chatroomId", "./routes/ChatroomPage/index.tsx"),
  ]),
] satisfies RouteConfig;
