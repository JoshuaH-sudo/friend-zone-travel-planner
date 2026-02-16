"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

const transportSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  type: z.enum(["flight", "bus", "car", "train"], {
    message: "Invalid transport type",
  }),
  price: z
    .number()
    .min(0, "Price must be positive")
    .max(Number.MAX_SAFE_INTEGER, "Price is too high"),
  currency: z.enum(["USD", "EUR", "JPY", "AUD"], {
    message: "Invalid currency",
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export type TransportFormData = z.infer<typeof transportSchema>;

export const Transport = ({
  transport,
}: {
  transport: TransportDocumentType;
}) => {
  const time = useTime();
  const { name, type, price, currency, date } = transport;
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransportFormData>({
    resolver: zodResolver(transportSchema),
    defaultValues: { name, type, price, currency, date },
  });

  const onSubmit = async (data: TransportFormData) => {
    await transport.patch({
      name: data.name,
      type: data.type,
      price: Math.round(data.price * 100) / 100,
      currency: data.currency,
      date: data.date,
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
                value={String(type)}
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
              <div className="flex-1 space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="transport-currency">Currency</Label>
                <Select
                  value={String(currency)}
                  onValueChange={(value) => {
                    const event = {
                      target: { name: "currency", value },
                    };
                    register("currency").onChange(event);
                  }}
                >
                  <SelectTrigger id="transport-currency" className="w-25">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                  </SelectContent>
                </Select>
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
    </TripItemCard>
  );
};
