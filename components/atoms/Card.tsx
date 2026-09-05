'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface CardProps extends HTMLMotionProps<'div'> {
  hoverEffect?: boolean;
  variant?: 'default' | 'glass' | 'bordered';
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-5 transition-all duration-200';

  const variants = {
    default: 'bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm shadow-zinc-200/50 dark:shadow-none',
    glass: 'bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-lg shadow-zinc-900/5',
    bordered: 'bg-transparent border border-zinc-200 dark:border-zinc-800',
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={cn(baseStyles, variants[variant], hoverEffect && 'hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
