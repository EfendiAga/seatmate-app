"use client";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Dynamically import the canvas app to avoid SSR issues with Konva and window
const SeatingChartApp = dynamic(
  () => import("@/components/SeatingChartApp").then((mod) => mod.SeatingChartApp),
  { ssr: false }
);

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="seatplan-theme">
        <main className="min-h-screen w-full flex flex-col">
          <SeatingChartApp />
          <Toaster />
        </main>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
