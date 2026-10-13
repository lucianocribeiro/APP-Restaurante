import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  ((import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL as string) ||
  'https://volnohzhysqmvmwndopx.supabase.co';

export const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  ((import.meta.env as any).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string) ||
  'sb_publishable_uKlzY7d1E2tX753qUs3udA_p-I7kY7A';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
