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
        months: "flex flex-col sm:flex-row gap-4",
        month: "relative space-y-3",
        month_caption: "flex justify-center pt-1 items-center",
        caption_label: "text-sm font-medium",
        nav: "absolute top-0 left-0 right-0 flex justify-between items-center pt-1 px-1",
        button_previous: cn(
          "h-7 w-7 rounded-md border border-input bg-transparent p-0 opacity-60",
          "hover:opacity-100 hover:bg-accent flex items-center justify-center",
        ),
        button_next: cn(
          "h-7 w-7 rounded-md border border-input bg-transparent p-0 opacity-60",
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
