'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useCallback, useState } from 'react';

export interface ComboboxOption<T extends string | number> {
  value: T;
  label: string;
}

export interface ComboboxPropsBase<T extends string | number> {
  options: ComboboxOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  multiple?: boolean;
  className?: string;
}

type ComboboxProps<T extends string | number> =
  | (ComboboxPropsBase<T> & {
      multiple: false;
      value: T;
      onChange: (value: T) => void;
    })
  | (ComboboxPropsBase<T> & {
      multiple: true;
      value: T[];
      onChange: (value: T[]) => void;
    });

export function Combobox<T extends string | number>({
  options,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found.',
  multiple = false,
  value,
  onChange,
  className,
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (optionValue: T) => {
      if (multiple === true) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter((v) => v !== optionValue)
          : [...currentValues, optionValue];
        (onChange as (value: T[]) => void)(newValues);
      } else {
        const newValue = optionValue === value ? ('' as T) : optionValue;
        (onChange as (value: T) => void)(newValue);
        setOpen(false);
      }
    },
    [multiple, onChange, value]
  );

  const clearSelection = (e: React.MouseEvent, valueToRemove: T) => {
    e.stopPropagation();
    handleSelect(valueToRemove);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          <div className='flex flex-wrap items-center gap-1'>
            {multiple ? (
              Array.isArray(value) && value.length > 0 ? (
                <div className='flex flex-wrap gap-1'>
                  {value.map((val) => (
                    <Badge key={`t${val}`} variant='secondary' className='mr-1'>
                      {options.find((option) => option.value === val)?.label}
                      <button
                        className='ml-1 rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                        onMouseDown={(e) => {
                          e.preventDefault();
                          clearSelection(e, val);
                        }}
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className='text-muted-foreground'>{placeholder}</span>
              )
            ) : value ? (
              options.find((option) => option.value === value)?.label
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        <Command>
          <CommandInput placeholder={searchPlaceholder} className='h-9' />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value.toString()}
                  value={option.value.toString()}
                  onSelect={(value) => {
                    const option = options.find((opt) => opt.value.toString() === value);
                    if (option) handleSelect(option.value);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      multiple
                        ? Array.isArray(value) && value.includes(option.value)
                        : value === option.value
                          ? 'opacity-100'
                          : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
