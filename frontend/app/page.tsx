"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Terminal,
  Lock,
  Cpu,
  FileCode,
  Check,
  Search,
  ArrowRight,
} from 'lucide-react';
import { HeroSection } from '@/components/layout/HeroSection';
import { RoiCalculatorSection } from '@/components/layout/RoiCalculatorSection';

export default function LandingPage() {
  const router = useRouter();
  const [trackingIdInput, setTrackingIdInput] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingIdInput.trim()) {
      router.push(`/track/${encodeURIComponent(trackingIdInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Marketing Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ParcelNode
              </span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 hidden xs:inline-block">
                v2.0 Enterprise
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#roi-calculator" className="hover:text-white transition-colors">Gas Calculator</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/playground" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> Dev Sandbox
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-2 sm:px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all whitespace-nowrap min-h-[40px] flex items-center"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Component */}
      <section className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 overflow-hidden border-b border-slate-800/60">
        <HeroSection />

        {/* Quick Tracking Search Bar */}
        <div className="max-w-xl mx-auto pt-6 px-4">
          <form onSubmit={handleTrackSubmit} className="relative">
            <div className="glass-panel p-2 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-2 shadow-2xl">
              <div className="flex items-center w-full">
                <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter Tracking ID (e.g. FS-984210)..."
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none px-2 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap min-h-[44px]"
              >
                Track Package
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
          <p className="text-[11px] text-slate-500 mt-2 text-center">Try sample tracking ID: <code className="text-blue-400">FS-984210</code></p>
        </div>
      </section>

      {/* Interactive ROI & Gas Savings Calculator Section */}
      <section id="roi-calculator" className="py-12 sm:py-20 border-b border-slate-800/60 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <RoiCalculatorSection />
        </div>
      </section>

      {/* Architecture Showcase Section */}
      <section id="architecture" className="py-12 sm:py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">Cryptographic Integrity</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">End-to-End Enterprise Architecture</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Built with NestJS API Gateway, BullMQ async batch queues, OpenZeppelin UUPS contracts, and Next.js portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-100 text-lg">HMAC Carrier Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inbound carrier webhooks are protected with HMAC-SHA256 signatures (`x-carrier-signature`), ensuring source verification and preventing spoofing attacks.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-100 text-lg">ECDSA Committer Signatures</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Merkle roots require ECDSA cryptographic attestations from system committer keys before triggering on-chain smart contract commits.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <FileCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-100 text-lg">Compliance Audit Exporter</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click CSV/JSON compliance reports containing event timestamps, leaf hashes, transaction hashes, and on-chain roots ready for regulatory audit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" className="py-12 sm:py-20 border-b border-slate-800/60 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">Transparent Plans</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Enterprise Pricing & SLA</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Select the tier that matches your shipment volume and compliance requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Developer Free */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-100">Developer Sandbox</h3>
                <div className="text-3xl font-extrabold text-white">$0 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <p className="text-xs text-slate-400">Ideal for testing webhooks and building custom carrier integrations.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 2,500 events / month</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Sepolia Testnet Ledger</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Interactive Cryptographic Playground</li>
                </ul>
              </div>
              <Link href="/login" className="w-full py-3 rounded-xl font-semibold text-xs text-center bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 min-h-[44px] flex items-center justify-center">
                Get Started Free
              </Link>
            </div>

            {/* Growth Tier */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/40 space-y-6 flex flex-col justify-between relative glow-blue">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-100">Scale Merchant</h3>
                <div className="text-3xl font-extrabold text-white">$299 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <p className="text-xs text-slate-400">For fast-growing e-commerce merchants requiring automated proof.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 100,000 events / month</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Redis Rate Caching & OpenAPI Docs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Webhook HMAC Verification</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> CSV/JSON Compliance Exporters</li>
                </ul>
              </div>
              <Link href="/login" className="w-full py-3 rounded-xl font-semibold text-xs text-center bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 min-h-[44px] flex items-center justify-center">
                Start 14-Day Trial
              </Link>
            </div>

            {/* Enterprise Custom */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-100">Enterprise Dedicated</h3>
                <div className="text-3xl font-extrabold text-white">Custom</div>
                <p className="text-xs text-slate-400">Dedicated node infrastructure, SLA guarantees, and custom chain deployment.</p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited Event Scale</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Dedicated Committer Nodes</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Custom EVM Mainnet / L2 Deployment</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 99.99% Uptime SLA Guarantee</li>
                </ul>
              </div>
              <Link href="/login" className="w-full py-3 rounded-xl font-semibold text-xs text-center bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 min-h-[44px] flex items-center justify-center">
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* High-Contrast Final Call-to-Action Section */}
      <section className="py-12 sm:py-20 bg-slate-900/90 text-center border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Ready to Secure Your Logistics Telemetry?</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Join enterprise merchants leveraging cryptographic Merkle trees for immutable shipment proof.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2 max-w-xs sm:max-w-none mx-auto">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl font-bold text-xs bg-white text-slate-950 hover:bg-slate-200 shadow-xl transition-all min-h-[44px] flex items-center justify-center"
            >
              Open Merchant Portal
            </Link>
            <Link
              href="/playground"
              className="px-6 py-3.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all min-h-[44px] flex items-center justify-center"
            >
              Open Dev Playground
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
