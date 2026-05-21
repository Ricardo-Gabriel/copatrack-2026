import { createClient } from '@supabase/supabase-js';

// Usamos variáveis de ambiente por padrão, mas mantemos o fallback para garantir que o deploy funcione
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndeuodkmuvekxnpkukgn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_SsxvmjlY-cA7GpSMMC33fg_BmtN1NQn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
