"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BANNER_COLOR_PRESETS } from "@/lib/banner-color";
import { cn } from "@/lib/utils";

export interface BannerColorPickerProps {
  /** Current CSS colour value (e.g. "#2d6a4f"). */
  value: string;
  onChange: (color: string) => void;
  /** Extra classes for the trigger button. */
  triggerClassName?: string;
}

/**
 * A compact colour picker for trip banner backgrounds.
 * The trigger is a small swatch button showing the current colour.
 * Clicking it opens a dialog with preset solid-colour swatches and a
 * native colour input for custom values.
 */
export function BannerColorPicker({
  value,
  onChange,
  triggerClassName,
}: BannerColorPickerProps) {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Change banner colour"
            className={cn(
              "size-9 shrink-0 cursor-pointer rounded-lg border-2 border-white/40 ring-1 ring-black/20 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              triggerClassName,
            )}
            style={{ background: value }}
          />
        }
      />
      <DialogContent className="max-w-xs sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="sr-only">Banner colour</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-8 gap-1.5">
          {BANNER_COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={preset}
              className={cn(
                "size-7 rounded cursor-pointer border-2 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
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
          className="h-8 w-full cursor-pointer rounded border border-input"
          aria-label="Custom colour"
        />
      </DialogContent>
    </Dialog>
  );
}
