'use client';

import React from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { AppHeader } from '@/components/organisms/AppHeader';
import { AppSidebar } from '@/components/organisms/AppSidebar';
import { ReceiptScannerModal } from '@/components/organisms/ReceiptScannerModal';
import { AddTransactionModal } from '@/components/organisms/AddTransactionModal';
import {
  LayoutDashboard,
  ReceiptText,
  TrendingUp,
  PiggyBank,
  FolderOpen,
  Target,
  Scan,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AppLayoutTemplateProps {
  children: React.ReactNode;
}

export const AppLayoutTemplate: React.FC<AppLayoutTemplateProps> = ({ children }) => {
  const { activeTab, setActiveTab, setScannerOpen } = useFinanceStore();

  const mobileNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: ReceiptText },
    { id: 'income', label: 'Pemasukan', icon: TrendingUp },
    { id: 'goals', label: 'Target', icon: Target },
    { id: 'categories', label: 'Kategori', icon: FolderOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* Top Fixed Header */}
      <AppHeader />

      {/* Main Content Layout Frame */}
      <div className="flex flex-1 relative max-w-[1600px] w-full mx-auto">
        {/* Desktop Navigation Sidebar */}
        <AppSidebar />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-8 pb-24 lg:pb-8 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Floating Action Button for Scanner */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setScannerOpen(true)}
        className="lg:hidden fixed right-5 bottom-20 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/40 flex items-center justify-center border-2 border-white dark:border-zinc-900"
        aria-label="Scan Struk"
      >
        <Scan size={24} />
      </motion.button>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-2 py-2 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Application Modals */}
      <ReceiptScannerModal />
      <AddTransactionModal />
    </div>
  );
};
