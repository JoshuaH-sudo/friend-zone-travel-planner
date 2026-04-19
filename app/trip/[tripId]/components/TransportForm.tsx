"use client";

import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { allCurrencyCodes } from "@/lib/constants/currencies";
import { useSettings } from "@/lib/SettingsProvider";
import { DATETIME_REGEX } from "@/lib/datetime-utils";
import { MS_PER_DAY } from "@/lib/constants/time";
import { AlertTriangle } from "lucide-react";

export type TransportFormValues = {
  name: string;
  type: "flight" | "bus" | "car" | "train";
  price: number;
  currency: string;
  departureDateTime: string;
  arrivalDateTime?: string;
  timezone?: string;
};

type TransportFormProps = {
  initialValues: TransportFormValues;
  onSubmit: (data: TransportFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  warningSummary?: string;
  highlightedDates?: string[];
  autoFocusName?: boolean;
  highlightNameInput?: boolean;
};

export function TransportForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  warningSummary,
  highlightedDates = [],
  autoFocusName = false,
  highlightNameInput = false,
}: TransportFormProps) {
  const t = useTranslations("transport");
  const { timezone: settingsTimezone } = useSettings();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const transportSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, t("errors.nameRequired"))
          .max(200, t("errors.nameTooLong")),
        type: z.enum(["flight", "bus", "car", "train"], {
          message: t("errors.invalidTransportType"),
        }),
        price: z
          .number()
          .min(0, t("errors.priceMustBePositive"))
          .max(Number.MAX_SAFE_INTEGER, t("errors.priceTooHigh")),
        currency: z
          .string()
          .refine((value) => allCurrencyCodes.includes(value), {
            message: t("errors.invalidCurrency"),
          }),
        departureDateTime: z
          .string()
          .regex(DATETIME_REGEX, t("errors.selectDepartureDateTime")),
        arrivalDateTime: z
          .string()
          .regex(DATETIME_REGEX, t("errors.invalidArrivalDateTime"))
          .or(z.literal(""))
          .optional(),
        timezone: z.string().optional(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<TransportFormValues>({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      ...initialValues,
      arrivalDateTime: initialValues.arrivalDateTime ?? "",
      timezone: initialValues.timezone ?? settingsTimezone,
    },
  });

  useEffect(() => {
    reset({
      ...initialValues,
      arrivalDateTime: initialValues.arrivalDateTime ?? "",
      timezone: initialValues.timezone ?? settingsTimezone,
    });
  }, [initialValues, reset, settingsTimezone]);

  useEffect(() => {
    if (!autoFocusName) return;
    requestAnimationFrame(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });
  }, [autoFocusName]);

  const watchedType = watch("type");
  const watchedCurrency = watch("currency");
  const watchedArrivalDateTime = watch("arrivalDateTime");
  const nameRegistration = register("name");
  const datePresets = [
    { label: t("datePresetToday"), date: new Date() },
    { label: t("datePresetTomorrow"), date: new Date(Date.now() + MS_PER_DAY) },
    { label: t("datePresetIn7Days"), date: new Date(Date.now() + 7 * MS_PER_DAY) },
  ];

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit({
          ...data,
          price: Math.round(data.price * 100) / 100,
          arrivalDateTime: data.arrivalDateTime || undefined,
          timezone: data.timezone || undefined,
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
        <Label htmlFor="transport-name">{t("nameLabel")}</Label>
        <Input
          id="transport-name"
          {...nameRegistration}
          ref={(element) => {
            nameRegistration.ref(element);
            nameInputRef.current = element;
          }}
          type="text"
          autoFocus={autoFocusName}
          placeholder={t("namePlaceholder")}
          className={highlightNameInput ? "ring-primary/40 ring-2" : ""}
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="transport-type">{t("typeLabel")}</Label>
        <Select
          value={watchedType}
          onValueChange={(value) => {
            const event = {
              target: { name: "type", value },
            };
            register("type").onChange(event);
          }}
        >
          <SelectTrigger id="transport-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flight">{t("type.flight")}</SelectItem>
            <SelectItem value="bus">{t("type.bus")}</SelectItem>
            <SelectItem value="car">{t("type.car")}</SelectItem>
            <SelectItem value="train">{t("type.train")}</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-destructive text-sm">{errors.type.message}</p>}
      </div>
      <div className="flex gap-4">
        <div className="space-y-2">
          <Label htmlFor="transport-price">{t("priceLabel")}</Label>
          <Input
            id="transport-price"
            {...register("price", { valueAsNumber: true })}
            type="number"
            step="0.01"
          />
          {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
        </div>
        <div className="w-24 space-y-2">
          <Label htmlFor="transport-currency">{t("currencyLabel")}</Label>
          <CurrencySelect
            id="transport-currency"
            name="currency"
            value={watchedCurrency}
            onValueChange={(value) => {
              if (!value) return;
              const event = {
                target: { name: "currency", value },
              };
              register("currency").onChange(event);
            }}
          />
          {errors.currency && (
            <p className="text-destructive text-sm">{errors.currency.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("departureLabel")}</Label>
        <Controller
          control={control}
          name="departureDateTime"
          render={({ field }) => (
            <DateTimePicker
              value={field.value}
              onChange={field.onChange}
              placeholder={t("departurePlaceholder")}
              className="w-full"
              highlightedDates={highlightedDates}
              pairedHighlightDate={watchedArrivalDateTime || undefined}
              presets={datePresets}
            />
          )}
        />
        {errors.departureDateTime && (
          <p className="text-destructive text-sm">{errors.departureDateTime.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          {t("arrivalLabel")} <span className="text-muted-foreground text-xs">{t("optional")}</span>
        </Label>
        <Controller
          control={control}
          name="arrivalDateTime"
          render={({ field }) => (
            <DateTimePicker
              value={field.value || undefined}
              onChange={field.onChange}
              placeholder={t("arrivalPlaceholder")}
              className="w-full"
              highlightedDates={highlightedDates}
              presets={datePresets}
            />
          )}
        />
        {errors.arrivalDateTime && (
          <p className="text-destructive text-sm">{errors.arrivalDateTime.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          {t("timezoneLabel")} <span className="text-muted-foreground text-xs">{t("optional")}</span>
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
