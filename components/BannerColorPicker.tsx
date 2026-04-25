"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BANNER_COLOR_PRESETS,
  isColorAllowedForTheme,
} from "@/lib/banner-color";
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
 *
 * Preset swatches and custom colour values that would make banner text
 * illegible for the active theme are disabled / flagged with a warning.
 */
export function BannerColorPicker({
  value,
  onChange,
  triggerClassName,
}: BannerColorPickerProps) {
  const { resolvedTheme } = useTheme();
  /**
   * Defer theme-based filtering until after hydration to avoid a server /
   * client mismatch (same pattern used in the site Header).
   */
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? resolvedTheme : undefined;

  const [inputValue, setInputValue] = React.useState(value);
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const isInputAllowed = React.useMemo(
    () => isColorAllowedForTheme(inputValue, activeTheme),
    [inputValue, activeTheme],
  );

  const themeLabel =
    activeTheme === "dark"
      ? "dark"
      : activeTheme === "light"
        ? "light"
        : "current";

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
          {BANNER_COLOR_PRESETS.map((preset) => {
            const allowed = isColorAllowedForTheme(preset, activeTheme);
            return (
              <button
                key={preset}
                type="button"
                aria-label={
                  allowed
                    ? preset
                    : `${preset} — not suitable for ${themeLabel} mode`
                }
                title={allowed ? undefined : `Not suitable for ${themeLabel} mode`}
                disabled={!allowed}
                className={cn(
                  "size-7 rounded border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  allowed
                    ? "cursor-pointer hover:scale-110"
                    : "cursor-not-allowed opacity-25",
                  value === preset
                    ? "border-foreground scale-110"
                    : "border-transparent",
                )}
                style={{ background: preset }}
                onClick={
                  allowed
                    ? () => {
                        setInputValue(preset);
                        onChange(preset);
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
        <div className="flex flex-col gap-1.5">
          <input
            type="color"
            value={inputValue}
            onChange={(e) => {
              const next = e.target.value;
              setInputValue(next);
              if (isColorAllowedForTheme(next, activeTheme)) {
                onChange(next);
              }
            }}
            className={cn(
              "h-8 w-full cursor-pointer rounded border",
              isInputAllowed ? "border-input" : "border-destructive",
            )}
            aria-label="Custom colour"
          />
          {!isInputAllowed && (
            <p className="text-destructive text-xs">
              {activeTheme === "dark"
                ? "This colour is too bright for dark mode — text may not be visible."
                : "This colour is too dark for light mode — text may not be visible."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
