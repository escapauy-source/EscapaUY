import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import { App } from "./App";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { useEffect, useState } from "react";


// Declare i18n type for TypeScript
declare global {
  interface Window {
    resetEscapa: () => void;
    i18n?: {
      isInitialized: boolean;
    };
  }
}


const DATA_VERSION = '2.0';

try {
  const currentVersion = localStorage.getItem('DATA_VERSION');
  if (currentVersion !== DATA_VERSION) {
    console.warn(`[MIGRATION] Version mismatch (${currentVersion} vs ${DATA_VERSION}). Clearing storage...`);
    // Preserve authentication if possible, but for safety clear everything related to itinerary
    const authStore = localStorage.getItem('auth-storage');
    localStorage.clear();
    if (authStore) localStorage.setItem('auth-storage', authStore); // Restore auth if it exists
    localStorage.setItem('DATA_VERSION', DATA_VERSION);
    console.log('[MIGRATION] Storage cleared and version updated.');
  }
} catch (e) {
  console.error('[MIGRATION] Error checking version:', e);
}

window.resetEscapa = () => {
  console.warn("TRIGGERING GLOBAL RESET");
  localStorage.clear();
  window.location.href = '/';
};


// Loading component mientras i18n se inicializa
function I18nLoader({ children }: { children: React.ReactNode }) {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    // Esperar a que i18n esté listo
    const checkI18n = () => {
      if (window.i18n && window.i18n.isInitialized) {
        setIsI18nReady(true);
      } else {
        setTimeout(checkI18n, 100);
      }
    };
    checkI18n();

    // Safety timeout: force load after 3 seconds to prevent infinite blank screen
    const safetyTimer = setTimeout(() => {
      console.warn("[I18N] Safety timeout triggered - forcing render");
      setIsI18nReady(true);
    }, 3000);

    return () => clearTimeout(safetyTimer);
  }, []);

  if (!isI18nReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Cargando EscapaUY...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <I18nLoader>
      <App />
    </I18nLoader>
  </GlobalErrorBoundary>
);
