"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ShieldCheck, Key, Truck, Globe, Save } from 'lucide-react';
import { getStoredUser } from '@/lib/auth';
import { ApiKeyManager } from '@/components/settings/ApiKeyManager';
import { CarrierConfigCard } from '@/components/settings/CarrierConfigCard';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState('https://api.acme-logistics.com/webhooks/parcelnode');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push('/login');
      return;
    }
    setUser(stored);
  }, [router]);

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-2 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
          <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 shrink-0" />
          Merchant Settings & Integrations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure API credentials, multi-carrier adapters, and webhook endpoints</p>
      </div>

      {/* API Key Management */}
      <ApiKeyManager />

      {/* Carrier Adapter Configuration Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-400" />
          Carrier Adapter Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CarrierConfigCard
            carrierCode="FASTSHIP"
            carrierName="FastShip Express"
            defaultServiceName="2-Day Air Priority"
            isEnabled={true}
          />
          <CarrierConfigCard
            carrierCode="ECODELIVER"
            carrierName="EcoDeliver Freight"
            defaultServiceName="Ground Eco Transit"
            isEnabled={true}
          />
        </div>
      </div>

      {/* Carrier Rate Markup & Fee Rules */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Carrier Rate Markup & Handling Fees
        </h3>
        <p className="text-xs text-slate-400">
          Configure custom profit margins or flat handling surcharges automatically applied to live carrier quotes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Percentage Markup (%)</label>
            <input
              type="number"
              defaultValue={5}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Flat Handling Fee ($)</label>
            <input
              type="number"
              defaultValue={2.50}
              step="0.50"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Webhook Endpoint Destination */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Outbound Webhook Notifications</h3>
            <p className="text-xs text-slate-400">Receive real-time event updates and on-chain Merkle commitment confirmations</p>
          </div>
        </div>

        <form onSubmit={handleSaveWebhook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Webhook Target URL</label>
            <input
              type="url"
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400 font-mono">HMAC Secret: <code className="text-blue-400">whsec_8841920...</code></span>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all min-h-[44px]"
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? 'Settings Saved!' : 'Save Webhook URL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
