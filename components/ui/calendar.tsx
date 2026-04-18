"use client";

import * as React from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex w-full flex-col gap-4",
        month_caption: "flex h-9 w-full items-center justify-center px-8",
        caption_label: "text-sm font-medium",
        dropdowns: "flex h-9 w-full items-center justify-center gap-1.5",
        dropdown_root:
          "relative has-focus-visible:border-ring has-focus-visible:ring-ring/50 rounded-md border border-input shadow-xs has-focus-visible:ring-[3px]",
        dropdown:
          "absolute inset-0 rounded-md bg-popover opacity-0 text-sm disabled:cursor-not-allowed",
        months_dropdown: "font-medium",
        years_dropdown: "font-medium",
        nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
        button_previous: cn(
          "h-7 w-7 rounded-md border border-input bg-transparent p-0 opacity-60 shadow-xs",
          "hover:opacity-100 hover:bg-accent flex items-center justify-center",
        ),
        button_next: cn(
          "h-7 w-7 rounded-md border border-input bg-transparent p-0 opacity-60 shadow-xs",
          "hover:opacity-100 hover:bg-accent flex items-center justify-center",
        ),
        weekdays: "flex",
        weekday:
          "text-muted-foreground w-9 text-center text-[0.8rem] font-normal",
        weeks: "mt-1 space-y-0.5",
        week: "flex",
        day: "flex h-9 w-9 items-center justify-center p-0 text-sm",
        day_button: cn(
          "h-9 w-9 rounded-md p-0 font-normal",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        ),
        ...classNames,
      }}
      modifiersClassNames={{
        selected:
          "bg-primary! text-primary-foreground! rounded-md hover:bg-primary! hover:text-primary-foreground!",
        today: "font-semibold",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
      }}
      {...props}
    />
  );
}

export { Calendar };
