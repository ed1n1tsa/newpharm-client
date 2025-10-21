'use client'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function LogoutBtn() {
  const router = useRouter()

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut({ scope: 'local' })
        router.push('/')
      }}
      className="text-sm text-gray-600 hover:text-black"
    >
      Выйти
    </button>
  )
}
