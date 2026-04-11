"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!localStorage.getItem("pwa-dismissed")) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-2xl p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0">📱</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Install PakTechJobs</p>
          <p className="text-xs text-muted mt-0.5">Get instant job alerts on your home screen</p>
          <div className="flex gap-2 mt-3">
            <button onClick={handleInstall}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors">
              Install
            </button>
            <button onClick={handleDismiss}
              className="rounded-lg border border-border dark:border-border-dark px-3 py-1.5 text-xs text-muted hover:bg-surface dark:hover:bg-surface-dark transition-colors">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
