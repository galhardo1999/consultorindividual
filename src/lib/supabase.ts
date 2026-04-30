import { createClient } from "@supabase/supabase-js";

// Validação em runtime das variáveis de ambiente do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis de ambiente do Supabase não configuradas: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias."
  );
}

// Cliente Supabase para uso de Storage (upload de imagens)
// ATENÇÃO: este cliente usa a anon key pública. Use APENAS para storage.
// Dados de negócio são acessados exclusivamente via Prisma.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
