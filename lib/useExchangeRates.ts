"use client";

import { useEffect, useState } from "react";
import { STATIC_RATES } from "./format";

const FRANKFURTER_API = "https://api.frankfurter.dev/v1/latest?base=USD";
const CACHE_KEY = "fx_rates_cache";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

type CacheEntry = {
  rates: Record<string, number>;
  fetchedAt: number;
};

function loadCache(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

function saveCache(rates: Record<string, number>) {
  try {
    const entry: CacheEntry = { rates, fetchedAt: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Fetches live exchange rates from the Frankfurter API (base = USD).
 * Falls back to the bundled STATIC_RATES if the fetch fails.
 * Caches results in sessionStorage for 6 hours.
 */
export function useExchangeRates(): {
  rates: Record<string, number>;
  isLive: boolean;
} {
  const [rates, setRates] = useState<Record<string, number>>(STATIC_RATES);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setRates({ USD: 1, ...cached.rates });
      setIsLive(true);
      return;
    }

    let cancelled = false;
    fetch(FRANKFURTER_API)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ rates: Record<string, number> }>;
      })
      .then((data) => {
        if (cancelled) return;
        const liveRates = { USD: 1, ...data.rates };
        saveCache(data.rates);
        setRates(liveRates);
        setIsLive(true);
      })
      .catch(() => {
        // Fall back to static rates silently
        if (!cancelled) {
          setIsLive(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { rates, isLive };
}
