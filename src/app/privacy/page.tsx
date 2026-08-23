import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan privasi | UndanganDigital",
  description: "Informasi pemrosesan data pada UndanganDigital.",
};

export default function PrivacyPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <main className="flex-1 bg-stone-50 px-5 py-14">
      <article className="mx-auto max-w-3xl rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm text-stone-500">
          Berlaku untuk beta · 23 Agustus 2026
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Kebijakan privasi</h1>
        <div className="mt-7 space-y-6 leading-7 text-stone-700">
          <section>
            <h2 className="font-semibold text-stone-950">Data yang diproses</h2>
            <p>
              UndanganDigital memproses data akun, konten undangan, media,
              daftar tamu, RSVP, ucapan, serta data teknis minimum untuk
              keamanan dan penanganan error.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-stone-950">Tujuan</h2>
            <p>
              Data digunakan untuk menyediakan undangan, mengamankan akses
              pemilik, menerima respons tamu, mencegah penyalahgunaan, dan
              memperbaiki gangguan layanan.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-stone-950">Pihak pemroses</h2>
            <p>
              Data aplikasi disimpan melalui Supabase. Deployment dapat
              menggunakan Vercel. Error teknis dapat dikirim ke Sentry dengan
              PII bawaan, session replay, token, cookie, dan isi formulir
              dinonaktifkan atau direduksi.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-stone-950">
              Retensi dan penghapusan
            </h2>
            <p>
              Selama beta tidak ada kedaluwarsa otomatis untuk undangan aktif.
              Pemilik dapat menghapus akun dari pengaturan. Data pada sistem
              aktif dihapus segera; salinan cadangan atau antrean pemulihan
              dipurge paling lambat 30 hari. Data rate-limit disimpan maksimal
              satu hari. Laporan yang telah diselesaikan disimpan maksimal 90
              hari dan seluruh laporan maksimal satu tahun.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-stone-950">
              Kontak dan hak Anda
            </h2>
            <p>
              Anda dapat meminta koreksi atau penghapusan melalui{" "}
              {supportEmail ? (
                <a
                  className="font-semibold text-rose-800 hover:underline"
                  href={`mailto:${supportEmail}`}
                >
                  {supportEmail}
                </a>
              ) : (
                <Link
                  className="font-semibold text-rose-800 hover:underline"
                  href="/report-abuse"
                >
                  formulir laporan
                </Link>
              )}
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
