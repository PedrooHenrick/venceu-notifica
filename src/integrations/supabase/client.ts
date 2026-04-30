import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Validação das variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas. ' +
    'Verifique VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env'
  )
}

// Criação do client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// 👇 PROTEÇÃO AUTOMÁTICA DE SESSÃO (ESSA É A PARTE IMPORTANTE)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)

  // Se a sessão morrer (refresh token inválido, expirado, logout em outro lugar etc)
  if (event === 'SIGNED_OUT') {
    console.warn('Sessão perdida → redirecionando para login')
    window.location.href = '/auth' // MUDE se sua rota for diferente
  }
})






















