import type { Metadata } from "next";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Absensi K-Means",
  description: "Sistem informasi absensi berbasis web dengan analisis K-Means.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
