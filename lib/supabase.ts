// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Crea el cliente Supabase usando tus variables de entorno
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
