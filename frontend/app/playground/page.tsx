"use client";

import { useState } from 'react';
import { Cpu, Terminal, ShieldCheck, GitCommit, Layers, RefreshCw, Copy, Check } from 'lucide-react';
import { ethers } from 'ethers';
import { MerkleTreeVisualizer } from '@/components/web3/MerkleTreeVisualizer';

export default function DeveloperPlaygroundPage() {
  // Input fields
  const [shipmentId, setShipmentId] = useState('ship-test-999');
  const [trackingId, setTrackingId] = useState('FS-881920');
  const [status, setStatus] = useState('DELIVERED');
  const [timestamp, setTimestamp] = useState(new Date().toISOString());
  const [dedupeKey, setDedupeKey] = useState('FS-881920-DELIVERED-001');

  // Custom leaves array
  const [leaves, setLeaves] = useState<string[]>([]);
  const [computedRoot, setComputedRoot] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const calculateSingleLeaf = () => {
    try {
      const leaf = ethers.solidityPackedKeccak256(
        ['string', 'string', 'string', 'string', 'string'],
        [shipmentId, trackingId, status, timestamp, dedupeKey]
      );
      if (!leaves.includes(leaf)) {
        const nextLeaves = [...leaves, leaf];
        setLeaves(nextLeaves);
        recomputeRoot(nextLeaves);
      }
    } catch (err) {
      console.error('Leaf calculation error:', err);
    }
  };

  const recomputeRoot = (leafList: string[]) => {
    if (leafList.length === 0) {
      setComputedRoot('');
      return;
    }

    let level = [...leafList];
    while (level.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        if (i + 1 < level.length) {
          const a = level[i];
          const b = level[i + 1];
          const bufA = ethers.getBytes(a);
          const bufB = ethers.getBytes(b);
          const pairHash =
            a.toLowerCase() <= b.toLowerCase()
              ? ethers.keccak256(ethers.concat([bufA, bufB]))
              : ethers.keccak256(ethers.concat([bufB, bufA]));
          nextLevel.push(pairHash);
        } else {
          nextLevel.push(level[i]);
        }
      }
      level = nextLevel;
    }
    setComputedRoot(level[0]);
  };

  const clearLeaves = () => {
    setLeaves([]);
    setComputedRoot('');
  };

  const copyRoot = async () => {
    if (!computedRoot) return;
    await navigator.clipboard.writeText(computedRoot);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-2 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
          <Terminal className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 shrink-0" />
          Developer Cryptographic Sandbox & Merkle Playground
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Interactively derive Keccak-256 event leaf hashes and construct binary Merkle trees</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payload Hash Input Controls */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            1. Event Payload Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Shipment ID</label>
              <input
                type="text"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Tracking ID</label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Event Status</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Timestamp (ISO)</label>
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Deduplication Key</label>
              <input
                type="text"
                value={dedupeKey}
                onChange={(e) => setDedupeKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={calculateSingleLeaf}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <GitCommit className="w-4 h-4" />
              Compute & Add Leaf Node
            </button>

            <button
              onClick={clearLeaves}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white min-h-[44px]"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tree Output & Computed Root */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-indigo-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              2. Accumulated Tree & Root
            </h3>
            <span className="text-xs text-indigo-400 font-semibold">{leaves.length} Leaves</span>
          </div>

          {computedRoot ? (
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/30 text-xs font-mono">
                <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Computed Merkle Root</span>
                <span className="text-emerald-400 font-bold break-all">{computedRoot}</span>

                <button
                  onClick={copyRoot}
                  className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white min-h-[36px]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied Root' : 'Copy Root'}
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">Leaf Hashes:</span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {leaves.map((l, i) => (
                    <div key={i} className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 truncate">
                      <span className="text-blue-400">#{i + 1}: </span> {l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Click "Compute & Add Leaf Node" to build a Merkle tree.
            </div>
          )}
        </div>
      </div>

      {/* Visual Inspector if leaves exist */}
      {computedRoot && (
        <MerkleTreeVisualizer
          merkleRoot={computedRoot}
          eventCount={leaves.length}
          sampleLeaves={leaves}
        />
      )}
    </div>
  );
}
