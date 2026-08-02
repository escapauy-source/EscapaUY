
import React, { useEffect, useState } from 'react';
import { createRoot } from "react-dom/client";

export const SystemCheck = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [stack, setStack] = useState<string | null>(null);
    const [AppComponent, setAppComponent] = useState<any>(null);

    const log = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    useEffect(() => {
        const runChecks = async () => {
            try {
                log("Iniciando SystemCheck v1.0...");

                // 1. Check i18n
                log("Importing i18n...");
                try {
                    await import('./i18n');
                    log("✅ i18n loaded successfully.");
                } catch (e: any) {
                    log("❌ ERROR loading i18n: " + e.message);
                    throw e;
                }

                // 2. Check Context
                log("Importing AppContext...");
                try {
                    await import('./context/AppContext');
                    log("✅ AppContext loaded.");
                } catch (e: any) {
                    log("❌ ERROR loading AppContext: " + e.message);
                    throw e;
                }

                // 3. Check App
                log("Importing App.tsx...");
                try {
                    const module = await import('./App');
                    log("✅ App.tsx module loaded.");

                    log("Preparing to render App...");
                    setAppComponent(() => module.App);
                } catch (e: any) {
                    log("❌ ERROR loading App.tsx: " + e.message);
                    throw e;
                }

            } catch (e: any) {
                console.error("DIAGNOSTIC CAUGHT:", e);
                setError(e.message || "Unknown error");
                setStack(e.stack || null);
            }
        };

        // Capture global errors that happen during async imports
        const handleGlobalError = (event: ErrorEvent) => {
            setError(`Global Error: ${event.message}`);
            setStack(`${event.filename}:${event.lineno}:${event.colno}`);
        };

        window.addEventListener('error', handleGlobalError);
        runChecks();

        return () => window.removeEventListener('error', handleGlobalError);
    }, []);

    if (error) {
        return (
            <div className="fixed inset-0 bg-red-50 p-10 font-mono overflow-auto z-[9999]">
                <h1 className="text-3xl text-red-700 font-bold mb-4">🚨 DIAGNÓSTICO: ERROR CRÍTICO</h1>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200 mb-6">
                    <h2 className="text-xl font-bold mb-2">Causa del Problema:</h2>
                    <p className="text-lg text-red-600 font-bold">{error}</p>
                    {stack && <pre className="mt-4 p-4 bg-gray-100 text-xs text-gray-700 rounded overflow-x-auto">{stack}</pre>}
                </div>

                <div className="bg-gray-900 text-green-400 p-6 rounded-lg shadow-lg">
                    <h3 className="text-gray-400 border-b border-gray-700 pb-2 mb-2">Logs de Inicialización:</h3>
                    {logs.map((L, i) => (
                        <div key={i} className="mb-1">{L}</div>
                    ))}
                </div>
            </div>
        );
    }

    if (AppComponent) {
        return <AppComponent />;
    }

    return (
        <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-center font-mono">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h1 className="text-2xl mb-4">EscapaUY - System Check</h1>
            <div className="max-w-md w-full bg-black/50 p-4 rounded text-sm h-64 overflow-auto">
                {logs.map((L, i) => (
                    <div key={i} className="mb-1 border-b border-gray-800 pb-1">{L}</div>
                ))}
            </div>
        </div>
    );
};
