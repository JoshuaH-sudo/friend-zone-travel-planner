"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TransportDocumentType } from "@/lib/rxdb-schema";

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
  onUpdate,
  onDelete,
}: {
  transport: TransportDocumentType;
  onUpdate: (data: TransportFormData) => void;
  onDelete: () => void;
}) => {
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

  const onSubmit = (data: TransportFormData) => {
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
              placeholder="Transport name"
              className="w-full rounded border px-2 py-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              {...register("type")}
              className="w-full rounded border px-2 py-1"
            >
              <option value="flight">Flight</option>
              <option value="bus">Bus</option>
              <option value="car">Car</option>
              <option value="train">Train</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
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
                step="0.01"
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
                <option value="AUD">AUD</option>
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              {...register("date")}
              type="date"
              className="w-full rounded border px-2 py-1"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
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
        aria-label="Delete transport"
        type="button"
      >
        ✕
      </button>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-10 z-10 cursor-pointer text-xl text-gray-400 hover:text-blue-600"
        aria-label="Edit transport"
        type="button"
      >
        ✎
      </button>
      <h4 className="text-lg font-semibold">{name}</h4>
      <div className="mt-2 flex items-center gap-2 text-gray-600">
        <span>{type}</span>
        <span>•</span>
        <span>{price}</span>
        <span>{currency}</span>
      </div>
      <p className="mt-2 text-gray-600">
        Date: {new Date(date).toLocaleDateString()}
      </p>
    </div>
  );
};
