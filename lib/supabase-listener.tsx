'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

export function SupabaseListener() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session }),
        })
      } else {
        await fetch('/api/auth/signout', { method: 'POST' })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
