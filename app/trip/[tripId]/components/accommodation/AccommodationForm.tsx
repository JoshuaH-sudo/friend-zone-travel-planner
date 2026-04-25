"use client";

import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencySelect } from "@/components/ui/currency-select";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { allCurrencyCodes } from "@/lib/constants/currencies";
import { useSettings } from "@/lib/SettingsProvider";
import { DATE_OR_DATETIME_REGEX } from "@/lib/datetime-utils";
import { MS_PER_DAY } from "@/lib/constants/time";
import { AlertTriangle } from "lucide-react";

export type AccommodationFormValues = {
  name: string;
  price: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  timezone?: string;
};

type AccommodationFormProps = {
  initialValues: AccommodationFormValues;
  onSubmit: (data: AccommodationFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  warningSummary?: string;
  highlightedDates?: string[];
  autoFocusName?: boolean;
  highlightNameInput?: boolean;
};

export function AccommodationForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  warningSummary,
  highlightedDates = [],
  autoFocusName = false,
  highlightNameInput = false,
}: AccommodationFormProps) {
  const t = useTranslations("accommodation");
  const { timezone: settingsTimezone, dateFormat } = useSettings();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const accommodationSchema = useMemo(
    () =>
      z
        .object({
          name: z
            .string()
            .min(1, t("errors.nameRequired"))
            .max(200, t("errors.nameTooLong")),
          price: z
            .number()
            .min(0, t("errors.priceMustBePositive"))
            .max(Number.MAX_SAFE_INTEGER, t("errors.priceTooHigh")),
          currency: z
            .string()
            .refine((value) => allCurrencyCodes.includes(value), {
              message: t("errors.invalidCurrency"),
            }),
          checkIn: z
            .string()
            .regex(DATE_OR_DATETIME_REGEX, t("errors.selectCheckInDateTime")),
          checkOut: z
            .string()
            .regex(DATE_OR_DATETIME_REGEX, t("errors.selectCheckOutDateTime")),
          timezone: z.string().optional(),
        })
        .refine((data) => new Date(data.checkOut) >= new Date(data.checkIn), {
          message: t("errors.checkOutAfterCheckIn"),
          path: ["checkOut"],
        }),
    [t],
  );

  const {
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<AccommodationFormValues>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: {
      ...initialValues,
      timezone: initialValues.timezone ?? settingsTimezone,
    },
  });

  useEffect(() => {
    if (!autoFocusName) return;
    requestAnimationFrame(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });
  }, [autoFocusName]);

  const watchedCurrency = watch("currency");
  const watchedCheckIn = watch("checkIn");
  const datePresets = [
    { label: t("datePresetToday"), date: new Date() },
    { label: t("datePresetTomorrow"), date: new Date(Date.now() + MS_PER_DAY) },
    {
      label: t("datePresetIn7Days"),
      date: new Date(Date.now() + 7 * MS_PER_DAY),
    },
  ];

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit({
          ...data,
          timezone: data.timezone || undefined,
          price: Math.round(data.price * 100) / 100,
        });
      })}
      className="space-y-4"
    >
      {warningSummary && (
        <p className="text-destructive flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {warningSummary}
        </p>
      )}
      <div className="space-y-2">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <>
              <Label htmlFor="accommodation-name">{t("nameLabel")}</Label>
              <Input
                id="accommodation-name"
                {...field}
                ref={(element) => {
                  field.ref(element);
                  nameInputRef.current = element;
                }}
                type="text"
                autoFocus={autoFocusName}
                placeholder={t("namePlaceholder")}
                className={highlightNameInput ? "ring-primary/40 ring-2" : ""}
              />
            </>
          )}
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <div className="space-y-2">
          <Label>{t("checkInLabel")}</Label>
          <Controller
            control={control}
            name="checkIn"
            render={({ field }) => (
              <DateTimePicker
                value={field.value}
                onChange={field.onChange}
                placeholder={t("checkInPlaceholder")}
                className="w-full"
                highlightedDates={highlightedDates}
                presets={datePresets}
                dateFormat={dateFormat}
              />
            )}
          />
          {errors.checkIn && (
            <p className="text-destructive text-sm">{errors.checkIn.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{t("checkOutLabel")}</Label>
          <Controller
            control={control}
            name="checkOut"
            render={({ field }) => (
              <DateTimePicker
                value={field.value}
                onChange={field.onChange}
                placeholder={t("checkOutPlaceholder")}
                className="w-full"
                highlightedDates={highlightedDates}
                pairedHighlightDate={watchedCheckIn}
                presets={datePresets}
                dateFormat={dateFormat}
              />
            )}
          />
          {errors.checkOut && (
            <p className="text-destructive text-sm">
              {errors.checkOut.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            {t("timezoneLabel")}{" "}
            <span className="text-muted-foreground text-xs">
              {t("optional")}
            </span>
          </Label>
          <Controller
            control={control}
            name="timezone"
            render={({ field }) => (
              <TimezonePicker
                value={field.value || settingsTimezone}
                onValueChange={field.onChange}
                className="w-full"
              />
            )}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="space-y-2">
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <>
                <Label htmlFor="accommodation-price">{t("priceLabel")}</Label>
                <Input
                  id="accommodation-price"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  type="number"
                  step="0.01"
                />
              </>
            )}
          />
          {errors.price && (
            <p className="text-destructive text-sm">{errors.price.message}</p>
          )}
        </div>
        <div className="w-24 space-y-2">
          <Label htmlFor="accommodation-currency">{t("currencyLabel")}</Label>
          <CurrencySelect
            id="accommodation-currency"
            name="currency"
            value={watchedCurrency}
            onValueChange={(value) => {
              if (!value) return;
              setValue("currency", value, { shouldValidate: true });
            }}
          />
          {errors.currency && (
            <p className="text-destructive text-sm">
              {errors.currency.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit">{submitLabel ?? t("save")}</Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel ?? t("cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
