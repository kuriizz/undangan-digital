import { randomUUID } from "node:crypto";

import type { Metadata } from "next";
import Link from "next/link";

import { AbuseReportForm } from "@/features/abuse/abuse-report-form";

export const metadata: Metadata = {
  title: "Laporkan penyalahgunaan | UndanganDigital",
  description:
    "Laporkan undangan yang melanggar privasi atau ketentuan layanan.",
  robots: { index: false, follow: false },
};

export default async function ReportAbusePage({
  searchParams,
}: PageProps<"/report-abuse">) {
  const query = await searchParams;
  const initialSlug = typeof query.slug === "string" ? query.slug : "";
  return (
    <main className="flex-1 bg-stone-50 px-5 py-14">
      <div className="mx-auto max-w-2xl rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
        <Link
          href="/"
          className="text-sm font-semibold text-rose-800 hover:underline"
        >
          ← Kembali
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">Laporkan penyalahgunaan</h1>
        <p className="mt-3 leading-7 text-stone-600">
          Gunakan formulir ini untuk melaporkan masalah privasi, penipuan,
          pelecehan, atau pelanggaran hak cipta pada undangan yang diterbitkan.
        </p>
        <div className="mt-8">
          <AbuseReportForm
            idempotencyKey={randomUUID()}
            initialSlug={initialSlug}
          />
        </div>
      </div>
    </main>
  );
}
