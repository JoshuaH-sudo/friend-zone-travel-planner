"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#ec4899", // pink
]

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const { t } = useTranslation()
  const [customColor, setCustomColor] = useState(color)

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value)
    onChange(e.target.value)
  }

  return (
    <Tabs defaultValue="preset" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="preset">{t("calendar.presetColors")}</TabsTrigger>
        <TabsTrigger value="custom">{t("calendar.customColor")}</TabsTrigger>
      </TabsList>

      <TabsContent value="preset" className="pt-2">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                color === c ? "border-black dark:border-white scale-110" : "border-transparent hover:scale-110",
              )}
              style={{ backgroundColor: c }}
              onClick={() => onChange(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="custom" className="pt-2 space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border" style={{ backgroundColor: customColor }} />
          <Input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-16 h-8 p-0 overflow-hidden"
          />
          <Input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            placeholder="#RRGGBB"
            className="flex-1"
            maxLength={7}
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
        <p className="text-xs text-muted-foreground">Enter a hex color code (e.g., #FF5500) or use the color picker</p>
      </TabsContent>
    </Tabs>
  )
}

