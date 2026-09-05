'use client';

import React from 'react';
import { Card } from '@/components/atoms/Card';
import { DynamicIcon } from '@/components/atoms/DynamicIcon';
import { formatRupiah } from '@/utils/cn';
import { motion } from 'framer-motion';

export interface StatCardProps {
  title: string;
  amount: number;
  iconName: string;
  trend?: string;
  trendUp?: boolean;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  iconName,
  trend,
  trendUp = true,
  color = 'emerald',
  subtitle,
}) => {
  const iconBgStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <Card hoverEffect className="relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <motion.h4
            key={amount}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1 tracking-tight"
          >
            {formatRupiah(amount)}
          </motion.h4>
        </div>
        <div className={`p-3 rounded-2xl border ${iconBgStyles[color]} transition-transform group-hover:scale-110 duration-200`}>
          <DynamicIcon name={iconName} size={22} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {trend && (
          <span className={`inline-flex items-center font-semibold ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
        {subtitle && <span className="text-zinc-400 dark:text-zinc-500">{subtitle}</span>}
      </div>
    </Card>
  );
};
