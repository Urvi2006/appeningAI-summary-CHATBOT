import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, FileText, RefreshCw } from 'lucide-react';
import { QueryAuditLog } from '../types';
import { api } from '../api/client';

export const ActivityView: React.FC = () => {
  const [logs, setLogs] = useState<QueryAuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getActivityLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            RAG Query Activity Log
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Real-time audit history of questions, retrieved passages, and latency
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#12141c] hover:bg-[#181b24] text-neutral-200 text-xs font-medium transition-colors cursor-pointer focus-ring"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0e1017] overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-2">
            <Activity className="w-8 h-8 mx-auto text-neutral-600" />
            <p className="text-xs font-medium text-neutral-300">No activity recorded yet</p>
            <p className="text-[11px] text-neutral-400">
              Questions asked in the AI Assistant will be audited and logged here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:px-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white font-sans text-sm">
                      "{log.question}"
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1 text-neutral-300">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      <span>{log.documentName}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                  <span className="text-neutral-300">
                    {log.citationsCount} citation{log.citationsCount === 1 ? '' : 's'}
                  </span>
                  <span className="text-neutral-400">{log.latencyMs} ms</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Grounded</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
