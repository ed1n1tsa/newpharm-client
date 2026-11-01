'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

export function SupabaseListener() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Avoid calling signout on every guest INITIAL_SESSION (null) —
      // that previously redirected to localhost and broke 127.0.0.1 demos.
      if (session) {
        try {
          await fetch('/api/auth/set-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session }),
          })
        } catch (err) {
          console.warn('set-session failed', err)
        }
        return
      }

      if (event === 'SIGNED_OUT') {
        try {
          await fetch('/api/auth/signout', { method: 'POST' })
        } catch (err) {
          console.warn('signout sync failed', err)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
