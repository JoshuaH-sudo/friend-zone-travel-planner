'use client';

import * as React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

export type Option = {
  label: string;
  value: string;
};

interface AutocompleteProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  clearable?: boolean;
  renderOption?: (option: Option) => React.ReactNode;
}

export function Autocomplete({
  options,
  value,
  onChange,
  onInputChange,
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  loading = false,
  disabled = false,
  triggerClassName,
  contentClassName,
  clearable = true,
  renderOption,
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || '');

  // Update internal input value when prop value changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const handleInputChange = (search: string) => {
    setInputValue(search);
    onInputChange?.(search);
  };

  const handleSelect = (currentValue: string) => {
    const selected = options.find((option) => option.value === currentValue);
    if (selected) {
      setInputValue(selected.label);
      onChange?.(selected.value);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
  };

  return (
    <Command className='rounded-lg border shadow-md md:min-w-[450px]'>
      <CommandInput
        value={inputValue}
        onValueChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        onClick={() => !disabled && setOpen(true)}
      />
      {/* <CommandEmpty>{emptyMessage}</CommandEmpty> */}
      <CommandGroup className='max-h-[300px] overflow-auto' hidden={!open}>
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
