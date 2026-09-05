'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Modal } from '@/components/atoms/Modal';
import { Input } from '@/components/atoms/Input';
import { Progress } from '@/components/atoms/Progress';
import { DynamicIcon } from '@/components/atoms/DynamicIcon';
import { formatRupiah } from '@/utils/cn';
import { Plus, Trash2, FolderPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export const CategoryGrid: React.FC = () => {
  const {
    categories,
    transactions,
    addCategory,
    deleteCategory,
    isAddCategoryOpen,
    setAddCategoryOpen,
  } = useFinanceStore();

  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'expense' | 'income' | 'deposit'>('expense');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('2000000');
  const [categoryIcon, setCategoryIcon] = useState('ShoppingBag');
  const [categoryColor, setCategoryColor] = useState('emerald');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    addCategory({
      name: categoryName,
      type: categoryType,
      monthlyLimit: categoryType === 'expense' ? Number(monthlyLimit) : undefined,
      icon: categoryIcon,
      color: categoryColor,
    });

    setCategoryName('');
    setAddCategoryOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Kategori Anggaran Kustom</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Atur & pantau batas pengeluaran bulanan sesuai kebutuhan</p>
        </div>
        <Button
          variant="emerald"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => setAddCategoryOpen(true)}
        >
          Kategori Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          // Calculate spent for this category
          const spent = transactions
            .filter((t) => t.category === cat.name && t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

          const limit = cat.monthlyLimit || 0;
          const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

          return (
            <Card key={cat.id} hoverEffect className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                      <DynamicIcon name={cat.icon} size={22} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{cat.name}</h4>
                      <Badge
                        variant={
                          cat.type === 'expense' ? 'rose' : cat.type === 'income' ? 'emerald' : 'cyan'
                        }
                        size="sm"
                      >
                        {cat.type}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {cat.type === 'expense' && limit > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Terpakai: {formatRupiah(spent)}</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        Batas: {formatRupiah(limit)}
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      color={percentage > 85 ? 'rose' : percentage > 60 ? 'amber' : 'emerald'}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        title="Buat Kategori Kustom Baru"
        subtitle="Tambahkan kategori khusus untuk pengelompokan anggaran"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Nama Kategori</label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Contoh: Langganan SaaS, Fitness, Peliharaan"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Tipe Kategori</label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value as 'expense' | 'income' | 'deposit')}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
            >
              <option value="expense">Pengeluaran (Expense)</option>
              <option value="income">Pemasukan (Income)</option>
              <option value="deposit">Setoran Deposito</option>
            </select>
          </div>

          {categoryType === 'expense' && (
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Batas Batas Pengeluaran Bulanan (IDR)</label>
              <Input
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="2000000"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" size="md" type="button" onClick={() => setAddCategoryOpen(false)}>
              Batal
            </Button>
            <Button variant="emerald" size="md" type="submit" icon={<FolderPlus size={16} />}>
              Simpan Kategori
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
