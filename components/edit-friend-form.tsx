"use client";

import type React from "react";

import { useState } from "react";
import type { Friend } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "./color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";

interface EditFriendFormProps {
  friend: Friend;
  onSave: (updatedFriend: Friend) => void;
  onCancel: () => void;
}

export function EditFriendForm({
  friend,
  onSave,
  onCancel,
}: EditFriendFormProps) {
  const t = useTranslations();
  const [name, setName] = useState(friend.name);
  const [color, setColor] = useState(friend.color);
  const [timezone, setTimezone] = useState(friend.timezone);

  // Common timezones
  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        ...friend,
        name: name.trim(),
        color,
        timezone,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="friend-name">{t("friend.name")}</Label>
        <Input
          id="friend-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("friend.namePlaceholder")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{t("friend.color")}</Label>
        <ColorPicker color={color} onChange={setColor} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="timezone">{t("friend.timezone")}</Label>
        </div>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger id="timezone">
            <SelectValue placeholder={t("friend.timezone")} />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {t("actions.save")}
        </Button>
      </div>
    </form>
  );
}
