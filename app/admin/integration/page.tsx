'use client';

import { useState } from 'react';

export default function IntegrationPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  async function handleSync() {
    setLoading(true);
    setLogs((prev) => [...prev, '🚀 Начато обновление из 1С...']);

    try {
      const res = await fetch('/api/products', { method: 'GET' });
      const data = await res.json();

      if (res.ok) {
        setLogs((prev) => [
          ...prev,
          `✅ Загружено ${data.products} товаров и ${data.categories} категорий.`,
          '✅ Интеграция завершена успешно.',
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          `❌ Ошибка: ${data.error || 'Неизвестная ошибка'}`,
        ]);
      }
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        `⚠️ Ошибка соединения: ${err.message}`,
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Интеграция с 1С</h1>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleSync}
          disabled={loading}
          className={`px-5 py-2.5 font-semibold rounded-lg transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          {loading ? '⏳ Обновление...' : '🔄 Обновить из 1С'}
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-2">Логи интеграции</h2>
          <div className="text-sm text-gray-800 space-y-1 max-h-64 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <p key={i} className="whitespace-pre-wrap">{log}</p>
              ))
            ) : (
              <p className="text-gray-500">Логи появятся после запуска интеграции.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
