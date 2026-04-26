import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Smartphone, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Support | Friend Zone Travel Planner",
  description:
    "Get help with Friend Zone Travel Planner, including troubleshooting, data export, and privacy details.",
};

const faq = [
  {
    question: "How do I back up my trip data?",
    answer:
      "Open Settings and choose Export App Data. This saves a backup file that you can store safely and import later.",
  },
  {
    question: "Can I restore my data on a new device?",
    answer:
      "Yes. Install the app on the new device, open Settings, and use Import App Data with your exported backup file.",
  },
  {
    question: "My totals look different than expected. Why?",
    answer:
      "Trip totals are estimates when multiple currencies are used. They depend on exchange rates available at the time of calculation.",
  },
  {
    question: "How is my data stored?",
    answer:
      "Your trip data is stored locally on your device. No account is required, and the app does not sync your trips to a cloud service.",
  },
];

export default function SupportPage() {
  return (
    <div className="container flex flex-col gap-8 py-8 sm:py-12">
      <section className="from-primary/95 to-accent/90 shadow-elegant relative overflow-hidden rounded-3xl bg-linear-to-br p-8 text-white sm:p-10">
        <div className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-24 size-56 rounded-full bg-black/10 blur-3xl" />
        <div className="relative flex flex-col gap-4">
          <Badge className="w-fit border-white/40 bg-white/10 text-white">
            App Support
          </Badge>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Friend Zone Travel Planner Support
          </h1>
          <p className="max-w-2xl text-sm text-white/90 sm:text-base">
            Need help planning trips, restoring a backup, or reporting a bug?
            Use the contact details below and include your app version, device
            model, and iOS version so we can help quickly.
          </p>
          <p className="text-xs text-white/80">Last updated: 26 April 2026</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-soft rounded-2xl border">
          <CardHeader className="flex flex-row items-center gap-3">
            <Wrench className="text-primary" />
            <CardTitle>Quick Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Force close and reopen the app.</p>
            <p>2. Ensure your device has enough free storage.</p>
            <p>3. Update to the latest app version in the app store.</p>
            <p>
              4. If a problem continues, contact support with reproduction steps.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-soft rounded-2xl border">
          <CardHeader className="flex flex-row items-center gap-3">
            <ShieldCheck className="text-primary" />
            <CardTitle>Privacy and Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Your trip data remains on your device by default.</p>
            <p>
              Backups are created manually by you from the Settings page using
              Export App Data.
            </p>
            <p>
              You can manage analytics and cookie preferences from Settings at
              any time.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft rounded-2xl border">
          <CardHeader className="flex flex-row items-center gap-3">
            <Smartphone className="text-primary" />
            <CardTitle>Compatibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Friend Zone Travel Planner is designed for modern devices.</p>
            <p>
              For the best experience, keep the OS and app updated to the
              latest available versions.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl font-semibold">Frequently Asked Questions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {faq.map((item) => (
            <Card key={item.question} className="rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-border bg-muted/40 rounded-2xl border p-6 text-sm">
        <p className="text-muted-foreground">
          Looking for app settings, backup, or data controls?
          <span> </span>
          <Link href="/settings" className="text-primary font-medium underline-offset-2 hover:underline">
            Open Settings
          </Link>
          .
        </p>
      </section>
    </div>
  );
}