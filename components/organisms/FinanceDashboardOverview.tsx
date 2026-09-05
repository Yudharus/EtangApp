'use client';

import React from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { formatRupiah } from '@/utils/cn';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ArrowRight, Scan, Plus, TrendingDown, Wallet, PiggyBank, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const FinanceDashboardOverview: React.FC = () => {
  const {
    transactions,
    savingsGoals,
    setActiveTab,
    setScannerOpen,
    setAddTransactionOpen,
  } = useFinanceStore();

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSavings = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const netBalance = totalIncome - totalExpense;

  // Monthly trend mock chart data
  const monthlyTrendData = [
    { month: 'Apr', Pemasukan: 12000000, Pengeluaran: 4500000 },
    { month: 'Mei', Pemasukan: 13500000, Pengeluaran: 5200000 },
    { month: 'Jun', Pemasukan: 14000000, Pengeluaran: 4800000 },
    { month: 'Jul', Pemasukan: 15500000, Pengeluaran: 6100000 },
    { month: 'Agu', Pemasukan: 18700000, Pengeluaran: 5900000 },
    { month: 'Sep', Pemasukan: totalIncome, Pengeluaran: totalExpense },
  ];

  // Category chart distribution
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  const categoryPieData = Object.keys(categoryTotals).map((cat, idx) => ({
    name: cat,
    value: categoryTotals[cat],
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Saldo Bersih"
          amount={netBalance}
          iconName="Wallet"
          color="emerald"
          trend="+12.5%"
          trendUp={true}
          subtitle="Bulan ini"
        />
        <StatCard
          title="Total Pemasukan"
          amount={totalIncome}
          iconName="TrendingUp"
          color="blue"
          trend="+8.2%"
          trendUp={true}
          subtitle="Bulan ini"
        />
        <StatCard
          title="Total Pengeluaran"
          amount={totalExpense}
          iconName="TrendingDown"
          color="rose"
          trend="-3.1%"
          trendUp={false}
          subtitle="Bulan ini"
        />
        <StatCard
          title="Total Tabungan & Deposito"
          amount={totalSavings}
          iconName="PiggyBank"
          color="purple"
          subtitle="3 Target Aktif"
        />
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending & Income Trend Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Tren Keuangan 6 Bulan Terakhir</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Perbandingan pemasukan vs pengeluaran bulanan</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Pemasukan
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Pengeluaran
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Rp${val / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value || 0))]}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="Pemasukan" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut Chart */}
        <Card className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Distribusi Pengeluaran</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Berdasarkan kategori pengeluaran</p>

            <div className="h-44 w-full my-2 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(Number(value || 0))]}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center pointer-events-none text-center">
                <span className="text-[10px] text-zinc-400 font-medium">Total</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatRupiah(totalExpense)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            {categoryPieData.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatRupiah(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lower Section: Recent Transactions & Scanner Promo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Transaksi Terakhir</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Catatan aktivitas keuangan terbaru Anda</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
              Lihat Semua <ArrowRight size={14} />
            </Button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {transactions.slice(0, 5).map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      tx.type === 'expense'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                        : tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400'
                    }`}
                  >
                    {tx.type === 'expense' ? (
                      <TrendingDown size={18} />
                    ) : tx.type === 'income' ? (
                      <ArrowUpRight size={18} />
                    ) : (
                      <PiggyBank size={18} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{tx.title}</h4>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-2">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{tx.category}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold ${
                      tx.type === 'expense'
                        ? 'text-rose-500'
                        : tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-cyan-600 dark:text-cyan-400'
                    }`}
                  >
                    {tx.type === 'expense' ? '-' : '+'}{formatRupiah(tx.amount)}
                  </span>
                  {tx.notes && <p className="text-[10px] text-zinc-400 truncate max-w-[150px]">{tx.notes}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Quick Action & Goal Progress Widget */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 space-y-4 shadow-xl shadow-emerald-900/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <Scan size={24} />
              </div>
              <div>
                <h4 className="font-bold text-base">Client Smart OCR Scanner</h4>
                <p className="text-xs text-emerald-100">Scan struk fisik & isi otomatis detail transaksi!</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold"
              onClick={() => setScannerOpen(true)}
            >
              Mulai Scan Struk Now
            </Button>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Progress Target Tabungan</h4>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            {savingsGoals.slice(0, 2).map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="space-y-1.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{goal.title}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
};
