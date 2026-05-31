"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { geocodeLocation } from "@/lib/enrichment/geocode";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type LocationPickerProps = {
  initialValue: string;
  onResolved: (payload: {
    name: string;
    latitude?: number;
    longitude?: number;
    countryCode?: string;
  }) => Promise<void>;
};

export function LocationPicker({
  initialValue,
  onResolved,
}: LocationPickerProps) {
  const t = useTranslations("routeEditor");
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const resolveLocation = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const geo = await geocodeLocation(trimmed);
      await onResolved({
        name: trimmed,
        latitude: geo?.latitude,
        longitude: geo?.longitude,
        countryCode: geo?.countryCode,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("locationResolveFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("locationPlaceholder")}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={resolveLocation}
        disabled={loading}
      >
        {loading ? t("loading") : t("saveLocation")}
      </Button>
    </div>
  );
}
