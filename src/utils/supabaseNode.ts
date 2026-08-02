// Only import fs/path if running in Node.js environment
// We cannot rely on import statements at the top level because Vite will try to resolve them in the browser.
// Instead, we will dynamically require or conditionally use them below.
import { createClient } from '@supabase/supabase-js';

// Manual .env parsing for Node environment without dotenv dependency
const loadEnv = () => {
    // Check if we are in a browser environment
    if (typeof process === 'undefined' || typeof process.cwd !== 'function') {
        return;
    }

    try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach((line: string) => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
        }
    } catch (error) {
        console.warn('Could not load .env file', error);
    }
};

loadEnv();

// Read from Vite env first (browser friendly), then fall back to process.env (Node)
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : null) || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : null);
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : null) || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : null);

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
        console.warn('Missing Supabase credentials in .env file');
    }
}

export const supabaseNode = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
