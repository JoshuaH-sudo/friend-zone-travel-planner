"use client";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AccommodationDocumentType } from "@/lib/rxdb-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TripItemCard } from "@/app/trip/[tripId]/components/TripItemCard";
import useTime from "@/components/hooks/useTime";
import { CurrencySelect } from "@/components/ui/currency-select";
import { TimezonePicker } from "@/components/ui/timezone-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { allCurrencyCodes } from "@/lib/constants/currencies";
import { useSettings } from "@/lib/SettingsProvider";
import {
  DATE_OR_DATETIME_REGEX,
  formatStoredDateTime,
} from "@/lib/datetime-utils";

// Accepts "YYYY-MM-DDTHH:MM" (new) or "YYYY-MM-DD" (legacy) stored values.
const accommodationSchema = z
  .object({
    name: z
      .string()
      .min(1, "errors.nameRequired")
      .max(200, "errors.nameTooLong"),
    price: z
      .number()
      .min(0, "errors.priceMustBePositive")
      .max(Number.MAX_SAFE_INTEGER, "errors.priceTooHigh"),
    currency: z.string().refine((value) => allCurrencyCodes.includes(value), {
      message: "errors.invalidCurrency",
    }),
    checkIn: z
      .string()
      .regex(DATE_OR_DATETIME_REGEX, "errors.selectCheckInDateTime"),
    checkOut: z
      .string()
      .regex(DATE_OR_DATETIME_REGEX, "errors.selectCheckOutDateTime"),
    timezone: z.string().optional(),
  })
  .refine((data) => new Date(data.checkOut) >= new Date(data.checkIn), {
    message: "errors.checkOutAfterCheckIn",
    path: ["checkOut"],
  });

export type AccommodationFormData = z.infer<typeof accommodationSchema>;

export const Accommodation = ({
  accommodation,
  startInEditMode = false,
}: {
  accommodation: AccommodationDocumentType;
  startInEditMode?: boolean;
}) => {
  const t = useTranslations("accommodation");
  const time = useTime();
  const { timezone: settingsTimezone } = useSettings();
  const { name, price, currency, checkIn, checkOut, timezone } = accommodation;
  const [isEditing, setIsEditing] = useState(false);
  const [highlightNameInput, setHighlightNameInput] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const {
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<AccommodationFormData>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: {
      name,
      price,
      currency,
      checkIn,
      checkOut,
      timezone: timezone ?? settingsTimezone,
    },
  });

  const watchedCurrency = watch("currency");

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

  const onSubmit = async (data: AccommodationFormData) => {
    await accommodation.patch({
      name: data.name,
      price: Math.round(data.price * 100) / 100,
      currency: data.currency,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      timezone: data.timezone || undefined,
      updatedAt: time.getUTCDate(),
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await accommodation.remove();
  };

  /** Format a stored ISO datetime string for display. */
  const formatDateTime = formatStoredDateTime;

  if (isEditing) {
    return (
      <Card>
        <CardContent className="px-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <>
                    <Label htmlFor="accommodation-name">{t("nameLabel")}</Label>
                    <Input
                      id={`accommodation-name-${accommodation.id}`}
                      {...field}
                      ref={(element) => {
                        field.ref(element);
                        nameInputRef.current = element;
                      }}
                      type="text"
                      autoFocus
                      placeholder={t("namePlaceholder")}
                      className={
                        highlightNameInput ? "ring-primary/40 ring-2" : ""
                      }
                    />
                  </>
                )}
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {t(errors.name.message ?? "")}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <>
                      <Label htmlFor="accommodation-price">
                        {t("priceLabel")}
                      </Label>
                      <Input
                        id="accommodation-price"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        type="number"
                        step="0.01"
                      />
                    </>
                  )}
                />
                {errors.price && (
                  <p className="text-destructive text-sm">
                    {t(errors.price.message ?? "")}
                  </p>
                )}
              </div>
              <div className="w-24 space-y-2">
                <Label htmlFor="accommodation-currency">
                  {t("currencyLabel")}
                </Label>
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
                    {t(errors.currency.message ?? "")}
                  </p>
                )}
              </div>
            </div>
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
                  />
                )}
              />
              {errors.checkIn && (
                <p className="text-destructive text-sm">
                  {t(errors.checkIn.message ?? "")}
                </p>
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
                  />
                )}
              />
              {errors.checkOut && (
                <p className="text-destructive text-sm">
                  {t(errors.checkOut.message ?? "")}
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
        <span>{price}</span>
        <span>{currency}</span>
      </div>
      <p className="text-muted-foreground mt-2">
        {t("checkInDisplay", { value: formatDateTime(checkIn) })}
      </p>
      <p className="text-muted-foreground mt-2">
        {t("checkOutDisplay", { value: formatDateTime(checkOut) })}
      </p>
      {timezone && (
        <p className="text-muted-foreground mt-1 text-sm">
          {t("timezoneDisplay", { value: timezone })}
        </p>
      )}
    </TripItemCard>
  );
};
