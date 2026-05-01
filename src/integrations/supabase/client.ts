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

// Flag de ambiente (DEV ou produção)
const isDev = import.meta.env.DEV

// 👇 PROTEÇÃO AUTOMÁTICA DE SESSÃO
supabase.auth.onAuthStateChange((event, session) => {

  // Logs apenas em desenvolvimento
  if (isDev) {
    console.log('Auth event:', event)
  }

  // Se a sessão morrer (logout, token inválido, etc)
  if (event === 'SIGNED_OUT') {

    if (isDev) {
      console.warn('Sessão perdida → redirecionando para login')
    }

    window.location.href = '/auth' // ajuste se necessário
  }
})