"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Compass, Plus, MapPin, Building2, Lock, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/SettingsProvider";
import { dateFormats, DateFormat } from "@/lib/rxdb-schema";

const TUTORIAL_SEEN_KEY = "fzt-tutorial-seen";

type InfoStep = {
  kind: "info";
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

type SetupStep = {
  kind: "setup";
  icon: LucideIcon;
};

type Step = InfoStep | SetupStep;

const STEPS: Step[] = [
  {
    kind: "info",
    icon: Compass,
    titleKey: "steps.welcome.title",
    descKey: "steps.welcome.description",
  },
  {
    kind: "info",
    icon: Plus,
    titleKey: "steps.createTrip.title",
    descKey: "steps.createTrip.description",
  },
  {
    kind: "info",
    icon: MapPin,
    titleKey: "steps.addStops.title",
    descKey: "steps.addStops.description",
  },
  {
    kind: "info",
    icon: Building2,
    titleKey: "steps.addDetails.title",
    descKey: "steps.addDetails.description",
  },
  {
    kind: "info",
    icon: Lock,
    titleKey: "steps.privacy.title",
    descKey: "steps.privacy.description",
  },
  {
    kind: "setup",
    icon: Settings2,
  },
];

export function TutorialDialog() {
  const t = useTranslations("tutorial");
  const { theme, setTheme } = useTheme();
  const {
    defaultCurrency,
    setDefaultCurrency,
    dateFormat,
    setDateFormat,
    analyticsConsent,
    setAnalyticsConsent,
    cookiesConsent,
    setCookiesConsent,
  } = useSettings();
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
  const currentStep = STEPS[step];
  const { icon: StepIcon } = currentStep;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) dismiss(); }}>
      <DialogContent>
        <div className="flex justify-center">
          <div className="bg-primary/10 text-primary flex items-center justify-center rounded-full p-4">
            <StepIcon className="size-8" />
          </div>
        </div>

        {currentStep.kind === "info" ? (
          <DialogHeader className="text-center">
            <DialogTitle>{t(currentStep.titleKey)}</DialogTitle>
            <DialogDescription>{t(currentStep.descKey)}</DialogDescription>
          </DialogHeader>
        ) : (
          <DialogHeader className="text-center">
            <DialogTitle>{t("steps.setup.title")}</DialogTitle>
            <DialogDescription>{t("steps.setup.description")}</DialogDescription>
          </DialogHeader>
        )}

        {currentStep.kind === "setup" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{t("steps.setup.currency")}</span>
              <CurrencySelect
                name="tutorialCurrency"
                value={defaultCurrency}
                onValueChange={(v) => { if (v) setDefaultCurrency(v); }}
                currencies="all"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{t("steps.setup.theme")}</span>
              <Select value={theme} onValueChange={(v) => v && setTheme(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">{t("steps.setup.themeSystem")}</SelectItem>
                  <SelectItem value="light">{t("steps.setup.themeLight")}</SelectItem>
                  <SelectItem value="dark">{t("steps.setup.themeDark")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{t("steps.setup.dateFormat")}</span>
              <Select
                value={dateFormat}
                onValueChange={(v) => v && setDateFormat(v as DateFormat)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-3 flex flex-col gap-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="accent-primary mt-0.5 size-4 shrink-0 cursor-pointer"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium leading-none">
                    {t("steps.setup.analyticsConsent")}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {t("steps.setup.analyticsConsentDescription")}
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="accent-primary mt-0.5 size-4 shrink-0 cursor-pointer"
                  checked={cookiesConsent}
                  onChange={(e) => setCookiesConsent(e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium leading-none">
                    {t("steps.setup.cookiesConsent")}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {t("steps.setup.cookiesConsentDescription")}
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

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
