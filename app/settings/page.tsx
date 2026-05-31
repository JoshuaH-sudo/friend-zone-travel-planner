"use client";

import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { dateFormats, DateFormat } from "@/lib/rxdb-schema";
import {
  exportAppData,
  importAppData,
  isValidTheme,
  resetAppData,
} from "@/lib/app-data-transfer";
import posthog from "posthog-js";
import { Download, Upload } from "lucide-react";

const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const clampWeight = (value: number) => Math.min(1, Math.max(0, value || 0));

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
    dateFormat,
    setDateFormat,
    analyticsConsent,
    setAnalyticsConsent,
    cookiesConsent,
    setCookiesConsent,
    compareWeights,
    setCompareWeights,
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
      posthog.capture("data_exported");
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
      posthog.capture("data_imported", { file_size_bytes: file.size });
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
    <div className="container flex flex-col gap-8 py-8 sm:py-12">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-4xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <section className="bg-card shadow-soft flex flex-col gap-4 rounded-2xl border p-6">
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

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{t("general.dateFormat.label")}</p>
              <p className="text-muted-foreground text-sm">
                {t("general.dateFormat.description")}
              </p>
            </div>
            <Select
              value={dateFormat}
              onValueChange={(v) => v && setDateFormat(v as DateFormat)}
            >
              <SelectTrigger className="w-40">
                <SelectValue
                  placeholder={t("general.dateFormat.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {dateFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">
                {t("general.analyticsConsent.label")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("general.analyticsConsent.description")}
              </p>
            </div>
            <input
              type="checkbox"
              className="accent-primary mt-0.5 size-4 shrink-0 cursor-pointer"
              checked={analyticsConsent}
              onChange={(e) => setAnalyticsConsent(e.target.checked)}
              aria-label={t("general.analyticsConsent.label")}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{t("general.cookiesConsent.label")}</p>
              <p className="text-muted-foreground text-sm">
                {t("general.cookiesConsent.description")}
              </p>
            </div>
            <input
              type="checkbox"
              className="accent-primary mt-0.5 size-4 shrink-0 cursor-pointer"
              checked={cookiesConsent}
              onChange={(e) => setCookiesConsent(e.target.checked)}
              aria-label={t("general.cookiesConsent.label")}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <p className="font-medium">{t("general.compareWeights.label")}</p>
              <p className="text-muted-foreground text-sm">
                {t("general.compareWeights.description")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["cost", "duration", "travel", "events"] as const).map(
                (key) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>{t(`general.compareWeights.fields.${key}`)}</span>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.05"
                      value={compareWeights[key]}
                      onChange={(event) =>
                        setCompareWeights({
                          ...compareWeights,
                          [key]: clampWeight(Number(event.target.value)),
                        })
                      }
                      className="w-24"
                    />
                  </label>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card shadow-soft flex flex-col gap-4 rounded-2xl border p-6">
        <h3 className="text-muted-foreground text-lg font-semibold">
          {t("backup.title")}
        </h3>
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            {t("backup.description")}
          </p>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div className="flex w-full flex-row flex-wrap gap-2 sm:w-auto">
              <Button
                type="button"
                onClick={handleExport}
                className="flex-1"
                disabled={isExporting || isImporting || isResetting}
              >
                <Download data-icon="inline-start" />
                {isExporting ? t("backup.exporting") : t("backup.export")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleImportClick}
                className="flex-1"
                disabled={isExporting || isImporting || isResetting}
              >
                <Upload data-icon="inline-start" />
                {isImporting ? t("backup.importing") : t("backup.import")}
              </Button>
            </div>
            <ConfirmationDialog
              trigger={
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto"
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
      <section className="border-border bg-muted/40 rounded-2xl border p-6 text-sm">
        <p className="text-muted-foreground">
          Need help?{" "}
          <Link
            href="/support"
            className="text-primary font-medium underline-offset-2 hover:underline"
          >
            Visit the Support page
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
