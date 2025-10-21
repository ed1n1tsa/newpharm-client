'use client'

export default function ProcedureCard({
  procedure,
  onCall,
}: {
  procedure: any
  onCall: (p: any) => void
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border shadow-sm">
      <h3 className="font-semibold text-lg text-[#001759] mb-2">{procedure.name}</h3>
      <p className="text-sm text-slate-600 mb-2">{procedure.description}</p>
      <p className="text-xs text-slate-500 mb-3">⏱ {procedure.duration}</p>
      <p className="font-semibold text-emerald-600 mb-4">
        {Number(procedure.price).toLocaleString('ru-RU')} ₸
      </p>
      <button
        onClick={() => onCall(procedure)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg w-full font-semibold"
      >
        🚑 Вызвать медсестру
      </button>
    </div>
  )
}
