'use client';

import React from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Button } from '@/components/atoms/Button';
import { Scan, Plus, WalletCards, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthModal } from '@/components/organisms/AuthModal';

export const AppHeader: React.FC = () => {
  const {
    setScannerOpen,
    setAddTransactionOpen,
    user,
    authLoading,
    setAuthModalOpen,
    signOut,
  } = useFinanceStore();

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-all">
        {/* Brand & Mobile Title */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 6, scale: 1.05 }}
            className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/25 shrink-0 flex items-center justify-center bg-zinc-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Etang Icon" className="w-full h-full object-cover" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Etang</h1>

            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">Ngatur duit, teu kudu lieur.</p>
          </div>
        </div>

        {/* Center Spacer (Search bar removed per user request) */}
        <div className="flex-1" />

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {user && (
            <>
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
            </>
          )}

          {/* User Auth Section */}
          {!authLoading && (
            <div className={user ? 'pl-2 border-l border-zinc-200 dark:border-zinc-800 flex items-center' : 'flex items-center'}>
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {(user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Keluar (Sign Out)"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<LogIn size={15} />}
                  onClick={() => setAuthModalOpen(true)}
                  className="font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  <span className="hidden sm:inline">Masuk</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal />
    </>
  );
};
