"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    // Detect if already running as standalone PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event (Android/Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    const promptEvent = deferredPrompt as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    promptEvent.prompt();
    await promptEvent.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // Already installed or not eligible
  if (isStandalone) return null;

  // iOS: show manual instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-border bg-card p-4 shadow-lg">
        <p className="text-sm font-medium">Install Expense Tracker</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tap the share button{" "}
          <span role="img" aria-label="share">
            ⎋
          </span>{" "}
          then &ldquo;Add to Home Screen&rdquo;{" "}
          <span role="img" aria-label="plus">
            ➕
          </span>
        </p>
      </div>
    );
  }

  // Chrome/Edge/Android: show install button
  if (showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-lg">
        <div>
          <p className="text-sm font-medium">Install Expense Tracker</p>
          <p className="text-xs text-muted-foreground">Add to home screen for quick access</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPrompt(false)}
            className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            Install
          </button>
        </div>
      </div>
    );
  }

  return null;
}
