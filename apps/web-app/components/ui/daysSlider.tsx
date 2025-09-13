'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DaysSliderProps {
  className?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function DaysSlider({
  className,
  value,
  onChange,
  min = 1,
  max = 30,
  step = 1,
  label = 'Days',
}: DaysSliderProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="days-slider">{label}</Label>
        <span className="text-sm font-medium">{value} {value === 1 ? 'day' : 'days'}</span>
      </div>
      <Slider
        id="days-slider"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleSliderChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} day</span>
        <span>{max} days</span>
      </div>
    </div>
  );
}

