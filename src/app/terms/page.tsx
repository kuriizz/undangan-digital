import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ketentuan layanan | UndanganDigital",
  description: "Ketentuan minimum penggunaan beta UndanganDigital.",
};

export default function TermsPage() {
  return (
    <main className="flex-1 bg-stone-50 px-5 py-14">
      <article className="mx-auto max-w-3xl rounded-3xl border bg-white p-7 shadow-sm sm:p-10">
        <p className="text-sm text-stone-500">
          Berlaku untuk beta · 23 Agustus 2026
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Ketentuan layanan</h1>
        <div className="mt-7 space-y-6 leading-7 text-stone-700">
          <section>
            <h2 className="font-semibold text-stone-950">Penggunaan beta</h2>
            <p>
              Layanan diberikan untuk pengujian beta dan dapat berubah. Pengguna
              bertanggung jawab memeriksa isi undangan sebelum diterbitkan.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-stone-950">Konten dan izin</h2>
            <p>
              Pengguna hanya boleh mengunggah konten yang dimiliki atau telah
              diizinkan. Dilarang memuat penipuan, pelecehan, malware,
              pelanggaran privasi, atau pelanggaran hak pihak lain.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-stone-950">Data tamu</h2>
            <p>
              Pemilik undangan bertanggung jawab menggunakan data tamu secara
              wajar, membagikan tautan personal hanya kepada penerimanya, dan
              menindaklanjuti permintaan koreksi atau penghapusan.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-stone-950">
              Moderasi dan penghentian
            </h2>
            <p>
              Konten yang dilaporkan dapat ditinjau, disembunyikan, atau dihapus
              untuk melindungi pengguna dan pihak lain. Penyalahgunaan berulang
              dapat menyebabkan akses dihentikan.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-stone-950">Pelaporan</h2>
            <p>
              Laporkan dugaan pelanggaran melalui{" "}
              <Link
                className="font-semibold text-rose-800 hover:underline"
                href="/report-abuse"
              >
                formulir penyalahgunaan
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
