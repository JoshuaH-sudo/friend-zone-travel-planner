'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandEmpty, CommandGroup, CommandInput as CommandPrimitiveInput, CommandItem } from '@/components/ui/command';

export type Option = {
  label: string;
  value: string;
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitiveInput>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitiveInput>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitiveInput
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));

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
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || '');

  // Update internal input value when prop value changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);
  };

  const handleSelect = (currentValue: string) => {
    const selected = options.find(option => option.value === currentValue);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('relative w-full', triggerClassName)}>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            clearable={clearable}
            onClear={handleClear}
            isLoading={loading}
            onClick={() => !disabled && setOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0 shadow-md', contentClassName)}
        align="start"
      >
        <Command>
          <CommandInput
            value={inputValue}
            onValueChange={(newValue: string) => {
              setInputValue(newValue);
              onInputChange?.(newValue);
            }}
            placeholder={placeholder}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
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
      </PopoverContent>
    </Popover>
  );
}