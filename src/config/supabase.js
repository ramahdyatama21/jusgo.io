// Supabase Configuration
export const supabaseConfig = {
  url: 'https://vwnfdzgkhibdlpcygdkp.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZkemdraGliZGxwY3lnZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTMyMjcsImV4cCI6MjA3NDc2OTIyN30.cAcyxtk93JeQhcTOrGzw6XVdNLCIlgSUPcSRFY_kV5c'
};

// Environment variables fallback
export const getSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL || supabaseConfig.url;
};

export const getSupabaseAnonKey = () => {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseConfig.anonKey;
};
