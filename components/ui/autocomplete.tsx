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
import { useEffect } from 'react';

export type Option = {
  label: string;
  value: string;
};

interface AutocompleteProps {
  options: Option[];
  value: string;
  onInputChange: (value: string) => void;
  onClear?: () => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function Autocomplete({
  options,
  value,
  onInputChange,
  onClear,
  onSelect,
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  disabled = false,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);

  const handleInputChange = (search: string) => {
    onInputChange?.(search);
  };

  const handleSelect = (currentValue: string) => {
    const selected = options.find((option) => option.value === currentValue);
    if (selected) {
      onSelect?.(selected.value);
      setOpen(false);
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

  return (
    <Command className='rounded-lg border shadow-md md:min-w-[450px]'>
      <div className='relative flex w-full items-center px-2'>
        <CommandInput
          value={value}
          onValueChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          onClick={() => !disabled && setOpen(true)}
          // onBlur={() => setOpen(false)}
        />
        <X
          className='absolute right-2 size-5 rounded-full text-muted-foreground hover:cursor-pointer hover:text-white'
          onClick={handleClear}
        />
      </div>
      <CommandEmpty
        style={{
          display: open ? 'block' : 'none',
        }}
      >
        {emptyMessage}
      </CommandEmpty>
      <CommandGroup
        className='max-h-[300px] overflow-auto'
        style={{
          display: open ? 'block' : 'none',
        }}
      >
        {options.map((option) => (
          <CommandItem
            key={option.value}
            value={option.value}
            onSelect={handleSelect}
          >
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
}
