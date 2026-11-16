'use client';

import { useState } from 'react';

type SyncResult = {
  ok?: boolean;
  dryRun?: boolean;
  onecRawCount?: number;
  onecUniqueCount?: number;
  onecDuplicateIdGroups?: number;
  toInsert?: number;
  toUpdate?: number;
  toDeactivate?: number;
  inserted?: number;
  updated?: number;
  deactivated?: number;
  stocksUpserted?: number;
  stocksZeroed?: number;
  stocksRpc?: string;
  stocksRpcError?: string;
  legacyIdMatches?: number;
  partial?: boolean;
  queueLogError?: string;
  sampleInserts?: string[];
  sampleUpdates?: string[];
  sampleDeactivates?: string[];
  error?: string;
  details?: SyncResult;
  products?: number;
};

export default function IntegrationPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  function pushLog(line: string) {
    setLogs((prev) => [...prev, line]);
  }

  function describeResult(data: SyncResult, dryRun: boolean) {
    const r = data.details || data;
    const lines = [
      dryRun ? '📋 Dry-run (запись в БД не выполнялась)' : '✅ Безопасный sync выполнен',
      `1С сырых строк: ${r.onecRawCount ?? '—'}`,
      `1С уникальных Id: ${r.onecUniqueCount ?? data.products ?? '—'}`,
      `Дубли Id в 1С (группы): ${r.onecDuplicateIdGroups ?? '—'}`,
      dryRun
        ? `Будет: insert ${r.toInsert ?? 0} · update ${r.toUpdate ?? 0} · deactivate ${r.toDeactivate ?? 0}`
        : `Сделано: insert ${r.inserted ?? 0} · update ${r.updated ?? 0} · deactivate ${r.deactivated ?? 0}`,
      `Остатки: upsert ${r.stocksUpserted ?? 0}, zeroed ${r.stocksZeroed ?? 0} · RPC: ${r.stocksRpc ?? '—'}`,
    ];
    if (r.legacyIdMatches) lines.push(`Legacy id matches: ${r.legacyIdMatches}`);
    if (r.partial) lines.push('⚠️ Частичный прогон — часть записей уже применена');
    if (r.stocksRpcError) lines.push(`RPC warning: ${r.stocksRpcError}`);
    if (r.queueLogError) lines.push(`Queue log: ${r.queueLogError}`);
    if (r.sampleInserts?.length) {
      lines.push('Примеры новых: ' + r.sampleInserts.slice(0, 3).join(' | '));
    }
    if (r.sampleDeactivates?.length) {
      lines.push('Примеры deactivate: ' + r.sampleDeactivates.slice(0, 3).join(', '));
    }
    return lines;
  }

  async function runSync(dryRun: boolean) {
    setLoading(true);
    pushLog(
      dryRun
        ? '🔎 Dry-run: сверка с 1С без записи…'
        : '🚀 Безопасное обновление из 1С (фото не трогаем)…'
    );

    try {
      const qs = dryRun ? '?dry_run=1' : '';
      const res = await fetch(`/api/1c/sync-catalog${qs}`, { method: 'GET' });
      const data = (await res.json()) as SyncResult;

      if (res.ok && data.ok !== false) {
        for (const line of describeResult(data, dryRun)) pushLog(line);
      } else {
        pushLog(`❌ Ошибка: ${data.error || 'Неизвестная ошибка'}`);
      }
    } catch (err: any) {
      pushLog(`⚠️ Ошибка соединения: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">Интеграция с 1С</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-2xl">
        Безопасный sync: название, цена, остатки по{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">external_id_1c</code>.
        Поле <code className="text-xs bg-gray-100 px-1 rounded">image_url</code> не
        перезаписывается. Новые товары создаются с заглушкой фото. Товары, которых
        нет в 1С, мягко выключаются (<code className="text-xs bg-gray-100 px-1 rounded">is_active=false</code>), не удаляются.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => runSync(true)}
            disabled={loading}
            className={`px-5 py-2.5 font-semibold rounded-lg transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-slate-700 hover:bg-slate-800 text-white'
            }`}
          >
            {loading ? '⏳ Работаем…' : '🔎 Сначала сверка (dry-run)'}
          </button>

          <button
            onClick={() => runSync(false)}
            disabled={loading}
            className={`px-5 py-2.5 font-semibold rounded-lg transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {loading ? '⏳ Обновление…' : '🔄 Обновить из 1С (безопасно)'}
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900 max-w-2xl">
          Доступ: войдите как CMS-админ (cookie) или передайте{' '}
          <code className="text-xs bg-white/80 px-1 rounded">ONE_C_SECRET</code> /{' '}
          <code className="text-xs bg-white/80 px-1 rounded">CRON_SECRET</code>.
          Автозапуск: cron →{' '}
          <code className="text-xs bg-white/80 px-1 rounded">
            GET /api/1c/sync-catalog
          </code>{' '}
          с <code className="text-xs bg-white/80 px-1 rounded">Authorization: Bearer …</code>{' '}
          или <code className="text-xs bg-white/80 px-1 rounded">x-onec-secret</code>.
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-2">Логи интеграции</h2>
          <div className="text-sm text-gray-800 space-y-1 max-h-80 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {log}
                </p>
              ))
            ) : (
              <p className="text-gray-500">
                Сначала сделайте dry-run, затем безопасное обновление.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
