import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing state with localStorage persistence
 * @param key - localStorage key (use STORAGE_KEYS constants)
 * @param defaultValue - Default value if nothing in storage
 * @param debug - Enable debug logging (default: false)
 * @returns [value, setValue] tuple like useState
 */
export function useLocalStorageState<T>(
    key: string,
    defaultValue: T,
    debug = false
): [T, (value: T | ((prev: T) => T)) => void] {
    // Initialize state from localStorage
    const [state, setState] = useState<T>(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored) as T;
                if (debug) {
                    console.log(`[useLocalStorageState] Loaded ${key}:`, parsed);
                }
                return parsed;
            }
        } catch (e) {
            console.error(`[useLocalStorageState] Error loading ${key}:`, e);
        }
        return defaultValue;
    });

    // Wrapped setState that also saves to localStorage
    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setState((prev) => {
                const newValue = value instanceof Function ? value(prev) : value;
                try {
                    localStorage.setItem(key, JSON.stringify(newValue));
                    if (debug) {
                        console.log(`[useLocalStorageState] Saved ${key}:`, newValue);
                    }
                } catch (e) {
                    console.error(`[useLocalStorageState] Error saving ${key}:`, e);
                }
                return newValue;
            });
        },
        [key, debug]
    );

    // Listen for changes in other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    const newValue = JSON.parse(e.newValue) as T;
                    setState(newValue);
                    if (debug) {
                        console.log(`[useLocalStorageState] External change for ${key}:`, newValue);
                    }
                } catch (error) {
                    console.error(`[useLocalStorageState] Error parsing storage event:`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, debug]);

    return [state, setValue];
}

/**
 * Hook for debouncing a value
 * Useful for search inputs, etc.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook for detecting if component is mounted
 * Useful for preventing state updates on unmounted components
 */
export function useIsMounted(): () => boolean {
    const [isMounted, setIsMounted] = useState(true);

    useEffect(() => {
        return () => {
            setIsMounted(false);
        };
    }, []);

    return useCallback(() => isMounted, [isMounted]);
}

/**
 * Hook for previous value
 * Useful for comparing prev/current in effects
 */
export function usePrevious<T>(value: T): T | undefined {
    const [current, setCurrent] = useState<T>(value);
    const [previous, setPrevious] = useState<T | undefined>(undefined);

    if (value !== current) {
        setPrevious(current);
        setCurrent(value);
    }

    return previous;
}
