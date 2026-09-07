"use client";

import { Users, Activity, Layers, Zap, Cpu, Search } from 'lucide-react';

interface AdminOverviewTabProps {
  stats: any;
  health: any;
  merchants: any[];
  search: string;
  onSearchChange: (val: string) => void;
  onToggleStatus: (merchantId: string, currentStatus: string) => void;
}

export function AdminOverviewTab({
  stats,
  health,
  merchants,
  search,
  onSearchChange,
  onToggleStatus,
}: AdminOverviewTabProps) {
  const filteredMerchants = merchants.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Tenants</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalMerchants || 0}</div>
          <div className="text-[11px] text-slate-500">Enrolled enterprise merchants</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Tracked Events</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalEvents || 0}</div>
          <div className="text-[11px] text-slate-500">Carrier telemetry logs</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Anchored Batches</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.confirmedBatches || 0} / {stats?.totalBatches || 0}</div>
          <div className="text-[11px] text-slate-500">Committed to Ethereum Sepolia</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Gas Saved (Est)</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">${stats?.estimatedGasSavingsUsd?.toLocaleString() || 0}</div>
          <div className="text-[11px] text-slate-500">Via binary Merkle batching</div>
        </div>
      </div>

      {/* Infrastructure & System Signer Health Matrix */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          System Committer Node & Infrastructure Health
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">System Committer Wallet</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">ONLINE</span>
            </div>
            <div className="font-mono text-slate-400 text-[11px] break-all">{health?.systemSignerAddress || '0x90F79bf6EB2c4f870365E785982E1f101E93b906'}</div>
            <div className="flex justify-between text-slate-300">
              <span>On-Chain Status:</span>
              <span className="font-bold text-emerald-400">READY</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Queue Worker Service</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">ACTIVE</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Batch Accumulator:</span>
              <span className="font-bold text-white">{health?.queueWorkers?.batchAccumulator || 'ACTIVE'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Unbatched Event Backlog:</span>
              <span className="font-bold text-white">{health?.queueWorkers?.unbatchedBacklog || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Management Roster */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Enrolled Merchant Roster
          </h3>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant name or email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Merchant Name</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Total Orders</th>
                  <th className="px-6 py-4 font-semibold">Account Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMerchants.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100">{m.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{m.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          m.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">{m._count?.orders || 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          m.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {m.role !== 'ADMIN' && (
                        <button
                          onClick={() => onToggleStatus(m.id, m.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            m.status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-300 hover:text-white border-emerald-500/30'
                          }`}
                        >
                          {m.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
