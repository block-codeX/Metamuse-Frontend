import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { useAuthStore } from "./stores/auth.store"; // Adjust path accordingly
import { BACKEND_BASE_URL } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const api = (withAuth = false) => {
  const instance = axios.create({
    baseURL: BACKEND_BASE_URL,
    withCredentials: true, // Enables sending cookies with requests
  });

  if (withAuth) {
    instance.interceptors.request.use(async (config) => {
      const token = await useAuthStore.getState().getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });
  }

  return instance;
};

