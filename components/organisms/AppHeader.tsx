'use client';

import React from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Button } from '@/components/atoms/Button';
import { Scan, Plus, Search, WalletCards } from 'lucide-react';
import { motion } from 'framer-motion';

export const AppHeader: React.FC = () => {
  const {
    setScannerOpen,
    setAddTransactionOpen,
    searchQuery,
    setSearchQuery,
    transactions,
  } = useFinanceStore();

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-all">
      {/* Brand & Mobile Title */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.05 }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0"
        >
          <WalletCards size={22} />
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Etang</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              v1.0 UI
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">Ngatur duit, teu kudu lieur.</p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center max-w-sm w-full relative">
        <Search size={16} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari transaksi, merchant, atau catatan..."
          className="w-full bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-all"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="emerald"
          size="sm"
          icon={<Scan size={16} />}
          onClick={() => setScannerOpen(true)}
          className="shadow-md shadow-emerald-500/20"
        >
          <span className="hidden sm:inline">Smart Receipt Scanner</span>
          <span className="sm:hidden">Scan</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => setAddTransactionOpen(true)}
        >
          <span className="hidden sm:inline">Catat Transaksi</span>
          <span className="sm:hidden">Catat</span>
        </Button>
      </div>
    </header>
  );
};
