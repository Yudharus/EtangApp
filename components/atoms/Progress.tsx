'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface ProgressProps {
  value: number; // 0 to 100
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'sky';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  color = 'emerald',
  size = 'md',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colors = {
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-500',
    sky: 'bg-gradient-to-r from-sky-500 to-cyan-500',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden', sizes[size], className)}>
      <motion.div
        className={cn('h-full rounded-full', colors[color] || colors.emerald)}
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};
