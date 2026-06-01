/**
 * Centralised Supabase configuration check.
 * Import this instead of re-implementing the check in every file.
 */
export const IS_SUPABASE_CONFIGURED = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
