'use client';

import React from 'react';
import { Card } from '@/components/atoms/Card';
import { Progress } from '@/components/atoms/Progress';
import { Button } from '@/components/atoms/Button';
import { DynamicIcon } from '@/components/atoms/DynamicIcon';
import { formatRupiah } from '@/utils/cn';
import { SavingsGoal } from '@/types/finance';
import { Plus, Trash2 } from 'lucide-react';

export interface GoalCardProps {
  goal: SavingsGoal;
  onDepositClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onDepositClick,
  onDeleteClick,
}) => {
  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

  return (
    <Card hoverEffect className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <DynamicIcon name={goal.icon} size={22} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{goal.title}</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Target: {goal.targetDate}</p>
            </div>
          </div>
          <button
            onClick={() => onDeleteClick(goal.id)}
            className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {goal.notes && (
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
            {goal.notes}
          </p>
        )}

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {formatRupiah(goal.currentAmount)}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {percentage}% dari {formatRupiah(goal.targetAmount)}
            </span>
          </div>
          <Progress value={percentage} color="emerald" size="md" />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          Sisa {formatRupiah(Math.max(0, goal.targetAmount - goal.currentAmount))}
        </span>
        <Button
          variant="emerald"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => onDepositClick(goal.id)}
        >
          Tambah Tabungan
        </Button>
      </div>
    </Card>
  );
};
