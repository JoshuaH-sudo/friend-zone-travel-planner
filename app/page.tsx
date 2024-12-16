"use client";
import ResultsCalender from "@/components/ResultsCalender";
import SelectCalender from "@/components/SelectCalender";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export default function Home() {
  const [user1Dates, setUser1Dates] = useState<DateRange[]>();
  const [user2Dates, setUser2Dates] = useState<DateRange[]>();
  const [overLappingDates, setOverLappingDates] = useState<DateRange[]>();

  useEffect(() => {
    // Compare the dates of user1 and user2 and find which dates overlap
    if (user1Dates && user2Dates) {
      const overlappingDates: DateRange[] = [];
      user1Dates.forEach((user1Date) => {
        user2Dates.forEach((user2Date) => {
          if (
            user1Date.from &&
            user1Date.to &&
            user2Date.from &&
            user2Date.to &&
            user1Date.from <= user2Date.to &&
            user1Date.to >= user2Date.from
          ) {
            overlappingDates.push({
              from:
                user1Date.from > user2Date.from
                  ? user1Date.from
                  : user2Date.from,
              to: user1Date.to < user2Date.to ? user1Date.to : user2Date.to,
            });
          }
        });
      });
      setOverLappingDates(overlappingDates);
    }
  }, [user1Dates, user2Dates]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex flex-row items-center justify-center gap-4">
        <SelectCalender onChange={setUser1Dates} />
        <SelectCalender onChange={setUser2Dates} />
      </div>
      <ResultsCalender ranges={overLappingDates || []} />
    </div>
  );
}
