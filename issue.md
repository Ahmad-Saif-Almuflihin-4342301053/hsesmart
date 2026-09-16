# Planning: Implementasi Halaman & Formulir Mobile-First Inspeksi Audit K3

Dokumen ini berisi rancangan *high-level planning* untuk pembangunan antarmuka dan alur formulir inspeksi Audit K3 berbasis *mobile-first* (Checklist K3 & Pelaporan Temuan Bahaya) pada aplikasi **HSE Smart**.

---

## 1. Alur Pengguna (User Flow) & Rancangan Fungsional

Inspeksi lapangan K3 dirancang dengan interaksi *thumb-friendly* (ramah satu tangan) agar auditor lapangan dapat mencatat kepatuhan secara cepat tanpa hambatan:

```
[ Inisiasi Audit ]
       │
       ▼
[ Pilih Gedung & Ruangan ] ──(Filter Kategori Ruangan: Lab / Kelas / Bengkel / dll)
       │
       ▼
[ Formulir Checklist K3 ]
  ├── Toggle Status: [ Sesuai (Hijau) ] / [ Tidak Sesuai (Merah) ]
  ├── Catatan Temuan Khusus (jika tidak sesuai)
  │
  └── [ Quick Hazard Action Button ]
              │
              ▼
    [ Form Cepat Temuan Bahaya ]
      ├── Judul & Deskripsi
      ├── Risk Level: Low / Medium / High
      ├── Input Foto Kamera (HTML5 file capture)
      └── Simpan Temuan ke Database
       │
       ▼
[ Simpan Draft / Finalisasi Audit ]
```

### A. Alur Pemilihan Lokasi
- Auditor memulai sesi baru dengan memilih **Gedung** (*Building*) dari daftar dropdown/card interaktif.
- Setelah gedung terpilih, daftar **Ruangan** (*Rooms*) pada gedung tersebut ditampilkan dengan indikator lantai dan kategori ruangan (misal: Ruang Teori, Laboratorium Kimia, Workshop Mesin).
- Sistem memuat template checklist spesifik sesuai dengan kategori ruangan terpilih.

### B. Formulir Checklist K3 (Thumb-Friendly UI)
- Setiap kriteria audit ditampilkan dalam bentuk kartu (*card*) ringkas.
- **Opsi Kepatuhan**: Menggunakan tombol toggle atau switch berukuran minimal 44x44px untuk kenyamanan tap jempol:
  - **Sesuai (*Compliant*)**: Aksen warna hijau dengan ikon centang.
  - **Tidak Sesuai (*Non-Compliant*)**: Aksen warna merah/amber dengan ikon peringatan.
- **Input Catatan Dinamis**: Muncul secara otomatis atau ekspansif saat item ditandai "Tidak Sesuai".

### C. Pelaporan Temuan Bahaya (Quick Hazard Form)
- Tombol aksi mengambang (*Floating Action Button*) atau *drawer/bottom sheet* untuk melaporkan bahaya mendadak di lokasi.
- Field isian ringkas:
  - **Judul Temuan** (misal: "Kabel Panel Listrik Terbuka")
  - **Deskripsi & Rekomendasi Tindakan**
  - **Level Risiko**: Pilihan chip satu ketukan (`Low` / `Medium` / `High`)
  - **Input Foto**: Komponen input HTML5 yang memicu kamera ponsel langsung (`accept="image/*"` dengan atribut `capture="environment"`).

### D. Server Actions & Mutasi Database
- Memanfaatkan **Next.js Server Actions** untuk mutasi langsung ke database Drizzle ORM tanpa perlu konfigurasi boilerplate REST API manual:
  - `createOrGetAuditSession`: Membuka sesi audit untuk gedung terpilih.
  - `saveAuditItemCheck`: Melakukan penyimpanan / *upsert* status checklist ke tabel `audit_items`.
  - `recordHazardFinding`: Menyimpan catatan bahaya ke tabel `hazard_findings`.

---

## 2. Struktur File Target

Pengorganisasian kode modular pada Next.js App Router dan direktori komponen:

```text
src/
├── actions/
│   └── audit-actions.ts              # Server actions: kelola sesi audit, checklist, & temuan
├── app/
│   ├── (dashboard)/
│   │   └── page.tsx                  # Beranda dengan tombol CTA "Mulai Inspeksi Baru"
│   └── audit/
│       ├── page.tsx                  # Step 1: Halaman pemilihan Gedung & Ruangan
│       └── [auditId]/
│           └── rooms/
│               └── [roomId]/
│                   └── page.tsx      # Step 2: Halaman eksekusi checklist & temuan ruangan
├── components/
│   └── audit/
│       ├── LocationSelector.tsx      # Selector bertingkat Gedung -> Ruangan
│       ├── ChecklistContainer.tsx    # State container checklist ruangan
│       ├── ChecklistItemCard.tsx     # Komponen kartu checklist dengan toggle ramah jempol
│       ├── QuickHazardDrawer.tsx     # Bottom sheet / modal pelaporan cepat temuan bahaya
│       ├── CameraCaptureInput.tsx    # Komponen input foto kamera HTML5 + preview thumbnail
│       └── RiskLevelSelector.tsx     # Selector pill/chip untuk tingkat risiko bahaya
└── lib/
    └── constants/
        └── audit-templates.ts        # Kumpulan master kriteria K3 per kategori ruangan
```

---

## 3. Komponen UI Konseptual

1. **`LocationSelector`**:
   - Menampilkan card pemilihan gedung dan grid pemilihan ruangan dengan badge kategori ruangan.
2. **`ChecklistItemCard`**:
   - Komponen dengan tombol toggle bivalen besar (50-60px height) agar mudah di-tap dengan jempol saat auditor berjalan.
   - Text area catatan dengan transisi *accordion/expand*.
3. **`QuickHazardDrawer`**:
   - *Slide-up bottom sheet* yang tidak menutupi seluruh layar secara kaku, memungkinkan pengisian laporan insidental secara cepat tanpa kehilangan konteks halaman audit.
4. **`CameraCaptureInput`**:
   - Tombol trigger kamera yang menampilkan ikon kamera besar, preview thumbnail hasil foto, dan tombol hapus/ambil ulang.

---

## 4. Master Data Kriteria Audit (`audit-templates.ts`)

Menyediakan daftar standar kriteria inspeksi K3 kampus terstruktur berdasarkan kategori ruangan:
- **Laboratorium**: Penyimpanan bahan B3, kelayakan eye washer/shower, ventilasi exhaust, ketersediaan APAR tipe CO2/Powder.
- **Workshop/Bengkel**: Jalur evakuasi bebas rintangan, grounding mesin listrik, ketersediaan kotak P3K lengkap, SOP alat berat.
- **Kelas/Kantor**: Kelayakan instalasi stopkontak, penerangan memadai, rambu petunjuk jalur evakuasi, kebersihan dan ergonomi.
- **Kantin/Umum**: Kebersihan sanitasi, ketersediaan alat pemadam, jalur evakuasi darurat, penempatan tabung gas aman.

---

## 5. Definition of Done & Acceptance Criteria

Fitur dinyatakan selesai dan lolos verifikasi jika memenuhi kriteria berikut:

1. **Alur Pemilihan Lokasi Berfungsi**:
   - Auditor dapat memilih Gedung dan Ruangan dari data database (atau seed initial data), lalu diarahkan ke halaman checklist ruangan terkait.
2. **Interaktivitas Checklist (Thumb-Friendly)**:
   - Tombol toggle "Sesuai" dan "Tidak Sesuai" responsif pada layar mobile (lebar 360px - 430px).
   - Menandai "Tidak Sesuai" membuka kolom input catatan temuan.
3. **Penyimpanan Checklist Terverifikasi**:
   - Perubahan status checklist tersimpan ke tabel `audit_items` via Server Action dan mempertahankan status saat halaman dimuat ulang (*refresh*).
4. **Pelaporan Temuan Bahaya Berhasil**:
   - Modal/Drawer temuan bahaya dapat dibuka, menerima input judul, deskripsi, level risiko, dan file foto dari input kamera.
   - Data temuan tersimpan ke tabel `hazard_findings` dan terhubung dengan `audit_id` serta `room_id` yang sesuai.
5. **Kompilasi & Build Bersih**:
   - Perintah `npm run build` berjalan tanpa error TypeScript, ESLint, maupun masalah SSR/Client component hydration.
