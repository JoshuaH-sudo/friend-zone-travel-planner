"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StopCollection } from "@/lib/rxdb-schema";

const stopSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

type StopFormData = z.infer<typeof stopSchema>;

export const Stop = ({
  stop,
  onUpdate,
  onDelete,
}: {
  stop: StopCollection;
  onUpdate: (data: StopFormData) => void;
  onDelete: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StopFormData>({
    resolver: zodResolver(stopSchema),
    defaultValues: { name: stop.name, date: stop.date },
  });

  const onSubmit = (data: StopFormData) => {
    onUpdate(data);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="relative rounded-lg border p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <input
              {...register("name")}
              type="text"
              autoFocus
              placeholder="Stop name"
              className="w-full rounded border px-2 py-1 text-xl font-semibold"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <input
              {...register("date")}
              type="date"
              className="rounded border px-2 py-1 text-gray-600"
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
        onClick={onDelete}
        className="absolute top-2 right-2 z-10 cursor-pointer text-xl text-gray-400 hover:text-red-600"
        aria-label="Delete stop"
        type="button"
      >
        ✕
      </button>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-2 right-10 z-10 cursor-pointer text-xl text-gray-400 hover:text-blue-600"
        aria-label="Edit stop"
        type="button"
      >
        ✎
      </button>
      <h3 className="text-xl font-semibold">{stop.name}</h3>
      <p className="mt-2 text-gray-600">
        {new Date(stop.date).toLocaleDateString()}
      </p>
    </div>
  );
};
