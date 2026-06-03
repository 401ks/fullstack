// js/supabaseClient.js
// Supabase client initialization — uses ANON key only (safe for frontend)

const SUPABASE_URL = 'https://jatysoypmlhnmjfuzses.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdHlzb3lwbWxobm1qZnV6c2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzU2MjQsImV4cCI6MjA5NjA1MTYyNH0.vctFx_WwbYCz4sET2Bd6JwS4c-wFr_jq6eZ7S0su2Hg';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Expose globally
window.supabaseClient = supabaseClient;