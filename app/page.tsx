"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export default function Home() {
  const [selected, setSelected] = useState<Date>();
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={setSelected}
        footer={
          selected
            ? `Selected: ${selected.toLocaleDateString()}`
            : "Pick a day."
        }
      />
    </div>
  );
}
