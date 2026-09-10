'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Modal } from '@/components/atoms/Modal';
import { CustomSelect } from '@/components/atoms/CustomSelect';
import { formatRupiah } from '@/utils/cn';
import { Transaction } from '@/types/finance';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Receipt,
  ArrowUpRight,
  TrendingDown,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TransactionTableProps {
  filterType?: 'all' | 'expense' | 'income';
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ filterType = 'all' }) => {
  const {
    transactions,
    deleteTransaction,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    setAddTransactionOpen,
    setScannerOpen,
  } = useFinanceStore();

  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'expense' | 'income'>(filterType);

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    // Type filter
    if (activeTabFilter !== 'all' && t.type !== activeTabFilter) return false;
    // Category filter
    if (selectedCategoryFilter !== 'all' && t.category !== selectedCategoryFilter) return false;
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchMerchant = t.merchant?.toLowerCase().includes(q);
      const matchCategory = t.category.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      return matchTitle || matchMerchant || matchCategory || matchNotes;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters & Actions Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs Filter */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            {(['all', 'expense', 'income'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTabFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTabFilter === tab
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab === 'all'
                  ? 'Semua'
                  : tab === 'expense'
                  ? 'Pengeluaran'
                  : 'Pemasukan'}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Receipt size={14} />}
              onClick={() => setScannerOpen(true)}
            >
              Scan Struk
            </Button>
            <Button
              variant="emerald"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setAddTransactionOpen(true)}
            >
              Tambah Transaksi
            </Button>
          </div>
        </div>

        {/* Category & Search Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi..."
              className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <CustomSelect
              options={[
                { value: 'all', label: 'Semua Kategori' },
                ...categories.map((c) => ({
                  value: c.name,
                  label: c.name,
                  icon: c.icon,
                  badge: c.type === 'expense' ? 'Expense' : 'Income',
                })),
              ]}
              value={selectedCategoryFilter}
              onChange={setSelectedCategoryFilter}
              placeholder="Filter Kategori"
            />
          </div>
        </div>
      </Card>

      {/* Transactions Table Container */}
      <Card className="p-0 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-zinc-400">
              <Receipt size={24} />
            </div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Tidak ada transaksi ditemukan</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau filter kategori untuk melihat riwayat transaksi Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-400 font-semibold border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Transaksi & Merchant</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4 text-right">Jumlah (IDR)</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredTransactions.map((tx) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            tx.type === 'expense'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                          }`}
                        >
                          {tx.type === 'expense' ? (
                            <TrendingDown size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <span>{tx.title}</span>
                            {tx.items && tx.items.length > 0 && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
                                {tx.items.length} items OCR
                              </span>
                            )}
                          </div>
                          {tx.merchant && <p className="text-[11px] text-zinc-400">{tx.merchant}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={tx.type === 'expense' ? 'rose' : 'emerald'}
                      >
                        {tx.category}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-500 font-medium">
                      {(() => {
                        if (!tx.date) return '-';
                        const parts = tx.date.split(' ')[0].split('-');
                        if (parts.length === 3) {
                          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                          return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                        }
                        return tx.date;
                      })()}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold">
                      <span
                        className={
                          tx.type === 'expense'
                            ? 'text-rose-500'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {tx.type === 'expense' ? '-' : '+'}{formatRupiah(tx.amount)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {tx.items && tx.items.length > 0 && (
                          <button
                            onClick={() => setSelectedTxForDetail(tx)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Lihat Detail Rincian Struk"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail OCR Items Modal */}
      <Modal
        isOpen={selectedTxForDetail !== null}
        onClose={() => setSelectedTxForDetail(null)}
        title={selectedTxForDetail?.title || 'Detail Transaksi Struk'}
        subtitle={`Diolah via Smart Receipt Scanner (${selectedTxForDetail?.date})`}
      >
        {selectedTxForDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 flex justify-between items-center">
              <div>
                <p className="text-zinc-400">Merchant</p>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{selectedTxForDetail.merchant}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-400">Total Transaksi</p>
                <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{formatRupiah(selectedTxForDetail.amount)}</p>
              </div>
            </div>

            {selectedTxForDetail.items && (
              <div>
                <h5 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Rincian Barang yang Dibeli:</h5>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  {selectedTxForDetail.items.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between bg-white dark:bg-zinc-900">
                      <div>
                        <p className="font-medium text-zinc-800 dark:text-zinc-200">{item.name}</p>
                        <p className="text-[10px] text-zinc-400">{item.qty}x @ {formatRupiah(item.price)}</p>
                      </div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatRupiah(item.qty * item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTxForDetail.notes && (
              <p className="text-zinc-500 italic bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                Catatan: {selectedTxForDetail.notes}
              </p>
            )}

            <Button variant="primary" size="md" className="w-full mt-2" onClick={() => setSelectedTxForDetail(null)}>
              Tutup Detail
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
