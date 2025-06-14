'use client';

import type React from 'react';
import '@/app/globals.css';
import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
} from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingArea />
      <main className='max-w-8xl container mx-auto p-4 sm:h-screen'>
        {children}
      </main>
    </QueryClientProvider>
  );
}

function LoadingArea() {
  const isFetching = useIsFetching();
  if (!isFetching) {
    return <div className='h-1' />;
  }
  return <Progress indeterminate />;
}
