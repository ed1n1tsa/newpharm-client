'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import ProcedureCard from './components/ProcedureCard'
import NurseCallForm from './components/NurseCallForm'

export default function ConsultationsPage() {
  const [procedures, setProcedures] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
    supabase
      .from('procedures')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => setProcedures(data || []))
  }, [])

  function handleCall(p: any) {
    setSelected([p]) // одна или несколько — можно расширить
    setOpen(true)
  }

  return (
    <main className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Вызов медсестры на дом</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {procedures.map((p) => (
          <ProcedureCard key={p.id} procedure={p} onCall={handleCall} />
        ))}
      </div>

      <NurseCallForm
        isOpen={open}
        onClose={() => setOpen(false)}
        selectedProcedures={selected}
        userId={userId}
      />
    </main>
  )
}
