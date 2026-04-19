"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useSettings } from "@/lib/SettingsProvider";
import {
  exportAppData,
  importAppData,
  isValidTheme,
  resetAppData,
} from "@/lib/app-data-transfer";

const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations("settings");
  const database = useDatabase();
  const { theme, setTheme } = useTheme();
  const {
    defaultCurrency,
    setDefaultCurrency,
    language,
    setLanguage,
    timezone,
    setTimezone,
  } = useSettings();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setStatusMessage(null);
      await exportAppData(database, {
        theme: isValidTheme(theme) ? theme : null,
      });
      setStatusMessage(t("backup.status.exported"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.unknownError");
      setStatusMessage(t("backup.status.exportFailed", { errorMessage }));
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

    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      setStatusMessage(t("backup.status.importFailedFileTooLarge"));
      event.target.value = "";
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
      setStatusMessage(t("backup.status.imported"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.unknownError");
      setStatusMessage(t("backup.status.importFailed", { errorMessage }));
    } finally {
      event.target.value = "";
      setIsImporting(false);
    }
  };

  const handleResetAppData = async () => {
    try {
      setIsResetting(true);
      setStatusMessage(null);
      await resetAppData(database);
      setStatusMessage(t("backup.status.reset"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.unknownError");
      setStatusMessage(t("backup.status.resetFailed", { errorMessage }));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">{t("title")}</h2>

      <section className="flex flex-col gap-4">
        <h3 className="text-muted-foreground text-lg font-semibold">
          {t("general.title")}
        </h3>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {t("general.defaultCurrency.label")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("general.defaultCurrency.description")}
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
              <p className="font-medium">{t("general.theme.label")}</p>
              <p className="text-muted-foreground text-sm">
                {t("general.theme.description")}
              </p>
            </div>
            <Select value={theme} onValueChange={(v) => v && setTheme(v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("general.theme.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">
                  {t("general.theme.system")}
                </SelectItem>
                <SelectItem value="light">
                  {t("general.theme.light")}
                </SelectItem>
                <SelectItem value="dark">{t("general.theme.dark")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{t("general.language.label")}</p>
              <p className="text-muted-foreground text-sm">
                {t("general.language.description")}
              </p>
            </div>
            <Select
              value={language}
              onValueChange={(v) => {
                if (!v) return;
                setLanguage(v);
                router.refresh();
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("general.language.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  {t("general.language.english")}
                </SelectItem>
                <SelectItem value="de">
                  {t("general.language.german")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {t("general.defaultTimezone.label")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("general.defaultTimezone.description")}
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
        <h3 className="text-muted-foreground text-lg font-semibold">
          {t("backup.title")}
        </h3>
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            {t("backup.description")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleExport}
              disabled={isExporting || isImporting || isResetting}
            >
              {isExporting ? t("backup.exporting") : t("backup.export")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleImportClick}
              disabled={isExporting || isImporting || isResetting}
            >
              {isImporting ? t("backup.importing") : t("backup.import")}
            </Button>
            <ConfirmationDialog
              trigger={
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isExporting || isImporting || isResetting}
                >
                  {t("backup.reset")}
                </Button>
              }
              title={t("backup.resetConfirmTitle")}
              description={t("backup.resetConfirmDescription")}
              confirmLabel={t("backup.resetConfirm")}
              onConfirm={handleResetAppData}
              disabled={isExporting || isImporting || isResetting}
            >
              <p className="text-muted-foreground text-sm">
                {t("backup.resetWarning")}
              </p>
            </ConfirmationDialog>
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
