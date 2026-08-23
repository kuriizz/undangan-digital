# Implementation Plan — UndanganDigital

**Status:** Active  
**Current phase:** Phase 2
**Last updated:** 2026-08-16

Dokumen ini mengatur urutan delivery. Scope dan acceptance criteria tetap berasal dari `PRD.md`; keputusan teknis berasal dari `ARCHITECTURE.md`.

## Cara menggunakan plan

- Kerjakan satu milestone aktif pada satu waktu.
- Tandai checklist hanya setelah implementasi dan validasinya selesai.
- Jangan menutup sebuah phase bila exit gate belum terbukti.
- Catat penyimpangan scope atau arsitektur sebagai keputusan eksplisit, bukan perubahan diam-diam.
- Perbarui status plan dalam pull request yang mengubah status milestone secara material.

Status milestone: `Not started`, `In progress`, `Blocked`, atau `Complete`.

## Phase 0 — Discovery and foundation

**Status:** Complete
**Outcome:** Keputusan produk minimum dikunci dan repository siap menghasilkan vertical slice dengan quality gates yang dapat dijalankan.

### P0.1 Product decisions

**Status:** Complete

- [x] Konfirmasi segmen awal dan positioning produk.
- [x] Konfirmasi batas satu undangan per akun pada MVP.
- [x] Tentukan kebijakan RSVP umum vs tautan personal dan deduplikasinya.
- [x] Tentukan moderasi ucapan: otomatis tampil atau approval pemilik.
- [x] Tentukan batas media, retensi, masa aktif, serta kebijakan slug.
- [x] Pilih tiga arah visual template beta tanpa membangun semuanya.

### P0.2 Technical decisions

**Status:** Complete

- [x] Finalisasi stack dari pilihan berstatus Proposed di `ARCHITECTURE.md`.
- [x] Pilih package manager, runtime, validation library, dan testing tools.
- [x] Putuskan bentuk draft/published snapshot melalui spike kecil.
- [x] Definisikan environment lokal, preview, dan produksi.
- [x] Catat keputusan yang mahal untuk dibalik di `docs/decisions/`.

### P0.3 Repository scaffold

**Status:** Complete

- [x] Scaffold Next.js App Router dengan TypeScript dan `src/` directory.
- [x] Aktifkan strict type checking, lint, formatting, dan import alias.
- [x] Siapkan struktur feature modules sesuai `ARCHITECTURE.md`.
- [x] Tambahkan `.env.example` tanpa credential.
- [x] Tambahkan scripts `dev`, `format:check`, `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, dan `build`.
- [x] Perbarui `README.md` dengan perintah yang benar-benar bekerja.
- [x] Siapkan CI untuk lint, typecheck, test, dan build minimum.

### P0.4 Data foundation

**Status:** Complete

- [x] Siapkan Supabase local development dan folder migrations.
- [x] Buat migration awal untuk profile dan invitation ownership minimum.
- [x] Tambahkan grants serta RLS eksplisit.
- [x] Buat integration test dua pengguna untuk isolasi data.
- [x] Dokumentasikan reset/migrate/test database lokal.

### Exit gate Phase 0

- [x] Aplikasi default berjalan lokal dan dapat dibuild.
- [x] Semua baseline command tersedia serta lulus.
- [x] CI menjalankan quality gate minimum.
- [x] Migration dapat dijalankan dari database bersih.
- [x] Test membuktikan pengguna A tidak dapat mengakses data pengguna B.
- [x] Keputusan terbuka yang memblokir Phase 1 telah ditutup.

## Phase 1 — Invitation vertical slice

**Status:** Complete
**Requirements:** AUTH-01–03, INV-01–08 secara minimum, TPL-02–04 untuk satu template, RSVP-01–03 minimum, PUB-01–03 minimum.  
**Outcome:** Satu pengguna dapat menyelesaikan alur login sampai menerima RSVP pada undangan terbit.

### P1.1 Authentication and ownership

- [x] Implementasi daftar, masuk, keluar, dan reset password.
- [x] Buat profile/onboarding minimal.
- [x] Terapkan authorization server-side dan RLS.
- [x] Uji anonymous, owner, dan cross-owner access.

### P1.2 Invitation draft

- [x] Buat satu undangan per akun dengan status draft.
- [x] Implementasi editor data inti: pasangan dan satu rangkaian acara.
- [x] Implementasi slug unik dan reserved words.
- [x] Simpan draft dengan validation serta loading/error feedback.

### P1.3 One complete template

- [x] Definisikan versioned content schema.
- [x] Render satu template mobile-first.
- [x] Implementasikan preview yang membaca draft.
- [x] Implementasikan metadata dasar untuk halaman terbit.

### P1.4 Publish lifecycle

- [x] Validasi kelengkapan sebelum publish.
- [x] Buat snapshot terbit secara atomik.
- [x] Implementasikan halaman `/i/[slug]` yang hanya membaca versi terbit.
- [x] Implementasikan unpublish dan cache invalidation.

### P1.5 RSVP end to end

- [x] Buat form RSVP publik dengan validasi server.
- [x] Tambahkan rate limit dasar dan aturan deduplikasi yang sudah diputuskan.
- [x] Tampilkan konfirmasi submit yang jelas.
- [x] Tampilkan daftar dan ringkasan RSVP hanya kepada pemilik.

### Exit gate Phase 1

- [x] E2E login → create → preview → publish lulus.
- [x] E2E anonymous RSVP → owner dashboard lulus.
- [x] Draft dan unpublished invitation tidak terbuka publik.
- [x] Cross-tenant integration tests lulus.
- [x] Mobile smoke test pada ukuran 320 px dan perangkat nyata lulus.
- [x] Tidak ada issue severity kritis/tinggi yang terbuka pada alur utama.

## Phase 2 — MVP beta

**Status:** In progress
**Requirements:** Sisa requirement MVP pada PRD.  
**Outcome:** Produk cukup lengkap dan aman untuk dipakai 5–10 pasangan beta tanpa pendampingan intensif.

### P2.1 Content completeness

- [x] Beberapa rangkaian acara.
- [x] Cerita, galeri, peta, hadiah, dan penutup.
- [x] Upload media dengan ownership, validasi, serta lifecycle penghapusan.
- [x] Konfigurasi urutan dan visibility section.

### P2.2 Template set

- [x] Tambah dua template sehingga total minimal tiga.
- [x] Pastikan konten tetap kompatibel saat template diganti.
- [x] Tambah pilihan aksen/font yang terkontrol.
- [x] Uji accessibility, reduced motion, dan responsive layout setiap template.

### P2.3 Guests and wishes

- [x] CRUD tamu manual dan party limit.
- [x] Tautan personal aman serta tombol berbagi WhatsApp.
- [x] Ucapan tamu dan workflow moderasi pemilik.
- [x] Ringkasan belum menjawab untuk tamu yang terdaftar.

### P2.4 Hardening and beta readiness

- [x] Rate limit dan anti-spam pada seluruh endpoint publik.
- [x] Open Graph image/metadata dan link preview.
- [x] Error monitoring, structured logs, dan redaksi data sensitif.
- [x] Privacy, terms, report abuse, retention, dan account deletion minimum.
- [ ] Uji jaringan lambat, perangkat nyata, serta performance budget.
  - [x] Simulasi jaringan lambat dan budget navigasi/resource otomatis.
  - [ ] Lighthouse deployment produksi dan smoke test perangkat nyata P2.4.
- [ ] Jalankan beta 5–10 pasangan dan prioritaskan temuan.
- [ ] Validasi minat, kebutuhan kustomisasi, sensitivitas harga, dan willingness-to-pay untuk kandidat paket Easy dan Advanced.

### Exit gate Phase 2

- [ ] Semua requirement MVP mempunyai bukti acceptance.
- [ ] Target Lighthouse contoh produksi tercapai atau pengecualian terdokumentasi.
- [x] Restore database telah diuji.
- [ ] Tidak ada issue kritis/tinggi terbuka.
- [ ] Feedback beta utama sudah ditangani atau sengaja ditunda dengan alasan.

## Phase 3 — Commercialization

**Status:** Not started  
**Outcome:** Produk dapat menerima pembayaran dan memberikan fitur berbayar dengan aman serta konsisten.

- [ ] Finalisasi struktur, nama, alokasi fitur, dan harga paket dari bukti beta.
- [ ] Pilih payment gateway berdasarkan kebutuhan bisnis Indonesia.
- [ ] Implementasikan transaksi, signature verification, webhook idempotent, dan audit trail.
- [ ] Pisahkan entitlement dari komponen tampilan.
- [ ] Jika bukti beta mendukung, implementasikan Advanced constrained editor dengan schema layout terversi, slot/variant terkontrol, undo/redo, serta preview responsif dan aksesibel.
- [ ] Tambahkan invoice/status pembayaran dan alur kegagalan/refund yang diperlukan.
- [ ] Tambahkan kuota media, masa aktif, dan ekspor RSVP sesuai paket.
- [ ] Finalisasi support, privacy, terms, retention, deletion, dan proses insiden.

### Exit gate Phase 3

- [ ] Skenario sandbox: success, pending, failed, duplicate webhook, dan refund diuji.
- [ ] Smoke test transaksi produksi bernilai kecil berhasil.
- [ ] Entitlement konsisten dengan status transaksi dan aman dari manipulasi client.
- [ ] Dashboard operasional dan prosedur support tersedia.

## Phase 4 — Growth and operations

**Status:** Not started  
**Outcome:** Fitur pertumbuhan dipilih berdasarkan data penggunaan, bukan asumsi.

Kandidat backlog, bukan komitmen sekaligus:

- [ ] Impor CSV dan pengelompokan tamu.
- [ ] QR check-in dan buku tamu acara.
- [ ] Custom domain.
- [ ] Analytics untuk pemilik undangan.
- [ ] Referral dan SEO landing pages.
- [ ] Multibahasa serta reseller/white-label.
- [ ] WhatsApp API resmi dengan consent dan template pesan yang patuh.
- [ ] AI copy assistant setelah kebutuhan inti tervalidasi.

Setiap kandidat membutuhkan mini-PRD, success metric, serta keputusan prioritas sebelum implementasi.

## Suggested first Codex task

Gunakan prompt berikut setelah keputusan P0.1 siap:

> Baca `AGENTS.md`, `docs/PRD.md`, bagian relevan `docs/ARCHITECTURE.md`, dan Phase 0 di `docs/IMPLEMENTATION_PLAN.md`. Implementasikan P0.2 dan P0.3 saja. Jika ada keputusan yang mengubah stack atau struktur secara material, laporkan terlebih dahulu. Scaffold project, tambahkan quality scripts dan CI, perbarui README dengan perintah nyata, jalankan semua validasi yang tersedia, dan jangan mulai fitur Phase 1.
