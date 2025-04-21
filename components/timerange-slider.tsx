"use client"

import * as React from "react"
import { MultiPointSlider } from "@/components/ui/multi-point-slider"

interface TimeRangeSliderProps {
  label: string
  min?: number
  max?: number
  step?: number
  onChange?: (values: number[]) => void
  className?: string
  trackColor?: string
  inactiveTrackColor?: string
  thumbColor?: string
}

export function TimeRangeSlider({
  label,
  min = 1,
  max = 24,
  step = 1,
  onChange,
  className,
  trackColor = "bg-[#e84393]",
  inactiveTrackColor = "bg-[#f8a5c2]",
  thumbColor = "bg-[#e84393]",
}: TimeRangeSliderProps) {
  const [range, setRange] = React.useState<[number, number]>([min, max])

  const handleValueChange = (newValues: number[]) => {
    setRange(newValues as [number, number])
    onChange?.(newValues)
  }

  return (
    <div className="space-y-4 w-full max-w-3xl">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">{label}</div>
        <div className="flex space-x-4">
          <div className="text-lg font-medium">
            {range[0]} - {range[1]}
          </div>
        </div>
      </div>

      <div className="pb-8">
        {/* Container with padding to accommodate labels */}
        <MultiPointSlider
          min={min}
          max={max}
          step={step}
          onValueChange={handleValueChange}
          className={className}
          trackColor={trackColor}
          inactiveTrackColor={inactiveTrackColor}
          thumbColor={thumbColor}
          showLabels={true}
        />
      </div>
    </div>
  )
}
