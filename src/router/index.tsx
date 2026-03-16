import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "@/pages/Login/Login";
import MainLayout from "@/pages/Layout/MainLayout";
import Home from "@/pages/Home/Home";
import UserSystem from "@/pages/System/UserSystem";
import MenuSystem from "@/pages/System/MenuSystem";
import RoleSystem from "@/pages/System/RoleSystem";
import PersonalCenter from "@/pages/PersonalCenter/PersonalCenter";

export const routeConfig = [
  {
    path: "/home",
    name: "home",
    meta: { title: "首页", keepAlive: true },
    element: <Home />,
  },
  {
    path: "/center",
    name: "center",
    meta: { title: "个人中心", keepAlive: true },
    element: <PersonalCenter />,
  },
  {
    path: "/system/user",
    name: "system-user",
    meta: { title: "用户管理", keepAlive: true },
    element: <UserSystem />,
  },
  {
    path: "/system/menu",
    name: "system-menu",
    meta: { title: "菜单管理", keepAlive: true },
    element: <MenuSystem />,
  },
  {
    path: "/system/role",
    name: "system-role",
    meta: { title: "角色管理", keepAlive: true },
    element: <RoleSystem />,
  },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: routeConfig.map((route) => ({
      path: route.path,
      element: route.element,
    })),
  },
]);

export default router;
