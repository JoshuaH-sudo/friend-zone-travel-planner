'use client';

import * as React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ScrollArea } from './scroll-area';

export type Option<T> = {
  label: string;
  value: T;
};

interface AutocompleteProps<T> {
  options: Option<T>[];
  value: string;
  onInputChange: (value: string) => void;
  onClear?: () => void;
  onSelect?: (value: T) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function Autocomplete<T>({
  options,
  value,
  onInputChange,
  onClear,
  onSelect,
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  disabled = false,
}: AutocompleteProps<T>) {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (search: string) => {
    onInputChange(search);
  };

  const handleSelect = (currentValue: string) => {
    const selected = options.find((option) => option.label === currentValue);
    if (selected) {
      onSelect?.(selected.value);
    }
  };

  const handleClear = () => {
    onClear?.();
    setOpen(false);
  };

  useEffect(() => {
    if (options.length > 0) {
      setOpen(true);
    }
  }, [options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className='relative w-full'>
      <Command className='rounded-lg border shadow-md w-full'>
        <div className='relative flex w-full items-center px-2'>
          <CommandInput
            value={value}
            onValueChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            onClick={() => !disabled && setOpen(true)}
          />
          <X
            className='absolute right-2 size-5 rounded-full text-muted-foreground hover:cursor-pointer hover:text-white'
            onClick={handleClear}
          />
        </div>
      </Command>
      
      {open && (
        <div className='absolute top-full left-0 right-0 z-50 bg-background border rounded-b-lg shadow-md'>
          <Command>
            <ScrollArea className='h-32'>
              <CommandEmpty>
                {emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.label}
                    // @ts-expect-error TypeScript doesn't know about the value prop
                    value={option.value}
                    onSelect={handleSelect}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </Command>
        </div>
      )}
    </div>
  );
}
