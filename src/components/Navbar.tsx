'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, HelpCircle, LayoutGrid, Sparkles } from 'lucide-react';
import { Suspense } from 'react';

function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-2">
      <Link
        href="/"
        className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
          pathname === '/'
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Entregables Empresa</span>
      </Link>

      <Link
        href="/ayuda"
        className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
          pathname === '/ayuda'
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <HelpCircle className="w-4 h-4" />
        <span>Ayuda e Instrucciones</span>
      </Link>
    </nav>
  );
}

export default function Navbar() {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                VisuaLink
              </span>
              <span className="text-xs text-blue-400 block -mt-1 font-medium">
                Gestión &amp; Entrega de Productos
              </span>
            </div>
          </Link>

          <Suspense fallback={<div className="h-8 w-32 bg-slate-800 rounded-lg animate-pulse" />}>
            <NavLinks />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
