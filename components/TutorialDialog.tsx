"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Compass, Plus, MapPin, Building2, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TUTORIAL_SEEN_KEY = "fzt-tutorial-seen";

type Step = {
  icon: LucideIcon;
  titleKey:
    | "steps.welcome.title"
    | "steps.createTrip.title"
    | "steps.addStops.title"
    | "steps.addDetails.title"
    | "steps.privacy.title";
  descKey:
    | "steps.welcome.description"
    | "steps.createTrip.description"
    | "steps.addStops.description"
    | "steps.addDetails.description"
    | "steps.privacy.description";
};

const STEPS: Step[] = [
  {
    icon: Compass,
    titleKey: "steps.welcome.title",
    descKey: "steps.welcome.description",
  },
  {
    icon: Plus,
    titleKey: "steps.createTrip.title",
    descKey: "steps.createTrip.description",
  },
  {
    icon: MapPin,
    titleKey: "steps.addStops.title",
    descKey: "steps.addStops.description",
  },
  {
    icon: Building2,
    titleKey: "steps.addDetails.title",
    descKey: "steps.addDetails.description",
  },
  {
    icon: Lock,
    titleKey: "steps.privacy.title",
    descKey: "steps.privacy.description",
  },
];

export function TutorialDialog() {
  const t = useTranslations("tutorial");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(TUTORIAL_SEEN_KEY)) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, "true");
    setOpen(false);
  };

  const isLast = step === STEPS.length - 1;
  const { icon: StepIcon, titleKey, descKey } = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) dismiss(); }}>
      <DialogContent>
        <div className="flex justify-center">
          <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full p-4">
            <StepIcon className="size-8" />
          </div>
        </div>
        <DialogHeader className="text-center">
          <DialogTitle>{t(titleKey)}</DialogTitle>
          <DialogDescription>{t(descKey)}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-1.5 py-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === step ? "bg-primary w-4" : "bg-muted-foreground/30 w-1.5",
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              {t("back")}
            </Button>
          ) : (
            <Button variant="ghost" onClick={dismiss}>
              {t("skip")}
            </Button>
          )}
          <Button onClick={isLast ? dismiss : () => setStep((s) => s + 1)}>
            {isLast ? t("getStarted") : t("next")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
