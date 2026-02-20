import { createClient } from '@supabase/supabase-js';

// Verifique se os nomes abaixo batem com o que está no seu .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Se a URL estiver vazia aqui, o Supabase vai dar erro de "Invalid URL"
export const supabase = createClient(supabaseUrl, supabaseAnonKey);