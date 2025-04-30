"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indeterminate?: boolean
  }
>(({ className, value, indeterminate = false, ...props }, ref) => { 
  const determinateClassname = 'rounded-full'
  const indeterminateClassname = 'bg-primary/20 h-1'
  
  return (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden bg-primary/20",
      indeterminate ? indeterminateClassname : determinateClassname,
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-primary transition-all",
        indeterminate && "animate-progress-indeterminate"
      )}
      style={!indeterminate ? { transform: `translateX(-${100 - (value || 0)}%)` } : undefined}
    />
  </ProgressPrimitive.Root>
)})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
