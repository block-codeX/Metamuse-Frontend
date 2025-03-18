"use client"
import { ReactNode, useEffect } from "react";
import { useUserStore } from "@/lib/stores/user-store";

export function UserProvider({ children }: { children: ReactNode }) {
  const { fetchUser, id } = useUserStore();

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  return <>{children}</>;
}
