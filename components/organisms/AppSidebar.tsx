'use client';

import React from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import {
  LayoutDashboard,
  ReceiptText,
  TrendingUp,
  FolderOpen,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AppSidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useFinanceStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: ReceiptText },
    { id: 'income', label: 'Pemasukan', icon: TrendingUp },
    { id: 'categories', label: 'Kategori Anggaran', icon: FolderOpen },
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
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
      </div>

      {/* Footer Info */}
      <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>Etang Personal Finance</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>
    </aside>
  );
};
