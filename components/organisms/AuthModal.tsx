'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { supabase } from '@/utils/supabase/client';
import { Lock, Mail, UserPlus, LogIn, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useFinanceStore();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    resetForm();
    setAuthModalOpen(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMessage('Berhasil masuk! Memuat data Anda...');
        setTimeout(() => handleClose(), 800);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        setSuccessMessage('Pendaftaran berhasil! Akun Anda telah siap.');
        setTimeout(() => handleClose(), 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const demoEmail = 'demo@etang.com';
    const demoPassword = 'EtangDemo2026!';

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) throw error;

      setSuccessMessage('Masuk sebagai Akun Demo berhasil! Memuat data...');
      setTimeout(() => handleClose(), 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk akun demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={handleClose}
      title={tab === 'signin' ? 'Masuk ke Etang' : 'Buat Akun Etang Baru'}
      subtitle="Sinkronisasi data pengeluaran dan pemasukan Anda secara real-time"
    >
      <div className="space-y-4 text-xs">
        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'signin'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <LogIn size={14} /> Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'signup'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <UserPlus size={14} /> Daftar Akun
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span className="text-xs">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2.5">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="text-xs">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Nama Lengkap</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Yudha Rusmana"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Kata Sandi</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="pl-9"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button
            variant="emerald"
            size="md"
            type="submit"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Memproses...' : tab === 'signin' ? 'Masuk Sekarang' : 'Daftar Akun Baru'}
          </Button>
        </form>

        {/* Quick Instant Demo Login */}
        <div className="relative pt-2">
          <div className="absolute inset-0 flex items-center pt-2">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400 font-semibold">
              atau coba langsung
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="md"
          type="button"
          disabled={loading}
          onClick={handleQuickDemoLogin}
          icon={<Sparkles size={14} className="text-amber-400" />}
          className="w-full border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500/50"
        >
          Masuk Instan dengan Akun Demo
        </Button>
      </div>
    </Modal>
  );
};
