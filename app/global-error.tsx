"use client"; // Error boundaries must be Client Components

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
    },
    de: {
      title: "Etwas ist schiefgelaufen!",
      tryAgain: "Erneut versuchen",
    },
  } as const;

  const t = messages[locale];

  return (
    // global-error must include html and body tags
    <html>
      <body>
        <h2>{t.title}</h2>
        <button onClick={() => reset()}>{t.tryAgain}</button>
      </body>
    </html>
  );
}
