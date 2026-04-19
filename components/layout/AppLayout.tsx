"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-background/90 border-border sticky top-0 z-50 border-b backdrop-blur">
        <div className="container flex w-full items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="gradient-hero text-primary-foreground inline-flex size-9 items-center justify-center rounded-xl">
              <Compass />
            </span>
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
              Trips
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
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full flex-1">{children}</main>
      <footer className="border-t mt-12">
        <div className="container py-6 text-xs text-muted-foreground text-center">
          Your data lives only on this device. No account, no cloud.
        </div>
      </footer>
    </div>
  );
}
