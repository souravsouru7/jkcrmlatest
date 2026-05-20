"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import type { User } from "@/lib/types";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();

      if (!storedToken) {
        router.replace("/login");
        return;
      }

      setToken(storedToken);
      setUser(storedUser ?? { email: "admin@jkinteriors.com", name: "Sales Admin", role: "admin" });
      setReady(true);
    }

    load();
  }, [router]);

  async function logout() {
    await storage.clear();
    router.replace("/login");
  }

  return { user, token, ready, logout };
}
