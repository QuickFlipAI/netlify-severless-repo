import { createClient, processLock } from '@supabase/supabase-js';

const supabaseBaseURL = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseSecretKey = process.env.SUPABASE_SEC_KEY;

console.log('initiate supabase client');

const supabase = createClient(supabaseBaseURL, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Access auth admin api
const adminAuthClient = supabase.auth.admin

export default supabase