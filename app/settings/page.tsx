"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useSettings } from "@/lib/SettingsProvider";
import {
  exportAppData,
  importAppData,
  isValidTheme,
} from "@/lib/app-data-transfer";

export default function SettingsPage() {
  const database = useDatabase();
  const { theme, setTheme } = useTheme();
  const { defaultCurrency, setDefaultCurrency, language, setLanguage, timezone, setTimezone } =
    useSettings();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setStatusMessage(null);
      await exportAppData(database, { theme: isValidTheme(theme) ? theme : null });
      setStatusMessage("App data exported.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatusMessage(`Failed to export app data: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsImporting(true);
      setStatusMessage(null);
      const content = await file.text();
      const { theme: importedTheme } = await importAppData(database, content);
      if (importedTheme) {
        setTheme(importedTheme);
      }
      setStatusMessage("App data imported.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setStatusMessage(`Failed to import app data: ${errorMessage}`);
    } finally {
      event.target.value = "";
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Settings</h2>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-muted-foreground">General</h3>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Default Currency</p>
              <p className="text-muted-foreground text-sm">
                The default currency used when creating new trip items.
              </p>
            </div>
            <CurrencySelect
              name="defaultCurrency"
              value={defaultCurrency}
              onValueChange={(value) => {
                if (value) setDefaultCurrency(value);
              }}
              currencies="all"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-muted-foreground text-sm">
                Choose your preferred color scheme.
              </p>
            </div>
            <Select value={theme} onValueChange={(v) => v && setTheme(v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Language</p>
              <p className="text-muted-foreground text-sm">
                The language used throughout the app.
              </p>
            </div>
            <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Default Timezone</p>
              <p className="text-muted-foreground text-sm">
                Used as the default when exporting trip data to iCal and when
                adding new transport or accommodation items.
              </p>
            </div>
            <TimezonePicker
              value={timezone}
              onValueChange={(v) => v && setTimezone(v)}
              className="max-w-56"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-muted-foreground">
          Backup and Restore
        </h3>
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Export all app data (trips, settings, and preferences) or upload a
            previously exported backup. Uploading a backup replaces current app
            data.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleExport}
              disabled={isExporting || isImporting}
            >
              {isExporting ? "Exporting..." : "Export App Data"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleImportClick}
              disabled={isExporting || isImporting}
            >
              {isImporting ? "Importing..." : "Upload App Data"}
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
          {statusMessage ? (
            <p className="text-muted-foreground text-sm">{statusMessage}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
