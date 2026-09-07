"use client";

import Link from 'next/link';
import { Package, ShieldCheck, Terminal, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function Footer() {
  const [copied, setCopied] = useState(false);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-xl mt-12 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand & Mission */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-100 tracking-tight text-base">ParcelNode</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enterprise multi-carrier logistics aggregation engine backed by UUPS upgradeable Ethereum Merkle audit ledger.
          </p>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            All Committer Nodes Active
          </div>
        </div>

        {/* Platform Links */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Platform</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Merchant Dashboard</Link>
            </li>
            <li>
              <Link href="/batches" className="hover:text-blue-400 transition-colors">Merkle Batches Explorer</Link>
            </li>
            <li>
              <Link href="/rates" className="hover:text-blue-400 transition-colors">Rate Comparison Quoter</Link>
            </li>
            <li>
              <Link href="/playground" className="hover:text-blue-400 transition-colors">Developer Cryptographic Sandbox</Link>
            </li>
          </ul>
        </div>

        {/* Developer & API */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Developers</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <a href="http://localhost:3001/api/docs" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-blue-400 transition-colors">
                Swagger OpenAPI Specs <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <Link href="/settings" className="hover:text-blue-400 transition-colors">API Credential Rotation</Link>
            </li>
            <li>
              <a href="http://localhost:3001/metrics" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-blue-400 transition-colors">
                Prometheus System Telemetry <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

        {/* Smart Contract Audit Ledger */}
        <div className="space-y-2.5 md:col-span-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Audit Smart Contract</h4>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                DeliveryLedgerV2
              </span>
              <button
                onClick={handleCopyContract}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                title="Copy Address"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="font-mono text-[10px] text-slate-300 break-all select-all">
              {contractAddress}
            </p>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 ParcelNode Enterprise. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">SOC2 Type II Certified</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">Ethereum Mainnet & Sepolia Compatible</span>
        </div>
      </div>
    </footer>
  );
}
