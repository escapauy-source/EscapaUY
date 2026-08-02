import { createRoot } from "react-dom/client";
import "./index.css";
import i18n from "./i18n";
import { App } from "./App";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { useState, useEffect } from "react";

const DATA_VERSION = '2.0';

// Guard: localStorage and window are not available during SSR/prerender
if (typeof window !== 'undefined') {
  try {
    const currentVersion = localStorage.getItem('DATA_VERSION');
    if (currentVersion !== DATA_VERSION) {
      const authStore = localStorage.getItem('auth-storage');
      localStorage.clear();
      if (authStore) localStorage.setItem('auth-storage', authStore);
      localStorage.setItem('DATA_VERSION', DATA_VERSION);
    }
  } catch (e) {
    console.error('[MIGRATION] Error checking version:', e);
  }

  (window as any).resetEscapa = () => {
    localStorage.clear();
    window.location.href = '/';
  };
}

import { I18nextProvider } from 'react-i18next';
import { Suspense } from 'react';

// Loading component mientras i18n se inicializa
function I18nLoader({ children }: { children: React.ReactNode }) {
  const [isI18nReady, setIsI18nReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (isI18nReady) return;

    const onInitialized = () => setIsI18nReady(true);

    if (i18n.isInitialized) {
      setIsI18nReady(true);
    } else {
      i18n.on('initialized', onInitialized);
    }

    // Safety timeout: force load after 3 seconds
    const safetyTimer = setTimeout(() => {
      console.warn("[I18N] Safety timeout triggered - forcing render");
      setIsI18nReady(true);
    }, 3000);

    return () => {
      clearTimeout(safetyTimer);
      i18n.off('initialized', onInitialized);
    };
  }, [isI18nReady]);

  const loader = (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-inter">Cargando EscapaUY...</p>
      </div>
    </div>
  );

  if (!isI18nReady) {
    return loader;
  }

  return <Suspense fallback={loader}>{children}</Suspense>;
}

import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <I18nLoader>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </I18nLoader>
      </I18nextProvider>
    </HelmetProvider>
  </GlobalErrorBoundary>
);
