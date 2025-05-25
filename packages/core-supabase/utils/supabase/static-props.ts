import {createClient as createClientPrimitive} from '@supabase/supabase-js'

export function createClient() {
  return createClientPrimitive(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}