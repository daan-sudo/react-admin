import { create } from "zustand";
import { storage } from "@/utils/storage";

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

const getInitialTheme = (): boolean => {
  const saved = storage.get("theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const useThemeStore = create<ThemeState>()((set, get) => {
  // 初始化时立即设置 DOM 属性
  const initial = getInitialTheme();
  document.documentElement.setAttribute(
    "data-theme",
    initial ? "dark" : "light",
  );

  return {
    dark: initial,
    toggle: () => {
      const newVal = !get().dark;
      const val = newVal ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", val);
      localStorage.setItem("theme", val);
      set({ dark: newVal });
    },
  };
});
