"use client";

import * as React from "react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { BANNER_COLOR_PRESETS } from "@/lib/banner-color";
import { cn } from "@/lib/utils";

export interface BannerColorPickerProps {
  /** Current CSS colour value (e.g. "#2d6a4f"). */
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

/**
 * A compact colour picker for trip banner backgrounds.
 * Renders a square trigger button showing the current colour swatch.
 * Opens a popover containing preset solid-colour swatches and a native
 * colour input for custom values.
 */
export function BannerColorPicker({
  value,
  onChange,
  className,
}: BannerColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <PopoverRoot>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Change banner colour"
            className={cn(
              "size-9 shrink-0 cursor-pointer rounded-lg border border-input bg-input/30 flex items-center justify-center transition-colors hover:bg-input/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              className,
            )}
          />
        }
      >
        <span
          className="size-5 rounded"
          style={{ background: value }}
          aria-hidden="true"
        />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div className="grid grid-cols-8 gap-1.5 mb-3">
          {BANNER_COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={preset}
              className={cn(
                "size-7 rounded cursor-pointer border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                value === preset
                  ? "border-foreground scale-110"
                  : "border-transparent",
              )}
              style={{ background: preset }}
              onClick={() => {
                setInputValue(preset);
                onChange(preset);
              }}
            />
          ))}
        </div>
        <input
          type="color"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full h-7 cursor-pointer rounded border border-input"
          aria-label="Custom colour"
        />
      </PopoverContent>
    </PopoverRoot>
  );
}
