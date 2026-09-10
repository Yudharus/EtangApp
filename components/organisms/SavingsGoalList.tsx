'use client';

import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { GoalCard } from '@/components/molecules/GoalCard';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import { Input } from '@/components/atoms/Input';
import { RupiahInput } from '@/components/atoms/RupiahInput';
import { DatePicker } from '@/components/atoms/DatePicker';
import { formatRupiah } from '@/utils/cn';
import { Plus, Target, PiggyBank, AlertCircle } from 'lucide-react';

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
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [goalNotes, setGoalNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Deposit amount state
  const [depositAmount, setDepositAmount] = useState('500000');

  const selectedGoal = savingsGoals.find((g) => g.id === selectedGoalIdForDeposit);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = goalTitle.trim();
    if (!trimmed) {
      setErrorMessage('Judul target tabungan tidak boleh kosong.');
      return;
    }

    // Check duplicate (case-insensitive)
    const isDuplicate = savingsGoals.some(
      (g) => g.title.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage(`Target tabungan "${trimmed}" sudah terdaftar. Silakan gunakan judul lain.`);
      return;
    }

    addSavingsGoal({
      title: trimmed,
      targetAmount: Number(targetAmount),
      targetDate: targetDate,
      color: 'emerald',
      icon: 'Target',
      notes: goalNotes,
    });

    setGoalTitle('');
    setGoalNotes('');
    setErrorMessage('');
    setAddGoalOpen(false);
  };

  const handleCloseGoalModal = () => {
    setGoalTitle('');
    setGoalNotes('');
    setErrorMessage('');
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
        onClose={handleCloseGoalModal}
        title="Buat Target Tabungan Baru"
        subtitle="Tetapkan nama target, nominal yang dicapai, dan estimasi waktu"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <AlertCircle size={16} className="shrink-0" />
              <span className="text-xs font-medium">{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Judul Target Tabungan</label>
            <Input
              value={goalTitle}
              onChange={(e) => {
                setGoalTitle(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Contoh: Beli Laptop Baru, Dana Umroh, Rumah Pertama"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <RupiahInput
                label="Nominal Target"
                value={targetAmount}
                onChange={setTargetAmount}
                placeholder="Contoh: 15.000.000"
                required
                quickChips={[1000000, 5000000, 10000000, 25000000]}
              />
            </div>
            <div>
              <DatePicker
                label="Target Tanggal Selesai"
                value={targetDate}
                onChange={setTargetDate}
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
            <Button variant="outline" size="md" type="button" onClick={handleCloseGoalModal}>
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
            <RupiahInput
              label="Nominal Setoran"
              value={depositAmount}
              onChange={setDepositAmount}
              placeholder="Contoh: 500.000"
              required
              quickChips={[50000, 100000, 500000, 1000000]}
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
