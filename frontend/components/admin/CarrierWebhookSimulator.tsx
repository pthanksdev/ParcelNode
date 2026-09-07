"use client";

import { useState } from 'react';
import { Send, Terminal } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface CarrierWebhookSimulatorProps {
  onSuccess: () => void;
}

export function CarrierWebhookSimulator({ onSuccess }: CarrierWebhookSimulatorProps) {
  const [carrier, setCarrier] = useState('FASTSHIP');
  const [trackingId, setTrackingId] = useState('FS-984210');
  const [status, setStatus] = useState('IN_TRANSIT');
  const [location, setLocation] = useState('Oakland Logistics Hub');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRunWebhookTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchApi('/api/admin/carriers/test-webhook', {
        method: 'POST',
        body: JSON.stringify({
          carrier,
          trackingId,
          status,
          location,
        }),
      });
      setResult(res);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Webhook test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400 shrink-0" />
            Simulate Carrier Inbound Webhook
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Generates a live HMAC-SHA256 signature (`x-carrier-signature`) and pushes telemetry events to the Redis ingestion queue.
          </p>
        </div>

        <form onSubmit={handleRunWebhookTest} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Carrier Provider</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="FASTSHIP">FastShip Express (FASTSHIP)</option>
              <option value="ECODELIVER">EcoDeliver Freight (ECODELIVER)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tracking ID</label>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Event Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="PICKED_UP">PICKED_UP</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hub / Facility Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Simulating Dispatch...' : 'Dispatch Webhook Event'}
          </button>
        </form>
      </div>

      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-base sm:text-lg text-slate-100 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400 shrink-0" />
          HMAC Verification Response
        </h3>

        {result ? (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
              <span className="font-bold">{result.verificationStatus}</span>
              <span>{result.latencyMs}ms</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Generated HMAC-SHA256 Signature Header:</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 break-all">
                {result.generatedHmacSignature}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Ingested Webhook Payload:</span>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs">
            Fill out form and click "Dispatch Webhook Event" to test live HMAC verification.
          </div>
        )}
      </div>
    </div>
  );
}
