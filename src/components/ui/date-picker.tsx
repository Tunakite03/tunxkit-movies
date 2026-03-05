'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';
import { vi } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ─── Constants ───────────────────────────────────────────────
// Display mask: "DD/MM/YYYY"
// digits[0..1] = day, digits[2..3] = month, digits[4..7] = year
// cursor positions for each digit slot in the 10-char display string:
//   slot: 0  1  2  3  4  5  6  7
//   pos:  0  1  3  4  6  7  8  9

const DIGIT_SLOTS: readonly number[] = [0, 1, 3, 4, 6, 7, 8, 9];
const STORE_FORMAT = 'yyyy-MM-dd';

// Map display cursor position → digit slot index
function posToSlot(pos: number): number {
   const clamped = Math.max(0, Math.min(pos, 9));
   const map: Record<number, number> = {
      0: 0,
      1: 1,
      2: 2,
      3: 2,
      4: 3,
      5: 4,
      6: 4,
      7: 5,
      8: 6,
      9: 7,
   };
   return map[clamped] ?? 7;
}

function makeEmpty(): string[] {
   return ['_', '_', '_', '_', '_', '_', '_', '_'];
}

function buildDisplay(d: string[]): string {
   return `${d[0]}${d[1]}/${d[2]}${d[3]}/${d[4]}${d[5]}${d[6]}${d[7]}`;
}

function digitsToStore(d: string[]): string {
   if (d.some((c) => c === '_')) return '';
   const s = `${d[4]}${d[5]}${d[6]}${d[7]}-${d[2]}${d[3]}-${d[0]}${d[1]}`;
   const date = parse(s, STORE_FORMAT, new Date());
   return isValid(date) ? s : '';
}

function storeToDigits(value: string): string[] {
   if (!value) return makeEmpty();
   const d = parse(value, STORE_FORMAT, new Date());
   if (!isValid(d)) return makeEmpty();
   // "ddMMyyyy" → 8 chars in the right order
   return format(d, 'ddMMyyyy').split('');
}

function clampDay(d: string[]): void {
   if (d[0] === '_' || d[1] === '_') return;
   const v = parseInt(d[0] + d[1]);
   if (v < 1) {
      d[0] = '0';
      d[1] = '1';
   } else if (v > 31) {
      d[1] = '1';
   }
}

function clampMonth(d: string[]): void {
   if (d[2] === '_' || d[3] === '_') return;
   const v = parseInt(d[2] + d[3]);
   if (v < 1) {
      d[2] = '0';
      d[3] = '1';
   } else if (v > 12) {
      d[2] = '1';
      d[3] = '2';
   }
}

// ─── Types ───────────────────────────────────────────────────

interface DatePickerProps {
   readonly value: string; // stored as yyyy-MM-dd
   readonly onChange: (value: string) => void;
   readonly disabled?: boolean;
   readonly className?: string;
}

// ─── Component ───────────────────────────────────────────────

export function DatePicker({ value, onChange, disabled = false, className }: DatePickerProps) {
   const [open, setOpen] = useState(false);
   const [digits, setDigits] = useState<string[]>(() => storeToDigits(value));
   const [lastSentValue, setLastSentValue] = useState(value);
   const [prevValue, setPrevValue] = useState(value);
   const inputRef = useRef<HTMLInputElement>(null);
   const pendingCursor = useRef<number | null>(null);

   // Sync from external value changes (form reset, etc.) using the
   // "store information from previous renders" pattern — avoids calling
   // setState inside an effect while still reacting to prop changes.
   if (prevValue !== value) {
      setPrevValue(value);
      if (value !== lastSentValue) {
         setDigits(storeToDigits(value));
      }
   }

   // Apply pending cursor position after paint to avoid cursor jump
   useLayoutEffect(() => {
      if (pendingCursor.current !== null && inputRef.current) {
         inputRef.current.setSelectionRange(pendingCursor.current, pendingCursor.current);
         pendingCursor.current = null;
      }
   });

   const selected = useMemo(() => {
      if (!value) return undefined;
      const d = parse(value, STORE_FORMAT, new Date());
      return isValid(d) ? d : undefined;
   }, [value]);

   const commit = useCallback(
      (newDigits: string[]) => {
         const v = digitsToStore(newDigits);
         setLastSentValue(v);
         onChange(v);
      },
      [onChange],
   );

   const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
         const input = inputRef.current;
         if (!input) return;

         const pos = input.selectionStart ?? 0;
         const slotIdx = posToSlot(pos);

         if (/^\d$/.test(e.key)) {
            e.preventDefault();
            const d = [...digits];
            let nextSlot = slotIdx + 1; // default: advance one slot

            if (slotIdx === 0 && parseInt(e.key) >= 4) {
               // Day first digit ≥ 4 → must be single-digit day → auto-prepend 0
               d[0] = '0';
               d[1] = e.key;
               clampDay(d);
               nextSlot = 2; // jump to month
            } else if (slotIdx === 2 && parseInt(e.key) >= 2) {
               // Month first digit ≥ 2 → auto-prepend 0
               d[2] = '0';
               d[3] = e.key;
               clampMonth(d);
               nextSlot = 4; // jump to year
            } else {
               d[slotIdx] = e.key;
               // Validate completed segments
               if (slotIdx === 1) clampDay(d);
               if (slotIdx === 3) clampMonth(d);
            }

            setDigits(d);
            commit(d);
            pendingCursor.current =
               nextSlot < DIGIT_SLOTS.length ? (DIGIT_SLOTS[nextSlot] as number) : 10;
         } else if (e.key === 'Backspace') {
            e.preventDefault();
            const d = [...digits];
            let target = slotIdx;
            // If current slot empty, step back to previous
            if (d[target] === '_' && target > 0) target -= 1;
            d[target] = '_';
            setDigits(d);
            commit(d);
            pendingCursor.current = DIGIT_SLOTS[target] as number;
         } else if (e.key === 'Delete') {
            e.preventDefault();
            const d = [...digits];
            d[slotIdx] = '_';
            setDigits(d);
            commit(d);
            pendingCursor.current = DIGIT_SLOTS[slotIdx] as number;
         } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            pendingCursor.current = DIGIT_SLOTS[Math.max(0, slotIdx - 1)] as number;
         } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            pendingCursor.current = DIGIT_SLOTS[
               Math.min(DIGIT_SLOTS.length - 1, slotIdx + 1)
            ] as number;
         } else if (e.key !== 'Tab') {
            e.preventDefault();
         }
      },
      [digits, commit],
   );

   // On focus: jump cursor to first empty slot
   const handleFocus = useCallback(() => {
      const first = digits.findIndex((c) => c === '_');
      const slotIdx = first === -1 ? 0 : first;
      pendingCursor.current = DIGIT_SLOTS[slotIdx] as number;
   }, [digits]);

   // On click: snap cursor to nearest digit slot
   const handleClick = useCallback(() => {
      const pos = inputRef.current?.selectionStart ?? 0;
      const nearest = DIGIT_SLOTS.reduce((prev, curr) =>
         Math.abs((curr as number) - pos) < Math.abs((prev as number) - pos) ? curr : prev,
      ) as number;
      pendingCursor.current = nearest;
   }, []);

   const handleCalendarSelect = useCallback(
      (date: Date | undefined) => {
         const newDigits = date ? storeToDigits(format(date, STORE_FORMAT)) : makeEmpty();
         const v = date ? format(date, STORE_FORMAT) : '';
         setDigits(newDigits);
         setLastSentValue(v);
         onChange(v);
         setOpen(false);
         inputRef.current?.focus();
      },
      [onChange],
   );

   return (
      <div className={cn('relative flex h-9 w-full', className)}>
         <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={buildDisplay(digits)}
            onChange={() => {}} // fully controlled via onKeyDown
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onClick={handleClick}
            disabled={disabled}
            className={cn(
               'selection:bg-primary selection:text-primary-foreground',
               'dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md rounded-r-none border border-r-0',
               'bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none font-mono',
               'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:z-10',
               'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            )}
         />

         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={disabled}
                  className="h-9 w-9 shrink-0 rounded-l-none border-l-0 shadow-xs"
               >
                  <CalendarIcon className="h-4 w-4" />
               </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
               <Calendar
                  mode="single"
                  selected={selected}
                  onSelect={handleCalendarSelect}
                  defaultMonth={selected ?? new Date()}
                  locale={vi}
               />
            </PopoverContent>
         </Popover>
      </div>
   );
}
