'use client';

import React from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import {
  LayoutDashboard,
  ReceiptText,
  TrendingUp,
  PiggyBank,
  FolderOpen,
  Target,
  Scan,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AppSidebar: React.FC = () => {
  const { activeTab, setActiveTab, setScannerOpen } = useFinanceStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: ReceiptText },
    { id: 'income', label: 'Pemasukan', icon: TrendingUp },
    { id: 'deposits', label: 'Deposito & Setoran', icon: PiggyBank },
    { id: 'categories', label: 'Kategori Kustom', icon: FolderOpen },
    { id: 'goals', label: 'Target Tabungan', icon: Target },
  ] as const;

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 p-4 flex flex-col justify-between shrink-0 hidden lg:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${isActive
                      ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveBg"
                      className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl border border-emerald-500/20"
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    />
                  )}
                  <Icon size={18} className={`shrink-0 z-10 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  <span className="z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Smart OCR Feature Spotlight Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/90 via-teal-900 to-zinc-900 text-white relative overflow-hidden shadow-lg border border-emerald-700/50">
          <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
            <Scan size={100} />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/60 inline-block mb-2">
            Client OCR Engine
          </span>
          <h4 className="text-sm font-bold leading-tight">Smart Receipt Scanner</h4>
          <p className="text-[11px] text-emerald-100/70 mt-1">
            Ekstrak merchant, tanggal, & total belanjaan otomatis tanpa kirim gambar ke server.
          </p>
          <button
            onClick={() => setScannerOpen(true)}
            className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <Scan size={14} />
            Coba Scan Struk
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>Etang Personal Finance</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>
    </aside>
  );
};
