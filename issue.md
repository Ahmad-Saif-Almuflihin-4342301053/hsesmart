# Planning: Implementasi Skema Database Audit K3 Kampus

Dokumen ini memuat panduan *high-level planning* untuk merancang dan menyusun skema database Audit K3 Kampus (Gedung, Ruangan, Aset K3, Checklist Audit, dan Temuan Bahaya) menggunakan Drizzle ORM (PostgreSQL).

---

## 1. Ringkasan Domain & Kebutuhan Relasi

Sistem audit K3 kampus terdiri dari 4 klaster entitas utama:

```
[ buildings ] ──< (1:N) ──> [ rooms ] ──< (1:N) ──> [ safety_assets ]
      │                         │
      │ (1:N)                   │ (1:N)
      ▼                         ▼
  [ audits ] ───< (1:N) ───> [ audit_items ]
      │                         ▲
      │ (1:N)                   │
      ▼                         │ (1:N)
[ hazard_findings ] ────────────┘
```

### A. Lokasi Kampus
1. **`buildings` (Gedung)**
   - Atribut: `id` (PK, serial), `name` (text, not null), `total_floors` (integer, not null), `created_at` (timestamp).
2. **`rooms` (Ruangan)**
   - Atribut: `id` (PK, serial), `building_id` (FK -> `buildings.id`), `name` (text), `floor` (integer), `category` (enum/text: `classroom`, `lab`, `canteen`, `workshop`, `office`), `created_at` (timestamp).
   - Relasi: Banyak ruangan berada dalam satu gedung (`buildings` 1:N `rooms`).

### B. Aset & Titik Fasilitas K3
3. **`safety_assets` (Aset Fasilitas Keselamatan)**
   - Atribut: `id` (PK, serial), `room_id` (FK -> `rooms.id`), `asset_code` (text, unique/qr-code), `type` (enum/text: `apar`, `p3k`, `fire_alarm`, `hydran`, `evacuation_sign`), `expiry_date` (timestamp/date), `status` (enum/text: `active`, `expired`, `damaged`), `created_at` (timestamp).
   - Relasi: Setiap aset keselamatan terpasang pada satu ruangan tertentu (`rooms` 1:N `safety_assets`).

### C. Pelaksanaan Audit & Checklist Kepatuhan
4. **`audits` (Sesi Audit)**
   - Atribut: `id` (PK, serial), `building_id` (FK -> `buildings.id`), `auditor_name` (text), `audit_date` (timestamp/date), `status` (enum/text: `draft`, `completed`), `created_at` (timestamp).
   - Relasi: Satu sesi audit menginspeksi satu gedung spesifik (`buildings` 1:N `audits`).
5. **`audit_items` (Item Checklist Audit)**
   - Atribut: `id` (PK, serial), `audit_id` (FK -> `audits.id`), `room_id` (FK -> `rooms.id`), `criteria_label` (text), `is_compliant` (boolean), `notes` (text), `created_at` (timestamp).
   - Relasi: Menghubungkan sesi audit dengan ruangan yang diperiksa (`audits` 1:N `audit_items` dan `rooms` 1:N `audit_items`).

### D. Temuan Bahaya Lapangan
6. **`hazard_findings` (Temuan Bahaya / Hazard)**
   - Atribut: `id` (PK, serial), `audit_id` (FK -> `audits.id`), `room_id` (FK -> `rooms.id`), `title` (text), `description` (text), `photo_url` (text), `risk_level` (enum/text: `low`, `medium`, `high`), `status` (enum/text: `open`, `in_progress`, `resolved`), `created_at` (timestamp).
   - Relasi: Temuan dicatat dalam sesi audit tertentu dan terikat ke ruangan tempat bahaya ditemukan (`audits` 1:N `hazard_findings` dan `rooms` 1:N `hazard_findings`).

---

## 2. Struktur File Target (`src/db/schema/*`)

Untuk menjaga modularitas kode dan kemudahan *maintenance*, skema dipecah per domain konteks:

```text
src/db/
├── index.ts                   # Ekspor instance db client & relasi skema gabungan
└── schema/
    ├── locations.ts           # Definisi tabel `buildings` dan `rooms`
    ├── safety-assets.ts       # Definisi tabel `safety_assets` & enum tipe/status aset
    ├── audits.ts              # Definisi tabel `audits` dan `audit_items`
    ├── hazard-findings.ts     # Definisi tabel `hazard_findings` & enum risk level/status
    └── index.ts               # Re-export seluruh tabel, enums, dan Drizzle relations
```

---

## 3. Langkah Implementasi (Implementation Tasks)

1. **Definisi Enums & Tabel Skema**:
   - Buat file skema modular di `src/db/schema/` sesuai struktur file target.
   - Tetapkan tipe data kolom, constraints (`notNull`, `primaryKey`, `defaultNow`, `unique`), serta *foreign keys* cascading yang tepat.
2. **Definisi Drizzle Relations (`relations`)**:
   - Konfigurasikan relasi satu-ke-banyak (1:N) dan relasi balik (*belongs-to*) menggunakan helper `relations` dari `drizzle-orm` untuk mempermudah *relational query*.
3. **Ekspor Terpusat**:
   - Satukan ekspor seluruh tabel, enums, dan relations di `src/db/schema/index.ts`.
4. **Verifikasi Migrasi**:
   - Jalankan migration generator Drizzle Kit untuk memastikan konsistensi seluruh relasi dan tipe data.

---

## 4. Definition of Done & Acceptance Criteria

Tahap implementasi skema database dinyatakan selesai dan diterima apabila memenuhi kriteria berikut:

1. **Struktur Modul Sesuai**:
   - Semua domain (Lokasi, Aset K3, Audit/Checklist, Temuan Bahaya) terorganisasi rapi di bawah folder `src/db/schema/`.
2. **Drizzle Kit Generation Berhasil**:
   - Perintah eksekusi `npx drizzle-kit generate` (atau `npm run db:generate`) berjalan sukses tanpa error syntax, circular dependency, atau invalid foreign key.
   - File migrasi SQL baru berhasil dibuat di direktori `src/db/migrations/`.
3. **Drizzle Check & Type Checking Lolos**:
   - Perintah `npx tsc --noEmit` atau `npm run build` berhasil mengompilasi seluruh file skema tanpa *type errors* pada Drizzle ORM types.
4. **Integritas Relasi**:
   - Seluruh foreign key (`building_id`, `room_id`, `audit_id`) terkonfigurasi dengan benar ke tabel induk masing-masing.
