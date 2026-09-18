# In-house Ticketing System

![CI](https://github.com/adiapandi/ticketsys/actions/workflows/ci.yml/badge.svg)

## Tech Stack

- **Backend**: NestJS (TypeScript), Prisma ORM, PostgreSQL, JWT Auth, Nodemailer, node-cron (via `@nestjs/schedule`), SheetJS (`xlsx`) untuk import/export
- **Frontend**: React + Vite, TailwindCSS (dark mode), React Router, Lucide Icons
- **Testing**: Jest (backend), Vitest (frontend)
- **CI/CD**: GitHub Actions

## Fitur

**Ticketing inti**
- CRUD ticket: judul, deskripsi, status, priority, kategori
- Comment thread per ticket, termasuk **internal note** yang cuma keliatan staff
- Staff bisa bikin ticket **atas nama user lain** (untuk kerjaan yang udah selesai duluan, baru dicatat)
- **File attachment** — upload ke ticket, download aman via JWT, validasi tipe & ukuran (maks 10MB)
- **Tag/label** — bisa nambah banyak tag bebas per ticket (autocomplete dari tag yang sudah ada), berguna untuk penanda lintas kategori (misal `recurring`, `urgent-vip`)
- Search, filter (status/priority/department/tag), sorting, dan pagination di daftar ticket
- **Export ticket ke Excel/CSV** — ikut filter yang lagi aktif
- Dashboard dengan statistik ticket yang bisa diklik buat filter langsung

**Multi-Department**
- Ticket ditujukan ke department tertentu (misal IT Support, IT Dev, HRGA) saat dibuat
- **Kategori spesifik per department** — tiap department punya daftar kategori sendiri
- Staff (Admin/Agent) **scoped ke 1 department**, cuma bisa kelola ticket & kategori department-nya sendiri
- **Super Admin** — role di atas Admin, bisa lihat & kelola semua department

**Auth & User Management**
- Login dengan JWT — **tidak ada registrasi publik**, semua akun dibuat oleh admin (satu-satu atau **bulk import via CSV/Excel**)
- Role: **Customer**, **Agent** (scoped ke department), **Admin** (scoped ke department), **Super Admin** (semua department)
- Halaman Settings dengan tab terpisah: **Profile** (foto, nama, email, no. HP), **Security** (ganti password), **Notifications** (preferensi notifikasi), **Appearance** (dark mode)

**Notifikasi**
- **Email notification** (via SMTP/Nodemailer) — ticket baru, ticket di-assign, status berubah, ada balasan baru, SLA breach
- **In-app notification** — bell icon dengan unread count, plus **nada dering** opsional saat ada notifikasi baru
- **Preferensi notifikasi per user** — bisa matiin email secara keseluruhan (master switch) atau per jenis event, terpisah dari notifikasi in-app

**SLA & Kualitas Layanan**
- **SLA tracking** — target waktu respons & resolusi otomatis dihitung berdasarkan priority. Cron job tiap 15 menit cek ticket yang lewat SLA, tandai breach, dan **auto-escalate** priority
- **Audit log** — riwayat perubahan status/priority/assignee/tag per ticket, siapa yang ubah dan kapan
- **CSAT (Customer Satisfaction Rating)** — user kasih rating bintang 1-5 + komentar setelah ticket resolved/closed, ada laporan rata-rata rating & distribusi untuk staff

**Produktivitas Staff**
- **Canned response** — template balasan yang bisa dipakai semua agent/admin lintas department saat membalas ticket

**UI/UX**
- **Sidebar navigation** yang bisa di-collapse, dengan section terpisah untuk fitur staff (Management)
- Dark mode (toggle di halaman Settings, tersimpan di browser)
- Login page dengan ilustrasi custom, live clock, dan opsi "Ingat saya" (sesi tetap login atau hilang saat browser ditutup)



## Cara Menjalankan (Development)

### 1. Jalankan PostgreSQL

```bash
docker compose up -d
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: DATABASE_URL, JWT_SECRET (generate dengan `openssl rand -base64 32`), dll

npx prisma migrate dev --name init
npm run seed        # buat akun admin default
npm run start:dev
```

Backend jalan di `http://localhost:3000/api`.

**Akun admin default setelah seed:**
- Email: `[email protected]`
- Password: `Admin123!`

### Setup Email (opsional untuk development)

Default `SMTP_ENABLED=false` — email tidak benar-benar dikirim, hanya di-log ke console backend. Untuk aktifkan email sungguhan, isi `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` di `.env`. Untuk Gmail, aktifkan 2FA lalu generate [App Password](https://myaccount.google.com/apppasswords).

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend jalan di `http://localhost:5173`.

## Role & Permission

| Aksi | Customer | Agent | Admin (dept) | Super Admin |
|---|---|---|---|---|
| Buat ticket | ✅ | ✅ | ✅ | ✅ |
| Lihat ticket sendiri | ✅ | ✅ | ✅ | ✅ |
| Lihat ticket department sendiri | ❌ | ✅ | ✅ | ✅ (semua dept) |
| Update status/priority/assignee/tag | ❌ | ✅ | ✅ | ✅ |
| Tulis internal note | ❌ | ✅ | ✅ | ✅ |
| Kelola template balasan | ❌ | ✅ | ✅ | ✅ |
| Lihat laporan CSAT | ❌ | ✅ (dept) | ✅ (dept) | ✅ (semua) |
| Beri rating CSAT (di ticket sendiri) | ✅ | ❌ | ❌ | ❌ |
| Kelola kategori | ❌ | ❌ | ✅ (dept sendiri) | ✅ (semua dept) |
| Kelola user | ❌ | ❌ | ✅ (dept sendiri) | ✅ (semua) |
| Kelola department | ❌ | ❌ | ❌ | ✅ |
| Hapus ticket | ❌ | ❌ | ✅ (dept sendiri) | ✅ |

## SLA Policy

Target waktu respons & resolusi per priority

| Priority | Target Respons | Target Resolusi |
|---|---|---|
| Urgent | 1 jam | 4 jam |
| High | 4 jam | 24 jam |
| Medium | 8 jam | 3 hari |
| Low | 24 jam | 7 hari |

Cron job jalan tiap 15 menit, cek ticket yang melewati target resolusi dan belum resolved/closed → tandai breach, naikkan priority satu tingkat, kirim notifikasi ke assignee (sesuai preferensi notifikasi masing-masing).


## Deploy ke Production

Aplikasi ini sudah dipakai di production dengan setup:
- **PM2** untuk menjalankan backend (`dist/main.js`) dan frontend (`serve -s dist`) sebagai background process dengan auto-restart
- **Caddy** atau **Nginx + Certbot** sebagai reverse proxy dengan HTTPS otomatis
- Migration database dijalankan manual (`npx prisma migrate dev`) setiap ada perubahan schema


## Rencana Pengembangan Selanjutnya

- [ ] Ticket watcher/CC — orang lain bisa ikut memantau ticket
- [ ] Merge duplicate ticket
- [ ] @mention di comment
- [ ] Dashboard perbandingan performa antar department (khusus Super Admin)
- [ ] SLA policy yang bisa dikustomisasi per department
- [ ] E2E test (integration test untuk API endpoints)
- [ ] Dockerize backend & frontend untuk deploy yang lebih portable

## Lisensi

Bebas dipakai untuk belajar maupun produksi. MIT License.
