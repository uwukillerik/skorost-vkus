import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export async function initNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  document.documentElement.classList.add("capacitor-native");

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: "#fdf8f3" });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    // StatusBar plugin may be unavailable in some WebView builds
  }
}
