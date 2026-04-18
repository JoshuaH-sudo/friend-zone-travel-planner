"use client";
import { useEffect, useRef, useState } from "react";
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
import { TripItemCard } from "@/app/trip/[tripId]/components/TripItemCard";
import useTime from "@/components/hooks/useTime";
import { CurrencySelect } from "@/components/ui/currency-select";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { allCurrencyCodes } from "@/lib/constants/currencies";
import { useSettings } from "@/lib/SettingsProvider";
import { DATETIME_REGEX, formatStoredDateTime } from "@/lib/datetime-utils";

const transportSchema = z.object({
  name: z.string().min(1, "errors.nameRequired").max(200, "errors.nameTooLong"),
  type: z.enum(["flight", "bus", "car", "train"], {
    message: "errors.invalidTransportType",
  }),
  price: z
    .number()
    .min(0, "errors.priceMustBePositive")
    .max(Number.MAX_SAFE_INTEGER, "errors.priceTooHigh"),
  currency: z.string().refine((value) => allCurrencyCodes.includes(value), {
    message: "errors.invalidCurrency",
  }),
  departureDateTime: z
    .string()
    .regex(DATETIME_REGEX, "errors.selectDepartureDateTime"),
  arrivalDateTime: z
    .string()
    .regex(DATETIME_REGEX, "errors.invalidArrivalDateTime")
    .or(z.literal(""))
    .optional(),
  timezone: z.string().optional(),
});

export type TransportFormData = z.infer<typeof transportSchema>;

export const Transport = ({
  transport,
  startInEditMode = false,
}: {
  transport: TransportDocumentType;
  startInEditMode?: boolean;
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
  const nameRegistration = register("name");

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
                  {t(errors.name.message ?? "")}
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
                  {t(errors.type.message ?? "")}
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
                    {t(errors.price.message ?? "")}
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
                    {t(errors.currency.message ?? "")}
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
                  />
                )}
              />
              {errors.departureDateTime && (
                <p className="text-destructive text-sm">
                  {t(errors.departureDateTime.message ?? "")}
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
                  />
                )}
              />
              {errors.arrivalDateTime && (
                <p className="text-destructive text-sm">
                  {t(errors.arrivalDateTime.message ?? "")}
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
    <TripItemCard
      onDelete={handleDelete}
      onEdit={() => setIsEditing(true)}
      deleteLabel={t("deleteAriaLabel")}
      editLabel={t("editAriaLabel")}
      title={<h4 className="text-lg font-semibold">{name}</h4>}
    >
      <div className="text-muted-foreground mt-2 flex items-center gap-2">
        <span className="capitalize">{t(`type.${type}`)}</span>
        <span>•</span>
        <span>{price}</span>
        <span>{currency}</span>
      </div>
      <p className="text-muted-foreground mt-2">
        {t("departureDisplay", { value: formatDateTime(departureDateTime) })}
      </p>
      {arrivalDateTime && (
        <p className="text-muted-foreground mt-1">
          {t("arrivalDisplay", { value: formatDateTime(arrivalDateTime) })}
        </p>
      )}
      {timezone && (
        <p className="text-muted-foreground mt-1 text-sm">
          {t("timezoneDisplay", { value: timezone })}
        </p>
      )}
    </TripItemCard>
  );
};
