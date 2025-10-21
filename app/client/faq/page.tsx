'use client'

const questions = [
  {
    q: 'Нужны ли анализы перед справкой?',
    a: 'Да, для некоторых справок (например, для бассейна) требуются анализы. Они указаны при выборе справки.',
  },
  {
    q: 'Сколько действует справка?',
    a: 'Срок действия справки обычно 6 месяцев, но может отличаться в зависимости от типа справки.',
  },
  {
    q: 'Как быстро можно получить справку?',
    a: 'Онлайн — в течение 1 рабочего дня после проверки документов. Оффлайн — сразу после приёма врача.',
  },
  {
    q: 'Подходит ли для конкретного бассейна или организации?',
    a: 'Да, наши справки соответствуют установленным требованиям государственных и частных учреждений.',
  },
]

export default function FAQPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-[#001759] font-[Inter]">
      <h1 className="text-3xl font-bold mb-6">Часто задаваемые вопросы</h1>
      <div className="space-y-4">
        {questions.map((item, i) => (
          <details
            key={i}
            className="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition"
          >
            <summary className="font-semibold cursor-pointer">{item.q}</summary>
            <p className="text-slate-600 mt-2 text-sm">{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
