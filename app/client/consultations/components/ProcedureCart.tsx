'use client'

export default function ProcedureCart({
  cart,
  onRemove,
  onNext,
  onBack,
}: any) {
  const total = cart.reduce((sum: number, p: any) => sum + p.price, 0)

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-[#001759]">Корзина процедур</h3>

      {cart.length === 0 ? (
        <p className="text-slate-600">Корзина пуста</p>
      ) : (
        <>
          <ul className="divide-y divide-slate-200 mb-4">
            {cart.map((p: any) => (
              <li key={p.id} className="py-2 flex justify-between items-center">
                <span>{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600 font-semibold">
                    {p.price.toLocaleString('ru-RU')} ₸
                  </span>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center font-semibold mb-4">
            <span>Итого:</span>
            <span className="text-emerald-600">{total.toLocaleString('ru-RU')} ₸</span>
          </div>

          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-semibold"
            >
              ← Назад
            </button>
            <button
              onClick={onNext}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Вызвать медсестру
            </button>
          </div>
        </>
      )}
    </div>
  )
}
