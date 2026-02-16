"use client";

import * as React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
        <div className="flex justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex">
            <Button
              onClick={onEdit}
              variant="ghost"
              size="icon-sm"
              className="bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary"
              aria-label={editLabel}
            >
              <HugeiconsIcon icon={Edit03Icon} />
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="icon-sm"
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 focus-visible:border-destructive/40"
              aria-label={deleteLabel}
            >
              <HugeiconsIcon icon={Cancel01Icon} />
            </Button>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
