import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog | UndanganDigital",
  description: "Riwayat perkembangan setiap phase UndanganDigital.",
};

const completedMilestones = [
  {
    key: "P0.1",
    title: "Keputusan produk",
    changes: [
      "Menetapkan target pasangan Indonesia dengan produk self-service yang terjangkau.",
      "Menetapkan satu undangan per akun selama MVP.",
      "Mengunci aturan RSVP, moderasi ucapan, media, retensi, slug, dan tiga arah template beta.",
    ],
  },
  {
    key: "P0.2",
    title: "Keputusan teknis",
    changes: [
      "Menetapkan Next.js, TypeScript, Tailwind CSS, Supabase, Zod, Vitest, dan Playwright.",
      "Memisahkan draft dari snapshot yang diterbitkan agar edit tidak langsung mengubah undangan publik.",
      "Menetapkan alur environment lokal, preview, dan produksi.",
    ],
  },
  {
    key: "P0.3",
    title: "Fondasi repository",
    changes: [
      "Membuat scaffold Next.js App Router dengan struktur feature module.",
      "Menambahkan formatting, lint, typecheck, unit test, E2E, dan production build.",
      "Menambahkan CI dan dokumentasi perintah pengembangan yang dapat dijalankan.",
    ],
  },
  {
    key: "P0.4",
    title: "Fondasi data",
    changes: [
      "Menambahkan migration Supabase untuk profil dan kepemilikan undangan.",
      "Mengaktifkan explicit grants dan Row Level Security untuk isolasi data pemilik.",
      "Menambahkan database test dua pengguna dan workflow reset database lokal.",
    ],
  },
  {
    key: "P1.1",
    title: "Autentikasi dan kepemilikan",
    changes: [
      "Menambahkan daftar, masuk, keluar, dan reset kata sandi.",
      "Menambahkan onboarding profil dan session berbasis cookie yang aman.",
      "Menguji akses anonymous, pemilik, dan lintas pemilik melalui browser serta database.",
    ],
  },
  {
    key: "P1.2",
    title: "Draft undangan",
    changes: [
      "Menambahkan pembuatan dan penyuntingan satu draft undangan per akun.",
      "Menambahkan data inti pasangan dan satu rangkaian acara dengan zona waktu Indonesia.",
      "Menambahkan slug unik, reserved words, dan perlindungan permanen untuk slug lama.",
      "Menambahkan validasi server, status loading, pesan error, serta penyimpanan atomik.",
    ],
  },
  {
    key: "P1.3",
    title: "Template dan preview",
    changes: [
      "Menetapkan schema konten render v1 yang divalidasi pada server.",
      "Menambahkan template Modern Minimal yang responsif mulai lebar 320 px.",
      "Menambahkan pilihan warna aksen dan gaya tipografi tanpa mengubah konten.",
      "Menambahkan preview khusus pemilik dan metadata dasar undangan.",
    ],
  },
  {
    key: "P1.4",
    title: "Publish lifecycle",
    changes: [
      "Menambahkan validasi kelengkapan dan publish snapshot secara atomik.",
      "Menambahkan halaman publik /i/[slug] yang hanya membaca snapshot terbit.",
      "Menambahkan unpublish tanpa menghapus draft maupun snapshot terakhir.",
      "Membatasi lookup publik agar anonymous tidak memperoleh data draft atau kepemilikan.",
    ],
  },
  {
    key: "P1.5",
    title: "RSVP end to end",
    changes: [
      "Menambahkan form RSVP umum pada undangan yang sedang terbit.",
      "Menambahkan idempotency teknis dan rate limit lima percobaan per 10 menit.",
      "Menambahkan validasi jumlah hadir maksimal 10 orang dan konfirmasi submit.",
      "Menambahkan ringkasan serta daftar RSVP yang hanya dapat dibaca pemilik.",
    ],
  },
  {
    key: "P2.1",
    title: "Kelengkapan konten",
    changes: [
      "Menambahkan beberapa rangkaian acara, cerita pasangan, peta, hadiah, kontak, dan penutup.",
      "Menambahkan pengaturan urutan serta visibility section tanpa mengubah template.",
      "Menambahkan satu foto sampul dan maksimal sepuluh foto galeri melalui Supabase Storage.",
      "Menegakkan validasi JPEG/PNG/WebP 5 MB, ownership path, RLS, serta penghapusan file dan metadata.",
    ],
  },
  {
    key: "P2.2",
    title: "Variasi template",
    changes: [
      "Menambahkan Elegant Floral dan Nusantara Contemporary sehingga tersedia tiga template yang berbeda secara visual.",
      "Menambahkan katalog preset warna dan tipografi yang tervalidasi untuk setiap template.",
      "Mempertahankan konten, media, urutan, visibility section, serta published snapshot ketika template draft diganti.",
      "Memvalidasi aksesibilitas dasar, reduced motion, dan layout responsif mulai lebar 320 px.",
    ],
  },
  {
    key: "P2.3",
    title: "Tamu dan ucapan",
    changes: [
      "Menambahkan CRUD tamu manual, batas rombongan, dan ringkasan tamu yang belum menjawab.",
      "Menambahkan tautan personal ber-token yang dapat dirotasi serta tombol berbagi melalui WhatsApp.",
      "Menghubungkan tautan personal ke satu RSVP tamu yang dapat diperbarui tanpa duplikasi.",
      "Menambahkan ucapan berstatus pending, moderasi pemilik, dan tampilan publik setelah disetujui.",
    ],
  },
] as const;

const roadmapPhases = [
  {
    phase: "Phase 1",
    status: "Selesai",
    summary:
      "Vertical slice login hingga RSVP telah tervalidasi, termasuk smoke test pada perangkat nyata tanpa issue kritis atau tinggi.",
  },
  {
    phase: "Phase 2",
    status: "Sedang berjalan",
    summary:
      "P2.1 kelengkapan konten, P2.2 tiga template beta, serta P2.3 tamu dan ucapan selesai; berikutnya hardening dan kesiapan beta.",
  },
  {
    phase: "Phase 3",
    status: "Direncanakan",
    summary:
      "Menambahkan fondasi komersialisasi seperti pembayaran, entitlement, invoice, dan operasional support.",
  },
  {
    phase: "Phase 4",
    status: "Kandidat backlog",
    summary:
      "Memilih fitur pertumbuhan berdasarkan data, misalnya analytics, referral, custom domain, dan QR check-in.",
  },
] as const;

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-stone-100 px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-4xl">
        <nav className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-rose-800 hover:underline"
          >
            ← Kembali ke beranda
          </Link>
          <span className="text-sm text-stone-500">
            Diperbarui 16 Agustus 2026
          </span>
        </nav>

        <header className="rounded-3xl bg-stone-950 px-7 py-10 text-white shadow-sm sm:px-10 sm:py-12">
          <p className="text-sm font-semibold tracking-[0.2em] text-rose-300 uppercase">
            Perjalanan produk
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Changelog UndanganDigital
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
            Ringkasan perubahan yang sudah selesai dan arah phase berikutnya.
            Hanya milestone yang telah divalidasi yang ditandai selesai.
          </p>
        </header>

        <section aria-labelledby="completed-heading" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-rose-700 uppercase">
                Sudah tersedia
              </p>
              <h2
                id="completed-heading"
                className="mt-2 text-3xl font-semibold tracking-tight text-stone-950"
              >
                Milestone selesai
              </h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900">
              12 milestone tervalidasi
            </span>
          </div>

          <ol className="mt-7 space-y-5">
            {completedMilestones.map((milestone) => (
              <li
                key={milestone.key}
                className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-900">
                    {milestone.key}
                  </span>
                  <h3 className="text-xl font-semibold text-stone-950">
                    {milestone.title}
                  </h3>
                  <span className="ml-auto text-sm font-semibold text-emerald-700">
                    Selesai
                  </span>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-600 sm:text-base">
                  {milestone.changes.map((change) => (
                    <li key={change} className="flex gap-3">
                      <span aria-hidden="true" className="text-rose-600">
                        ✓
                      </span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="roadmap-heading" className="mt-14">
          <p className="text-sm font-semibold tracking-[0.18em] text-rose-700 uppercase">
            Roadmap
          </p>
          <h2
            id="roadmap-heading"
            className="mt-2 text-3xl font-semibold tracking-tight text-stone-950"
          >
            Arah berikutnya
          </h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {roadmapPhases.map((item) => (
              <article
                key={item.phase}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-stone-950">{item.phase}</h3>
                  <span className="text-xs font-semibold text-stone-500 uppercase">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {item.summary}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
