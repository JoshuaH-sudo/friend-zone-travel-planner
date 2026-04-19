"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { de, enUS } from "date-fns/locale";
import {
  DayPicker,
  getDefaultClassNames,
  type DayPickerProps,
} from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const locale = useLocale();
  const defaultClassNames = getDefaultClassNames();
  const dayPickerLocale = locale === "de" ? de : enUS;

  return (
    <DayPicker
      locale={dayPickerLocale}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex w-full flex-col gap-4",
        month_caption: "flex h-9 w-full items-center justify-center px-8",
        caption_label: cn(
          "inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium [&_svg]:shrink-0",
          defaultClassNames.caption_label,
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium dark:fill-white",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "cn-calendar-dropdown-root relative rounded-(--cell-radius)",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown,
        ),
        months_dropdown: "font-medium",
        years_dropdown: "font-medium",
        nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
        button_previous: cn(
          "h-7 w-7 rounded-md border border-input p-0 opacity-60 shadow-xs fill-text-foreground",
          "hover:opacity-100 hover:bg-accent flex items-center justify-center bg-accent",
        ),
        button_next: cn(
          "h-7 w-7 rounded-md border border-input p-0 opacity-60 shadow-xs fill-text-foreground",
          "hover:opacity-100 hover:bg-accent flex items-center justify-center bg-accent",
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
