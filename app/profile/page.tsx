import { supabaseServer } from '@/lib/supabase-server'
import ProfileClient, { ProfileAuthGate } from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await supabaseServer()
  const { data, error } = await supabase.auth.getUser()

  if (error?.message === 'Auth session missing!' || !data?.user) {
    return <ProfileAuthGate />
  }

  const user = data.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, role, created_at')
    .eq('id', user.id)
    .single()

  return (
    <ProfileClient
      fullName={
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email ||
        'Пользователь'
      }
      email={user.email || '—'}
      phone={profile?.phone || user.user_metadata?.phone || '—'}
      registeredAt={new Date(
        profile?.created_at || user.created_at
      ).toLocaleDateString('ru-RU')}
    />
  )
}
