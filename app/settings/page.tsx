"use client";

import { useTheme } from "next-themes";
import { CurrencySelect } from "@/components/ui/currency-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/lib/SettingsProvider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { defaultCurrency, setDefaultCurrency, language, setLanguage } =
    useSettings();

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Settings</h2>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-muted-foreground">General</h3>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Default Currency</p>
              <p className="text-muted-foreground text-sm">
                The default currency used when creating new trip items.
              </p>
            </div>
            <CurrencySelect
              name="defaultCurrency"
              value={defaultCurrency}
              onValueChange={(value) => {
                if (value) setDefaultCurrency(value);
              }}
              currencies="custom"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-muted-foreground text-sm">
                Choose your preferred color scheme.
              </p>
            </div>
            <Select value={theme} onValueChange={(v) => v && setTheme(v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Language</p>
              <p className="text-muted-foreground text-sm">
                The language used throughout the app.
              </p>
            </div>
            <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
    </div>
  );
}
