"use client";

import { FileCode } from 'lucide-react';

interface SecurityAuditLogsTabProps {
  logs: any[];
}

export function SecurityAuditLogsTab({ logs }: SecurityAuditLogsTabProps) {
  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
      <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
        <FileCode className="w-5 h-5 text-indigo-400" />
        Platform Security Audit Log Feed
      </h3>

      <div className="space-y-3 font-mono text-xs">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px] border border-blue-500/30">
                  {log.action}
                </span>
                <span className="text-slate-200 font-semibold">{log.detail}</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Performed by: {log.performedBy}</span>
            </div>
            <span className="text-[11px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
