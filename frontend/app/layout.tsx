import './globals.css';
import { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'ParcelNode — Enterprise Multi-Carrier Shipping & Web3 Audit Ledger',
  description: 'Open-source multi-carrier shipping API aggregator, rate quoter, and blockchain audit ledger bridging Web2 SaaS with Ethereum immutability.',
  keywords: ['shipping api', 'logistics', 'multi-carrier', 'merkle tree audit', 'blockchain logistics', 'nestJS', 'nextJS'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
