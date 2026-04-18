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
import { allCurrencyCodes } from "@/lib/constants/currencies";
import { useSettings } from "@/lib/SettingsProvider";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const optionalTimeField = z
  .string()
  .regex(timeRegex, "Invalid time (HH:MM)")
  .or(z.literal(""))
  .optional();

const transportSchema = z
  .object({
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
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    departureTime: optionalTimeField,
    arrivalTime: optionalTimeField,
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
  const { name, type, price, currency, date, departureTime, arrivalTime, timezone } = transport;
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
      date,
      departureTime: departureTime ?? "",
      arrivalTime: arrivalTime ?? "",
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
      date: data.date,
      departureTime: data.departureTime || undefined,
      arrivalTime: data.arrivalTime || undefined,
      timezone: data.timezone || undefined,
      updatedAt: time.getUTCDate(),
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await transport.remove();
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
              <Label htmlFor="transport-date">Date</Label>
              <Input id="transport-date" {...register("date")} type="date" />
              {errors.date && (
                <p className="text-destructive text-sm">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label htmlFor="transport-departure-time">
                  Departure time{" "}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="transport-departure-time"
                  {...register("departureTime")}
                  type="time"
                />
                {errors.departureTime && (
                  <p className="text-destructive text-sm">
                    {errors.departureTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="transport-arrival-time">
                  Arrival time{" "}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="transport-arrival-time"
                  {...register("arrivalTime")}
                  type="time"
                />
                {errors.arrivalTime && (
                  <p className="text-destructive text-sm">
                    {errors.arrivalTime.message}
                  </p>
                )}
              </div>
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
        Date: {new Date(date).toLocaleDateString()}
      </p>
      {(departureTime || arrivalTime) && (
        <p className="text-muted-foreground mt-1 text-sm">
          {departureTime && <>Dep: {departureTime}</>}
          {departureTime && arrivalTime && <span className="mx-1">→</span>}
          {arrivalTime && <>Arr: {arrivalTime}</>}
          {timezone && <span className="ml-1 text-xs">({timezone})</span>}
        </p>
      )}
    </TripItemCard>
  );
};
