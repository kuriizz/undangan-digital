# Architecture — UndanganDigital

**Status:** Accepted baseline  
**Last reviewed:** 2026-08-11  
**Scope:** MVP dan jalur evolusi awal

Dokumen ini menerjemahkan kebutuhan di `PRD.md` menjadi batas teknis. Ia tidak menggantikan requirement produk. Bila keduanya bertentangan, hentikan implementasi dan selesaikan keputusannya terlebih dahulu.

## 1. Architectural goals

- Mengirim vertical slice MVP dengan cepat tanpa mengorbankan isolasi data pengguna.
- Menjaga halaman undangan publik cepat dan nyaman pada perangkat mobile.
- Membuat template visual dapat berkembang tanpa mengubah model konten setiap kali desain baru ditambahkan.
- Menghindari kompleksitas operasional yang belum dibutuhkan.
- Menyimpan keputusan schema dan keamanan dalam artefak yang dapat direview di Git.

## 2. System shape

Gunakan **modular monolith**: satu aplikasi Next.js dan satu PostgreSQL database. Modul dipisahkan di dalam codebase, bukan menjadi service terpisah.

```text
Browser pemilik ─┐
                 ├── Next.js application ── Supabase PostgreSQL
Browser tamu ────┘           │                       │
                             ├── Supabase Auth       ├── RLS policies
                             └── Supabase Storage    └── migrations
```

### Deployment proposal

- Aplikasi Next.js: Vercel.
- PostgreSQL, Auth, dan object storage: Supabase.
- Preview deployment: dibuat untuk perubahan yang perlu pemeriksaan UI/integrasi.
- Production dan non-production menggunakan project serta secret terpisah.

Pilihan vendor telah diterima melalui ADR 0001. Provisioning project layanan dan
secret tetap dilakukan pada milestone yang sesuai dengan environment terpisah.

## 3. Technology choices

| Area | Pilihan | Status | Alasan |
|---|---|---|---|
| Language | TypeScript | Accepted | Tipe bersama untuk UI, server, validasi, dan konten template |
| Web framework | Next.js App Router | Accepted | Full-stack React, routing dinamis, metadata, dan rendering publik |
| UI | Tailwind CSS + komponen aksesibel milik project | Accepted | Pengembangan cepat tanpa mengunci domain ke template vendor |
| Database | PostgreSQL melalui Supabase | Accepted | Relasional, constraints, migrations, dan Row Level Security |
| Authentication | Supabase Auth + SSR cookie sessions | Accepted | Terintegrasi dengan identitas database dan kebijakan RLS |
| Media | Supabase Storage | Accepted | Ownership path dan policy dapat dihubungkan ke pengguna |
| Hosting | Vercel | Accepted | Jalur deployment sederhana untuk Next.js |
| Validation | Zod bersama client/server | Accepted | Satu schema runtime menjadi sumber kebenaran |
| Testing | Vitest + Supabase integration + Playwright | Accepted | Melindungi aturan bisnis, RLS, dan alur kritis |
| Monitoring | Error monitoring + structured logs | Open | Vendor dipilih sebelum beta |

Pin dependency ke versi yang kompatibel saat instalasi; jangan menulis nomor versi ke dokumen ini bila tidak diperlukan.

## 4. Module boundaries

### Identity

Menangani session, onboarding, profil, dan helper otorisasi. Modul lain menerima identitas pengguna yang sudah diverifikasi, bukan mempercayai `owner_id` dari request.

### Invitations

Memiliki lifecycle draft, preview, publish, unpublish, slug, konfigurasi section, dan snapshot konten terbit. Ia tidak menangani pembayaran.

### Templates

Merender schema konten yang stabil menjadi presentasi. Template tidak melakukan query data sendiri dan tidak menyimpan business logic RSVP.

### Guests

Menangani daftar tamu, batas rombongan, token personal, dan tautan berbagi. Token personal diperlakukan sebagai credential terbatas.

### RSVP and wishes

Menangani submission publik, deduplikasi, batas jumlah hadir, ringkasan pemilik, dan moderasi ucapan.

### Media

Menangani upload, ownership, metadata, validasi tipe/ukuran, dan lifecycle penghapusan file.

### Administration

Menangani operasi platform yang benar-benar membutuhkan role admin. Admin access harus eksplisit dan menghasilkan audit event untuk aksi sensitif.

### Billing

Tidak dibangun pada MVP. Pada Fase 3, billing memiliki webhook, transaksi, dan entitlement sendiri tanpa menaruh logika paket di komponen UI.

## 5. Data architecture

Model konseptual terdapat di `PRD.md`. Aturan implementasinya:

- Gunakan UUID atau identifier tidak berurutan untuk resource yang terlihat eksternal.
- Semua tabel tenant-owned mempunyai `owner_id` langsung atau jalur relasi yang tidak ambigu ke pemilik.
- Gunakan foreign key, unique constraint, check constraint, dan index untuk invariant yang dapat dijaga database.
- Semua perubahan database masuk sebagai migration. Hindari perubahan manual dashboard yang tidak direkam.
- Aktifkan RLS dan definisikan grants secara eksplisit untuk setiap tabel/view yang terekspos.
- Service role hanya digunakan di trusted server context untuk operasi yang memang tidak dapat memakai user session.

### Structured content versus JSON

Gunakan kolom/tabel relasional untuk data yang perlu dicari, diurutkan, dihitung, direferensikan, atau diberi constraint: owner, slug, status, event time, guests, RSVP, dan media.

Gunakan JSON tervalidasi untuk konfigurasi presentasi yang fleksibel: warna, font key, urutan section, visibility, dan copy dekoratif. Setiap dokumen JSON memiliki schema version dan parser server-side.

### Draft and publish model

Requirement INV-06 meminta draft tidak langsung mengubah halaman publik. Proposal awal:

- Editor membaca/menulis `draft_content`.
- Publish melakukan validasi lengkap dan membuat snapshot `published_content` beserta `published_at`.
- Halaman publik hanya membaca snapshot terbit.
- Unpublish mengubah availability tanpa menghapus draft maupun snapshot.

Gunakan JSONB terversi untuk `draft_content` dan `published_content`, dengan
revision yang diperiksa saat publish. Operasi publish harus atomik sesuai ADR
0002. Migration dan fungsi database diterapkan pada milestone data/publish.

### Slugs and personalized links

- Slug dinormalisasi, memiliki unique constraint, dan menolak reserved words.
- Perubahan slug tidak boleh membuat URL lama menunjuk ke undangan milik pihak lain. Gunakan tombstone atau redirect yang ownership-nya tetap tercatat.
- Link personal menggunakan token acak berentropi cukup; simpan hash token bila lookup yang dipilih memungkinkan.
- Jangan masukkan nama tamu atau data pribadi lain sebagai parameter URL mentah.

## 6. Authorization model

| Actor | Public invitation | Own draft/settings | Own guest/RSVP data | Other owner data | Admin operations |
|---|---:|---:|---:|---:|---:|
| Anonymous guest | Published only | No | Submit through constrained endpoint | No | No |
| Authenticated owner | Published only | Yes | Yes | No | No |
| Platform admin | As needed | Support-only policy | Support-only policy | Explicit audited access | Yes |

Browser UI bukan security boundary. Setiap server operation dan database policy harus menolak akses lintas pengguna meskipun caller memanipulasi ID.

Integration test minimum menggunakan dua pengguna dan memastikan pengguna A tidak dapat select, update, atau delete resource pengguna B.

## 7. Public request security

RSVP, wishes, lookup token tamu, dan upload membutuhkan:

- Server-side schema validation dan panjang input maksimum.
- Rate limit berdasarkan kombinasi sinyal yang tidak hanya bergantung pada IP.
- Output escaping; jangan merender HTML dari input tamu.
- Idempotency atau aturan uniqueness untuk operasi yang dapat terkirim ulang.
- Honeypot atau challenge adaptif bila spam terdeteksi.
- Pesan error yang berguna tanpa membocorkan keberadaan data privat.

## 8. Rendering and performance

- Halaman editor bersifat authenticated dan dapat lebih dinamis.
- Halaman publik mengutamakan server rendering/caching yang tetap menghormati publish state.
- Setelah publish/unpublish, invalidasi cache harus deterministik.
- Gunakan image optimization, responsive sizes, lazy loading di bawah fold, dan batas upload.
- Animasi menghormati `prefers-reduced-motion`.
- Jangan autoplay audio dengan suara.

Target kualitas terukur mengikuti bagian nonfungsional pada `PRD.md`.

## 9. Proposed route map

```text
src/app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/dashboard/
│   └── invitations/[id]/
│       ├── content/
│       ├── design/
│       ├── guests/
│       ├── rsvp/
│       ├── preview/
│       └── settings/
├── i/[slug]/
├── privacy/
├── terms/
└── admin/
```

Route groups dan nama internal dapat berubah selama URL publik serta boundary modul tetap jelas.

## 10. Testing strategy

### Unit

- Normalisasi dan validasi slug.
- Validasi schema konten/template.
- Aturan RSVP dan party limit.
- Transformasi draft menjadi snapshot terbit.

### Database integration

- Grants dan RLS untuk anonymous, owner A, owner B, dan admin/service context.
- Constraints dan idempotency RSVP.
- Publish transaction dan perubahan slug.

### End-to-end

- Daftar/masuk → buat → preview → publish.
- Anonymous membuka published invitation; draft/unpublished menghasilkan respons yang benar.
- Tamu submit RSVP → owner melihat ringkasan.
- Owner A tidak dapat membuka atau mengubah data owner B.

## 11. Observability and operations

- Gunakan structured logs dengan request/correlation ID.
- Jangan log token, session, isi ucapan pribadi, nomor rekening, atau data personal yang tidak diperlukan.
- Tangkap error frontend dan server dengan environment/release metadata.
- Definisikan backup, restore test, data retention, dan account deletion sebelum peluncuran berbayar.
- Perubahan produksi harus dapat ditelusuri ke commit dan migration.

## 12. Open decisions for Phase 0

Catat keputusan yang sudah final sebagai ADR kecil di `docs/decisions/` hanya ketika dibutuhkan.

Keputusan technical foundation telah ditutup dalam ADR 0001 dan ADR 0002.
Keputusan media serta slug telah ditutup dalam ADR 0003. Keputusan yang masih
terbuka dan tidak memblokir Phase 1:

1. Monitoring vendor dan aturan redaksi data.
2. Region layanan berdasarkan mayoritas pengguna Indonesia dan kebutuhan operasional.
