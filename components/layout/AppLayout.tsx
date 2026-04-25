"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const tHeader = useTranslations("header");
  const tLayout = useTranslations("layout");

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-background/90 border-border sticky top-0 z-50 border-b backdrop-blur">
        <div className="container flex w-full items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt={tHeader("logoAlt")}
                className="h-10 w-10 antialiased"
              /> 
            <span className="text-foreground text-lg font-semibold">
              Friend Zone <em className="font-serif">travel</em>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className={cn(
                "hover:bg-secondary rounded-lg px-3 py-2 text-sm",
                pathname === "/" ? "bg-secondary text-foreground" : "text-muted-foreground",
              )}
            >
              {tHeader("trips")}
            </Link>
            <Link
              href="/settings"
              className={cn(
                "hover:bg-secondary rounded-lg px-3 py-2 text-sm",
                pathname.startsWith("/settings")
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {tHeader("settings")}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full flex-1">{children}</main>
      <footer className="border-t mt-12">
        <div className="container py-6 text-xs text-muted-foreground text-center">
          {tLayout("dataPrivacy")}
        </div>
      </footer>
    </div>
  );
}
