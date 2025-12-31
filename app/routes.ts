import {
  type RouteConfig,
  layout,
  route
} from "@react-router/dev/routes";

export default [
  
   route('/login', 'routes/LoginPage/index.tsx'),
   route('/settings', 'routes/SettingsPage/index.tsx'),

  layout("routes/ChatLayout/index.tsx", [
    {
      path: "/",
      file: "routes/Home/index.tsx",
    },
    {
      path: "/:chatroomId",
      file: "routes/ChatroomPage/index.tsx",
    },
  ]),
] satisfies RouteConfig;

