"use client";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast-provider";
import idMessages from "@/messages/id.json";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="id" messages={idMessages}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <ToastProvider />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
