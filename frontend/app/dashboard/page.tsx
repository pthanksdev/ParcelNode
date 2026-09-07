"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, Package } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { ShipmentsTable } from '@/components/shipments/ShipmentsTable';
import { AuditExporter } from '@/components/shipments/AuditExporter';
import { DashboardKpiCards } from '@/components/shipments/DashboardKpiCards';
import { CreateShipmentModal } from '@/components/shipments/CreateShipmentModal';
import { EditShipmentModal } from '@/components/shipments/EditShipmentModal';
import { DeleteShipmentModal } from '@/components/shipments/DeleteShipmentModal';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state for CRUD operations
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<any>(null);
  const [deletingShipment, setDeletingShipment] = useState<any>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(storedUser);
    loadShipments();
  }, [router]);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/shipments');
      setShipments(data);
    } catch (err) {
      console.error('Failed fetching live shipments from backend API:', err);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  // KPI Computations
  const totalShipments = shipments.length;
  const outForDelivery = shipments.filter((s) => s.status === 'OUT_FOR_DELIVERY' || s.status === 'IN_TRANSIT').length;
  const confirmedBatches = shipments.filter((s) => s.trackingEvents?.some((e: any) => e.batch?.status === 'CONFIRMED')).length;
  const gasSavingsUsd = totalShipments * 14.85;

  return (
    <div className="space-y-8 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            Merchant Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time shipping management & Merkle tree cryptographic proof ledger
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => loadShipments()}
            className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-800 flex-1 sm:flex-none flex items-center justify-center min-h-[44px]"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Create Shipment
          </button>
        </div>
      </div>

      {/* KPI Cards Component */}
      <DashboardKpiCards
        totalShipments={totalShipments}
        outForDelivery={outForDelivery}
        confirmedBatches={confirmedBatches}
        gasSavingsUsd={gasSavingsUsd}
      />

      {/* Main Content & Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
          <p>Loading live merchant shipments from database...</p>
        </div>
      ) : shipments.length > 0 ? (
        <div className="space-y-6">
          <ShipmentsTable
            shipments={shipments}
            onEdit={(s) => setEditingShipment(s)}
            onDelete={(s) => setDeletingShipment(s)}
          />
          <AuditExporter shipments={shipments} />
        </div>
      ) : (
        <div className="glass-panel p-6 sm:p-12 text-center rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">No Shipments Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't created any shipments yet. Click "Create Shipment" to dispatch your first package.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white min-h-[44px]"
          >
            Create First Shipment
          </button>
        </div>
      )}

      {/* CRUD Modals */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => loadShipments()}
      />

      <EditShipmentModal
        isOpen={!!editingShipment}
        shipment={editingShipment}
        onClose={() => setEditingShipment(null)}
        onSuccess={() => loadShipments()}
      />

      <DeleteShipmentModal
        isOpen={!!deletingShipment}
        shipment={deletingShipment}
        onClose={() => setDeletingShipment(null)}
        onSuccess={() => loadShipments()}
      />
    </div>
  );
}
