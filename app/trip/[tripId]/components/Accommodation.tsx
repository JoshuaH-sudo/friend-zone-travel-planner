"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AccommodationCollection } from "@/lib/rxdb-schema";

const accommodationSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200, "Name is too long"),
    price: z
      .number()
      .min(0, "Price must be positive")
      .max(1000000, "Price is too high"),
    currency: z.enum(["USD", "EUR", "JPY"], { message: "Invalid currency" }),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  })
  .refine((data) => new Date(data.checkOut) >= new Date(data.checkIn), {
    message: "Check-out date must be after check-in date",
    path: ["checkOut"],
  });

type AccommodationFormData = z.infer<typeof accommodationSchema>;

export const Accommodation = ({
  accommodation,
  onUpdate,
  onDelete,
}: {
  accommodation: AccommodationCollection;
  onUpdate: (data: AccommodationFormData) => void;
  onDelete: () => void;
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

  const onSubmit = (data: AccommodationFormData) => {
    onUpdate(data);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="relative rounded-lg border p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              {...register("name")}
              type="text"
              autoFocus
              placeholder="Accommodation name"
              className="w-full rounded border px-2 py-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                className="w-full rounded border px-2 py-1"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                {...register("currency")}
                className="rounded border px-2 py-1"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="JPY">JPY</option>
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Check-in
              </label>
              <input
                {...register("checkIn")}
                type="date"
                className="w-full rounded border px-2 py-1"
              />
              {errors.checkIn && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.checkIn.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Check-out
              </label>
              <input
                {...register("checkOut")}
                type="date"
                className="w-full rounded border px-2 py-1"
              />
              {errors.checkOut && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.checkOut.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border p-4">
      <button
        onClick={() => {
          onDelete();
        }}
        className="absolute top-2 right-2 z-10 cursor-pointer text-xl text-gray-400 hover:text-red-600"
        aria-label="Delete accommodation"
        type="button"
      >
        ✕
      </button>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-10 z-10 cursor-pointer text-xl text-gray-400 hover:text-blue-600"
        aria-label="Edit accommodation"
        type="button"
      >
        ✎
      </button>
      <h4 className="text-lg font-semibold">{name}</h4>
      <div className="mt-2 flex items-center gap-2 text-gray-600">
        <span>{price}</span>
        <span>{currency}</span>
      </div>
      <p className="mt-2 text-gray-600">
        Check-in: {new Date(checkIn).toLocaleDateString()}
      </p>
      <p className="mt-1 text-gray-600">
        Check-out: {new Date(checkOut).toLocaleDateString()}
      </p>
    </div>
  );
};
