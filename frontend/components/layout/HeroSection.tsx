"use client";

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Layers, Lock } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative pt-12 pb-16 text-center space-y-8 max-w-4xl mx-auto">
      {/* Glow highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-400">
        <ShieldCheck className="w-4 h-4 text-blue-400" />
        Zero-Knowledge Merkle Proof Shipping Engine
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
        Enterprise Logistics Governance With <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">On-Chain Proofs</span>
      </h1>

      <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Aggregate thousands of carrier tracking events into binary Merkle trees. Anchor immutable cryptographic attestations to Ethereum Sepolia with 98%+ gas reduction.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Link
          href="/dashboard"
          className="px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2"
        >
          Launch Merchant Console
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/playground"
          className="px-6 py-3.5 rounded-xl font-semibold text-sm glass-panel border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-600 transition-all flex items-center gap-2"
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          Cryptographic Sandbox
        </Link>
      </div>

      {/* Feature Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <Zap className="w-6 h-6 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-sm">98.5% Gas Savings</h3>
          <p className="text-xs text-slate-400">Binary batch aggregation drops per-event execution costs from $15 to $0.05.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <Layers className="w-6 h-6 text-blue-400" />
          <h3 className="font-bold text-slate-100 text-sm">Multi-Carrier Adapters</h3>
          <p className="text-xs text-slate-400">Pre-built REST/Webhook adapters for FastShip, EcoDeliver, and custom logistics fleets.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h3 className="font-bold text-slate-100 text-sm">Cryptographic Committer</h3>
          <p className="text-xs text-slate-400">ECDSA threshold signatures ensure no single party can alter tracking telemetry.</p>
        </div>
      </div>
    </div>
  );
}
