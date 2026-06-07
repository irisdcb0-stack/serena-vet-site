// Copy this file to `supabase-config.js` and fill the values.
// Keep this file out of public repos if you prefer privacy.

const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key';

// The script below will create a `supabaseClient` global used by `script.js`.
if (typeof window !== 'undefined' && window.supabase) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('Supabase SDK not found. Include the supabase CDN in your HTML.');
}
