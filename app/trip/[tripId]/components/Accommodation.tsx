"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AccommodationDocumentType } from "@/lib/rxdb-schema";
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

const accommodationSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200, "Name is too long"),
    price: z
      .number()
      .min(0, "Price must be positive")
      .max(Number.MAX_SAFE_INTEGER, "Price is too high"),
    currency: z.enum(["USD", "EUR", "JPY", "AUD"], {
      message: "Invalid currency",
    }),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
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
  const { name, price, currency, checkIn, checkOut } = accommodation;
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccommodationFormData>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: { name, price, currency, checkIn, checkOut },
  });

  const onSubmit = async (data: AccommodationFormData) => {
    await accommodation.patch({
      name: data.name,
      price: Math.round(data.price * 100) / 100,
      currency: data.currency,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      updatedAt: Date.now(),
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await accommodation.remove();
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accommodation-name">Name</Label>
              <Input
                id="accommodation-name"
                {...register("name")}
                type="text"
                autoFocus
                placeholder="Accommodation name"
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="accommodation-price">Price</Label>
                <Input
                  id="accommodation-price"
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
                <Label htmlFor="accommodation-currency">Currency</Label>
                <Select
                  value={String(currency)}
                  onValueChange={(value) => {
                    const event = {
                      target: { name: "currency", value },
                    };
                    register("currency").onChange(event);
                  }}
                >
                  <SelectTrigger id="accommodation-currency" className="w-25">
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
              <Label htmlFor="check-in">Check-in</Label>
              <Input id="check-in" {...register("checkIn")} type="date" />
              {errors.checkIn && (
                <p className="text-destructive text-sm">
                  {errors.checkIn.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="check-out">Check-out</Label>
              <Input id="check-out" {...register("checkOut")} type="date" />
              {errors.checkOut && (
                <p className="text-destructive text-sm">
                  {errors.checkOut.message}
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
    <Card className="relative">
      <CardContent className="p-4">
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          aria-label="Delete accommodation"
        >
          ✕
        </Button>
        <Button
          onClick={() => setIsEditing(true)}
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-10"
          aria-label="Edit accommodation"
        >
          ✎
        </Button>
        <h4 className="text-lg font-semibold">{name}</h4>
        <div className="text-muted-foreground mt-2 flex items-center gap-2">
          <span>{price}</span>
          <span>{currency}</span>
        </div>
        <p className="text-muted-foreground mt-2">
          Check-in: {new Date(checkIn).toLocaleDateString()}
        </p>
        <p className="text-muted-foreground mt-1">
          Check-out: {new Date(checkOut).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};
