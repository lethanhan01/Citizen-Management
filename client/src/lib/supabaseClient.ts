import { createClient } from '@supabase/supabase-js';

// Lấy từ environment variables hoặc hardcode tạm thời
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL hoặc Key chưa được cấu hình!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
