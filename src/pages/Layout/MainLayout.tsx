import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Breadcrumb,
  Tabs,
  Dropdown,
  Avatar,
  Tooltip,
  Modal,
  type MenuProps,
} from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  RedoOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import ThemeChange from "@/components/ThemeChange";
import { useUserStore } from "@/stores/userStore";
import { useTabStore } from "@/stores/tabStore";
import { getUserMenuApi } from "@/api/system";
import { routeConfig } from "@/router";
import type { Menu as MenuType } from "@/types/system";
import logoSvg from "@/assets/react.svg";

const { Sider, Header, Content } = Layout;

// 将后端菜单数据转为 Ant Design Menu items
const buildMenuItems = (menus: MenuType[]): MenuProps["items"] => {
  return menus.map((menu) => {
    if (menu.children && menu.children.length > 0) {
      return {
        key: menu.path || menu.id?.toString() || "",
        label: menu.name,
        children: buildMenuItems(menu.children),
      };
    }
    return {
      key: menu.path || menu.id?.toString() || "",
      label: menu.name,
    };
  });
};

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useUserStore((s) => s.userInfo);
  const clearAuth = useUserStore((s) => s.clearAuth);
  const getInfoApi = useUserStore((s) => s.getInfoApi);
  const {
    tabs,
    addTab,
    closeTab,
    closeAllTabs,
    refreshCurrentPage,
    isRouterAlive,
  } = useTabStore();

  const [collapsed, setCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isContentMax, setIsContentMax] = useState(false);
  const [isSpin, setIsSpin] = useState(false);
  const [menuData, setMenuData] = useState<MenuType[]>([]);

  const selectedKeys = useMemo(() => [location.pathname], [location.pathname]);
  const openKeys = useMemo(() => {
    const parts = location.pathname.split("/");
    if (parts.length >= 3) {
      return ["/" + parts[1]];
    }
    return [];
  }, [location.pathname]);

  // 初始化：获取用户信息和菜单
  useEffect(() => {
    const init = async () => {
      try {
        await getInfoApi();
        const info = useUserStore.getState().userInfo;
        if (info?.id) {
          const res = await getUserMenuApi(info.id);
          setMenuData(res);
        }
      } catch {
        // ignore
      }
    };
    init();
  }, [getInfoApi]);

  // 监听路由变化，自动添加 Tab
  useEffect(() => {
    const currentRoute = routeConfig.find((r) => r.path === location.pathname);
    if (currentRoute) {
      addTab({
        path: currentRoute.path,
        fullPath: location.pathname + location.search,
        name: currentRoute.name,
        meta: currentRoute.meta,
      });
    }
  }, [location.pathname, location.search, addTab]);

  // 面包屑
  const breadcrumbItems = useMemo(() => {
    const currentRoute = routeConfig.find((r) => r.path === location.pathname);
    if (!currentRoute) return [];
    return [{ title: currentRoute.meta.title }];
  }, [location.pathname]);

  // 菜单点击
  const handleMenuClick = useCallback(
    ({ key }: { key: string }) => {
      navigate(key);
    },
    [navigate],
  );

  // Tab 切换
  const handleTabChange = useCallback(
    (key: string) => {
      navigate(key);
    },
    [navigate],
  );

  // 关闭 Tab
  const handleTabEdit = useCallback(
    (
      targetKey: React.MouseEvent | React.KeyboardEvent | string,
      action: "add" | "remove",
    ) => {
      if (action === "remove") {
        const key = targetKey as string;
        closeTab(key);
        if (location.pathname === key) {
          const state = useTabStore.getState();
          const lastTab = state.tabs[state.tabs.length - 1];
          navigate(lastTab ? lastTab.path : "/home");
        }
      }
    },
    [closeTab, location.pathname, navigate],
  );

  // 全屏
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 内容区域放大
  const toggleContentMax = useCallback(() => {
    setIsContentMax((prev) => !prev);
  }, []);

  // 刷新当前页面
  const refresh = useCallback(() => {
    setIsSpin(true);
    refreshCurrentPage(location.pathname);
    setTimeout(() => setIsSpin(false), 500);
  }, [refreshCurrentPage, location.pathname]);

  // 退出登录
  const logout = useCallback(() => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: "确认退出登录吗",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        clearAuth();
        closeAllTabs();
        navigate("/login");
      },
    });
  }, [clearAuth, closeAllTabs, navigate]);

  // ESC 退出内容放大
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isContentMax) {
        setIsContentMax(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isContentMax]);

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const menuItems = useMemo(() => buildMenuItems(menuData), [menuData]);

  // 用户下拉菜单
  const userDropdownItems: MenuProps["items"] = [
    { key: "center", label: "个人中心", onClick: () => navigate("/center") },
    { type: "divider" },
    { key: "logout", label: "退出登录", onClick: logout },
  ];

  // Tab items
  const tabItems = tabs.map((tab) => ({
    key: tab.path,
    label: tab.meta.title as string,
    closable: !tab.meta.affix,
  }));

  return (
    <Layout className="h-screen overflow-hidden">
      {/* 侧边栏 */}
      {!isContentMax && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="shadow-lg"
          style={{ backgroundColor: "var(--c-bg)" }}
        >
          <div className="h-16 flex items-center justify-center gap-2">
            <img src={logoSvg} className="w-8 h-8" alt="logo" />
            {!collapsed && (
              <span className="text-xl font-bold text-[#00b96b]">
                React Admin
              </span>
            )}
          </div>
          <Menu
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            mode="inline"
            className="border-none"
            items={menuItems}
            onClick={handleMenuClick}
            style={{ backgroundColor: "transparent" }}
          />
        </Sider>
      )}

      <Layout>
        {/* 顶部栏 */}
        {!isContentMax && (
          <Header
            className="flex items-center justify-between shadow-sm px-4 border-b-2 border-b-[#daddda]"
            style={{ backgroundColor: "var(--c-bg)", padding: "0 28px" }}
          >
            <div className="flex items-center gap-4">
              {collapsed ? (
                <MenuUnfoldOutlined
                  className="text-lg cursor-pointer"
                  style={{ color: "var(--c-text)" }}
                  onClick={() => setCollapsed(false)}
                />
              ) : (
                <MenuFoldOutlined
                  className="text-lg cursor-pointer"
                  style={{ color: "var(--c-text)" }}
                  onClick={() => setCollapsed(true)}
                />
              )}
              <Breadcrumb items={breadcrumbItems} />
            </div>

            <div className="flex items-center gap-4">
              <Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
                {isFullscreen ? (
                  <FullscreenExitOutlined
                    className="text-lg cursor-pointer"
                    style={{ color: "var(--c-text)" }}
                    onClick={toggleFullscreen}
                  />
                ) : (
                  <FullscreenOutlined
                    className="text-lg cursor-pointer"
                    style={{ color: "var(--c-text)" }}
                    onClick={toggleFullscreen}
                  />
                )}
              </Tooltip>
              <ThemeChange />
              <Dropdown menu={{ items: userDropdownItems }}>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar src={userInfo?.avatar} />
                  <span
                    className="font-medium"
                    style={{ color: "var(--c-text)" }}
                  >
                    {userInfo?.username}
                  </span>
                </div>
              </Dropdown>
            </div>
          </Header>
        )}

        {/* Tab 标签页 */}
        <div
          className="px-4 pt-2 flex justify-between"
          style={{ backgroundColor: "var(--c-bg)" }}
        >
          <Tabs
            activeKey={location.pathname}
            type="editable-card"
            hideAdd
            className="flex-1"
            onChange={handleTabChange}
            onEdit={handleTabEdit}
            items={tabItems}
          />
          <div className="w-20 flex items-center justify-center text-lg cursor-pointer gap-3">
            <RedoOutlined onClick={refresh} spin={isSpin} />
            <Tooltip title={isContentMax ? "还原" : "内容放大"}>
              {isContentMax ? (
                <FullscreenExitOutlined onClick={toggleContentMax} />
              ) : (
                <FullscreenOutlined onClick={toggleContentMax} />
              )}
            </Tooltip>
          </div>
        </div>

        {/* 内容区域 */}
        <Content
          className={`rounded-lg overflow-auto transition-all duration-300 ${
            isContentMax ? "m-0 h-screen" : "m-4"
          }`}
        >
          {isRouterAlive && <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
