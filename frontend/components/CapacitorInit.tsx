"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";
import { App } from "@capacitor/app";
import { registerPushNotifications } from "@/lib/notifications";

export default function CapacitorInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    async function init() {
      // Status bar — dark background with light icons
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#0f172a" });
      await StatusBar.show();

      // Hide splash once app is ready
      await SplashScreen.hide({ fadeOutDuration: 400 });

      // Keyboard — scroll body instead of resizing viewport
      Keyboard.addListener("keyboardWillShow", () => {
        document.body.classList.add("keyboard-open");
      });
      Keyboard.addListener("keyboardWillHide", () => {
        document.body.classList.remove("keyboard-open");
      });

      // Back button — close app only when at root, otherwise browser goes back
      App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });

      // Register push notifications (requests permission automatically)
      await registerPushNotifications(
        (fcmToken) => {
          // Send fcmToken to your backend here when you add push support
          console.info("FCM token:", fcmToken);
        }
      );
    }

    init().catch(console.error);
  }, []);

  return null;
}
