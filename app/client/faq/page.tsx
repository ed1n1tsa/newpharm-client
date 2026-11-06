import { redirect } from 'next/navigation'

/** Legacy /client/faq → homepage FAQ anchor */
export default function ClientFaqRedirect() {
  redirect('/#faq')
}
