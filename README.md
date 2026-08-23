# UndanganDigital

Platform web untuk membuat, menerbitkan, dan membagikan undangan pernikahan
digital serta mengelola RSVP tamu.

## Status

**Phase 2 — MVP beta** sedang berjalan. P2.1–P2.3 telah selesai. Engineering
hardening P2.4 mencakup trusted public request boundary, anti-spam, metadata
sosial, observability privacy-first, legal minimum, account deletion, dan
database restore proof. Lighthouse produksi, smoke test perangkat nyata P2.4,
serta beta 5–10 pasangan masih menjadi exit gate eksternal.

Dokumen utama:

- [Product Requirements Document](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Technical decisions](docs/decisions/)
- [Codex repository instructions](AGENTS.md)

## Stack

- Node.js 22 dan npm
- TypeScript, Next.js App Router, dan React
- Tailwind CSS
- Zod untuk runtime schema validation
- Supabase untuk PostgreSQL, Auth, dan Storage
- Vitest dan Playwright untuk pengujian
- Vercel untuk hosting aplikasi
- Sentry Cloud untuk error monitoring opt-in

## Prasyarat

- Node.js 22.x
- npm 10 atau lebih baru
- Git
- Docker Desktop atau container runtime yang kompatibel dan sedang berjalan

Supabase CLI terpasang sebagai dev dependency dan dijalankan melalui npm scripts.

## Setup lokal

```bash
npm ci
npm run db:start
```

Lihat URL dan local publishable key dengan `npx supabase status`, lalu salin
contoh environment menjadi `.env.local` dan ganti placeholder dengan nilai lokal.
Jangan memasukkan credential ke source control:

```powershell
Copy-Item .env.example .env.local
```

Pada macOS/Linux:

```bash
cp .env.example .env.local
```

Isi `SUPABASE_SERVICE_ROLE_KEY` hanya pada server dari output local Supabase dan
isi `RSVP_FINGERPRINT_SECRET` dengan nilai acak minimal 32 karakter yang berbeda
untuk setiap environment. Nilai ini dipakai untuk membuat fingerprint rate
limit tanpa menyimpan IP atau user-agent mentah. Service-role key tidak boleh
memakai prefix `NEXT_PUBLIC_` atau masuk source control.

Sentry bersifat opsional dan tidak aktif tanpa DSN. Deployment beta dapat
mengisi variable `SENTRY_*` dan `NEXT_PUBLIC_SENTRY_*` pada `.env.example`;
session replay dan PII bawaan tetap dinonaktifkan.

Jalankan aplikasi:

```bash
npm run dev
```

Buka `http://localhost:3000`.

Alur autentikasi lokal tersedia di `/register`, `/login`, dan
`/forgot-password`. Email konfirmasi dan reset lokal ditangkap Mailpit; lihat URL
Mailpit dengan `npx supabase status`. Setelah masuk, buat draft melalui
`/dashboard/invitations/new`; editor menyimpan slug, nama pasangan, rangkaian
acara, konten, media, urutan section, serta pilihan template. Preview Modern
Minimal, Elegant Floral, atau Nusantara Contemporary milik pemilik tersedia pada
`/dashboard/invitations/[id]/preview`. Ringkasan perkembangan produk tersedia di
`/changelog`. Daftar tamu, tautan personal, batas rombongan, serta moderasi
ucapan dikelola melalui `/dashboard/invitations/[id]/guests`.

## Quality commands

| Perintah                   | Fungsi                                              |
| -------------------------- | --------------------------------------------------- |
| `npm run format`           | Memformat file yang dikelola Prettier               |
| `npm run format:check`     | Memeriksa formatting tanpa mengubah file            |
| `npm run lint`             | Menjalankan ESLint tanpa mengizinkan warning        |
| `npm run typecheck`        | Menjalankan TypeScript strict type checking         |
| `npm test`                 | Menjalankan unit test sekali                        |
| `npm run test:watch`       | Menjalankan unit test dalam watch mode              |
| `npm run test:integration` | Menjalankan pgTAP untuk grants, constraint, dan RLS |
| `npm run test:e2e`         | Menjalankan Playwright browser tests                |
| `npm run build`            | Membuat production build Next.js                    |
| `npm start`                | Menjalankan production build yang sudah dibuat      |

Sebelum menjalankan E2E pertama kali, pasang browser Chromium Playwright:

```bash
npx playwright install chromium
npm run test:e2e
```

## Database lokal

| Perintah                   | Fungsi                                               |
| -------------------------- | ---------------------------------------------------- |
| `npm run db:start`         | Menjalankan stack Supabase lokal dan migration       |
| `npm run db:stop`          | Menghentikan stack lokal tanpa menghapus data        |
| `npm run db:reset`         | Membuat ulang database lokal dari migration dan seed |
| `npm run db:lint`          | Memeriksa masalah schema PostgreSQL lokal            |
| `npm run db:test`          | Menjalankan seluruh database test pgTAP              |
| `npm run db:restore:test`  | Menguji restore ke database verifikasi terisolasi    |
| `npm run test:integration` | Alias quality gate untuk `npm run db:test`           |

Workflow database harian:

```bash
npm run db:start
npm run db:reset
npm run db:lint
npm run test:integration
npm run db:restore:test
```

Migration adalah satu-satunya sumber perubahan schema. Jangan mengandalkan
perubahan manual di Supabase Studio tanpa menangkapnya sebagai migration.

CI di `.github/workflows/ci.yml` menjalankan formatting, lint, typecheck, unit
test, production build, database reset dari kondisi bersih, database lint,
pgTAP, restore proof, dan E2E pada setiap push serta pull request.

## Environment

- **Local:** `.env.local` dan Supabase lokal melalui Docker.
- **Preview:** Vercel Preview dengan project Supabase non-production tersendiri.
- **Production:** Vercel Production dengan project Supabase production
  tersendiri.

Secret tidak boleh digunakan silang antar-environment. Jangan commit `.env.local`
atau Supabase service-role key.

## Batas scope saat ini

Autentikasi, profile onboarding, session cookie, editor draft inti, slug,
template Modern Minimal, preview pemilik, grants, dan RLS sudah tersedia.
Publish/unpublish, halaman publik `/i/[slug]`, RSVP, tamu personal, ucapan,
laporan penyalahgunaan, dan penghapusan akun sudah tersedia. Aktivasi monitoring
deployment dan langkah beta mengikuti `docs/features/beta-readiness.md`;
pembayaran, broadcast WhatsApp, custom
domain, QR check-in, AI, dan editor drag-and-drop berada di luar MVP.
