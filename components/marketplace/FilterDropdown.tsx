'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Option = {
  label: string;
  value: string;
};

type FilterDropdownProps = {
  label: string;
  options: Option[];
  value: string[];
  multiple?: boolean;
  onChange: (nextValue: string[]) => void;
};

export default function FilterDropdown({
  label,
  options,
  value,
  multiple = true,
  onChange,
}: FilterDropdownProps) {
  const isActive = value.length > 0;

  const triggerLabel = isActive
    ? `${label}: ${multiple ? `${value.length} selected` : options.find((item) => item.value === value[0])?.label || value[0]}`
    : label;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition',
            isActive
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900',
          )}
        >
          <span>{triggerLabel}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[220px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)] animate-in fade-in zoom-in-95"
        >
          {options.map((option) => {
            const checked = value.includes(option.value);

            return (
              <DropdownMenu.CheckboxItem
                key={option.value}
                checked={checked}
                onCheckedChange={(nextChecked) => {
                  if (multiple) {
                    if (nextChecked) {
                      onChange(Array.from(new Set([...value, option.value])));
                    } else {
                      onChange(value.filter((item) => item !== option.value));
                    }
                    return;
                  }

                  onChange(nextChecked ? [option.value] : []);
                }}
                className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-slate-700 outline-none transition hover:bg-slate-50 data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700"
              >
                <DropdownMenu.ItemIndicator className="absolute left-2.5 inline-flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </DropdownMenu.ItemIndicator>
                {option.label}
              </DropdownMenu.CheckboxItem>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
