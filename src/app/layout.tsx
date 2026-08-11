import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UndanganDigital",
  description: "Platform undangan pernikahan digital.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
