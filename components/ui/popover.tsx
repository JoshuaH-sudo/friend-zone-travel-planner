"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

const PopoverRoot = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverPrimitive.Popup.Props & {
    className?: string;
    sideOffset?: number;
    align?: "start" | "center" | "end";
  }
>(({ className, sideOffset = 8, align = "center", children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner sideOffset={sideOffset} align={align}>
      <PopoverPrimitive.Popup
        ref={ref}
        className={cn(
          "bg-popover text-popover-foreground z-50 w-auto rounded-md border p-0 shadow-md outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Popup>
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";

export { PopoverRoot, PopoverTrigger, PopoverContent };
