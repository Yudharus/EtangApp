'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { RupiahInput } from '@/components/atoms/RupiahInput';
import { CustomSelect } from '@/components/atoms/CustomSelect';
import { DatePicker } from '@/components/atoms/DatePicker';
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
    if (!title.trim() || !amount || Number(amount) <= 0) return;

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

  const categoryOptions = categories
    .filter((c) => c.type === type)
    .map((c) => ({
      value: c.name,
      label: c.name,
      icon: c.icon,
      badge: c.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
    }));

  return (
    <Modal
      isOpen={isAddTransactionOpen}
      onClose={() => setAddTransactionOpen(false)}
      title="Catat Transaksi Baru Manual"
      subtitle="Rekam pengeluaran atau pemasukan baru ke dalam sistem"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Type Selector Tabs */}
        <div>
          <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Tipe Transaksi</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  const firstMatch = categories.find((c) => c.type === t);
                  if (firstMatch) setCategory(firstMatch.name);
                }}
                className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-emerald-500 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
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
            <RupiahInput
              label="Nominal Transaksi"
              value={amount}
              onChange={setAmount}
              placeholder="Contoh: 45.000"
              required
              quickChips={[10000, 20000, 50000, 100000]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <CustomSelect
              label="Pilih Kategori"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              placeholder="Pilih kategori..."
            />
          </div>
          <div>
            <DatePicker
              label="Tanggal Transaksi"
              value={date}
              onChange={setDate}
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
