# Planning: Implementasi Halaman & Formulir Mobile-First Inspeksi Audit K3

Dokumen ini memuat panduan *high-level planning* untuk perancangan antarmuka, alur pengguna (*user flow*), dan integrasi backend formulir inspeksi Audit K3 berbasis *mobile-first* (Checklist Kepatuhan K3 & Pelaporan Cepat Temuan Bahaya) pada aplikasi **HSE Smart**.

---

## 1. Alur Pengguna (User Flow) & Fungsionalitas Utama

Antarmuka inspeksi dirancang khusus untuk kenyamanan penggunaan satu tangan (*thumb-friendly*) oleh auditor lapangan:

```
[ Beranda / Navigasi ]
        │
        ▼
[ Alur 1: Pemilihan Lokasi ]
  ├── 1. Pilih Gedung Kampus (Building)
  └── 2. Pilih Ruangan Target (Room) ──> Deteksi Kategori (Lab, Workshop, Kelas, dll.)
        │
        ▼
[ Alur 2: Formulir Checklist K3 ]
  ├── Template Kriteria Otomatis per Kategori Ruangan
  ├── Toggle Bivalen Besar (Thumb-friendly): [ Sesuai (Hijau) ] / [ Tidak Sesuai (Merah) ]
  ├── Input Catatan Temuan Dinamis (Wajib jika "Tidak Sesuai")
  │
  └── [ Alur 3: Pelaporan Cepat Temuan Bahaya (Quick Hazard Form) ]
        ├── Pemicu: Tombol Lapor / Floating Action Button
        ├── Modal/Bottom Drawer Ringkas:
        │     ├── Judul Bahaya & Deskripsi
        │     ├── Selector Level Risiko: [ Low ] / [ Medium ] / [ High ]
        │     └── Input Foto Kamera (HTML5 file capture: capture="environment")
        └── Simpan Temuan Terintegrasi
        │
        ▼
[ Alur 4: Penyimpanan & Sinkronisasi Data ]
  ├── Server Actions: Upsert status item ke tabel `audit_items`
  └── Server Actions: Insert data temuan ke tabel `hazard_findings`
```

### A. Alur Pemilihan Lokasi (Location Selection)
- Auditor memilih **Gedung** melalui daftar card/selektor bertingkat.
- Setelah gedung dipilih, sistem memuat daftar **Ruangan** pada gedung tersebut beserta informasi lantai dan kategori ruangan (`lab`, `workshop`, `classroom`, `office`, `canteen`).
- Membuka atau melanjutkan sesi audit aktif untuk lokasi terpilih.

### B. Formulir Checklist K3 (Thumb-Friendly UI)
- Kriteria audit disesuaikan dengan kategori ruangan yang sedang diperiksa.
- Tombol aksi kepatuhan bivalen berukuran besar (tinggi minimal 44–48px) agar mudah ditekan jempol saat bergerak di lapangan:
  - **Sesuai (*Compliant*)**: Status hijau dengan ikon centang.
  - **Tidak Sesuai (*Non-Compliant*)**: Status merah/amber dengan ikon silang/peringatan.
- Kolom input catatan ketidaksesuaian terbuka secara interaktif jika item ditandai "Tidak Sesuai".

### C. Pelaporan Temuan Bahaya (Quick Hazard Form)
- *Bottom sheet* / modal cepat untuk mencatat temuan bahaya insidental di lokasi tanpa mengganggu alur checklist utama.
- Field input esensial:
  - **Judul Temuan** (misal: "Penumpukan Beban Stopkontak")
  - **Tingkat Risiko**: Chip seleksi instan (`Low` / `Medium` / `High`).
  - **Deskripsi & Rekomendasi**: Detail kondisi bahaya.
  - **Foto Bukti**: Trigger kamera ponsel langsung menggunakan elemen HTML5 file input (`accept="image/*"` dengan `capture="environment"`) disertai pratinjau thumbnail.

### D. Server Actions & Mutasi Database
- Menggunakan Next.js Server Actions untuk interaksi langsung dengan database Drizzle ORM:
  - `createOrGetAuditSession`: Inisiasi / pengambilan sesi audit aktif.
  - `saveAuditItemCheck`: Melakukan penyimpanan / *upsert* data checklist ke tabel `audit_items`.
  - `recordHazardFinding`: Menyimpan data temuan bahaya ke tabel `hazard_findings`.

---

## 2. Struktur File & Modul Target

```text
src/
├── actions/
│   └── audit-actions.ts              # Server Actions: kelola sesi audit, upsert checklist, & insert temuan
├── app/
│   └── audit/
│       ├── page.tsx                  # Halaman Step 1: Pemilihan Gedung & Ruangan
│       └── [auditId]/
│           └── rooms/
│               └── [roomId]/
│                   └── page.tsx      # Halaman Step 2: Eksekusi checklist & pelaporan temuan ruangan
├── components/
│   └── audit/
│       ├── LocationSelector.tsx      # Komponen seleksi bertingkat Gedung -> Ruangan
│       ├── ChecklistContainer.tsx    # State wrapper & progress bar inspeksi ruangan
│       ├── ChecklistItemCard.tsx     # Kartu butir checklist dengan toggle ramah jempol & textarea catatan
│       ├── QuickHazardDrawer.tsx     # Bottom sheet modal formulir temuan bahaya cepat
│       ├── CameraCaptureInput.tsx    # Komponen capture kamera HTML5 + preview thumbnail
│       └── RiskLevelSelector.tsx     # Komponen pemilihan level risiko (Low/Medium/High)
└── lib/
    └── constants/
        └── audit-templates.ts        # Master data template kriteria K3 per kategori ruangan
```

---

## 3. Rancangan Komponen UI Konseptual

1. **`LocationSelector`**:
   - Card interaktif dengan visual badge per kategori ruangan, indikator lantai, dan transisi mulus menuju formulir audit.
2. **`ChecklistItemCard`**:
   - Touch target lebar dengan visual feedback kontras tinggi dan transisi expand/collapse untuk kolom catatan.
3. **`QuickHazardDrawer`**:
   - Drawer slide-up mobile-first yang memungkinkan input cepat satu tangan dan penutupan drawer yang intuitif.
4. **`CameraCaptureInput`**:
   - Antarmuka upload/kamera responsif dengan dukungan penggantian gambar dan visualisasi status lampiran foto.

---

## 4. Definition of Done & Acceptance Criteria

Tahap pengerjaan dinyatakan selesai dan dapat diterima jika memenuhi kriteria:

1. **Navigasi & Pemilihan Lokasi Berjalan**:
   - Pengguna dapat memilih Gedung dan Ruangan, lalu diarahkan ke lembar checklist ruangan terkait dengan kriteria yang sesuai kategori ruangan.
2. **Interaktivitas Checklist Responsif**:
   - Toggle status "Sesuai" dan "Tidak Sesuai" berfungsi lancar pada layar mobile (viewport smartphone 360px - 430px).
   - Kolom catatan terbuka dan dapat diisi saat status "Tidak Sesuai" dipilih.
3. **Penyimpanan Data Terverifikasi**:
   - Perubahan status checklist tersimpan ke tabel `audit_items` via Server Action dan persist saat halaman di-refresh.
   - Pelaporan temuan bahaya (judul, deskripsi, level risiko, foto) tersimpan ke tabel `hazard_findings`.
4. **Validasi Kompilasi & Build**:
   - Perintah `npm run build` berjalan sukses tanpa error TypeScript, ESLint, maupun kendala hidrasi client/server components.
