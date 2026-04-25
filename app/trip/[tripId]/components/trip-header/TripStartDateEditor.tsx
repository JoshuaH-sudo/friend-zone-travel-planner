"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateShort } from "@/lib/format";
import { Calendar, Pencil } from "lucide-react";

type TripStartDateEditorProps = {
  currentStartDate: string | null;
  displayStartDate: string | null;
  rangeEndDate: string | null;
  canAdjustAllDates: boolean;
  onSaveStartDate: (
    newStartDate: string,
    adjustAllDates: boolean,
  ) => Promise<void>;
};

export function TripStartDateEditor({
  currentStartDate,
  displayStartDate,
  rangeEndDate,
  canAdjustAllDates,
  onSaveStartDate,
}: TripStartDateEditorProps) {
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [startDateDraft, setStartDateDraft] = useState("");
  const [adjustDatesDialogOpen, setAdjustDatesDialogOpen] = useState(false);
  const [pendingStartDate, setPendingStartDate] = useState<string | null>(null);
  const startDateInputRef = useRef<HTMLInputElement | null>(null);

  const beginEditingStartDate = () => {
    setStartDateDraft(
      currentStartDate ?? new Date().toISOString().slice(0, 10),
    );
    setIsEditingStartDate(true);
    setTimeout(() => startDateInputRef.current?.focus(), 50);
  };

  const handleStartDateSave = async () => {
    if (!startDateDraft) {
      setIsEditingStartDate(false);
      return;
    }

    if (!currentStartDate || !canAdjustAllDates) {
      await onSaveStartDate(startDateDraft, false);
      setIsEditingStartDate(false);
      return;
    }

    if (currentStartDate === startDateDraft) {
      setIsEditingStartDate(false);
      return;
    }

    setPendingStartDate(startDateDraft);
    setAdjustDatesDialogOpen(true);
    setIsEditingStartDate(false);
  };

  return (
    <>
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="h-4 w-4" />
        {isEditingStartDate ? (
          <form
            className="inline-flex items-center gap-1"
            onSubmit={async (e) => {
              e.preventDefault();
              await handleStartDateSave();
            }}
          >
            <input
              ref={startDateInputRef}
              type="date"
              value={startDateDraft}
              onChange={(e) => setStartDateDraft(e.target.value)}
              className="bg-background/20 text-foreground rounded px-1 py-0.5 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="text-foreground/80 h-6 px-1 text-xs"
            >
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-foreground/60 h-6 px-1 text-xs"
              onClick={() => setIsEditingStartDate(false)}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <button
            type="button"
            className="hover:text-primary-foreground inline-flex items-center gap-1 text-left"
            onClick={beginEditingStartDate}
            title="Set start date to move the entire trip"
          >
            {displayStartDate
              ? `${formatDateShort(displayStartDate)}${rangeEndDate && rangeEndDate !== displayStartDate ? ` – ${formatDateShort(rangeEndDate)}` : ""}`
              : "Set start date"}
            <Pencil className="h-3 w-3 opacity-60" />
          </button>
        )}
      </span>

      <AlertDialog
        open={adjustDatesDialogOpen}
        onOpenChange={(open) => {
          setAdjustDatesDialogOpen(open);
          if (!open) {
            setPendingStartDate(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adjust all item dates?</AlertDialogTitle>
            <AlertDialogDescription>
              You changed the trip start date. Do you want to shift all
              accommodation, transport, and expense dates to keep the same
              relative schedule?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingStartDate(null);
                setIsEditingStartDate(true);
                setAdjustDatesDialogOpen(false);
                setTimeout(() => startDateInputRef.current?.focus(), 50);
              }}
            >
              Go back
            </AlertDialogCancel>
            <AlertDialogAction
              variant="secondary"
              onClick={async () => {
                if (!pendingStartDate) return;
                await onSaveStartDate(pendingStartDate, false);
                setPendingStartDate(null);
                setAdjustDatesDialogOpen(false);
              }}
            >
              Only update trip
            </AlertDialogAction>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingStartDate) return;
                await onSaveStartDate(pendingStartDate, true);
                setPendingStartDate(null);
                setAdjustDatesDialogOpen(false);
              }}
            >
              Update all items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
