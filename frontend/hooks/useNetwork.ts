"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";

export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function init() {
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus();
        setIsOnline(status.connected);

        const handle = await Network.addListener("networkStatusChange", (s) => {
          setIsOnline(s.connected);
        });
        cleanup = () => handle.remove();
      } else {
        setIsOnline(navigator.onLine);
        const online = () => setIsOnline(true);
        const offline = () => setIsOnline(false);
        window.addEventListener("online", online);
        window.addEventListener("offline", offline);
        cleanup = () => {
          window.removeEventListener("online", online);
          window.removeEventListener("offline", offline);
        };
      }
    }

    init();
    return () => cleanup?.();
  }, []);

  return { isOnline };
}
