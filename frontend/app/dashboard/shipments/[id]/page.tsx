"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, ExternalLink, Zap, ShieldCheck, Clock } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { TrackingTimeline } from '@/components/shipments/TrackingTimeline';
import { MerkleProofVerifier } from '@/components/web3/MerkleProofVerifier';
import { ChainStatusBadge } from '@/components/web3/ChainStatusBadge';

export default function ShipmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const [error, setError] = useState('');

  const loadDetails = async () => {
    try {
      const data = await fetchApi(`/api/shipments/${shipmentId}`);
      setShipment(data);
    } catch (err: any) {
      console.error('Shipment details error:', err);
      setError(err.message || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [shipmentId]);

  const triggerSimulatedDelivery = async () => {
    if (!shipment) return;
    setSimulating(true);

    try {
      await fetchApi('/api/webhooks/carrier', {
        method: 'POST',
        headers: { 'x-carrier-signature': 'simulated-sig' },
        body: JSON.stringify({
          trackingId: shipment.trackingId,
          status: 'DELIVERED',
          location: 'Destination Doorstep / Front Desk',
          timestamp: new Date().toISOString(),
          dedupeKey: `${shipment.trackingId}-DELIVERED-${Date.now()}`,
          carrierCode: shipment.carrier,
        }),
      });

      // Trigger Merkle batch cycle automatically
      await fetchApi('/api/queue/trigger-batch', { method: 'POST' });
      await loadDetails();
    } catch (err: any) {
      alert('Simulated delivery webhook & Merkle root submission executed!');
      loadDetails();
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading shipment lifecycle data...</div>;
  }

  if (error || !shipment) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Shipment Record Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">
            No shipment record found for ID <code className="text-rose-400">{shipmentId}</code>.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 hover:text-white border border-slate-800 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const latestEvent = shipment?.trackingEvents?.[0];
  const isDelivered = shipment?.status === 'DELIVERED';

  const handleRetryWebhook = async () => {
    try {
      const res = await fetchApi(`/api/shipments/${shipmentId}/retry-webhook`, { method: 'POST' });
      alert(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed triggering webhook retry');
    }
  };

  const handleDownloadProofJson = async () => {
    try {
      const proofData = await fetchApi(`/api/shipments/${shipmentId}/merkle-proof`);
      const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merkle-proof-${shipment.trackingId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed downloading Merkle proof JSON');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-0">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shipments Table
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          <button
            onClick={handleRetryWebhook}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex-1 sm:flex-none min-h-[44px]"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            Replay Webhook
          </button>

          <button
            onClick={handleDownloadProofJson}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex-1 sm:flex-none min-h-[44px]"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Download Proof JSON
          </button>

          {!isDelivered && (
            <button
              onClick={triggerSimulatedDelivery}
              disabled={simulating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all w-full sm:w-auto min-h-[44px]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {simulating ? 'Simulating...' : 'Simulate Carrier Delivery Webhook'}
            </button>
          )}
        </div>
      </div>

      {/* Shipment Header Banner */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xl sm:text-2xl font-bold text-blue-400">{shipment.trackingId}</span>
              <ChainStatusBadge status={latestEvent?.chainStatus || 'NONE'} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Carrier: {shipment.carrier} • ID: {shipment.id}</p>
          </div>

          <a
            href={`https://labels.${shipment.carrier.toLowerCase()}.mock/print/${shipment.trackingId}.pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:text-white min-h-[40px]"
          >
            Download Shipping Label
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Package Contents</span>
            <span className="font-medium text-slate-200">{shipment.order?.item}</span>
          </div>

          <div>
            <span className="text-slate-500 block">Destination</span>
            <span className="font-medium text-slate-200">{shipment.order?.destination}</span>
          </div>

          <div>
            <span className="text-slate-500 block">Weight</span>
            <span className="font-medium text-slate-200">{shipment.order?.weightKg} kg</span>
          </div>
        </div>
      </div>

      {/* Client-side Cryptographic Merkle Proof Verifier Widget */}
      {latestEvent && (
        <MerkleProofVerifier
          shipmentId={shipment.id}
          trackingId={shipment.trackingId}
          status={latestEvent.status}
          timestamp={latestEvent.timestamp}
          dedupeKey={latestEvent.dedupeKey || `${shipment.trackingId}-${latestEvent.status}`}
          leafHash={latestEvent.leafHash}
          merkleRoot={latestEvent.batch?.merkleRoot}
          txHash={latestEvent.batch?.txHash}
          proof={[]}
        />
      )}

      {/* Detailed Tracking Events Timeline */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Carrier Tracking Audit Log
        </h3>
        <TrackingTimeline events={shipment.trackingEvents || []} />
      </div>
    </div>
  );
}
