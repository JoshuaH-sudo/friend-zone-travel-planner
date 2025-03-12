"use client";

import { useState, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import type { Friend } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Globe,
  Upload,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { generateFriendIcal, downloadFile } from "@/lib/ical";
import { EditFriendForm } from "./edit-friend-form";
import { useTranslations } from "next-intl";

interface FriendCalendarProps {
  friend: Friend;
  onUpdateAvailability: (friendId: string, dates: Date[]) => void;
  onRemoveFriend: (friendId: string) => void;
  onUpdateTimezone: (friendId: string, timezone: string) => void;
  onUpdateFriend: (updatedFriend: Friend) => void;
}

export function FriendCalendar({
  friend,
  onUpdateAvailability,
  onRemoveFriend,
  onUpdateTimezone,
  onUpdateFriend,
}: FriendCalendarProps) {
  const t = useTranslations();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [dragOperation, setDragOperation] = useState<"add" | "remove" | null>(
    null,
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const toggleDate = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;

    const isSelected = friend.availableDates.some((d) => isSameDay(d, date));
    let newDates: Date[];

    if (isSelected) {
      newDates = friend.availableDates.filter((d) => !isSameDay(d, date));
    } else {
      newDates = [...friend.availableDates, date];
    }

    onUpdateAvailability(friend.id, newDates);
  };

  const isDateSelected = (date: Date) => {
    return friend.availableDates.some((d) => isSameDay(d, date));
  };

  const handleMouseDown = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;

    setIsDragging(true);
    setDragStartDate(date);

    // Determine if we're adding or removing dates
    const isSelected = isDateSelected(date);
    setDragOperation(isSelected ? "remove" : "add");

    // Toggle the initial date
    toggleDate(date);

    // Add event listeners to handle drag outside the calendar
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseEnter = (date: Date) => {
    setHoveredDate(date);

    if (!isDragging || !dragStartDate || !isSameMonth(date, currentMonth))
      return;

    // Get all dates between dragStartDate and current date
    const startDate = new Date(
      Math.min(dragStartDate.getTime(), date.getTime()),
    );
    const endDate = new Date(Math.max(dragStartDate.getTime(), date.getTime()));
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Filter to only include dates in the current month
    const monthDates = dateRange.filter((d) => isSameMonth(d, currentMonth));

    // Create a new set of dates based on the drag operation
    let newDates: Date[];

    if (dragOperation === "add") {
      // Add all dates in the range that aren't already selected
      const existingDates = friend.availableDates.filter(
        (d) => !monthDates.some((md) => isSameDay(md, d)),
      );
      newDates = [...existingDates, ...monthDates];
    } else {
      // Remove all dates in the range
      newDates = friend.availableDates.filter(
        (d) => !monthDates.some((md) => isSameDay(md, d)),
      );
    }

    onUpdateAvailability(friend.id, newDates);
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartDate(null);
    setDragOperation(null);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const exportCalendar = () => {
    const icalContent = generateFriendIcal(friend);
    const filename = `${friend.name.replace(/\s+/g, "_")}_availability.ics`;
    downloadFile(icalContent, filename);
  };

  const handleSaveEdit = (updatedFriend: Friend) => {
    onUpdateFriend(updatedFriend);
    setShowEditDialog(false);
  };

  // Common timezones
  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="pb-2"
        style={{ backgroundColor: `${friend.color}20` }}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: friend.color }}
            />
            {friend.name}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  title={t("actions.edit")}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">
                    {t("actions.edit")} {friend.name}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h2 className="text-xl font-bold mb-4">
                  {t("actions.edit")} {friend.name}
                </h2>
                <EditFriendForm
                  friend={friend}
                  onSave={handleSaveEdit}
                  onCancel={() => setShowEditDialog(false)}
                />
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={exportCalendar}
              title={t("actions.export")}
            >
              <Upload className="h-4 w-4" />
              <span className="sr-only">
                {t("actions.export")} {friend.name}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemoveFriend(friend.id)}
              title={t("actions.delete")}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">
                {t("actions.delete")} {friend.name}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <h3 className="font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>

        <div
          ref={calendarRef}
          className="grid grid-cols-7 gap-1 text-center"
          onMouseLeave={() => {
            handleMouseUp();
            handleMouseLeave();
          }}
        >
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="h-8" />
          ))}

          {monthDays.map((day) => {
            const isSelected = isDateSelected(day);
            const isHovered = hoveredDate && isSameDay(day, hoveredDate);

            return (
              <div
                key={day.toString()}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors cursor-pointer select-none",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                  isHovered && !isSelected && "bg-muted/80",
                  isHovered &&
                    isSelected &&
                    "ring-2 ring-offset-2 ring-primary",
                )}
                style={isSelected ? { backgroundColor: friend.color } : {}}
                onMouseDown={() => handleMouseDown(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                onMouseLeave={handleMouseLeave}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3 px-3 flex flex-col items-start gap-2">
        <div className="text-xs text-muted-foreground">
          {friend.availableDates.length === 1
            ? t("friend.availableDays", { count: "1" })
            : t("friend.availableDaysPlural", {
                count: friend.availableDates.length.toString(),
              })}
        </div>

        <div className="w-full">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-3 w-3 text-muted-foreground" />
            <Label htmlFor={`timezone-${friend.id}`} className="text-xs">
              {t("friend.timezone")}
            </Label>
          </div>
          <Select
            value={friend.timezone}
            onValueChange={(value) => onUpdateTimezone(friend.id, value)}
          >
            <SelectTrigger id={`timezone-${friend.id}`} className="h-8 text-xs">
              <SelectValue placeholder={t("friend.timezone")} />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz} className="text-xs">
                  {tz.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardFooter>
    </Card>
  );
}
