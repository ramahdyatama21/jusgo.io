import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vwnfdzgkhibdlpcygdkp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmZkemdraGliZGxwY3lnZGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTMyMjcsImV4cCI6MjA3NDc2OTIyN30.cAcyxtk93JeQhcTOrGzw6XVdNLCIlgSUPcSRFY_kV5c';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
