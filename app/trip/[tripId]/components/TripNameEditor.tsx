"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pencil } from "lucide-react";
import {
  Cancel01Icon,
  Tick02Icon,
  CalendarDownload01Icon,
} from "@hugeicons/core-free-icons";

type TripNameEditorProps = {
  tripName: string;
  onSave: (newName: string) => Promise<void>;
  onExport: () => Promise<void>;
};

export function TripNameEditor({
  tripName,
  onSave,
  onExport,
}: TripNameEditorProps) {
  const t = useTranslations("tripNameEditor");
  const [isEditingTripName, setIsEditingTripName] = useState(false);
  const [tripNameDraft, setTripNameDraft] = useState("");

  const startEditingTripName = () => {
    setTripNameDraft(tripName);
    setIsEditingTripName(true);
  };

  const saveTripName = async () => {
    const trimmedName = tripNameDraft.trim();
    if (!trimmedName) return;

    await onSave(trimmedName);
    setIsEditingTripName(false);
  };

  const cancelTripNameEdit = () => {
    setTripNameDraft(tripName);
    setIsEditingTripName(false);
  };

  if (isEditingTripName) {
    return (
      <form
        className="flex w-full items-center gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          await saveTripName();
        }}
      >
        <Input
          type="text"
          value={tripNameDraft}
          onChange={(event) => setTripNameDraft(event.target.value)}
          autoFocus
          className="w-full text-3xl font-bold tracking-tight sm:text-[5rem]"
        />
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            className="bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary"
            aria-label={t("saveAriaLabel")}
            disabled={!tripNameDraft.trim()}
          >
            <HugeiconsIcon icon={Tick02Icon} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 focus-visible:border-destructive/40"
            aria-label={t("cancelAriaLabel")}
            onClick={cancelTripNameEdit}
          >
            <HugeiconsIcon icon={Cancel01Icon} />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="group flex min-w-0 items-center">
        <h5
          className="cursor-pointer text-xl font-bold tracking-tight text-gray-900 hover:text-blue-600 sm:text-[5rem] dark:text-white dark:hover:text-blue-400"
          onClick={startEditingTripName}
        >
          {tripName}
        </h5>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary ml-2 shrink-0 translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100"
          aria-label={t("editAriaLabel")}
          onClick={startEditingTripName}
        >
          <Pencil className="size-4" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary shrink-0"
        aria-label={t("exportAriaLabel")}
        onClick={onExport}
      >
        <HugeiconsIcon icon={CalendarDownload01Icon} />
      </Button>
    </div>
  );
}
