"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { TransportDocumentType } from "@/lib/rxdb-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useTime from "@/components/hooks/useTime";
import { formatMoney } from "@/lib/format";
import { formatStoredDateTime } from "@/lib/datetime-utils";
import {
  AlertTriangle,
  Bus,
  Car,
  Pencil,
  Plane,
  Train,
  Trash2,
} from "lucide-react";
import { TransportForm } from "./TransportForm";
import { formatDate } from "date-fns";

export const Transport = ({
  transport,
  startInEditMode = false,
  warningSummary,
  highlightedDates = [],
}: {
  transport: TransportDocumentType;
  startInEditMode?: boolean;
  warningSummary?: string;
  highlightedDates?: string[];
}) => {
  const t = useTranslations("transport");
  const time = useTime();
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
    type: "flight" | "bus" | "car" | "train";
    price: number;
    currency: string;
    departureDateTime: string;
    arrivalDateTime?: string;
    timezone?: string;
  }) => {
    await transport.patch({
      name: data.name,
      type: data.type,
      price: data.price,
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
  const formatDateTime = formatStoredDateTime;

  if (isEditing) {
    return (
      <Card>
        <CardContent className="px-4">
          <TransportForm
            initialValues={{
              name,
              type,
              price,
              currency,
              departureDateTime,
              arrivalDateTime: arrivalDateTime ?? "",
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
    <div className="border-border/50 bg-card flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
      {type === "flight" && <Plane className="text-primary h-5 w-5 shrink-0" />}
      {type === "bus" && <Bus className="text-primary h-5 w-5 shrink-0" />}
      {type === "car" && <Car className="text-primary h-5 w-5 shrink-0" />}
      {type === "train" && <Train className="text-primary h-5 w-5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate font-medium">{name}</p>
        <p className="text-muted-foreground text-xs capitalize">
          {t(`type.${type}`)} · {formatDate(new Date(departureDateTime), "LLLL p")}
        </p>
        {arrivalDateTime && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t("arrivalDisplay", { value: formatDate(new Date(arrivalDateTime), "LLLL p") })}
          </p>
        )}
        {timezone && (
          <p className="text-muted-foreground mt-0.5 text-xs">
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
        <span className="text-foreground mr-1 text-sm font-medium">
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
          className="text-muted-foreground hover:text-foreground h-7 w-7"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label={t("deleteAriaLabel")}
          className="text-muted-foreground hover:text-destructive h-7 w-7"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
