'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  align?: 'left' | 'right';
  placement?: 'bottom' | 'top';
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Pilih Tanggal',
  error,
  className = '',
  align = 'right',
  placement = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or default to current date
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sync view month/year when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const toIsoDate = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleSelectDay = (e: React.MouseEvent, day: number) => {
    e.preventDefault();
    e.stopPropagation();
    const iso = toIsoDate(viewYear, viewMonth, day);
    onChange(iso);
    setIsOpen(false);
  };

  // Quick Presets
  const setToday = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const today = new Date();
    const iso = toIsoDate(today.getFullYear(), today.getMonth(), today.getDate());
    onChange(iso);
    setIsOpen(false);
  };

  const setYesterday = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const iso = toIsoDate(d.getFullYear(), d.getMonth(), d.getDate());
    onChange(iso);
    setIsOpen(false);
  };

  const setLast7Days = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const iso = toIsoDate(d.getFullYear(), d.getMonth(), d.getDate());
    onChange(iso);
    setIsOpen(false);
  };

  // Calculate calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getDate() === day &&
      now.getMonth() === viewMonth &&
      now.getFullYear() === viewYear
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const iso = toIsoDate(viewYear, viewMonth, day);
    return value === iso;
  };

  return (
    <div className={cn('relative w-full space-y-1.5', className)} ref={containerRef}>
      {label && (
        <label className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs block">
          {label}
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 transition-all shadow-xs outline-none',
          isOpen ? 'ring-2 ring-emerald-500/30 border-emerald-500 shadow-lg shadow-emerald-500/10' : 'hover:border-zinc-300 dark:hover:border-zinc-700',
          error ? 'border-rose-500 ring-rose-500/20' : ''
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className={value ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400'}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>
        {value && (
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
            {value}
          </span>
        )}
      </button>

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

      {/* Popover Calendar */}
      {isOpen && (
        <div
          ref={popoverRef}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'absolute z-50 w-72 sm:w-80 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-black/20 animate-in fade-in zoom-in-95 duration-150',
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-1.5',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {/* Quick Presets */}
          <div className="flex items-center justify-between gap-1.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={setToday}
              className="flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Hari ini
            </button>
            <button
              type="button"
              onClick={setYesterday}
              className="flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Kemarin
            </button>
            <button
              type="button"
              onClick={setLast7Days}
              className="flex-1 py-1 px-2 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              -7 Hari
            </button>
          </div>

          {/* Month/Year Navigation Header */}
          <div className="flex items-center justify-between py-2 px-1">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Bulan Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES.map((d, idx) => (
              <div
                key={d}
                className={cn(
                  'text-[10px] font-bold py-1 select-none',
                  idx === 0 ? 'text-rose-500' : 'text-zinc-400 dark:text-zinc-500'
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {paddingArray.map((p) => (
              <div key={`pad-${p}`} className="h-8 w-8" />
            ))}

            {daysArray.map((day) => {
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={(e) => handleSelectDay(e, day)}
                  className={cn(
                    'h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-medium transition-all duration-150 relative select-none',
                    selected
                      ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/30 scale-105 z-10'
                      : today
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
