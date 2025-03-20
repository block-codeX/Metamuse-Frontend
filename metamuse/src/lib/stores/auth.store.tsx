import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { BACKEND_BASE_URL } from "../config";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  accessExpiry: Date | null;
  refreshExpiry: Date | null;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  getAccessToken: () => Promise<string | null>;
  setAll: (obj: any) => void;
}
export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      accessExpiry: null,
      refreshExpiry: null,
      setAll: (obj) => set(obj),
      setAccessToken: (token) => set({ accessToken: token }),
      setRefreshToken: (token) => set({ refreshToken: token }),
      getAccessToken: async () => {
        let token = get().accessToken;
        return token;
        if (token && get().accessExpiry && get().accessExpiry! > new Date()) {
          console.log("Access token is valid");
          return token;
        }
        const url = `${BACKEND_BASE_URL}/auth/refresh`;
        try {
          const response = await axios.post(url, {}, { withCredentials: true });
          const { accessToken, refreshToken, access_exp, refresh_exp } = response.data;
          if (response.data.refreshToken) {
            set({ accessToken: accessToken });
            set({
              // refreshToken: response.data.refreshToken,
              accessExpiry: new Date(access_exp),
              refreshExpiry: new Date(refresh_exp),
            });
          }
          return accessToken;
        } catch (error) {
          console.error("Failed to refresh token", error);
          return null;
        }
      },
    }),
    { name: "auth-storage" } // Persists tokens in localStorage
  )
);
