"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ShieldCheck, LogOut, Calculator, Settings, Terminal, ExternalLink, Menu } from 'lucide-react';
import { getStoredUser, clearAuthSession } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  const navLinks = [
    { label: 'Shipments', href: '/dashboard', icon: Package },
    { label: 'Merkle Batches', href: '/batches', icon: ShieldCheck },
    { label: 'Rate Quoter', href: '/rates', icon: Calculator },
    { label: 'Dev Playground', href: '/playground', icon: Terminal },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.unshift({ label: 'Admin Console', href: '/admin', icon: ShieldCheck });
  }

  return (
    <>
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 sm:px-6 py-3.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">ParcelNode</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden xs:inline-block">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Multi-Carrier Shipping & Web3 Audit Ledger</p>
            </div>
          </Link>

          {user && (
            <>
              {/* Desktop Nav Links */}
              <nav className="hidden xl:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                <a
                  href="http://localhost:3001/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  API Docs
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-200">{user.name}</p>
                  <p className="text-[11px] text-slate-400">{user.email}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="hidden sm:p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="xl:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Open Mobile Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNavDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} user={user} />
    </>
  );
}
