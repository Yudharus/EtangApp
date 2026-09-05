'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { TransactionType } from '@/types/finance';
import { Plus } from 'lucide-react';

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTransactionOpen,
    setAddTransactionOpen,
    addTransaction,
    categories,
  } = useFinanceStore();

  const [title, setTitle] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Makanan & Minuman');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addTransaction({
      title,
      merchant: merchant || undefined,
      amount: Number(amount),
      type,
      category,
      date,
      notes: notes || undefined,
    });

    // Reset & close
    setTitle('');
    setMerchant('');
    setAmount('');
    setNotes('');
    setAddTransactionOpen(false);
  };

  return (
    <Modal
      isOpen={isAddTransactionOpen}
      onClose={() => setAddTransactionOpen(false)}
      title="Catat Transaksi Baru Manual"
      subtitle="Rekam pengeluaran, pemasukan, atau setoran deposito"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Type Selector Tabs */}
        <div>
          <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Tipe Transaksi</label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            {(['expense', 'income', 'deposit'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : t === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-cyan-500 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Deposito'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Judul / Deskripsi Transaksi</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Makan Siang Nasi Padang, Pembayaran Listrik"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Merchant / Pihak Terkait</label>
            <Input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="Contoh: Rumah Makan Sederhana, PLN"
            />
          </div>
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Nominal Transaksi (IDR)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="45000"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Pilih Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories
                .filter((c) => c.type === type)
                .map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Tanggal Transaksi</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Catatan Opsional</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan catatan singkat..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="outline" size="md" type="button" onClick={() => setAddTransactionOpen(false)}>
            Batal
          </Button>
          <Button variant="emerald" size="md" type="submit" icon={<Plus size={16} />}>
            Simpan Transaksi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
