import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "UndanganDigital",
  description: "Platform undangan pernikahan digital.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <footer className="border-t border-stone-200 bg-white px-5 py-6 text-sm text-stone-600">
          <nav
            className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2"
            aria-label="Informasi layanan"
          >
            <Link
              href="/privacy"
              className="hover:text-rose-800 hover:underline"
            >
              Privasi
            </Link>
            <Link href="/terms" className="hover:text-rose-800 hover:underline">
              Ketentuan
            </Link>
            <Link
              href="/report-abuse"
              className="hover:text-rose-800 hover:underline"
            >
              Laporkan penyalahgunaan
            </Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
