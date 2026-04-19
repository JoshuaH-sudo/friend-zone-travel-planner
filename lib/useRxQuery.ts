"use client";

import { useEffect, useState } from "react";

type QueryDocument = { toJSON: () => unknown };
type QueryLike = {
  $: {
    subscribe: (
      handler: (docs: QueryDocument[]) => void,
    ) => {
      unsubscribe: () => void;
    };
  };
};

export function useRxQuery<T>(query: QueryLike | null | undefined): T[] {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    if (!query) return;

    const subscription = query.$.subscribe((docs) => {
      setData(docs.map((doc) => doc.toJSON() as T));
    });

    return () => subscription.unsubscribe();
  }, [query]);

  return data;
}
