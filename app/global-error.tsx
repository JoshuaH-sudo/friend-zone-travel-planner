"use client"; // Error boundaries must be Client Components

import { useState } from "react";
import { deleteDatabaseData } from "@/lib/rxdb-database";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale =
    typeof window !== "undefined"
      ? navigator.language.toLowerCase().startsWith("de")
        ? "de"
        : "en"
      : "en";

  const messages = {
    en: {
      title: "Something went wrong!",
      tryAgain: "Try again",
      clearData: "Clear local data",
      clearing: "Clearing...",
    },
    de: {
      title: "Etwas ist schiefgelaufen!",
      tryAgain: "Erneut versuchen",
      clearData: "Lokale Daten löschen",
      clearing: "Löschen...",
    },
  } as const;

  const t = messages[locale];
  const [clearing, setClearing] = useState(false);

  return (
    // global-error must include html and body tags
    <html>
      <body>
        <h2>{t.title}</h2>
        <button onClick={() => reset()}>{t.tryAgain}</button>
        <button
          onClick={async () => {
            setClearing(true);
            await deleteDatabaseData();
            window.location.reload();
          }}
          disabled={clearing}
        >
          {clearing ? t.clearing : t.clearData}
        </button>
      </body>
    </html>
  );
}
