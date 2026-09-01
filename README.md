# In-house Ticketing System

Helpdesk ticketing system yang dibangun dari nol — awalnya project belajar, sekarang udah dipakai buat operasional IT support sehari-hari.

![CI](https://github.com/adiapandi/ticketsys/actions/workflows/ci.yml/badge.svg)

> Ganti `<username>/<nama-repo>` di URL badge atas dengan username & nama repo GitHub kamu sendiri.

## Tech Stack

- **Backend**: NestJS (TypeScript), Prisma ORM, PostgreSQL, JWT Auth, Nodemailer, node-cron (via `@nestjs/schedule`)
- **Frontend**: React + Vite, TailwindCSS (dengan dark mode), React Router
- **Testing**: Jest (backend), Vitest (frontend)
- **CI/CD**: GitHub Actions

## Fitur

**Ticketing inti**
- CRUD ticket: judul, deskripsi, status, priority, kategori
- Comment thread per ticket, termasuk **internal note** yang cuma keliatan staff
- Staff bisa bikin ticket **atas nama user lain** (untuk kerjaan yang udah selesai duluan, baru dicatat)
- **File attachment** — upload ke ticket, download aman via JWT, validasi tipe & ukuran (maks 10MB)
- Search, filter (status/priority), sorting, dan pagination di daftar ticket
- Dashboard dengan statistik ticket yang bisa diklik buat filter langsung

**Auth & User Management**
- Login dengan JWT — **tidak ada registrasi publik**, semua akun dibuat oleh admin
- Role: **Customer** (bikin & lihat ticket sendiri), **Agent** (kelola semua ticket, assign, internal note), **Admin** (semua akses + kelola user & kategori)
- Halaman profil: ubah nama/email/no. HP, upload foto profil, ganti password
- Halaman admin: kelola user (buat, ubah role, hapus) dan kelola kategori

**Notifikasi**
- **Email notification** (via SMTP/Nodemailer) — ticket baru, ticket di-assign, status berubah, ada balasan baru
- **In-app notification** — bell icon di navbar dengan unread count

**SLA & Kualitas Layanan**
- **SLA tracking** — target waktu respons & resolusi otomatis dihitung per priority. Cron job tiap 15 menit cek ticket yang lewat SLA, tandai breach, dan **auto-escalate** priority
- **Audit log** — riwayat perubahan status/priority/assignee per ticket, siapa yang ubah dan kapan
- **CSAT (Customer Satisfaction Rating)** — user kasih rating bintang 1-5 + komentar setelah ticket resolved/closed, ada laporan rata-rata rating & distribusi untuk staff

**Produktivitas Staff**
- **Canned response** — template balasan yang bisa dipakai semua agent/admin saat membalas ticket

**UI/UX**
- Dark mode (toggle 🌙/☀️ di navbar, tersimpan di browser)

## Struktur Project
ticketing-system/
├── .github/workflows/ # GitHub Actions CI
├── backend/ # NestJS API
│ ├── prisma/ # Schema & seed database
│ ├── uploads/ # File attachment & avatar (auto-dibuat, gitignored)
│ └── src/
│ ├── auth/ # Login, ganti password, update profil, upload avatar
│ ├── users/ # Kelola user (admin)
│ ├── tickets/ # CRUD ticket, CSAT
│ ├── comments/ # Comment & internal note
│ ├── attachments/ # Upload & download file
│ ├── categories/ # CRUD kategori (admin)
│ ├── canned-responses/ # Template balasan
│ ├── audit-log/ # Riwayat perubahan ticket
│ ├── notifications/ # Notifikasi in-app
│ ├── mail/ # Kirim email (Nodemailer)
│ └── sla/ # SLA policy, cron auto-escalate
├── frontend/ # React + Vite SPA
│ └── src/
│ ├── pages/
│ ├── components/
│ ├── context/ # Auth & Theme (dark mode)
│ ├── api/
│ └── utils/
└── docker-compose.yml # PostgreSQL untuk development


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

⚠️ Ganti password ini setelah login pertama kali. Karena tidak ada registrasi publik, akun baru **hanya bisa dibuat lewat halaman "Kelola User" oleh admin**.

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

| Aksi | Customer | Agent | Admin |
|---|---|---|---|
| Buat ticket | ✅ | ✅ | ✅ |
| Lihat ticket sendiri | ✅ | ✅ | ✅ |
| Lihat semua ticket | ❌ | ✅ | ✅ |
| Update status/priority/assignee | ❌ | ✅ | ✅ |
| Tulis internal note | ❌ | ✅ | ✅ |
| Kelola template balasan | ❌ | ✅ | ✅ |
| Lihat laporan CSAT | ❌ | ✅ | ✅ |
| Lihat audit log ticket | ❌ | ✅ | ✅ |
| Beri rating CSAT (di ticket sendiri) | ✅ | ❌ | ❌ |
| Hapus ticket | ❌ | ❌ | ✅ |
| Kelola user (buat/ubah role/hapus) | ❌ | ❌ | ✅ |
| Kelola kategori | ❌ | ❌ | ✅ |

## SLA Policy

Target waktu respons & resolusi per priority (bisa diubah di `backend/src/sla/sla.constants.ts`):

| Priority | Target Respons | Target Resolusi |
|---|---|---|
| Urgent | 1 jam | 4 jam |
| High | 4 jam | 24 jam |
| Medium | 8 jam | 3 hari |
| Low | 24 jam | 7 hari |

Cron job jalan tiap 15 menit, cek ticket yang melewati target resolusi dan belum resolved/closed → tandai breach, naikkan priority satu tingkat, kirim notifikasi ke assignee.

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

CI otomatis jalan di GitHub Actions setiap push/PR ke branch `main` — build + test backend dan frontend secara paralel.

## Deploy ke Production

Aplikasi ini sudah dipakai di production dengan setup:
- **PM2** untuk menjalankan backend (`dist/main.js`) dan frontend (`serve -s dist`) sebagai background process dengan auto-restart
- **Caddy** atau **Nginx + Certbot** sebagai reverse proxy dengan HTTPS otomatis
- Migration database dijalankan manual (`npx prisma migrate dev`) setiap ada perubahan schema

Langkah detail deploy production tersedia di riwayat percakapan pengembangan project ini — ringkasnya: `npm run build` di kedua folder, jalankan lewat PM2, arahkan domain lewat reverse proxy ke port backend (3000) untuk path `/api/*` dan ke hasil build frontend untuk path lainnya.

## Rencana Pengembangan Selanjutnya

- [ ] Tag/label ticket (selain kategori)
- [ ] Ticket watcher/CC — orang lain bisa ikut memantau ticket
- [ ] Merge duplicate ticket
- [ ] @mention di comment
- [ ] E2E test (integration test untuk API endpoints)
- [ ] Dockerize backend & frontend untuk deploy yang lebih portable

## Lisensi

Bebas dipakai untuk belajar maupun produksi. MIT License.
