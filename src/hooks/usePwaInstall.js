import { useState, useEffect, useCallback } from "react";

/**
 * Hook that captures the browser's `beforeinstallprompt` event and
 * exposes a trigger to show the native install dialog.
 *
 * Returns:
 *   canInstall  – true when the browser supports install and user hasn't dismissed
 *   dismissed   – true after user clicks "Maybe later"
 *   triggerInstall – call to show the native install prompt
 *   dismiss     – call to hide the banner for this session
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("pwa-install-dismissed") === "1";
    } catch {
      return false;
    }
  });
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA — no banner needed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem("pwa-install-dismissed", "1");
    } catch {
      // ignore
    }
  }, []);

  const canInstall = !!deferredPrompt && !dismissed && !installed;

  return { canInstall, dismissed, installed, triggerInstall, dismiss };
}
