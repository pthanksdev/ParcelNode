"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, ShieldCheck, Calculator, Settings, LogOut, Terminal, ExternalLink } from 'lucide-react';
import { clearAuthSession } from '@/lib/auth';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  user?: any;
}

export function MobileNavDrawer({ isOpen, onClose, pathname, user }: MobileNavDrawerProps) {
  const links = [
    { label: 'Shipments', href: '/dashboard', icon: Package },
    { label: 'Merkle Batches', href: '/batches', icon: ShieldCheck },
    { label: 'Rate Quoter', href: '/rates', icon: Calculator },
    { label: 'Dev Playground', href: '/playground', icon: Terminal },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    links.unshift({ label: 'Admin Console', href: '/admin', icon: ShieldCheck });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col p-6 space-y-6 overflow-y-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-lg text-white">ParcelNode</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {user && (
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <p className="text-xs font-semibold text-slate-200">{user.name}</p>
              <p className="text-[11px] text-slate-400">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Role: {user.role || 'MERCHANT'}
              </span>
            </div>
          )}

          <nav className="flex-1 space-y-2">
            {links.map((link, i) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <a
              href="http://localhost:3001/api/docs"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white min-h-[44px]"
            >
              Swagger API Specs <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => {
                clearAuthSession();
                onClose();
                window.location.href = '/login';
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
