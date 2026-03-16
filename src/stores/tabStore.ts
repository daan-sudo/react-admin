import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TabRoute {
  path: string;
  fullPath: string;
  name: string;
  meta: Record<string, unknown>;
  query?: Record<string, string>;
}

interface TabState {
  tabs: TabRoute[];
  cacheList: string[];
  isRouterAlive: boolean;
  addTab: (route: {
    path: string;
    fullPath?: string;
    name: string;
    meta: Record<string, unknown>;
  }) => void;
  closeTab: (path: string) => void;
  closeAllTabs: () => void;
  refreshCurrentPage: (routeName: string) => void;
  setRouterAlive: (alive: boolean) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [],
      cacheList: [],
      isRouterAlive: true,

      addTab: (route) => {
        const state = get();
        if (!route.name) return;

        const hasExist = state.tabs.some((tab) => tab.path === route.path);
        if (!hasExist) {
          set({
            tabs: [
              ...state.tabs,
              {
                path: route.path,
                fullPath: route.fullPath || route.path,
                name: route.name,
                meta: { ...route.meta },
              },
            ],
          });
        }

        // 处理 KeepAlive 缓存
        if (route.meta?.keepAlive && typeof route.name === "string") {
          if (!state.cacheList.includes(route.name)) {
            set({ cacheList: [...state.cacheList, route.name] });
          }
        }
      },

      closeTab: (path) => {
        const state = get();
        const index = state.tabs.findIndex((tab) => tab.path === path);
        if (index > -1) {
          const route = state.tabs[index];
          const newTabs = state.tabs.filter((_, i) => i !== index);
          const newCacheList = state.cacheList.filter(
            (name) => name !== route.name,
          );
          set({ tabs: newTabs, cacheList: newCacheList });
        }
      },

      closeAllTabs: () => set({ tabs: [], cacheList: [] }),

      refreshCurrentPage: (_routeName: string) => {
        set({ isRouterAlive: false });
        setTimeout(() => set({ isRouterAlive: true }), 50);
      },

      setRouterAlive: (alive) => set({ isRouterAlive: alive }),
    }),
    {
      name: "my-app-tabs",
      partialize: (state) => ({ tabs: state.tabs }),
    },
  ),
);
