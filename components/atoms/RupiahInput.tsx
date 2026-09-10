'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface RupiahInputProps {
  label?: string;
  value: number | string;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  showQuickChips?: boolean;
  quickChips?: number[];
  id?: string;
}

export const RupiahInput: React.FC<RupiahInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '0',
  className,
  required = false,
  disabled = false,
  showQuickChips = true,
  quickChips = [10000, 50000, 100000, 500000],
  id,
}) => {
  // Convert number to thousand dot separated string
  const formatNumberWithDots = (num: number | string): string => {
    if (num === '' || num === null || num === undefined) return '';
    const cleanNum = String(num).replace(/[^0-9]/g, '');
    if (!cleanNum) return '';
    return new Intl.NumberFormat('id-ID').format(Number(cleanNum));
  };

  const [displayValue, setDisplayValue] = useState<string>(() => formatNumberWithDots(value));

  useEffect(() => {
    setDisplayValue(formatNumberWithDots(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (!rawVal) {
      setDisplayValue('');
      onChange('');
      return;
    }
    const num = Number(rawVal);
    setDisplayValue(new Intl.NumberFormat('id-ID').format(num));
    onChange(num);
  };

  const handleAddChip = (amountToAdd: number) => {
    const current = Number(String(value).replace(/[^0-9]/g, '')) || 0;
    const nextVal = current + amountToAdd;
    setDisplayValue(new Intl.NumberFormat('id-ID').format(nextVal));
    onChange(nextVal);
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs block">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-xs font-bold text-zinc-400 dark:text-zinc-500 pointer-events-none select-none">
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            'w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-zinc-400 shadow-xs',
            className
          )}
        />
      </div>

      {showQuickChips && quickChips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {quickChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleAddChip(chip)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              +{chip >= 1000000 ? `${chip / 1000000}jt` : `${chip / 1000}rb`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
