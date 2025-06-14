'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/colour-utils';

const MultiPointSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showLabels?: boolean;
    trackColor?: string;
    inactiveTrackColor?: string;
    thumbColor?: string;
  }
>(
  (
    {
      className,
      showLabels = false,
      trackColor, // Bright pink color from the image
      inactiveTrackColor, // Light pink color from the image
      thumbColor, // Matching thumb color
      ...props
    },
    ref
  ) => {
    // Ensure we have exactly two values
    const min = props.min || 0;
    const max = props.max || 100;
    const step = props.step || 1;
    // const defaultValue = props.defaultValue || [min, max];

    // Generate scale marks
    const scaleMarks = React.useMemo(() => {
      const marks = [];
      for (let i = min; i <= max; i += step) {
        marks.push(i);
      }
      return marks;
    }, [min, max, step]);

    return (
      <div className='relative'>
        {/* Slider component */}
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            'relative flex w-full touch-none select-none items-center',
            className
          )}
          {...props}
          defaultValue={[0, 24]}
        >
          {/* Inactive track (full width) */}
          <SliderPrimitive.Track
            className='relative h-2 w-full grow overflow-hidden rounded-full'
            style={{
              backgroundColor: inactiveTrackColor,
            }}
          >
            {/* Active track (between thumbs) */}
            <SliderPrimitive.Range
              className='absolute h-full'
              style={{
                backgroundColor: trackColor,
              }}
            />
          </SliderPrimitive.Track>

          {/* Start thumb */}
          <SliderPrimitive.Thumb
            className={cn(
              'block h-5 w-5 rounded-full border-2 border-white',
              'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
            )}
            style={{
              backgroundColor: thumbColor,
            }}
          />

          {/* End thumb */}
          <SliderPrimitive.Thumb
            className={cn(
              'block h-5 w-5 rounded-full border-2 border-white',
              'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
            )}
            style={{
              backgroundColor: thumbColor,
            }}
          />
        </SliderPrimitive.Root>

        {showLabels && (
          <div className='pt-2'>
            {/* Reduced spacing */}
            <div className='relative flex h-6 w-full flex-row justify-between'>
              {scaleMarks.map((mark) => {
                const position = (100 / max) * mark; // Calculate position based on the mark value 
                return (
                    <span key={mark} className='absolute font-mono text-xs text-muted-foreground' style={{ left: `calc(${position}% - 15px)` }}>
                      {mark}
                    </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);
MultiPointSlider.displayName = SliderPrimitive.Root.displayName;

export { MultiPointSlider };
