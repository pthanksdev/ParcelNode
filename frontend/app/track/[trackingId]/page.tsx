"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Package, ShieldCheck, Truck, Clock, AlertCircle } from 'lucide-react';
import { TrackingTimeline } from '@/components/shipments/TrackingTimeline';
import { MerkleProofVerifier } from '@/components/web3/MerkleProofVerifier';
import { ChainStatusBadge } from '@/components/web3/ChainStatusBadge';
import { fetchApi } from '@/lib/api';

export default function PublicTrackingPage() {
  const params = useParams();
  const trackingId = params.trackingId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!trackingId) return;

    loadPublicShipment();
  }, [trackingId]);

  const loadPublicShipment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi(`/api/shipments/track/${trackingId}`);
      setData(res);
    } catch (err: any) {
      console.error('Failed querying public tracking API:', err);
      setError(err.message || 'Tracking ID not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 px-4">
        <Package className="w-10 h-10 text-blue-500 mx-auto animate-bounce" />
        <p className="text-sm text-slate-400">Resolving package status from carrier & audit ledger...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Tracking Record Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">
            No active package found for Tracking ID <code className="text-rose-400">{trackingId}</code>.
          </p>
        </div>
      </div>
    );
  }

  const latestEvent = data.trackingEvents?.[0];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 px-2 sm:px-0">
      {/* Customer Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 text-center glow-blue">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
          <Truck className="w-7 h-7 text-white" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Package Tracking</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 break-all">{data.trackingId}</h1>
          {data.order?.item && <p className="text-xs text-slate-400 mt-1">Item: {data.order.item}</p>}
        </div>

        <div className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Status: {data.status}
          </span>
          <ChainStatusBadge status={latestEvent?.chainStatus || 'NONE'} />
        </div>
      </div>

      {/* Embedded Client-Side Cryptographic Verifier */}
      {latestEvent && (
        <MerkleProofVerifier
          shipmentId={data.id}
          trackingId={data.trackingId}
          status={latestEvent.status}
          timestamp={latestEvent.timestamp}
          dedupeKey={latestEvent.dedupeKey}
          leafHash={latestEvent.leafHash}
          merkleRoot={latestEvent.batch?.merkleRoot}
          txHash={latestEvent.batch?.txHash}
        />
      )}

      {/* Delivery Milestone Timeline */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Delivery History
        </h3>
        <TrackingTimeline events={data.trackingEvents || []} />
      </div>
    </div>
  );
}
