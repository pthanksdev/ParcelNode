"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  RefreshCw,
  Zap,
  PauseCircle,
  PlayCircle,
  Server,
  Send,
  FileCode,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { AdminOverviewTab } from '@/components/admin/AdminOverviewTab';
import { CarrierWebhookSimulator } from '@/components/admin/CarrierWebhookSimulator';
import { SecurityAuditLogsTab } from '@/components/admin/SecurityAuditLogsTab';

export default function AdminControlPlanePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'webhook_tester' | 'audit_logs'>('overview');
  const [flushLoading, setFlushLoading] = useState(false);
  const [circuitBreakerLoading, setCircuitBreakerLoading] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser || storedUser.role !== 'ADMIN') {
      alert('Access Denied. Super Admin credentials required.');
      router.push('/dashboard');
      return;
    }
    setUser(storedUser);
    loadAdminData();
  }, [router]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overviewData, merchantsData, healthData, logsData] = await Promise.all([
        fetchApi('/api/admin/overview'),
        fetchApi('/api/admin/merchants'),
        fetchApi('/api/admin/system/health'),
        fetchApi('/api/admin/audit-logs'),
      ]);

      setStats(overviewData);
      setMerchants(merchantsData);
      setHealth(healthData);
      setAuditLogs(logsData);
    } catch (err: any) {
      console.error('Failed loading admin control plane data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (merchantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await fetchApi(`/api/admin/merchants/${merchantId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: nextStatus }),
      });
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed updating tenant status');
    }
  };

  const handleToggleCircuitBreaker = async () => {
    if (!stats) return;
    const nextPaused = !stats.circuitBreakerPaused;
    setCircuitBreakerLoading(true);
    try {
      const res = await fetchApi('/api/admin/circuit-breaker/toggle', {
        method: 'POST',
        body: JSON.stringify({ paused: nextPaused }),
      });
      alert(res.message);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed toggling circuit breaker');
    } finally {
      setCircuitBreakerLoading(false);
    }
  };

  const handleForceBatchFlush = async () => {
    setFlushLoading(true);
    try {
      const res = await fetchApi('/api/admin/batches/force-flush', {
        method: 'POST',
      });
      alert(res.message);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed executing batch flush');
    } finally {
      setFlushLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading Super Admin Control Plane data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-2 sm:px-0">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> Super Admin Control Plane
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 mt-1">
            Platform Owner Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tenant management, Merkle batch force-flushing, carrier webhook testing, and security audit logs
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-800 min-h-[44px] flex items-center justify-center"
            title="Refresh System Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleForceBatchFlush}
            disabled={flushLoading}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 flex-1 sm:flex-none min-h-[44px]"
          >
            <Zap className="w-4 h-4" />
            {flushLoading ? 'Flushing...' : 'Force Batch Flush'}
          </button>

          <button
            onClick={handleToggleCircuitBreaker}
            disabled={circuitBreakerLoading}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all flex-1 sm:flex-none min-h-[44px] ${
              stats?.circuitBreakerPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
            }`}
          >
            {stats?.circuitBreakerPaused ? (
              <>
                <PlayCircle className="w-4 h-4" /> Resume Contract Batching
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4" /> Emergency Circuit Breaker
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs - Mobile Scrollable */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          Overview & Tenants
        </button>

        <button
          onClick={() => setActiveTab('webhook_tester')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'webhook_tester'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          Carrier Webhook Simulator
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'audit_logs'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab Content Components */}
      {activeTab === 'overview' && (
        <AdminOverviewTab
          stats={stats}
          health={health}
          merchants={merchants}
          search={search}
          onSearchChange={setSearch}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {activeTab === 'webhook_tester' && (
        <CarrierWebhookSimulator onSuccess={() => loadAdminData()} />
      )}

      {activeTab === 'audit_logs' && (
        <SecurityAuditLogsTab logs={auditLogs} />
      )}
    </div>
  );
}
