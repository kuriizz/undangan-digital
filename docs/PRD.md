# Product Requirements Document — Platform Undangan Pernikahan Digital

**Status:** Approved MVP baseline v0.2  
**Pemilik produk:** TBD  
**Target awal:** Web responsif, Bahasa Indonesia, pasar Indonesia  
**Prinsip delivery:** Bangun alur utama sampai selesai terlebih dahulu, lalu monetisasi dan optimasi.

## 1. Ringkasan produk

Platform ini membantu pasangan membuat, mempublikasikan, dan membagikan undangan pernikahan digital tanpa perlu kemampuan teknis. Pengguna memilih template, mengisi informasi acara, mengunggah foto, mengatur RSVP, lalu mendapat tautan publik yang siap dibagikan melalui WhatsApp atau kanal lain.

Produk terdiri dari dua pengalaman utama:

1. **Dashboard pembuat undangan** untuk membuat dan mengelola undangan.
2. **Halaman undangan publik** untuk tamu, termasuk detail acara, peta, RSVP, dan ucapan.

## 2. Masalah yang ingin diselesaikan

Calon pengantin membutuhkan undangan yang cepat dibuat, tampil baik di ponsel, mudah dibagikan, dan mampu mengumpulkan konfirmasi kehadiran. Solusi yang ada sering kali memerlukan komunikasi manual dengan vendor, terlalu sulit dikustomisasi, lambat, atau tidak memberi pengelolaan RSVP yang rapi.

## 3. Tujuan dan indikator keberhasilan

### Tujuan MVP

- Pengguna baru dapat membuat dan mempublikasikan satu undangan tanpa bantuan admin.
- Tamu dapat membuka undangan dengan cepat di ponsel dan mengirim RSVP tanpa membuat akun.
- Pemilik undangan dapat melihat hasil RSVP dari dashboard.
- Data setiap pengguna terisolasi dan tidak dapat diakses pengguna lain.

### Metrik awal

| Metrik | Target validasi MVP |
|---|---:|
| Pengguna yang berhasil menerbitkan undangan | >= 40% dari pengguna yang mulai membuat |
| Waktu median dari daftar sampai publish | <= 20 menit |
| Keberhasilan submit RSVP | >= 98% |
| Halaman undangan publik lolos Core Web Vitals | Mayoritas kunjungan |
| Error tidak tertangani pada alur utama | < 1% sesi |

Target adalah hipotesis awal dan harus ditinjau setelah 30 hari data produksi.

## 4. Pengguna dan peran

### Pasangan/pembuat undangan

- Membuat akun dan masuk.
- Membuat, mengedit, preview, publish, dan unpublish undangan miliknya.
- Mengelola daftar tamu serta melihat RSVP dan ucapan.

### Tamu

- Membuka tautan undangan tanpa akun.
- Melihat informasi acara dan membuka lokasi di aplikasi peta.
- Mengirim atau memperbarui RSVP sesuai aturan produk.
- Mengirim ucapan yang dapat dimoderasi.

### Admin platform

- Mengelola template dan akun bermasalah.
- Menangani moderasi, laporan penyalahgunaan, dan dukungan.
- Melihat status sistem tanpa dapat mengambil alih akun pengguna secara diam-diam.

## 5. Ruang lingkup MVP

### 5.1 Autentikasi dan akun

- **AUTH-01:** Pengguna dapat mendaftar, masuk, keluar, dan melakukan reset kata sandi.
- **AUTH-02:** Pengguna hanya dapat membaca dan mengubah data yang dimilikinya.
- **AUTH-03:** Profil minimal menyimpan nama tampilan dan email.

### 5.2 Pembuatan undangan

- **INV-01:** Pada MVP, satu akun dapat membuat satu undangan. Model data tidak boleh menghalangi dukungan banyak undangan pada paket berikutnya.
- **INV-02:** Setiap undangan mempunyai slug unik, misalnya `/i/ayu-bima`.
- **INV-03:** Pengguna dapat mengisi nama pasangan, cerita singkat, tanggal, waktu, zona waktu, alamat, tautan peta, kontak, dan informasi hadiah.
- **INV-04:** Satu undangan dapat memiliki beberapa rangkaian acara, misalnya akad dan resepsi.
- **INV-05:** Pengguna dapat mengunggah foto sampul dan galeri dengan batas ukuran serta tipe file yang jelas.
- **INV-06:** Perubahan tersimpan sebagai draft dan tidak mengubah versi publik sampai pengguna menerbitkannya.
- **INV-07:** Pengguna dapat preview tampilan desktop dan mobile sebelum publish.
- **INV-08:** Pengguna dapat publish dan unpublish undangan.

### 5.3 Template dan tampilan

- **TPL-01:** MVP menyediakan minimal tiga template yang benar-benar berbeda secara visual.
- **TPL-02:** Pengguna dapat memilih template dan mengatur opsi terbatas: warna aksen, font yang tersedia, urutan section, serta section aktif/nonaktif.
- **TPL-03:** Konten tetap sama ketika pengguna mengganti template.
- **TPL-04:** Halaman publik responsif pada lebar layar 320 px ke atas.

### 5.4 Tamu dan personalisasi tautan

- **GST-01:** Pemilik dapat menambah tamu secara manual dengan nama dan jumlah undangan.
- **GST-02:** Sistem dapat membuat tautan tamu yang mempersonalisasi sapaan tanpa menampilkan data privat lain.
- **GST-03:** Pemilik dapat menyalin tautan umum atau tautan personal untuk dibagikan melalui WhatsApp.
- **GST-04:** Impor CSV, grup tamu, dan pengiriman pesan massal tidak termasuk MVP.

### 5.5 RSVP dan ucapan

- **RSVP-01:** Tamu dapat memilih hadir/tidak hadir, mengisi nama, jumlah hadir sesuai batas, dan catatan opsional.
- **RSVP-02:** Sistem mencegah submit otomatis berulang dengan rate limit dan validasi server.
- **RSVP-03:** Pemilik dapat melihat ringkasan hadir, tidak hadir, belum menjawab, serta daftar respons.
- **RSVP-04:** Tamu dapat mengirim ucapan; pemilik dapat menyembunyikan atau menghapus ucapan dari halaman publik.

### 5.6 Halaman publik

- **PUB-01:** Halaman memuat sampul, pasangan, hitung mundur, detail acara, cerita, galeri, peta, RSVP, ucapan, hadiah, dan penutup sesuai section yang aktif.
- **PUB-02:** Undangan draft atau unpublished tidak dapat diakses publik.
- **PUB-03:** Metadata judul, deskripsi, dan gambar Open Graph tersedia untuk tautan publik.
- **PUB-04:** URL lama tidak boleh menunjuk ke undangan pengguna lain setelah slug diganti.
- **PUB-05:** Halaman mempunyai tombol laporkan penyalahgunaan dan informasi kontak/privasi platform.

## 6. Di luar ruang lingkup MVP

- Editor bebas drag-and-drop seperti Canva.
- Aplikasi Android/iOS native.
- Domain khusus milik pelanggan.
- Pembayaran, paket berlangganan, kupon, dan invoice.
- Pengiriman WhatsApp otomatis atau broadcast.
- Ekspor RSVP ke CSV.
- Live streaming, QR check-in, buku tamu di lokasi, dan seating plan.
- Generasi teks atau gambar berbasis AI.
- Marketplace vendor pernikahan.
- Banyak bahasa dan white-label reseller.

## 7. Alur utama dan acceptance criteria

### Alur A — Membuat dan menerbitkan undangan

1. Pengguna mendaftar atau masuk.
2. Pengguna memilih template.
3. Pengguna mengisi data wajib dan mengunggah media.
4. Pengguna melihat preview.
5. Sistem menampilkan validasi jika data wajib belum lengkap.
6. Pengguna menekan **Publish** dan menerima URL publik.

**Selesai bila:** URL publik dapat dibuka pada perangkat lain tanpa login, hanya memuat data versi terbit, dan tampilan tidak rusak pada mobile.

### Alur B — Tamu membuka undangan dan RSVP

1. Tamu membuka tautan umum atau personal.
2. Tamu melihat sapaan dan informasi acara.
3. Tamu mengirim RSVP.
4. Sistem menampilkan konfirmasi yang jelas dan memperbarui dashboard pemilik.

**Selesai bila:** submit yang valid tersimpan satu kali, submit invalid ditolak tanpa kehilangan input, dan data RSVP tidak terlihat oleh tamu lain.

### Alur C — Pemilik memantau respons

1. Pemilik membuka dashboard undangan.
2. Pemilik melihat ringkasan RSVP.
3. Pemilik mencari respons berdasarkan nama dan memoderasi ucapan.

**Selesai bila:** hitungan ringkasan konsisten dengan data respons dan hanya dapat diakses pemilik atau admin berwenang.

## 8. Kebutuhan nonfungsional

### Keamanan dan privasi

- Otorisasi harus diterapkan di server/database, bukan hanya dengan menyembunyikan UI.
- Semua tabel yang terekspos menggunakan kebijakan Row Level Security dan prinsip least privilege.
- Service-role key tidak pernah dikirim ke browser.
- Upload memvalidasi MIME type, ekstensi, ukuran, dan kepemilikan path.
- Endpoint publik memiliki rate limit, validasi input, proteksi spam, dan output escaping.
- Data sensitif tidak ditulis ke log. Rahasia hanya disimpan di environment variables.
- Tersedia kebijakan privasi, ketentuan layanan, retensi data, ekspor data, dan penghapusan akun sebelum peluncuran komersial.
- Nomor rekening dan data personal tidak muncul di metadata sosial atau endpoint yang tidak diperlukan.

### Performa dan kualitas

- Gunakan image optimization, lazy loading, dan ukuran gambar terkompresi.
- Target awal Lighthouse mobile: Performance >= 85, Accessibility >= 90, Best Practices >= 90, SEO >= 90 pada halaman contoh produksi.
- Form tetap memberi feedback yang dapat dipahami pada jaringan lambat.
- Error produksi dicatat dengan request ID tanpa membocorkan data pribadi.
- Backup database dan prosedur restore harus diuji sebelum menerima pelanggan berbayar.

### Aksesibilitas

- Navigasi keyboard, fokus terlihat, kontras memadai, label form, teks alternatif gambar, dan dukungan `prefers-reduced-motion`.
- Musik tidak boleh autoplay dengan suara; kontrol play/pause harus tersedia bila fitur musik ditambahkan.

## 9. Model data konseptual

| Entitas | Field inti | Catatan |
|---|---|---|
| `profiles` | `id`, `display_name`, `created_at` | Terhubung ke pengguna auth |
| `invitations` | `id`, `owner_id`, `slug`, `status`, `template_id`, `draft_content`, `published_content`, timestamps | Slug unik; draft dipisahkan dari versi terbit |
| `events` | `id`, `invitation_id`, `type`, `starts_at`, `ends_at`, `timezone`, `venue`, `map_url` | Banyak acara per undangan |
| `media` | `id`, `invitation_id`, `owner_id`, `path`, `type`, `sort_order` | File asli berada di object storage |
| `guests` | `id`, `invitation_id`, `name`, `token_hash`, `party_limit` | Token mentah tidak disimpan bila memungkinkan |
| `rsvps` | `id`, `invitation_id`, `guest_id?`, `name`, `attendance`, `party_size`, `note`, timestamps | Aturan uniqueness ditetapkan eksplisit |
| `wishes` | `id`, `invitation_id`, `rsvp_id?`, `name`, `message`, `visibility`, timestamps | Mendukung moderasi |
| `templates` | `id`, `key`, `name`, `version`, `status`, `config_schema` | Template dikelola admin |
| `audit_logs` | `id`, `actor_id`, `action`, `resource_type`, `resource_id`, `created_at` | Hanya aksi sensitif/administratif |

Keputusan implementasi sebelum coding: apakah konten fleksibel disimpan sebagai JSON tervalidasi atau tabel terstruktur. Rekomendasi MVP adalah kombinasi: kolom relasional untuk data yang perlu dicari/dihitung, JSON tervalidasi untuk konfigurasi presentasi.

## 10. Struktur halaman

```text
/
├── login, daftar, lupa-password
├── dashboard
│   ├── invitations
│   └── invitations/[id]
│       ├── content
│       ├── design
│       ├── guests
│       ├── rsvp
│       ├── preview
│       └── settings
├── i/[slug]                 # halaman publik
├── privacy
├── terms
└── admin                    # dibatasi role admin
```

## 11. Rekomendasi teknologi

### Pilihan utama

- **Bahasa:** TypeScript untuk frontend dan backend.
- **Framework:** Next.js App Router dengan React.
- **UI:** Tailwind CSS dan komponen aksesibel yang dimiliki project; hindari ketergantungan penuh pada template vendor.
- **Database/Auth/Storage:** Supabase (PostgreSQL, Auth, dan Storage) dengan migration SQL yang masuk Git.
- **Hosting:** Vercel untuk aplikasi Next.js; Supabase sebagai layanan data.
- **Validasi:** Schema validation bersama di client dan server.
- **Testing:** Unit test untuk aturan bisnis, integration test untuk database/RLS, dan end-to-end test untuk publish serta RSVP.

### Mengapa TypeScript

Satu bahasa dapat digunakan untuk UI, server actions/route handlers, validasi, dan tooling. Tipe data membantu menjaga konsistensi antara editor, bentuk konten template, dan respons API—bagian yang cepat kompleks pada produk undangan berbasis template. Ekosistem React juga cocok untuk komponen visual yang dapat digunakan ulang.

### Kapan memilih alternatif

- Pilih Laravel/PHP bila tim jauh lebih kuat di PHP dan mempunyai hosting/operasional Laravel yang matang.
- Pilih Django/Python bila produk segera membutuhkan workflow data/AI berat dan tim dominan Python.
- Jangan membuat microservices pada MVP. Satu aplikasi modular dan satu database lebih mudah dikembangkan serta dioperasikan.

## 12. Fase delivery

Estimasi mengasumsikan satu developer full-time dengan desain yang cukup sederhana. Validasi scope dilakukan pada akhir setiap fase; jangan memulai semua fase sekaligus.

### Fase 0 — Discovery dan fondasi produk (3–5 hari)

- Putuskan nama produk, audiens utama, batas MVP, dan model bisnis awal.
- Buat wireframe alur dashboard, editor, preview, dan halaman publik.
- Tentukan schema konten template dan model data final.
- Siapkan repository, quality gates, environment, migration, dan preview deployment.

**Gate:** alur utama, wireframe, schema data, serta acceptance criteria disetujui.

### Fase 1 — Vertical slice MVP (1–2 minggu)

- Autentikasi dan isolasi data pengguna.
- Satu template lengkap.
- Editor data inti, preview, publish/unpublish, dan URL publik.
- RSVP dasar dari halaman publik sampai terlihat di dashboard.
- Tes end-to-end untuk happy path.

**Gate:** satu pengguna dapat menyelesaikan seluruh alur membuat undangan hingga menerima RSVP.

### Fase 2 — MVP beta (1–2 minggu)

- Tambah dua template, galeri, beberapa rangkaian acara, peta, hadiah, ucapan, serta tautan tamu.
- Moderasi, rate limiting, aksesibilitas, metadata sosial, analytics/error monitoring, dan hardening upload.
- Uji pada perangkat nyata dan jaringan lambat.

**Gate:** minimal 5–10 pasangan beta dapat memakai produk tanpa pendampingan intensif; temuan kritis ditutup.

### Fase 3 — Komersialisasi (2–3 minggu)

- Paket gratis/berbayar, payment gateway Indonesia, webhook idempotent, invoice, dan status entitlement.
- Domain khusus atau subdomain premium bila tervalidasi.
- Ekspor RSVP, kuota media, masa aktif undangan, onboarding, dukungan, kebijakan privasi, dan penghapusan akun.

**Gate:** transaksi sandbox dan produksi terverifikasi; akses premium konsisten terhadap status pembayaran.

### Fase 4 — Growth dan operasional

- Impor CSV, grup tamu, QR check-in, analytics undangan, referral, dan SEO landing pages.
- Multibahasa, white-label/reseller, serta lebih banyak template hanya berdasarkan permintaan pengguna.
- Otomasi WhatsApp hanya melalui penyedia/API resmi dan setelah consent, template pesan, biaya, serta kepatuhan dipahami.

## 13. Backlog prioritas setelah MVP

Gunakan urutan berikut sampai data pengguna menunjukkan prioritas lain:

1. Pembayaran dan entitlement yang andal.
2. Impor/ekspor tamu dan RSVP.
3. QR check-in dan buku tamu acara.
4. Domain khusus.
5. Analytics bagi pemilik undangan.
6. Template tambahan.
7. AI copy assistant dan fitur eksperimen lain.

## 14. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope editor terlalu bebas | MVP terlambat dan banyak bug visual | Gunakan section serta opsi desain yang terstruktur |
| Halaman lambat karena foto/animasi | Tamu keluar sebelum melihat informasi | Batas upload, kompresi, lazy load, performance budget |
| Kebocoran data antar pengguna | Dampak keamanan tinggi | RLS, integration test kebijakan, review service-role usage |
| Spam RSVP/ucapan | Data dan pengalaman pengguna rusak | Rate limit, honeypot/challenge adaptif, moderasi |
| Slug ditebak atau diambil alih | Privasi/reputasi | Unique constraint, reserved words, aturan redirect/tombstone |
| Webhook pembayaran ganda | Entitlement salah | Verifikasi signature dan idempotency key |
| Musik/foto melanggar hak cipta | Risiko hukum dan takedown | Syarat penggunaan, mekanisme laporan, gunakan aset berlisensi |
| Terlalu banyak template dini | Biaya maintenance tinggi | Mulai tiga template dan ukur pemakaian |

## 15. Definition of Done per fitur

Sebuah requirement dianggap selesai bila:

- Acceptance criteria terpenuhi dan ada bukti pengujian yang relevan.
- Otorisasi, validasi input, empty/loading/error state, serta mobile layout telah ditangani.
- Perubahan schema mempunyai migration dan kebijakan akses.
- Tidak ada rahasia atau data personal di source control/log.
- Dokumentasi pengguna/developer diperbarui bila perilaku atau konfigurasi berubah.
- Preview deployment telah diperiksa dan tidak ada regression kritis pada alur publish/RSVP.

## 16. Cara menggunakan PRD ini dengan Codex

Jangan meminta Codex “buat semua aplikasi” dalam satu prompt. Berikan satu fase atau vertical slice dengan requirement ID, batas file/fitur, dan perintah validasi.

Contoh prompt pertama:

> Implementasikan Fase 0 dan fondasi Fase 1 berdasarkan `docs/PRD.md`. Mulai dengan membaca instruksi repository. Buat rencana singkat, scaffold Next.js TypeScript, siapkan struktur modul, lint/typecheck/test, contoh environment tanpa secret, dan migration awal. Jangan implementasikan pembayaran atau fitur di luar MVP. Laporkan asumsi dan validasi yang dijalankan.

Contoh prompt per fitur:

> Implementasikan AUTH-01 sampai AUTH-03 dan isolasi data pemilik. Sertakan migration/RLS, integration test untuk akses lintas pengguna, serta dokumentasi setup lokal. Jangan mengerjakan editor undangan. Jalankan lint, typecheck, dan test yang relevan.

Gunakan `AGENTS.md` di root sebagai router menuju PRD, arsitektur, implementation plan, aturan keamanan, dan perintah validasi. Jangan menaruh seluruh detail produk di `AGENTS.md`; PRD tetap menjadi sumber requirement produk.

## 17. Keputusan produk

Baseline MVP mengenai segmen, satu undangan per akun, RSVP, moderasi ucapan,
media, retensi, slug, dan arah visual template telah disetujui dalam ADR 0003.

Keputusan berikut tetap ditunda karena tidak memblokir Phase 1:

- Payment gateway dan struktur harga untuk Fase 3.
- Detail konten agama/adat dalam setiap arah template, yang ditentukan saat
  template tersebut memasuki milestone aktif.

## 18. Referensi teknis resmi

- [Next.js App Router](https://nextjs.org/docs/app)
- [Struktur project Next.js](https://nextjs.org/docs/app/getting-started/project-structure)
- [Supabase Database](https://supabase.com/docs/guides/database/overview)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Next.js di Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
