"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Pencil } from "lucide-react";
import { TRIP_START_LOCATION_MAX_LENGTH } from "@/lib/rxdb-schema";

type TripStartLocationEditorProps = {
  currentStartLocation: string | null;
  onSaveStartLocation: (newStartLocation: string | null) => Promise<void>;
};

export function TripStartLocationEditor({
  currentStartLocation,
  onSaveStartLocation,
}: TripStartLocationEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const beginEditing = () => {
    setDraft(currentStartLocation ?? "");
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSave = async () => {
    const trimmed = draft.trim();
    await onSaveStartLocation(trimmed || null);
    setIsEditing(false);
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <MapPin className="h-4 w-4" />
      {isEditing ? (
        <form
          className="inline-flex items-center gap-1"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSave();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="bg-background/20 text-foreground rounded px-1 py-0.5 text-sm"
            maxLength={TRIP_START_LOCATION_MAX_LENGTH}
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
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <button
          type="button"
          className="hover:text-primary-foreground inline-flex items-center gap-1 text-left"
          onClick={beginEditing}
          title="Set start location"
        >
          {currentStartLocation ?? "Set start location"}
          <Pencil className="h-3 w-3 opacity-60" />
        </button>
      )}
    </span>
  );
}
