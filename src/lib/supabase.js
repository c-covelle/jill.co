import { createClient } from '@supabase/supabase-js';

// Replace with your real URL and Anon/Publishable Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fywmzhvlfsjvniqagaki.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_gg6sNv9KVbd_tOs44ghVZw_NkdUO5DG';

console.log("Supabase URL loaded:", supabaseUrl ? "Connected" : "MISSING");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TRIAL_ALLOWLIST = [
  'crissianjill@gmail.com',     // Candidate Account
  'prinzcruz169@gmail.com', // Your Testing Email
  'alleajean@gmail.com'     // Another Testing Email
];

export function isEmailAllowed(email) {
  if (!email) return false;
  return TRIAL_ALLOWLIST.some(
    (allowed) => allowed.toLowerCase().trim() === email.toLowerCase().trim()
  );
}