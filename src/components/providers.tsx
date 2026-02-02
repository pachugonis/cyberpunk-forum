"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#13131a",
            border: "1px solid #2a2a35",
            color: "#e4e4e7",
          },
        }}
      />
    </SessionProvider>
  );
}
