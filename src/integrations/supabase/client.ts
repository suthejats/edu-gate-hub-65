import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic validation: must be a proper http(s) URL and non-empty anon key
if (!supabaseUrl || typeof supabaseUrl !== 'string' || !/^https?:\/\/.+\..+/.test(supabaseUrl)) {
  throw new Error(
    `Invalid or missing VITE_SUPABASE_URL. It must be a valid URL like "https://your-project-id.supabase.co". Current value: ${String(supabaseUrl)}`
  );
}

if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string') {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);