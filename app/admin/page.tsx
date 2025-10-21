import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'

export default async function AdminHome() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'unknown'

  switch (role) {
    case 'director':   redirect('/admin/director')
    case 'accountant': redirect('/admin/accountant')
    case 'doctor':     redirect('/admin/doctor')
    case 'developer':  redirect('/admin/dev')
    default:           redirect('/admin/unknown')
  }
}
