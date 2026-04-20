"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AccommodationDocumentType } from "@/lib/rxdb-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useTime from "@/components/hooks/useTime";
import { formatMoney } from "@/lib/format";
import { formatStoredDateTime } from "@/lib/datetime-utils";
import { useSettings } from "@/lib/SettingsProvider";
import { AlertTriangle, Bed, Pencil, Trash2 } from "lucide-react";
import { AccommodationForm } from "./AccommodationForm";

export const Accommodation = ({
  accommodation,
  startInEditMode = false,
  warningSummary,
  highlightedDates = [],
}: {
  accommodation: AccommodationDocumentType;
  startInEditMode?: boolean;
  warningSummary?: string;
  highlightedDates?: string[];
}) => {
  const t = useTranslations("accommodation");
  const time = useTime();
  const { dateFormat } = useSettings();
  const { name, price, currency, checkIn, checkOut, timezone } = accommodation;
  const [isEditing, setIsEditing] = useState(false);
  const [highlightNameInput, setHighlightNameInput] = useState(false);
  const didAutofocusRef = useRef(false);

  useEffect(() => {
    if (!startInEditMode) return;

    setIsEditing(true);
    setHighlightNameInput(true);
    didAutofocusRef.current = true;

    const timeout = setTimeout(() => {
      setHighlightNameInput(false);
    }, 1400);

    return () => clearTimeout(timeout);
  }, [startInEditMode]);

  const onSubmit = async (data: {
    name: string;
    price: number;
    currency: string;
    checkIn: string;
    checkOut: string;
    timezone?: string;
  }) => {
    await accommodation.patch({
      name: data.name,
      price: data.price,
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
  const formatDateTime = (dt: string) => formatStoredDateTime(dt, dateFormat);

  if (isEditing) {
    return (
      <Card>
        <CardContent className="px-4">
          <AccommodationForm
            initialValues={{
              name,
              price,
              currency,
              checkIn,
              checkOut,
              timezone,
            }}
            onSubmit={onSubmit}
            onCancel={() => setIsEditing(false)}
            submitLabel={t("save")}
            cancelLabel={t("cancel")}
            warningSummary={warningSummary}
            highlightedDates={highlightedDates}
            autoFocusName={didAutofocusRef.current}
            highlightNameInput={highlightNameInput}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-border/50 bg-card px-3 py-2 text-sm">
      <Bed className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(checkIn)}{" → "}{formatDateTime(checkOut)}
        </p>
        {timezone && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("timezoneDisplay", { value: timezone })}
          </p>
        )}
        {warningSummary && (
          <p className="text-destructive mt-1 flex items-center gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {warningSummary}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-1 text-sm font-medium text-foreground">
          {formatMoney(price, currency)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            didAutofocusRef.current = true;
            setIsEditing(true);
          }}
          aria-label={t("editAriaLabel")}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label={t("deleteAriaLabel")}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
