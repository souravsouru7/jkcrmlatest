# JK Interiors CRM — Android App Setup

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| Java JDK | 17+ | https://adoptium.net |
| Android Studio | Latest | https://developer.android.com/studio |
| Android SDK | API 24+ | Install via Android Studio SDK Manager |

---

## First-Time Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Add Android platform

```bash
npx cap add android
```

### 3. Build and sync

```bash
npm run cap:sync
```

This runs `next build` (static export to `out/`), then `cap sync` which copies the web assets into `android/app/src/main/assets/public`.

### 4. Open in Android Studio

```bash
npx cap open android
```

---

## Development Workflow

### Every time you change frontend code:

```bash
npm run cap:sync        # build + sync to android/
npx cap open android    # open in Android Studio and run
```

### Or run directly on connected device/emulator:

```bash
npx cap run android
```

---

## Connecting to the Backend

Edit `lib/api.ts` line with `ANDROID_EMULATOR_API`:

| Scenario | Value |
|----------|-------|
| Android Emulator (testing on your PC) | `http://10.0.2.2:5000/api` (default) |
| Real Android device on same WiFi | `http://192.168.1.XXX:5000/api` (your PC's LAN IP) |
| Production (deployed backend) | Set `NEXT_PUBLIC_API_URL=https://your-api.com/api` in `.env.local` |

### Finding your PC's LAN IP:
- Windows: Run `ipconfig` in terminal → look for "IPv4 Address"
- Mac/Linux: Run `ifconfig` → look for `inet` under `en0`

---

## Required Android Permissions

These are added automatically by Capacitor in `android/app/src/main/AndroidManifest.xml`.
Verify they are present:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

### Allow cleartext HTTP (for local dev only — remove for production):

In `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.0</domain>
    </domain-config>
</network-security-config>
```

In `AndroidManifest.xml` `<application>` tag add:
```xml
android:networkSecurityConfig="@xml/network_security_config"
```

---

## Push Notifications Setup (Firebase)

1. Create a project in [Firebase Console](https://console.firebase.google.com)
2. Add an Android app with package ID `com.jkinteriors.crm`
3. Download `google-services.json` → place in `android/app/`
4. In `android/build.gradle` add to `dependencies`:
   ```groovy
   classpath 'com.google.gms:google-services:4.4.0'
   ```
5. In `android/app/build.gradle` add at the bottom:
   ```groovy
   apply plugin: 'com.google.gms.google-services'
   ```
6. After `npx cap run android`, the FCM token is logged to console — send it to your backend to target this device.

---

## App Icon & Splash Screen

### Icons
Place your icon files in:
- `android/app/src/main/res/mipmap-*/` folders (use Android Asset Studio)
- Or use `@capacitor/assets` CLI tool:
  ```bash
  npx @capacitor/assets generate --android
  ```
  (Requires `assets/icon.png` at 1024×1024px and `assets/splash.png` at 2732×2732px)

### Splash Screen
Capacitor handles splash automatically. Config is in `capacitor.config.ts`:
```ts
SplashScreen: {
  launchShowDuration: 2200,
  backgroundColor: "#0f172a",
  splashFullScreen: true,
}
```

---

## Build Release APK / AAB

### Debug APK (for testing)
In Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**

Or via terminal:
```bash
cd android
./gradlew assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release AAB (for Play Store)
```bash
cd android
./gradlew bundleRelease
```
AAB: `android/app/build/outputs/bundle/release/app-release.aab`

> You need a keystore for signing. Generate one:
> ```bash
> keytool -genkey -v -keystore jk-crm-release.keystore -alias jk-crm -keyalg RSA -keysize 2048 -validity 10000
> ```

---

## Project Structure (What was Changed)

```
frontend/
├── capacitor.config.ts          ← NEW: Capacitor configuration
├── next.config.mjs              ← UPDATED: static export + no image optimization
├── package.json                 ← UPDATED: Capacitor packages + cap:android scripts
├── app/
│   ├── layout.tsx               ← UPDATED: viewport meta, CapacitorInit, dark theme
│   ├── globals.css              ← UPDATED: safe area, overscroll, Android-specific CSS
│   ├── login/page.tsx           ← UPDATED: mobile-first single-column design
│   └── (crm)/
│       ├── layout.tsx           ← UPDATED: bottom tab navigation (replaces sidebar)
│       ├── more/page.tsx        ← NEW: "More" tab route
│       ├── dashboard/page.tsx   ← UPDATED: 2×3 mobile metric grid, card list
│       ├── leads/page.tsx       ← UPDATED: card list + bottom sheet form
│       ├── follow-ups/page.tsx  ← UPDATED: card list + notifications
│       ├── site-visits/page.tsx ← UPDATED: card list + notifications
│       ├── quotations/page.tsx  ← UPDATED: card list + bottom sheet form
│       ├── pipeline/page.tsx    ← UPDATED: stage tabs (replaces kanban columns)
│       └── reports/page.tsx     ← UPDATED: bar chart in dark theme
├── components/
│   ├── Badge.tsx                ← UPDATED: dark theme colors
│   └── CapacitorInit.tsx        ← NEW: StatusBar, SplashScreen, keyboard, back button
├── hooks/
│   ├── useAuth.ts               ← UPDATED: uses Capacitor Preferences storage
│   └── useNetwork.ts            ← NEW: network state detection
└── lib/
    ├── api.ts                   ← UPDATED: Android emulator URL, async token
    ├── storage.ts               ← NEW: Capacitor Preferences (falls back to localStorage)
    └── notifications.ts         ← NEW: Push + Local notifications helpers
```

---

## Backend CORS

The backend already has `cors({ origin: true })` which allows all origins including `capacitor://localhost`. No changes needed.

---

## Production Deployment Checklist

- [ ] Deploy backend to Railway / Render / VPS
- [ ] Set `NEXT_PUBLIC_API_URL=https://your-api.com/api` in `.env.local`
- [ ] Run `npm run cap:sync` for production build
- [ ] Add Firebase `google-services.json` for push notifications
- [ ] Generate signed keystore and build release AAB
- [ ] Create Play Store developer account ($25 one-time fee)
- [ ] Upload AAB, fill store listing, submit for review
