"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StopDocumentType } from "@/lib/rxdb-schema";
import { useDatabase } from "@/lib/DatabaseProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const stopSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

type StopFormData = z.infer<typeof stopSchema>;

export const Stop = ({ stop }: { stop: StopDocumentType }) => {
  const [isEditing, setIsEditing] = useState(false);
  const database = useDatabase();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StopFormData>({
    resolver: zodResolver(stopSchema),
    defaultValues: { name: stop.name, date: stop.date },
  });

  const onSubmit = async (data: StopFormData) => {
    await stop.patch({
      name: data.name,
      date: data.date,
      updatedAt: Date.now(),
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    // Delete related accommodations and transports first
    const accoms = await database.accommodations
      .find({ selector: { stopId: stop.id } })
      .exec();
    const trans = await database.transports
      .find({ selector: { stopId: stop.id } })
      .exec();

    for (const accom of accoms) {
      await accom.remove();
    }
    for (const transport of trans) {
      await transport.remove();
    }

    await stop.remove();
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="stop-name">Stop Name</Label>
              <Input
                id="stop-name"
                {...register("name")}
                type="text"
                autoFocus
                placeholder="Stop name"
                className="text-xl font-semibold"
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stop-date">Date</Label>
              <Input id="stop-date" {...register("date")} type="date" />
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
    <Card className="relative w-full">
      <CardContent className="px-4">
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          aria-label="Delete stop"
        >
          ✕
        </Button>
        <Button
          onClick={() => setIsEditing(true)}
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-10"
          aria-label="Edit stop"
        >
          ✎
        </Button>
        <h3 className="text-xl font-semibold">{stop.name}</h3>
        <p className="text-muted-foreground mt-2">
          {new Date(stop.date).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};
