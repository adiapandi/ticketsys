# In-house Ticketing System

Helpdesk ticketing system sederhana, dibangun dari nol sebagai project belajar (dan portfolio 😄).

## Tech Stack

- **Backend**: NestJS (TypeScript), Prisma ORM, PostgreSQL, JWT Auth
- **Frontend**: React + Vite, TailwindCSS, React Router
- **Auth**: JWT dengan role-based access control (ADMIN / AGENT / CUSTOMER)

## Fitur

- Register & login dengan JWT
- Role: **Customer** (bikin & lihat tiket sendiri), **Agent** (kelola semua tiket, assign, internal note), **Admin** (semua akses + kelola user)
- CRUD ticket: judul, deskripsi, status, priority, kategori
- Assign ticket ke agent
- Comment thread per ticket, termasuk **internal note** yang cuma keliatan staff
- Dashboard dengan statistik ticket (open/in progress/resolved/closed)
- Filter & search ticket
- **File attachment** — upload file ke ticket (saat create maupun setelahnya), download aman via JWT, validasi tipe & ukuran file (maks 10MB)
- **Email notification** (via SMTP/Nodemailer) — dikirim otomatis saat: ticket baru dibuat (ke semua agent/admin), ticket di-assign, status berubah, ada balasan baru
- **In-app notification** — bell icon di navbar dengan unread count, polling tiap 30 detik
- **SLA tracking** — target waktu respons & resolusi otomatis dihitung berdasarkan priority saat ticket dibuat. Cron job tiap 15 menit cek ticket yang lewat SLA, tandai breach, dan **auto-escalate** priority satu tingkat + notifikasi ke assignee
- **Kelola kategori** — CRUD kategori lewat UI (khusus admin), dipakai saat membuat/mengelola ticket

## Struktur Project

```
ticketing-system/
├── backend/          # NestJS API
│   ├── prisma/       # Schema & seed database
│   ├── uploads/      # File attachment tersimpan di sini (auto-dibuat, gitignored)
│   └── src/
│       ├── auth/
│       ├── users/
│       ├── tickets/
│       ├── comments/
│       ├── attachments/    # Upload & download file
│       ├── mail/           # Kirim email notifikasi (Nodemailer)
│       ├── notifications/  # Notifikasi in-app (bell icon)
│       ├── sla/            # SLA policy, due date calculation, cron auto-escalate
│       └── categories/     # CRUD kategori (admin only)
├── frontend/         # React + Vite SPA
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── api/
└── docker-compose.yml # PostgreSQL untuk development
```

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
# edit .env kalau perlu (JWT_SECRET, dll)

npx prisma migrate dev --name init
npm run seed        # buat akun admin default
npm run start:dev
```

Backend jalan di `http://localhost:3000/api`.

**Akun admin default setelah seed:**
- Email: `[email protected]`
- Password: `Admin123!`

⚠️ Ganti password ini setelah login pertama kali, atau hapus/ubah seed script sebelum deploy production.

### Setup Email (opsional untuk development)

Secara default `SMTP_ENABLED=false` — email tidak benar-benar dikirim, hanya di-log ke console backend. Untuk aktifkan email sungguhan:

```env
SMTP_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password-kamu   # Gmail: pakai App Password, bukan password akun biasa
MAIL_FROM="Ticketing System <your-email@gmail.com>"
```

Kalau pakai Gmail, aktifkan 2FA dulu lalu generate [App Password](https://myaccount.google.com/apppasswords). Provider SMTP lain (Mailgun, SendGrid, SMTP kantor sendiri) tinggal sesuaikan `SMTP_HOST`/`SMTP_PORT`.

### SLA Policy

Target waktu respons & resolusi per priority (bisa diubah di `backend/src/sla/sla.constants.ts`):

| Priority | Target Respons | Target Resolusi |
|---|---|---|
| Urgent | 1 jam | 4 jam |
| High | 4 jam | 24 jam |
| Medium | 8 jam | 3 hari |
| Low | 24 jam | 7 hari |

Cron job jalan tiap 15 menit (`SlaService.checkOverdueTickets`), cek ticket yang melewati target resolusi dan belum resolved/closed → tandai `slaBreached`, naikkan priority satu tingkat (LOW→MEDIUM→HIGH→URGENT), dan kirim notifikasi ke assignee (atau semua staff kalau belum di-assign).

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
| Hapus ticket | ❌ | ❌ | ✅ |
| Kelola role user | ❌ | ❌ | ✅ |

Catatan: user baru yang register otomatis jadi role `CUSTOMER`. Untuk naikkan jadi `AGENT`/`ADMIN`, pakai endpoint `PATCH /api/users/:id/role` (perlu login sebagai admin), atau ubah langsung lewat `npx prisma studio`.

## Rencana Pengembangan Selanjutnya

Beberapa hal yang belum diimplementasi dan bisa jadi next steps:

- [ ] Audit log (siapa mengubah apa)
- [ ] Halaman admin untuk kelola user & role
- [ ] Pagination di ticket list
- [ ] Testing (unit test untuk service, e2e untuk API)
- [ ] Deploy: Dockerize backend & frontend untuk production
- [ ] Dashboard SLA compliance rate (persentase ticket yang selesai sebelum due date)

## Lisensi

Bebas dipakai untuk belajar. MIT License.
