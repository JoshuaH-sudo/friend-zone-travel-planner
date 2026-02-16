"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Edit03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type TripItemCardProps = {
  title: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
  children?: React.ReactNode;
};

export const TripItemCard = ({
  title,
  onEdit,
  onDelete,
  editLabel = "Edit item",
  deleteLabel = "Delete item",
  className,
  children,
}: TripItemCardProps) => {
  return (
    <Card className={cn("relative", className)}>
      <CardContent className="px-4">
        <Button
          onClick={onDelete}
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          aria-label={deleteLabel}
        >
          <HugeiconsIcon icon={Cancel01Icon} />
        </Button>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-10"
          aria-label={editLabel}
        >
          <HugeiconsIcon icon={Edit03Icon} />
        </Button>
        {title}
        {children}
      </CardContent>
    </Card>
  );
};
