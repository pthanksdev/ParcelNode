"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, CheckCircle2, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { ExplorerLink } from '@/components/web3/ExplorerLink';
import { MerkleTreeVisualizer } from '@/components/web3/MerkleTreeVisualizer';

export default function BatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push('/login');
      return;
    }
    loadBatches();
  }, [router]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/api/web3/batches');
      setBatches(data);
    } catch (err) {
      console.error('Failed loading web3 batches:', err);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Layers className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400 shrink-0" />
            Merkle Batch Audit Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Inspect accumulated tracking event roots committed to Ethereum Sepolia</p>
        </div>

        <button
          onClick={loadBatches}
          className="p-2.5 rounded-xl glass-panel text-slate-300 hover:text-white border border-slate-800 min-h-[44px] flex items-center justify-center self-end sm:self-auto"
          title="Refresh Batches"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Selected Batch Structural Inspector */}
      {selectedBatch && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Viewing Inspection for Batch ID: {selectedBatch.id}</span>
            <button
              onClick={() => setSelectedBatch(null)}
              className="text-blue-400 hover:text-white font-semibold min-h-[44px] px-2 flex items-center"
            >
              Close Inspector
            </button>
          </div>
          <MerkleTreeVisualizer
            merkleRoot={selectedBatch.merkleRoot}
            txHash={selectedBatch.txHash}
            eventCount={selectedBatch.eventCount}
          />
        </div>
      )}

      {/* Batches Table / Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
          <p>Fetching on-chain Merkle batches from database...</p>
        </div>
      ) : batches.length > 0 ? (
        <>
          {/* Mobile Card Layout for screens < md */}
          <div className="block md:hidden space-y-3">
            {batches.map((batch) => (
              <div key={batch.id} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-400 text-sm">{batch.id}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-slate-400">Merkle Root:</div>
                  <div className="font-mono text-emerald-300 break-all bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[11px]">
                    {batch.merkleRoot || 'Pending accumulation...'}
                  </div>
                  <div className="text-slate-300 font-medium pt-1">
                    Bundled: <span className="text-white font-semibold">{batch.eventCount} Events</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  {batch.txHash ? (
                    <ExplorerLink hash={batch.txHash} type="tx" />
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">In Queue</span>
                  )}

                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all min-h-[36px]"
                  >
                    Inspect Tree
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table for screens >= md */}
          <div className="hidden md:block glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Batch ID</th>
                    <th className="px-6 py-4 font-semibold">Merkle Root</th>
                    <th className="px-6 py-4 font-semibold">Bundled Events</th>
                    <th className="px-6 py-4 font-semibold">Attestation</th>
                    <th className="px-6 py-4 font-semibold">EVM Tx Hash</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-indigo-400">
                        {batch.id}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-emerald-300">
                        {batch.merkleRoot ? `${batch.merkleRoot.substring(0, 16)}...` : 'Pending...'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {batch.eventCount} Events
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Single-Committer Verified
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {batch.txHash ? (
                          <ExplorerLink hash={batch.txHash} type="tx" />
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">In Queue</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedBatch(batch)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all min-h-[36px]"
                        >
                          Inspect Tree
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-panel p-6 sm:p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <Layers className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="font-bold text-slate-100 text-base">No Merkle Batches Accumulated Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tracking events are automatically accumulated into binary Merkle trees once batch volume thresholds are triggered.
          </p>
        </div>
      )}
    </div>
  );
}
