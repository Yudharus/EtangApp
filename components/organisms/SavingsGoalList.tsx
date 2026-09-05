'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { GoalCard } from '@/components/molecules/GoalCard';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import { Input } from '@/components/atoms/Input';
import { formatRupiah } from '@/utils/cn';
import { Plus, Target, PiggyBank } from 'lucide-react';

export const SavingsGoalList: React.FC = () => {
  const {
    savingsGoals,
    deleteSavingsGoal,
    addSavingsGoal,
    addDepositToGoal,
    isAddGoalOpen,
    setAddGoalOpen,
    isDepositModalOpen,
    selectedGoalIdForDeposit,
    openDepositModal,
    closeDepositModal,
  } = useFinanceStore();

  // Form states for new Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('10000000');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [goalNotes, setGoalNotes] = useState('');

  // Deposit amount state
  const [depositAmount, setDepositAmount] = useState('500000');

  const selectedGoal = savingsGoals.find((g) => g.id === selectedGoalIdForDeposit);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    addSavingsGoal({
      title: goalTitle,
      targetAmount: Number(targetAmount),
      targetDate: targetDate,
      color: 'emerald',
      icon: 'Target',
      notes: goalNotes,
    });

    setGoalTitle('');
    setAddGoalOpen(false);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalIdForDeposit || !depositAmount) return;

    addDepositToGoal(selectedGoalIdForDeposit, Number(depositAmount));
    closeDepositModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Target Tabungan & Impian</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Rencanakan alokasi dana darurat, investasi, & target keuangan Anda</p>
        </div>
        <Button
          variant="emerald"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => setAddGoalOpen(true)}
        >
          Target Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onDepositClick={openDepositModal}
            onDeleteClick={deleteSavingsGoal}
          />
        ))}
      </div>

      {/* Add New Goal Modal */}
      <Modal
        isOpen={isAddGoalOpen}
        onClose={() => setAddGoalOpen(false)}
        title="Buat Target Tabungan Baru"
        subtitle="Tetapkan nama target, nominal yang dicapai, dan estimasi waktu"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Judul Target Tabungan</label>
            <Input
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Contoh: Beli Laptop Baru, Dana Umroh, Rumah Pertama"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Nominal Target (IDR)</label>
              <Input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Target Tanggal Selesai</label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Catatan Tambahan</label>
            <Input
              value={goalNotes}
              onChange={(e) => setGoalNotes(e.target.value)}
              placeholder="Catatan motivasi atau alokasi harian..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" size="md" type="button" onClick={() => setAddGoalOpen(false)}>
              Batal
            </Button>
            <Button variant="emerald" size="md" type="submit" icon={<Target size={16} />}>
              Simpan Target Tabungan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deposit to Goal Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={closeDepositModal}
        title={`Tambah Setoran ke ${selectedGoal?.title || ''}`}
        subtitle="Nominal yang disetor akan otomatis memperbarui progress tabungan"
      >
        <form onSubmit={handleSubmitDeposit} className="space-y-4 text-xs">
          {selectedGoal && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <p className="text-zinc-500">Terkumpul Saat Ini:</p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {formatRupiah(selectedGoal.currentAmount)} / {formatRupiah(selectedGoal.targetAmount)}
              </p>
            </div>
          )}

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Nominal Setoran (IDR)</label>
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="500000"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="outline" size="md" type="button" onClick={closeDepositModal}>
              Batal
            </Button>
            <Button variant="emerald" size="md" type="submit" icon={<PiggyBank size={16} />}>
              Konfirmasi Setoran
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
