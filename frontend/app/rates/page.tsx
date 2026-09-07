"use client";

import { useState } from 'react';
import { Calculator, Truck, Zap, Leaf, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function RatesPage() {
  const [weightKg, setWeightKg] = useState(5.0);
  const [origin, setOrigin] = useState('New York, NY 10001');
  const [destination, setDestination] = useState('Los Angeles, CA 90001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quotes, setQuotes] = useState<any[] | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Extract postal codes or default to string search
      const originMatch = origin.match(/\b\d{5}\b/);
      const destMatch = destination.match(/\b\d{5}\b/);

      const originCode = originMatch ? originMatch[0] : '10001';
      const destCode = destMatch ? destMatch[0] : '90001';

      const res = await fetchApi(`/api/rates/compare?weightKg=${weightKg}&originPostalCode=${originCode}&destPostalCode=${destCode}`);
      setQuotes(res);
    } catch (err: any) {
      setError(err.message || 'Failed retrieving live rates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-2 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
          <Calculator className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 shrink-0" />
          Multi-Carrier Rate Quoting Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Calculate live side-by-side shipping quotes across carrier adapters</p>
      </div>

      {/* Input Calculator Form */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-6">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Package Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              min="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Origin City / Postal Code</label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination City / Postal Code</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? 'Fetching Rates...' : 'Calculate Live Carrier Quotes'}
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Side-by-Side Carrier Quote Matrix */}
      {quotes && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {quotes.map((quote, idx) => (
            <div
              key={idx}
              className={`glass-panel p-6 rounded-2xl border space-y-4 relative ${
                quote.carrier === 'ECODELIVER' ? 'border-emerald-500/30 glow-emerald' : 'border-blue-500/30 glow-blue'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-slate-300" />
                  <span className="font-bold text-lg text-slate-100">{quote.carrier}</span>
                </div>
                {quote.carrier === 'ECODELIVER' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Leaf className="w-3 h-3" /> Eco Choice
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs text-slate-400">{quote.serviceName}</p>
                <div className="text-3xl font-extrabold text-white mt-1">
                  ${Number(quote.rate).toFixed(2)} <span className="text-xs font-normal text-slate-400">{quote.currency}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Est. Delivery</span>
                  <span className="font-semibold text-slate-200">{quote.estimatedDays} Business Days</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CO2 Carbon Estimate</span>
                  <span className="font-semibold text-slate-200">{quote.co2Kg || '1.5'} kg CO2</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
