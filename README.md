# UndanganDigital

Platform web untuk membuat, menerbitkan, dan membagikan undangan pernikahan
digital serta mengelola RSVP tamu.

## Status

Project berada pada **Phase 0 — discovery dan fondasi**. P0.1 sampai P0.4 sudah
selesai secara lokal. Workflow CI masih perlu dibuktikan di GitHub sebelum exit
gate Phase 0 ditutup; fitur Phase 1 belum dimulai.

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

Jalankan aplikasi:

```bash
npm run dev
```

Buka `http://localhost:3000`.

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
| `npm run test:integration` | Alias quality gate untuk `npm run db:test`           |

Workflow database harian:

```bash
npm run db:start
npm run db:reset
npm run db:lint
npm run test:integration
```

Migration adalah satu-satunya sumber perubahan schema. Jangan mengandalkan
perubahan manual di Supabase Studio tanpa menangkapnya sebagai migration.

CI di `.github/workflows/ci.yml` menjalankan formatting, lint, typecheck, unit
test, production build, database reset dari kondisi bersih, database lint, dan
pgTAP pada push ke `main` serta pull request.

## Environment

- **Local:** `.env.local` dan Supabase lokal melalui Docker.
- **Preview:** Vercel Preview dengan project Supabase non-production tersendiri.
- **Production:** Vercel Production dengan project Supabase production
  tersendiri.

Secret tidak boleh digunakan silang antar-environment. Jangan commit `.env.local`
atau Supabase service-role key.

## Batas scope saat ini

Fondasi schema, grants, dan RLS sudah tersedia, tetapi aplikasi belum menyediakan
autentikasi, editor undangan, publish, halaman publik, atau RSVP. Seluruh fitur
tersebut tetap mengikuti urutan di `docs/IMPLEMENTATION_PLAN.md`; pembayaran,
broadcast WhatsApp, custom domain, QR check-in, AI, dan editor drag-and-drop
berada di luar MVP.
