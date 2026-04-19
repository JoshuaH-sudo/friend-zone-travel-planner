"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TransportDocumentType } from "@/lib/rxdb-schema";
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
import { Card, CardContent } from "@/components/ui/card";
import useTime from "@/components/hooks/useTime";
import { CurrencySelect } from "@/components/ui/currency-select";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { allCurrencyCodes } from "@/lib/constants/currencies";
import { useSettings } from "@/lib/SettingsProvider";
import { formatMoney } from "@/lib/format";
import { DATETIME_REGEX, formatStoredDateTime } from "@/lib/datetime-utils";
import { MS_PER_DAY } from "@/lib/constants/time";
import {
  AlertTriangle,
  Bus,
  Car,
  Pencil,
  Plane,
  Train,
  Trash2,
} from "lucide-react";

export const Transport = ({
  transport,
  startInEditMode = false,
  warningSummary,
  highlightedDates = [],
}: {
  transport: TransportDocumentType;
  startInEditMode?: boolean;
  warningSummary?: string;
  highlightedDates?: string[];
}) => {
  const t = useTranslations("transport");
  const time = useTime();
  const { timezone: settingsTimezone } = useSettings();
  const {
    name,
    type,
    price,
    currency,
    departureDateTime,
    arrivalDateTime,
    timezone,
  } = transport;
  const [isEditing, setIsEditing] = useState(false);
  const [highlightNameInput, setHighlightNameInput] = useState(false);
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
  type TransportFormData = z.infer<typeof transportSchema>;

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TransportFormData>({
    resolver: zodResolver(transportSchema),
    defaultValues: {
      name,
      type,
      price,
      currency,
      departureDateTime,
      arrivalDateTime: arrivalDateTime ?? "",
      timezone: timezone ?? settingsTimezone,
    },
  });

  const watchedType = watch("type");
  const watchedCurrency = watch("currency");
  const watchedArrivalDateTime = watch("arrivalDateTime");
  const nameRegistration = register("name");
  const datePresets = [
    { label: t("datePresetToday"), date: new Date() },
    { label: t("datePresetTomorrow"), date: new Date(Date.now() + MS_PER_DAY) },
    {
      label: t("datePresetIn7Days"),
      date: new Date(Date.now() + 7 * MS_PER_DAY),
    },
  ];

  useEffect(() => {
    if (!startInEditMode) return;

    setIsEditing(true);
    setHighlightNameInput(true);

    requestAnimationFrame(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });

    const timeout = setTimeout(() => {
      setHighlightNameInput(false);
    }, 1400);

    return () => clearTimeout(timeout);
  }, [startInEditMode]);

  const onSubmit = async (data: TransportFormData) => {
    await transport.patch({
      name: data.name,
      type: data.type,
      price: Math.round(data.price * 100) / 100,
      currency: data.currency,
      departureDateTime: data.departureDateTime,
      arrivalDateTime: data.arrivalDateTime || undefined,
      timezone: data.timezone || undefined,
      updatedAt: time.getUTCDate(),
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await transport.remove();
  };

  /** Format a stored ISO datetime string for display. */
  const formatDateTime = formatStoredDateTime;

  if (isEditing) {
    return (
      <Card>
        <CardContent className="px-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {warningSummary && (
              <p className="text-destructive flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {warningSummary}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor={`transport-name-${transport.id}`}>
                {t("nameLabel")}
              </Label>
              <Input
                id={`transport-name-${transport.id}`}
                {...nameRegistration}
                ref={(element) => {
                  nameRegistration.ref(element);
                  nameInputRef.current = element;
                }}
                type="text"
                autoFocus
                placeholder={t("namePlaceholder")}
                className={highlightNameInput ? "ring-primary/40 ring-2" : ""}
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
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
              {errors.type && (
                <p className="text-destructive text-sm">
                  {errors.type.message}
                </p>
              )}
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
                {errors.price && (
                  <p className="text-destructive text-sm">
                    {errors.price.message}
                  </p>
                )}
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
                  <p className="text-destructive text-sm">
                    {errors.currency.message}
                  </p>
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
                <p className="text-destructive text-sm">
                  {errors.departureDateTime.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                {t("arrivalLabel")}{" "}
                <span className="text-muted-foreground text-xs">
                  {t("optional")}
                </span>
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
                <p className="text-destructive text-sm">
                  {errors.arrivalDateTime.message}
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
            <div className="flex gap-2">
              <Button type="submit">{t("save")}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                {t("cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border-border/50 bg-card flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
      {type === "flight" && <Plane className="text-primary h-5 w-5 shrink-0" />}
      {type === "bus" && <Bus className="text-primary h-5 w-5 shrink-0" />}
      {type === "car" && <Car className="text-primary h-5 w-5 shrink-0" />}
      {type === "train" && <Train className="text-primary h-5 w-5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate font-medium">{name}</p>
        <p className="text-muted-foreground text-xs capitalize">
          {t(`type.${type}`)} · {formatDateTime(departureDateTime)}
        </p>
        {arrivalDateTime && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t("arrivalDisplay", { value: formatDateTime(arrivalDateTime) })}
          </p>
        )}
        {timezone && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t("timezoneDisplay", { value: timezone })}
          </p>
        )}
        {warningSummary && (
          <p className="text-destructive mt-1 flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {warningSummary}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="text-foreground mr-1 text-sm font-medium">
          {formatMoney(price, currency)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          aria-label={t("editAriaLabel")}
          className="text-muted-foreground hover:text-foreground h-7 w-7"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label={t("deleteAriaLabel")}
          className="text-muted-foreground hover:text-destructive h-7 w-7"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
