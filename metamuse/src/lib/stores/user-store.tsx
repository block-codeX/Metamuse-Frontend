"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/utils";
import { toast } from "sonner";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  walletAddress: string | null;
};
type UserState = {
  user: User | null;
  id: string | null;
  setUser: (user: User | null) => void;
  setUserId: (id: string | null) => void;
  fetchUser: () => Promise<void>;
};

// Persist the store using Zustand middleware
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      id: null,
      setUser: (user) => set({ user }),
      setUserId: (id) => set({ id }),
      fetchUser: async () => {
        const userId = get().id;
        if (!userId) return;

        try {
          const response = await api().get(`/users/${userId}`);
          set({ user: response.data });
        } catch (error: any) {
          toast(
            error?.response?.data?.message?.message || "Something went wrong!"
          );
        }
      },
    }),
    { name: "user-storage" } // Stores user data in localStorage
  )
);
