'use client';

import * as React from 'react';
import { MultiPointSlider } from '@/components/ui/multi-point-slider';
import { lightenColor } from '@/lib/utils';

interface TimeRangeSliderProps {
  label: string;
  colour: string;
  min?: number;
  max?: number;
  step?: number;
  value: number[];
  onChange?: (values: number[]) => void;
  className?: string;
}

export function TimeRangeSlider({
  label,
  min = 1,
  max = 24,
  step = 1,
  value = [min, max],
  onChange,
  className,
  colour,
}: TimeRangeSliderProps) {
  const handleValueChange = (newValues: number[]) => {
    onChange?.(newValues);
  };

  const trackColor = colour;
  const inactiveTrackColor = lightenColor(colour, 0.5); // Lighten the color for inactive track
  const thumbColor = colour;

  return (
    <div className='w-full max-w-3xl space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='text-lg font-medium'>{label}</div>
        <div className='flex space-x-4'>
          <div className='text-lg font-medium'>
            {value[0]} - {value[1]}
          </div>
        </div>
      </div>

      <div className='pb-8'>
        {/* Container with padding to accommodate labels */}
        <MultiPointSlider
          min={min}
          max={max}
          step={step}
          value={value}
          onValueChange={handleValueChange}
          className={className}
          trackColor={trackColor}
          inactiveTrackColor={inactiveTrackColor}
          thumbColor={thumbColor}
          showLabels={true}
        />
      </div>
    </div>
  );
}
