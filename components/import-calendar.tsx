"use client"

import type React from "react"

import { useState } from "react"
import { parseIcalFile } from "@/lib/ical"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Friend } from "@/lib/types"
import { ColorPicker } from "./color-picker"
import { Download, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "react-i18next"

interface ImportCalendarProps {
  onImport: (friend: Friend) => void
  onCancel: () => void
}

export function ImportCalendar({ onImport, onCancel }: ImportCalendarProps) {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [timezone, setTimezone] = useState("UTC")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { name: calendarName, dates } = await parseIcalFile(file)

      // Use the calendar name from the file if no custom name is provided
      const friendName = name.trim() || calendarName

      onImport({
        id: crypto.randomUUID(),
        name: friendName,
        color,
        timezone,
        availableDates: dates,
      })
    } catch (err) {
      setError("Failed to parse the iCal file. Please make sure it's a valid .ics file.")
    } finally {
      setIsLoading(false)
    }
  }

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
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="calendar-file">{t("calendar.icalFile")}</Label>
        <Input id="calendar-file" type="file" accept=".ics" onChange={handleFileChange} className="cursor-pointer" />
        <p className="text-xs text-muted-foreground">{t("calendar.importCalendarDescription")}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="friend-name">{t("friend.nameOptional")}</Label>
        <Input
          id="friend-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("friend.nameFromFile")}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("friend.color")}</Label>
        <ColorPicker color={color} onChange={setColor} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">{t("friend.timezone")}</Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger id="timezone">
            <SelectValue placeholder={t("friend.timezone")} />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {t("actions.cancel")}
        </Button>
        <Button onClick={handleImport} disabled={!file || isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("state.importing")}
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              {t("actions.import")}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

