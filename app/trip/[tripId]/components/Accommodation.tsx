"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { format } from "date-fns";

// Accepts "YYYY-MM-DDTHH:MM" (new) or "YYYY-MM-DD" (legacy) stored values.
const dateOrDateTimeRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;

const accommodationSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200, "Name is too long"),
    price: z
      .number()
      .min(0, "Price must be positive")
      .max(Number.MAX_SAFE_INTEGER, "Price is too high"),
    currency: z.string().refine((value) => allCurrencyCodes.includes(value), {
      message: "Invalid currency",
    }),
    checkIn: z
      .string()
      .regex(dateOrDateTimeRegex, "Select a check-in date and time"),
    checkOut: z
      .string()
      .regex(dateOrDateTimeRegex, "Select a check-out date and time"),
    timezone: z.string().optional(),
  })
  .refine((data) => new Date(data.checkOut) >= new Date(data.checkIn), {
    message: "Check-out date must be after check-in date",
    path: ["checkOut"],
  });

export type AccommodationFormData = z.infer<typeof accommodationSchema>;

export const Accommodation = ({
  accommodation,
}: {
  accommodation: AccommodationDocumentType;
}) => {
  const time = useTime();
  const { timezone: settingsTimezone } = useSettings();
  const { name, price, currency, checkIn, checkOut, timezone } = accommodation;
  const [isEditing, setIsEditing] = useState(false);

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
  const formatDateTime = (dt: string) => {
    try {
      const [datePart, timePart] = dt.split("T");
      const [y, m, d] = datePart.split("-").map(Number);
      const [h, min] = (timePart ?? "12:00").split(":").map(Number);
      return format(new Date(y, m - 1, d, h, min), "MM/dd/yyyy hh:mm aa");
    } catch {
      return dt;
    }
  };

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
                    <Label htmlFor="accommodation-name">Name</Label>
                    <Input
                      id="accommodation-name"
                      {...field}
                      type="text"
                      autoFocus
                      placeholder="Accommodation name"
                    />
                  </>
                )}
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
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
                      <Label htmlFor="accommodation-price">Price</Label>
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
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div className="w-24 space-y-2">
                <Label htmlFor="accommodation-currency">Currency</Label>
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
            <div className="space-y-2">
              <Label>Check-in</Label>
              <Controller
                control={control}
                name="checkIn"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pick check-in date & time"
                    className="w-full"
                  />
                )}
              />
              {errors.checkIn && (
                <p className="text-destructive text-sm">
                  {errors.checkIn.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Check-out</Label>
              <Controller
                control={control}
                name="checkOut"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pick check-out date & time"
                    className="w-full"
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
                Timezone{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
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
              <Button type="submit">Save</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
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
      deleteLabel="Delete accommodation"
      editLabel="Edit accommodation"
      title={<h4 className="text-lg font-semibold">{name}</h4>}
    >
      <div className="text-muted-foreground mt-2 flex items-center gap-2">
        <span>{price}</span>
        <span>{currency}</span>
      </div>
      <p className="text-muted-foreground mt-2">
        Check-in: {formatDateTime(checkIn)}
      </p>
      <p className="text-muted-foreground mt-2">
        Check-out: {formatDateTime(checkOut)}
      </p>
      {timezone && (
        <p className="text-muted-foreground mt-1 text-sm">
          Timezone: {timezone}
        </p>
      )}
    </TripItemCard>
  );
};

