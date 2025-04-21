"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const MultiPointSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showLabels?: boolean
    trackColor?: string
    inactiveTrackColor?: string
    thumbColor?: string
  }
>(
  (
    {
      className,
      showLabels = false,
      trackColor = "bg-[#e84393]", // Bright pink color from the image
      inactiveTrackColor = "bg-[#f8a5c2]", // Light pink color from the image
      thumbColor = "bg-[#e84393]", // Matching thumb color
      ...props
    },
    ref,
  ) => {
    // Ensure we have exactly two values
    const defaultValue = props.defaultValue || [0, 100]
    const min = props.min || 0
    const max = props.max || 100
    const step = props.step || 1

    // Generate scale marks
    const scaleMarks = React.useMemo(() => {
      const marks = []
      for (let i = min; i <= max; i += step) {
        marks.push(i)
      }
      return marks
    }, [min, max, step])

    return (
      <div className="relative">
        {/* Slider component */}
        <SliderPrimitive.Root
          ref={ref}
          className={cn("relative flex w-full touch-none select-none items-center", className)}
          {...props}
          defaultValue={defaultValue}
        >
          {/* Inactive track (full width) */}
          <SliderPrimitive.Track
            className={cn("relative h-2 w-full grow overflow-hidden rounded-full", inactiveTrackColor)}
          >
            {/* Active track (between thumbs) */}
            <SliderPrimitive.Range className={cn("absolute h-full", trackColor)} />
          </SliderPrimitive.Track>

          {/* Start thumb */}
          <SliderPrimitive.Thumb
            className={cn(
              "block h-5 w-5 rounded-full border-2 border-white",
              thumbColor,
              "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            )}
          />

          {/* End thumb */}
          <SliderPrimitive.Thumb
            className={cn(
              "block h-5 w-5 rounded-full border-2 border-white",
              thumbColor,
              "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            )}
          />
        </SliderPrimitive.Root>

        {/* Labels with precise positioning */}
        {showLabels && (
          <div className="absolute left-0 right-0 top-4 pt-2">
            {" "}
            {/* Reduced spacing */}
            <div className="relative w-full h-6">
              {scaleMarks.map((mark) => {
                // Calculate the position as a percentage
                const position = ((mark - min) / (max - min)) * 100

                return (
                  <div
                    key={mark}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${position}%`,
                      transform: "translateX(-50%)", // Center the label
                    }}
                  >
                    <span className="text-xs text-muted-foreground">{mark}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  },
)
MultiPointSlider.displayName = SliderPrimitive.Root.displayName

export { MultiPointSlider }
