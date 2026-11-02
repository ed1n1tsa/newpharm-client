import { redirect } from 'next/navigation'

/** Legacy /client/profile → public guest /profile */
export default function ClientProfileRedirect() {
  redirect('/profile')
}
