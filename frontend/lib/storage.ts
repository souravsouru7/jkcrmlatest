/**
 * Capacitor Preferences-backed storage.
 * Falls back to localStorage when running in a plain browser (next dev).
 * On Android, Preferences stores data in SharedPreferences — encrypted
 * by the OS at rest. For token security this is sufficient; for higher
 * assurance swap to @capacitor-community/secure-storage (Keystore-backed).
 */

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const TOKEN_KEY = "jk-crm-token";
const USER_KEY = "jk-crm-user";

function isNative() {
  return Capacitor.isNativePlatform();
}

export const storage = {
  async getToken(): Promise<string | null> {
    if (!isNative()) return localStorage.getItem(TOKEN_KEY);
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    return value;
  },

  async setToken(token: string): Promise<void> {
    if (!isNative()) { localStorage.setItem(TOKEN_KEY, token); return; }
    await Preferences.set({ key: TOKEN_KEY, value: token });
  },

  async removeToken(): Promise<void> {
    if (!isNative()) { localStorage.removeItem(TOKEN_KEY); return; }
    await Preferences.remove({ key: TOKEN_KEY });
  },

  async getUser(): Promise<{ email: string; name: string; role: string } | null> {
    if (!isNative()) {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }
    const { value } = await Preferences.get({ key: USER_KEY });
    return value ? JSON.parse(value) : null;
  },

  async setUser(user: { email: string; name: string; role: string }): Promise<void> {
    if (!isNative()) { localStorage.setItem(USER_KEY, JSON.stringify(user)); return; }
    await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
  },

  async clear(): Promise<void> {
    if (!isNative()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return;
    }
    await Preferences.remove({ key: TOKEN_KEY });
    await Preferences.remove({ key: USER_KEY });
  },
};
