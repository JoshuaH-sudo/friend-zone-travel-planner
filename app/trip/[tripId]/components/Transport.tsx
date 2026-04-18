"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { format } from "date-fns";

const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const transportSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  type: z.enum(["flight", "bus", "car", "train"], {
    message: "Invalid transport type",
  }),
  price: z
    .number()
    .min(0, "Price must be positive")
    .max(Number.MAX_SAFE_INTEGER, "Price is too high"),
  currency: z.string().refine((value) => allCurrencyCodes.includes(value), {
    message: "Invalid currency",
  }),
  departureDateTime: z
    .string()
    .regex(dateTimeRegex, "Select a departure date and time"),
  arrivalDateTime: z
    .string()
    .regex(dateTimeRegex, "Invalid arrival date/time")
    .or(z.literal(""))
    .optional(),
  timezone: z.string().optional(),
});

export type TransportFormData = z.infer<typeof transportSchema>;

export const Transport = ({
  transport,
}: {
  transport: TransportDocumentType;
}) => {
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
              <Label htmlFor="transport-name">Name</Label>
              <Input
                id="transport-name"
                {...register("name")}
                type="text"
                autoFocus
                placeholder="Transport name"
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport-type">Type</Label>
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
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
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
                <Label htmlFor="transport-price">Price</Label>
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
                <Label htmlFor="transport-currency">Currency</Label>
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
              <Label>Departure</Label>
              <Controller
                control={control}
                name="departureDateTime"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pick departure date & time"
                    className="w-full"
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
                Arrival{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Controller
                control={control}
                name="arrivalDateTime"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value || undefined}
                    onChange={field.onChange}
                    placeholder="Pick arrival date & time"
                    className="w-full"
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
      deleteLabel="Delete transport"
      editLabel="Edit transport"
      title={<h4 className="text-lg font-semibold">{name}</h4>}
    >
      <div className="text-muted-foreground mt-2 flex items-center gap-2">
        <span className="capitalize">{type}</span>
        <span>•</span>
        <span>{price}</span>
        <span>{currency}</span>
      </div>
      <p className="text-muted-foreground mt-2">
        Departure: {formatDateTime(departureDateTime)}
      </p>
      {arrivalDateTime && (
        <p className="text-muted-foreground mt-1">
          Arrival: {formatDateTime(arrivalDateTime)}
        </p>
      )}
      {timezone && (
        <p className="text-muted-foreground mt-1 text-sm">
          Timezone: {timezone}
        </p>
      )}
    </TripItemCard>
  );
};

