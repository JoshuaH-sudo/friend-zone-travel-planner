"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

type EditableTextProps = {
  value: string;
  onSave: (nextValue: string) => Promise<void> | void;
  className?: string;
};

export function EditableText({ value, onSave, className }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={className}
        title="Click to edit"
      >
        {value}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={async () => {
        const nextValue = draft.trim() || value;
        if (nextValue !== value) {
          await onSave(nextValue);
        }
        setIsEditing(false);
      }}
      onKeyDown={async (event) => {
        if (event.key === "Escape") {
          setDraft(value);
          setIsEditing(false);
        }
        if (event.key === "Enter") {
          const nextValue = draft.trim() || value;
          if (nextValue !== value) {
            await onSave(nextValue);
          }
          setIsEditing(false);
        }
      }}
      className={className}
    />
  );
}
