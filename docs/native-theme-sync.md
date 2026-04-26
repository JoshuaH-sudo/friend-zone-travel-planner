# Native Theme Sync – Expo + React Native WebView Implementation

This document describes the **mobile-app side** of the theme synchronisation
system. The web-app side lives in:

- `lib/native-bridge.ts` – payload types & `sendThemeToNative` helper
- `components/hooks/useNativeThemeSync.ts` – React hook
- `components/NativeThemeSync.tsx` – root component

---

## How the two sides cooperate

```
Native app                          Web app (Next.js)
──────────                          ──────────────────
Opens WebView with URL:
  ?native=true&theme=dark
                                    Reads ?theme= param → applies via setTheme
                                    Resolves theme → sends postMessage:
                                    { type: "THEME_UPDATE",
                                      payload: { theme, backgroundColor,
                                                 statusBarStyle } }
onMessage fires
  → parse payload
  → update StatusBar
  → update background color
```

---

## 1 · Initial theme via URL param (splash / loading screen)

Before loading the WebView, read the user's preferred theme (from your local
storage or system preference) and append it to the URL.

```tsx
// utils/theme.ts
export type AppTheme = "light" | "dark";

export interface ThemeConfig {
  backgroundColor: string;
  statusBarStyle: "light-content" | "dark-content";
}

export const THEME_CONFIGS: Record<AppTheme, ThemeConfig> = {
  light: {
    backgroundColor: "#faf8f5",
    statusBarStyle: "dark-content",
  },
  dark: {
    backgroundColor: "#0f1619",
    statusBarStyle: "light-content",
  },
};

export const DEFAULT_THEME: AppTheme = "light";

export function getThemeConfig(theme: string): ThemeConfig {
  return THEME_CONFIGS[theme as AppTheme] ?? THEME_CONFIGS[DEFAULT_THEME];
}

/** Builds the WebView URL with the native flag and current theme. */
export function buildWebViewUrl(baseUrl: string, theme: AppTheme): string {
  const url = new URL(baseUrl);
  url.searchParams.set("native", "true");
  url.searchParams.set("theme", theme);
  return url.toString();
}
```

---

## 2 · Parsing incoming postMessage payloads

```tsx
// utils/nativeBridge.ts
export interface NativeThemePayload {
  type: "THEME_UPDATE";
  payload: {
    theme: string;
    backgroundColor: string;
    statusBarStyle: "light-content" | "dark-content";
  };
}

/**
 * Safely parses a raw postMessage string from the web app.
 * Returns null if the message is not a valid THEME_UPDATE payload.
 */
export function parseThemeMessage(raw: string): NativeThemePayload | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as Record<string, unknown>).type === "THEME_UPDATE"
    ) {
      return parsed as NativeThemePayload;
    }
    return null;
  } catch {
    return null;
  }
}
```

---

## 3 · Main WebView screen

```tsx
// screens/WebViewScreen.tsx
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import WebView, { WebViewMessageEvent } from "react-native-webview";

import {
  AppTheme,
  DEFAULT_THEME,
  buildWebViewUrl,
  getThemeConfig,
} from "../utils/theme";
import { parseThemeMessage } from "../utils/nativeBridge";

const BASE_URL = "https://yourapp.com"; // ← replace with your production URL

export default function WebViewScreen() {
  // Initialise from stored preference / system setting if available.
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME);
  const config = getThemeConfig(theme);

  const webViewRef = useRef<WebView>(null);
  const webViewUrl = buildWebViewUrl(BASE_URL, theme);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const message = parseThemeMessage(event.nativeEvent.data);
    if (!message) return;

    const { theme: newTheme, backgroundColor, statusBarStyle } = message.payload;

    // Only update when something actually changed.
    setTheme((prev) => {
      if (prev === newTheme) return prev;
      return newTheme as AppTheme;
    });

    // backgroundColor / statusBarStyle are derived from the theme state above
    // but you can also cache them directly if you want to avoid recomputing.
    void backgroundColor; // used via getThemeConfig(theme)
    void statusBarStyle;  // used via getThemeConfig(theme)
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <StatusBar style={config.statusBarStyle === "light-content" ? "light" : "dark"} />
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUrl }}
        style={[styles.webView, { backgroundColor: config.backgroundColor }]}
        onMessage={handleMessage}
        // Start the WebView with a matching background so there's no flash.
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});
```

---

## 4 · Removing the white flash at startup

### app.json / app.config.js

Set the splash background to match your default theme:

```json
{
  "expo": {
    "splash": {
      "backgroundColor": "#faf8f5",
      "resizeMode": "contain"
    }
  }
}
```

For dark-default users you can check `Appearance.getColorScheme()` and use the
appropriate colour in `app.config.js` via a dynamic config.

### SplashScreen (optional – for finer control)

```tsx
// app/_layout.tsx  (Expo Router)
import { SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { Appearance, View } from "react-native";
import { getThemeConfig } from "../utils/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const colorScheme = Appearance.getColorScheme();
  const config = getThemeConfig(colorScheme ?? "light");

  useEffect(() => {
    // Your async setup (fonts, auth, etc.) goes here.
    // Once done, hide the splash and show the app.
    setReady(true);
    SplashScreen.hideAsync();
  }, []);

  if (!ready) {
    // Keep the native background colour visible while loading.
    return <View style={{ flex: 1, backgroundColor: config.backgroundColor }} />;
  }

  return <WebViewScreen />;
}
```

---

## 5 · Required packages

```bash
npx expo install expo-status-bar react-native-webview
```

---

## 6 · End-to-end flow summary

| Step | Who | What |
|------|-----|-------|
| 1 | Native app | Reads system / stored theme preference |
| 2 | Native app | Sets container + splash background to matching colour |
| 3 | Native app | Loads WebView with `?native=true&theme=<value>` |
| 4 | Web app | Reads URL param → applies via `setTheme` |
| 5 | Web app | Resolves theme → `sendThemeToNative` posts `THEME_UPDATE` |
| 6 | Native app | `onMessage` fires → updates `StatusBar` & background |
| 7+ | Web app | User changes theme → repeat step 5–6 for every change |
