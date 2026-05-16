import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast-provider";
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
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
