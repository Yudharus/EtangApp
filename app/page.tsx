'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import {
  WalletCards,
  Scan,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  PieChart,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Etang Icon" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">Etang</span>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wide">Ngatur duit, teu kudu lieur.</p>
          </div>
        </div>

        <Link href="/app">
          <Button variant="emerald" size="md" icon={<ArrowRight size={16} />}>
            Buka Aplikasi Web
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center relative z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold"
        >
          <Sparkles size={16} /> Client-Side OCR Smart Receipt Scanner Inside
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight leading-tight"
        >
          Kelola Keuangan Pribadi Tanpa Ribet dengan{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Etang
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Catat pengeluaran harian, pemasukan, target tabungan, dan scan struk fisik otomatis dengan teknologi Tesseract.js langsung di browser Anda.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link href="/app">
            <Button variant="emerald" size="lg" icon={<Scan size={20} className="text-zinc-950" />}>
              Coba Smart Receipt Scanner Now
            </Button>
          </Link>
          <Link href="/app">
            <Button variant="outline" size="lg" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
              Lihat Demo UI Workspace
            </Button>
          </Link>
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left"
        >
          <Card className="bg-zinc-900/80 border-zinc-800 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Scan size={24} />
            </div>
            <h3 className="text-base font-bold text-white">Smart Receipt Scanner</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ekstrak nama merchant, tanggal, total belanja, dan daftar barang secara otomatis dari struk belanja fisik Anda.
            </p>
          </Card>

          <Card className="bg-zinc-900/80 border-zinc-800 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Lock size={24} />
            </div>
            <h3 className="text-base font-bold text-white">100% Privacy-Focused</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gambar struk diproses di perangkat lokal via WebAssembly Web Worker tanpa dikirim ke server luar mana pun.
            </p>
          </Card>

          <Card className="bg-zinc-900/80 border-zinc-800 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <PieChart size={24} />
            </div>
            <h3 className="text-base font-bold text-white">Visual Financial Analytics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Pantau tren keuangan bulanan, distribusi pengeluaran per kategori, serta perkembangan target tabungan impian Anda.
            </p>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 max-w-7xl mx-auto px-6 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 Etang • Smart Personal Money Tracker & Receipt Scanner. All rights reserved.</p>
      </footer>
    </div>
  );
}
