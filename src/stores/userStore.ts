import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserInfo, Token } from "@/types/user";
import { getUserInfoApi } from "@/api/user";

interface UserState {
  userInfo: UserInfo | null;
  token: Token;
  setAuth: (auth: UserInfo) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  getInfoApi: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      token: { access_token: "", refresh_token: "" },

      setAuth: (auth: UserInfo) => set({ userInfo: auth }),

      setTokens: (accessToken: string, refreshToken: string) =>
        set({
          token: { access_token: accessToken, refresh_token: refreshToken },
        }),

      clearAuth: () =>
        set({
          userInfo: null,
          token: { access_token: "", refresh_token: "" },
        }),

      getInfoApi: async () => {
        const res = await getUserInfoApi();
        set({ userInfo: res });
      },
    }),
    {
      name: "USER_STORAGE_KEY",
    },
  ),
);
