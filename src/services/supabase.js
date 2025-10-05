import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '../config/supabase';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  console.error('❌ Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Must start with https://');
}

// Validate key format (JWT should have 3 parts)
const keyParts = supabaseAnonKey.split('.');
if (keyParts.length !== 3) {
  console.error('❌ Invalid Supabase key format');
  throw new Error('Invalid Supabase key format. Must be a valid JWT token.');
}

console.log('✅ Supabase configuration validated');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
