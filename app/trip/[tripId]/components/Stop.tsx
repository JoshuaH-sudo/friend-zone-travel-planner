"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StopDocumentType } from "@/lib/rxdb-schema";
import { useDatabase } from "@/lib/DatabaseProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { TripItemCard } from "@/app/trip/[tripId]/components/TripItemCard";
import useTime from "@/components/hooks/useTime";

type StopProps = {
  stop: StopDocumentType;
  startInEditMode?: boolean;
  dateRangeSummary?: string;
};

export const Stop = ({
  stop,
  startInEditMode = false,
  dateRangeSummary,
}: StopProps) => {
  const t = useTranslations("stop");
  const time = useTime();
  const [isEditing, setIsEditing] = useState(false);
  const [highlightNameInput, setHighlightNameInput] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const database = useDatabase();

  const stopSchema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, t("errors.nameRequired"))
          .max(100, t("errors.nameTooLong")),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, t("errors.invalidDateFormat")),
      }),
    [t],
  );
  type StopFormData = z.infer<typeof stopSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StopFormData>({
    resolver: zodResolver(stopSchema),
    defaultValues: { name: stop.name, date: stop.date },
  });
  const nameRegistration = register("name");

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

  const onSubmit = async (data: StopFormData) => {
    await stop.patch({
      name: data.name,
      date: data.date,
      updatedAt: time.getUTCDate(),
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
      <Card className="w-full">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="stop-name">{t("nameLabel")}</Label>
              <Input
                id={`stop-name-${stop.id}`}
                {...nameRegistration}
                ref={(element) => {
                  nameRegistration.ref(element);
                  nameInputRef.current = element;
                }}
                type="text"
                autoFocus
                placeholder={t("namePlaceholder")}
                className={`text-xl font-semibold ${
                  highlightNameInput ? "ring-primary/40 ring-2" : ""
                }`}
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
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
      className="w-full"
      title={
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold">{stop.name}</h3>
          {dateRangeSummary && (
            <span className="text-muted-foreground text-sm">
              {dateRangeSummary}
            </span>
          )}
        </div>
      }
    >
    </TripItemCard>
  );
};
