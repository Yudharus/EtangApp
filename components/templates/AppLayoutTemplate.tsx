'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { AppHeader } from '@/components/organisms/AppHeader';
import { AppSidebar } from '@/components/organisms/AppSidebar';
import { ReceiptScannerModal } from '@/components/organisms/ReceiptScannerModal';
import { AddTransactionModal } from '@/components/organisms/AddTransactionModal';
import { AuthModal } from '@/components/organisms/AuthModal';
import { Button } from '@/components/atoms/Button';
import {
  LayoutDashboard,
  ReceiptText,
  TrendingUp,
  FolderOpen,
  Target,
  Scan,
  Lock,
  LogIn,
  ArrowLeft,
  WalletCards,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AppLayoutTemplateProps {
  children: React.ReactNode;
}

export const AppLayoutTemplate: React.FC<AppLayoutTemplateProps> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    setScannerOpen,
    initAuth,
    user,
    authLoading,
    setAuthModalOpen,
  } = useFinanceStore();

  useEffect(() => {
    const cleanup = initAuth();
    return () => {
      cleanup?.();
    };
  }, [initAuth]);

  // Open AuthModal automatically when unauthenticated on /app
  useEffect(() => {
    if (!authLoading && !user) {
      setAuthModalOpen(true);
    }
  }, [authLoading, user, setAuthModalOpen]);

  // 1. Loading State while checking Supabase session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 shadow-xl shadow-emerald-500/30 mb-4"
        >
          <WalletCards size={28} />
        </motion.div>
        <p className="text-xs font-semibold text-zinc-400 animate-pulse">
          Memeriksa sesi otentikasi...
        </p>
      </div>
    );
  }

  // 2. Protected Screen: User not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
        <AppHeader />

        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-teal-500/10 blur-[120px] pointer-events-none rounded-full" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative z-10"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <Lock size={30} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                Akses Terproteksi
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 pt-1">
                Silakan Masuk Terlebih Dahulu
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Untuk mengakses dashboard keuangan, ringkasan transaksi, serta target tabungan, Anda harus terautentikasi terlebih dahulu agar data tersimpan aman di database Supabase.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="emerald"
                size="lg"
                onClick={() => setAuthModalOpen(true)}
                className="w-full shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 font-bold"
              >
                <LogIn size={16} /> Masuk / Daftar Akun
              </Button>

              <Link href="/" className="block">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Kembali ke Beranda
                </Button>
              </Link>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <p className="text-[11px] text-zinc-400">
                💡 Belum memiliki akun? Gunakan opsi <strong>Akun Demo</strong> di dalam form masuk untuk langsung menjelajah.
              </p>
            </div>
          </motion.div>
        </main>

        <AuthModal />
      </div>
    );
  }

  // 3. Authenticated Workspace
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
