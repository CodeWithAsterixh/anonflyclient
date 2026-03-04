import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const PWA_STORAGE_KEY = 'anonfly_pwa_prompt';

  const appVersion = "1.0.0"; // This should ideally be synced with package.json or an env var

  useEffect(() => {
    // Check if app is already installed
    if (globalThis.window.matchMedia('(display-mode: standalone)').matches || 
        (globalThis.window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Check storage for prompt preference
      const promptData = localStorage.getItem(PWA_STORAGE_KEY);
      if (promptData) {
        const { status, nextPromptDate } = JSON.parse(promptData);
        if (status === 'dismissed' && nextPromptDate && Date.now() < nextPromptDate) {
          return;
        }
        if (status === 'cancelled') {
          return;
        }
      }
      
      // If no preference or reminder due, show the prompt
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    globalThis.window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    globalThis.window.addEventListener('appinstalled', handleAppInstalled);

    const onStateChange = (newWorker: ServiceWorker) => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
      }
    };

    const onUpdateFound = (reg: ServiceWorkerRegistration) => {
      const newWorker = reg.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => onStateChange(newWorker));
      }
    };

    const initServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) return;
      
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      setRegistration(reg);
      reg.addEventListener('updatefound', () => onUpdateFound(reg));
    };

    initServiceWorker();

    // Handle controller change (reload when new SW takes over)
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          globalThis.window.location.reload();
        }
      });
    }

    return () => {
      globalThis.window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      globalThis.window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const updateApp = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const remindLater = () => {
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    const nextPromptDate = Date.now() + oneWeekInMs;
    localStorage.setItem(PWA_STORAGE_KEY, JSON.stringify({ 
      status: 'dismissed', 
      nextPromptDate 
    }));
    setShowInstallPrompt(false);
  };

  const cancelInstallation = () => {
    localStorage.setItem(PWA_STORAGE_KEY, JSON.stringify({ 
      status: 'cancelled' 
    }));
    setShowInstallPrompt(false);
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    appVersion,
    updateAvailable,
    updateApp,
    showInstallPrompt,
    remindLater,
    cancelInstallation
  };
};
