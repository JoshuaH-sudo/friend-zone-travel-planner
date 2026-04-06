"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch - intentional for theme switching
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex w-full items-center justify-between gap-2 border-b bg-white px-6 py-4 dark:bg-black">
      <div className="flex items-center gap-2">
        <Link
          id="back"
          className="rounded-md bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
          style={{
            visibility: pathname === "/" ? "hidden" : "visible",
          }}
          href=".."
        >
          {`<`}
        </Link>
        <h1 className="text-xl font-bold">Friend Zone Travel Planner</h1>
      </div>
      {mounted && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </Button>
          <Link
            href="/settings"
            aria-label="Settings"
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
          >
            <HugeiconsIcon icon={Settings02Icon} size={20} strokeWidth={2} />
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
