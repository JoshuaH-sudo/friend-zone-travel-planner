"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  AccommodationDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Check, Cross, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { format as formatDate, parseISO, isEqual, differenceInDays, differenceInYears, differenceInMonths } from "date-fns";
import { useState, useRef } from "react";

type SortableStopCardProps = {
  index: number;
  stop: StopDocumentType;
  accommodations: AccommodationDocumentType[];
  transports: TransportDocumentType[];
  children: React.ReactNode;
  onEditStopName: (newName: string) => Promise<void>;
  onDeleteStop: () => Promise<void>;
};

export function SortableStopCard({
  index,
  stop,
  accommodations,
  transports,
  children,
  onEditStopName,
  onDeleteStop,
}: SortableStopCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stop.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  //Earliest date from all items in the stop, used for calculating the date range summary
  const dates = [
    ...accommodations.map((a) => a.checkIn),
    ...accommodations.map((a) => a.checkOut),
    ...transports.map((t) => t.departureDateTime),
    ...transports.map((t) => t.arrivalDateTime),
  ];
  let earliestDate: string | null = null;
  let latestDate: string | null = null;
  dates.forEach((date) => {
    if (!date) return;
    if (!earliestDate || date < earliestDate) earliestDate = date;
    if (!latestDate || date > latestDate) latestDate = date;
  });
  let dateRangeSummary = "";
  if (earliestDate && latestDate) {
    const start = parseISO(earliestDate);
    const end = parseISO(latestDate);
    if (isEqual(start, end)) {
      dateRangeSummary = formatDate(start, "MMM d, yyyy");
    } else if (differenceInMonths(end, start) < 1) {
      dateRangeSummary =
        formatDate(start, "MMM d") + " - " + formatDate(end, "d");
    } else if (differenceInYears(end, start) >= 1) {
      dateRangeSummary =
        formatDate(start, "MMM d, yyyy") + " - " + formatDate(end, "MMM d, yyyy");
    } else {
      dateRangeSummary =
        formatDate(start, "MMM d") + " - " + formatDate(end, "MMM d");
    }
  }

  // Edit stop name handlers
  const handleEditClick = () => {
    setEditDraft(stop.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  const handleEditSave = async () => {
    if (!editDraft.trim() || !onEditStopName) return;
    await onEditStopName(editDraft.trim());
    setIsEditing(false);
  };
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditDraft("");
  };

  // Delete stop handlers
  const handleDeleteClick = () => setShowDeleteDialog(true);
  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    if (onDeleteStop) await onDeleteStop();
  };

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-2xl pb-0 shadow-md"
    >
      <CardHeader className="flex flex-row items-center gap-1 pb-4">
        <div className="flex w-full flex-row items-start gap-2">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground mt-1 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${stop.name}`}
          >
            <GripVertical />
          </button>
          <div className="bg-primary-muted text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif font-semibold">
            {index}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {isEditing ? (
              <form className="flex items-center gap-2">
                <Label htmlFor={`stop-edit-${stop.id}`} className="sr-only">
                  Edit stop name
                </Label>
                <Input
                  id={`stop-edit-${stop.id}`}
                  ref={inputRef}
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  className="h-8 px-2 py-1 font-serif text-2xl"
                  maxLength={100}
                  autoFocus
                />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-primary"
                  aria-label="Save stop name"
                  disabled={!editDraft.trim()}
                  onClick={handleEditSave}
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="text-destructive"
                  aria-label="Cancel edit"
                  onClick={handleEditCancel}
                >
                  <X className="size-4" />
                </Button>
              </form>
            ) : (
              <>
                <CardTitle className="truncate font-serif text-2xl">
                  {capitalize(stop.name)}
                </CardTitle>
                <p className="text-muted-foreground truncate text-sm">
                  {dateRangeSummary}
                </p>
              </>
            )}
          </div>
          {!isEditing && (
            <div className="ml-2 flex gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="text-primary"
                aria-label="Edit stop name"
                onClick={handleEditClick}
              >
                <Pencil className="size-4" />
              </Button>
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogTrigger>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive"
                    aria-label="Delete stop"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete stop?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this stop and all related
                      items. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteConfirm}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="bg-secondary/30 space-y-3 border-t px-4 py-3 sm:px-5">
        {children}
      </CardContent>
    </Card>
  );
}
