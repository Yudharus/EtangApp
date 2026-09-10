'use client';

import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { formatRupiah } from '@/utils/cn';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ArrowRight,
  Scan,
  Plus,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Target,
  Receipt,
  BarChart2,
  Activity,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FinanceDashboardOverview: React.FC = () => {
  const {
    transactions,
    savingsGoals,
    setActiveTab,
    setScannerOpen,
    setAddTransactionOpen,
    user,
    setAuthModalOpen,
  } = useFinanceStore();

  const [trendChartType, setTrendChartType] = useState<'area' | 'bar'>('area');
  const [trendMetric, setTrendMetric] = useState<'all' | 'income' | 'expense'>('all');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // 1. Calculations from REAL database transactions
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );

  const totalSavings = useMemo(
    () => savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0),
    [savingsGoals]
  );

  const netBalance = totalIncome - totalExpense;

  // Dynamic monthly trend computed from real transactions across the last 6 calendar months
  const monthlyTrendData = useMemo(() => {
    const months: Array<{ month: string; fullMonth: string; monthKey: string; Pemasukan: number; Pengeluaran: number }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('id-ID', { month: 'short' });
      const fullMonth = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const yearStr = d.getFullYear();
      const monthKey = `${yearStr}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        month: monthName,
        fullMonth,
        monthKey,
        Pemasukan: 0,
        Pengeluaran: 0,
      });
    }

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const txMonthKey = tx.date.slice(0, 7);
      const monthEntry = months.find((m) => m.monthKey === txMonthKey);
      if (monthEntry) {
        if (tx.type === 'income') {
          monthEntry.Pemasukan += tx.amount;
        } else if (tx.type === 'expense') {
          monthEntry.Pengeluaran += tx.amount;
        }
      }
    });

    return months;
  }, [transactions]);

  // Current month stats vs previous month for real comparison
  const { currentMonthIncome, currentMonthExpense, incomeTrend, expenseTrend } = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const curKey = `${curYear}-${curMonth}`;

    const prevDate = new Date(curYear, now.getMonth() - 1, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const curInc = transactions
      .filter((t) => t.type === 'income' && t.date?.startsWith(curKey))
      .reduce((acc, t) => acc + t.amount, 0);

    const curExp = transactions
      .filter((t) => t.type === 'expense' && t.date?.startsWith(curKey))
      .reduce((acc, t) => acc + t.amount, 0);

    const prevInc = transactions
      .filter((t) => t.type === 'income' && t.date?.startsWith(prevKey))
      .reduce((acc, t) => acc + t.amount, 0);

    const prevExp = transactions
      .filter((t) => t.type === 'expense' && t.date?.startsWith(prevKey))
      .reduce((acc, t) => acc + t.amount, 0);

    let incTr: { text: string; up: boolean } | undefined = undefined;
    if (prevInc > 0) {
      const diff = Math.round(((curInc - prevInc) / prevInc) * 100);
      incTr = { text: `${diff >= 0 ? '+' : ''}${diff}% vs bln lalu`, up: diff >= 0 };
    }

    let expTr: { text: string; up: boolean } | undefined = undefined;
    if (prevExp > 0) {
      const diff = Math.round(((curExp - prevExp) / prevExp) * 100);
      expTr = { text: `${diff >= 0 ? '+' : ''}${diff}% vs bln lalu`, up: diff <= 0 };
    }

    return {
      currentMonthIncome: curInc,
      currentMonthExpense: curExp,
      incomeTrend: incTr,
      expenseTrend: expTr,
    };
  }, [transactions]);

  // Category chart distribution from real expenses with percentages and sorted order
  const categoryPieData = useMemo(() => {
    const totals: Record<string, number> = {};
    let sumExpense = 0;
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
        sumExpense += t.amount;
      });

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E', '#84CC16'];

    return Object.keys(totals)
      .map((cat, idx) => ({
        name: cat,
        value: totals[cat],
        color: COLORS[idx % COLORS.length],
        percent: sumExpense > 0 ? Math.round((totals[cat] / sumExpense) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Format YYYY-MM-DD to Indonesian human-readable date
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const cleanStr = dateStr.split(' ')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dateStr;
  };

  // Compact currency formatter for chart axis (e.g. Rp50rb, Rp1.5jt, Rp10jt, Rp1M)
  const formatCompactRupiah = (val: number): string => {
    if (!val || val === 0) return 'Rp0';
    if (val >= 1_000_000_000) {
      const b = val / 1_000_000_000;
      return `Rp${b % 1 === 0 ? b : b.toFixed(1)}M`;
    }
    if (val >= 1_000_000) {
      const m = val / 1_000_000;
      return `Rp${m % 1 === 0 ? m : m.toFixed(1)}jt`;
    }
    if (val >= 1_000) {
      const k = val / 1_000;
      return `Rp${k % 1 === 0 ? k : k.toFixed(0)}rb`;
    }
    return `Rp${val}`;
  };

  return (
    <div className="space-y-6">
      {/* Banner if not logged in */}
      {!user && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold shrink-0">
              <Scan size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Simpan Data Anda di Cloud Supabase</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Masuk atau daftar untuk menyinkronkan transaksi di seluruh perangkat.</p>
            </div>
          </div>
          <Button variant="emerald" size="sm" onClick={() => setAuthModalOpen(true)}>
            Masuk / Daftar Akun
          </Button>
        </div>
      )}

      {/* Top Stat Cards Grid (Real Calculated Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Saldo Bersih"
          amount={netBalance}
          iconName="Wallet"
          color="emerald"
          subtitle={netBalance >= 0 ? 'Surplus Finansial' : 'Defisit Pengeluaran'}
        />
        <StatCard
          title="Total Pemasukan"
          amount={totalIncome}
          iconName="TrendingUp"
          color="blue"
          trend={incomeTrend?.text}
          trendUp={incomeTrend?.up ?? true}
          subtitle={currentMonthIncome > 0 ? `Bulan ini: ${formatRupiah(currentMonthIncome)}` : `${transactions.filter(t => t.type === 'income').length} Transaksi`}
        />
        <StatCard
          title="Total Pengeluaran"
          amount={totalExpense}
          iconName="TrendingDown"
          color="rose"
          trend={expenseTrend?.text}
          trendUp={expenseTrend?.up ?? false}
          subtitle={currentMonthExpense > 0 ? `Bulan ini: ${formatRupiah(currentMonthExpense)}` : `${transactions.filter(t => t.type === 'expense').length} Transaksi`}
        />
        <StatCard
          title="Total Target Tabungan"
          amount={totalSavings}
          iconName="Target"
          color="purple"
          subtitle={`${savingsGoals.length} Target Aktif`}
        />
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending & Income Trend Chart from Real Data */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Tren Keuangan 6 Bulan Terakhir</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                  Interaktif
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Analisis perbandingan arus kas masuk vs keluar</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Metric filter pills */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/90 p-1 rounded-xl text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setTrendMetric('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    trendMetric === 'all'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric('income')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    trendMetric === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-emerald-500'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMetric('expense')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    trendMetric === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-rose-500'
                  }`}
                >
                  Pengeluaran
                </button>
              </div>

              {/* Chart type switch: Area vs Bar */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/90 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTrendChartType('area')}
                  title="Tampilan Area Kurva"
                  className={`p-1.5 rounded-lg transition-all ${
                    trendChartType === 'area'
                      ? 'bg-white dark:bg-zinc-900 text-emerald-500 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  <Activity size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setTrendChartType('bar')}
                  title="Tampilan Batang / Bar"
                  className={`p-1.5 rounded-lg transition-all ${
                    trendChartType === 'bar'
                      ? 'bg-white dark:bg-zinc-900 text-emerald-500 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  <BarChart2 size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Legend Indicator */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-4">
              {(trendMetric === 'all' || trendMetric === 'income') && (
                <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
                  Pemasukan
                </span>
              )}
              {(trendMetric === 'all' || trendMetric === 'expense') && (
                <span className="flex items-center gap-1.5 font-medium text-rose-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20"></span>
                  Pengeluaran
                </span>
              )}
            </div>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Arahkan kursor ke grafik untuk rincian
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {trendChartType === 'area' ? (
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 6 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    fontSize={12}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={{ stroke: '#3f3f46', strokeWidth: 1 }}
                    dy={6}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={formatCompactRupiah}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(16, 185, 129, 0.4)', strokeDasharray: '4 4' }}
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        const inc = payload.find((p: any) => p.dataKey === 'Pemasukan')?.value ?? 0;
                        const exp = payload.find((p: any) => p.dataKey === 'Pengeluaran')?.value ?? 0;
                        const net = inc - exp;
                        const fullTitle = payload[0]?.payload?.fullMonth || label;
                        return (
                          <div className="p-3.5 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/80 shadow-2xl text-xs space-y-2 min-w-[200px]">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                              <span className="font-bold text-zinc-100">{fullTitle}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  net >= 0
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {net >= 0 ? 'Surplus' : 'Defisit'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {(trendMetric === 'all' || trendMetric === 'income') && (
                                <div className="flex items-center justify-between text-emerald-400 font-medium">
                                  <span>Pemasukan:</span>
                                  <span className="font-bold">{formatRupiah(inc)}</span>
                                </div>
                              )}
                              {(trendMetric === 'all' || trendMetric === 'expense') && (
                                <div className="flex items-center justify-between text-rose-400 font-medium">
                                  <span>Pengeluaran:</span>
                                  <span className="font-bold">{formatRupiah(exp)}</span>
                                </div>
                              )}
                              {trendMetric === 'all' && (
                                <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-zinc-300 font-semibold">
                                  <span>Arus Kas:</span>
                                  <span className={net >= 0 ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                                    {net >= 0 ? '+' : ''}{formatRupiah(net)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {(trendMetric === 'all' || trendMetric === 'income') && (
                    <Area
                      type="monotone"
                      dataKey="Pemasukan"
                      stroke="#10B981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      isAnimationActive={true}
                      animationDuration={900}
                    />
                  )}
                  {(trendMetric === 'all' || trendMetric === 'expense') && (
                    <Area
                      type="monotone"
                      dataKey="Pengeluaran"
                      stroke="#F43F5E"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                      isAnimationActive={true}
                      animationDuration={900}
                    />
                  )}
                </AreaChart>
              ) : (
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 6 }}>
                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    fontSize={12}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={{ stroke: '#3f3f46', strokeWidth: 1 }}
                    dy={6}
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={formatCompactRupiah}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        const inc = payload.find((p: any) => p.dataKey === 'Pemasukan')?.value ?? 0;
                        const exp = payload.find((p: any) => p.dataKey === 'Pengeluaran')?.value ?? 0;
                        const net = inc - exp;
                        const fullTitle = payload[0]?.payload?.fullMonth || label;
                        return (
                          <div className="p-3.5 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/80 shadow-2xl text-xs space-y-2 min-w-[200px]">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                              <span className="font-bold text-zinc-100">{fullTitle}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  net >= 0
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {net >= 0 ? 'Surplus' : 'Defisit'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {(trendMetric === 'all' || trendMetric === 'income') && (
                                <div className="flex items-center justify-between text-emerald-400 font-medium">
                                  <span>Pemasukan:</span>
                                  <span className="font-bold">{formatRupiah(inc)}</span>
                                </div>
                              )}
                              {(trendMetric === 'all' || trendMetric === 'expense') && (
                                <div className="flex items-center justify-between text-rose-400 font-medium">
                                  <span>Pengeluaran:</span>
                                  <span className="font-bold">{formatRupiah(exp)}</span>
                                </div>
                              )}
                              {trendMetric === 'all' && (
                                <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-zinc-300 font-semibold">
                                  <span>Arus Kas:</span>
                                  <span className={net >= 0 ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                                    {net >= 0 ? '+' : ''}{formatRupiah(net)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {(trendMetric === 'all' || trendMetric === 'income') && (
                    <Bar
                      dataKey="Pemasukan"
                      fill="#10B981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  )}
                  {(trendMetric === 'all' || trendMetric === 'expense') && (
                    <Bar
                      dataKey="Pengeluaran"
                      fill="#F43F5E"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut Chart with Dynamic Active Slice & Interactive Legend */}
        <Card className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Distribusi Pengeluaran</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Komposisi pengeluaran riil</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold">
                {categoryPieData.length} Kategori
              </span>
            </div>

            <div className="h-44 w-full my-2 flex items-center justify-center relative">
              {categoryPieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-zinc-400 text-xs text-center px-4">
                  <Receipt size={28} className="mb-2 opacity-50" />
                  <span>Belum ada data pengeluaran</span>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={76}
                        paddingAngle={3}
                        dataKey="value"
                        isAnimationActive={true}
                        animationDuration={900}
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                        onMouseLeave={() => setActivePieIndex(null)}
                      >
                        {categoryPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={activePieIndex === index ? '#ffffff' : 'transparent'}
                            strokeWidth={activePieIndex === index ? 2 : 0}
                            style={{
                              outline: 'none',
                              cursor: 'pointer',
                              filter:
                                activePieIndex === index
                                  ? 'drop-shadow(0px 0px 8px rgba(16, 185, 129, 0.4))'
                                  : 'none',
                            }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Interactive Dynamic Center Indicator */}
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center px-2 max-w-[125px]">
                    <AnimatePresence mode="wait">
                      {activePieIndex !== null && categoryPieData[activePieIndex] ? (
                        <motion.div
                          key={categoryPieData[activePieIndex].name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[105px]">
                            {categoryPieData[activePieIndex].name}
                          </span>
                          <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                            {formatRupiah(categoryPieData[activePieIndex].value)}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded-full mt-0.5"
                            style={{
                              backgroundColor: `${categoryPieData[activePieIndex].color}20`,
                              color: categoryPieData[activePieIndex].color,
                            }}
                          >
                            {categoryPieData[activePieIndex].percent}%
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="total"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="flex flex-col items-center"
                        >
                          <span className="text-[10px] text-zinc-400 font-medium">Total</span>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {formatRupiah(totalExpense)}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Interactive Category Legend with Hover Highlight and Mini Progress Bar */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            {categoryPieData.slice(0, 3).map((item, idx) => {
              const isHovered = activePieIndex === idx;
              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setActivePieIndex(idx)}
                  onMouseLeave={() => setActivePieIndex(null)}
                  className={`p-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
                    isHovered
                      ? 'bg-zinc-100 dark:bg-zinc-800/90 scale-[1.02]'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                        style={{
                          backgroundColor: item.color,
                          transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                        }}
                      />
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[120px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {item.percent}%
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                        {formatRupiah(item.value)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                        opacity: isHovered ? 1 : 0.8,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Lower Section: Recent Transactions & Relocated Smart OCR Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List with Real Formatted Dates */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Transaksi Terakhir</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Catatan aktivitas riil dari database Supabase</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
              Lihat Semua <ArrowRight size={14} />
            </Button>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-zinc-400">
                <Receipt size={22} />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Belum ada transaksi yang tercatat.</p>
              <div className="flex items-center justify-center gap-2">
                <Button variant="emerald" size="sm" icon={<Plus size={14} />} onClick={() => setAddTransactionOpen(true)}>
                  Catat Transaksi Pertama
                </Button>
              </div>
            </div>
          ) : (
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
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                      }`}
                    >
                      {tx.type === 'expense' ? (
                        <TrendingDown size={18} />
                      ) : (
                        <ArrowUpRight size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{tx.title}</h4>
                      <p className="text-[11px] text-zinc-400 flex items-center gap-2">
                        <span>{formatDisplayDate(tx.date)}</span>
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
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : '+'}{formatRupiah(tx.amount)}
                    </span>
                    {tx.notes && <p className="text-[10px] text-zinc-400 truncate max-w-[150px]">{tx.notes}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Relocated Smart Receipt Scanner Spotlight & Goal Progress Widget */}
        <div className="space-y-4">
          {/* Smart Receipt Scanner Spotlight Card (Moved from Sidebar) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/95 via-teal-950 to-zinc-900 text-white relative overflow-hidden shadow-xl border border-emerald-700/50">
            <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
              <Scan size={130} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-700/60 inline-block mb-2.5">
              Client OCR Engine
            </span>
            <h4 className="text-base font-bold leading-tight">Smart Receipt Scanner</h4>
            <p className="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">
              Ekstrak merchant, tanggal, & total belanjaan otomatis tanpa kirim gambar ke server.
            </p>
            <button
              onClick={() => setScannerOpen(true)}
              className="mt-4 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              <Scan size={15} />
              Coba Scan Struk
            </button>
          </div>

          {/* Goal Progress Widget */}
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
            {savingsGoals.length === 0 ? (
              <p className="text-xs text-zinc-400 py-2">Belum ada target tabungan aktif.</p>
            ) : (
              savingsGoals.slice(0, 2).map((goal) => {
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
              })
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
