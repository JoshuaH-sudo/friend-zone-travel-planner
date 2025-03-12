"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns";
import type { Friend } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AvailabilityOverviewProps {
  friends: Friend[];
}

export function AvailabilityOverview({ friends }: AvailabilityOverviewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getAvailableFriends = (date: Date) => {
    return friends.filter((friend) =>
      friend.availableDates.some((d) => isSameDay(d, date)),
    );
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Availability Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-4">
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

        <div className="grid grid-cols-7 gap-1 text-center">
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className="h-24 md:h-28" />
          ))}

          {monthDays.map((day) => {
            const availableFriends = getAvailableFriends(day);
            const availableCount = availableFriends.length;
            const allAvailable =
              availableCount === friends.length && friends.length > 0;

            return (
              <TooltipProvider key={day.toString()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-24 md:h-28 p-1 border rounded-md flex flex-col",
                        !isSameMonth(day, currentMonth) && "opacity-50",
                        allAvailable &&
                          "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
                      )}
                    >
                      <div className="text-sm font-medium self-end">
                        {format(day, "d")}
                      </div>

                      {availableCount > 0 && (
                        <div className="mt-auto flex flex-wrap gap-1 justify-center">
                          {availableCount === friends.length &&
                          friends.length > 0 ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              Everyone
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              {availableCount}/{friends.length}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Display friend names/initials */}
                      <div className="mt-1 flex flex-wrap gap-1 justify-center overflow-hidden">
                        {availableFriends.slice(0, 3).map((friend) => (
                          <div
                            key={friend.id}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white"
                            style={{ backgroundColor: friend.color }}
                            title={friend.name}
                          >
                            {getInitials(friend.name)}
                          </div>
                        ))}
                        {availableFriends.length > 3 && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium bg-muted">
                            +{availableFriends.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center">
                    <div className="text-sm font-medium">
                      {format(day, "EEEE, MMMM d, yyyy")}
                    </div>
                    {availableCount > 0 ? (
                      <div className="mt-1">
                        <div className="font-medium">Available:</div>
                        <ul className="list-disc list-inside">
                          {availableFriends.map((friend) => (
                            <li
                              key={friend.id}
                              className="flex items-center gap-1"
                            >
                              <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: friend.color }}
                              />
                              {friend.name}{" "}
                              <span className="text-xs text-muted-foreground">
                                ({friend.timezone})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        No one is available
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
