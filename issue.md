# Planning: Implementasi QR Scanner Kamera untuk Validasi Aset K3 Lapangan

Dokumen ini memuat panduan *high-level planning* untuk pembangunan fitur pemindai QR Code berbasis kamera perangkat (*native camera*) guna memvalidasi dan memeriksa kondisi aset-aset keselamatan K3 (APAR, Kotak P3K, Fire Alarm, Hydran, Rambu Evakuasi) di lapangan pada aplikasi **HSE Smart**.

---

## 1. Alur Pengguna (User Flow) & Fungsionalitas Utama

```
[ Navigasi Bawah (Bottom Bar) ] ──> [ Halaman /scan ]
                                           │
                                           ▼
                            [ Inisialisasi Kamera Native ]
                              (Permintaan izin kamera laptop / kamera belakang HP)
                                           │
                                           ▼
                            [ Viewfinder / Kotak Bidik Scanner ]
                              (Overlay visual pemindaian real-time)
                                           │
                                           ▼ (QR Code Terdeteksi, misal: HSE-APAR-001)
                            [ Query Data Aset ke Database ]
                                           │
                                           ▼
                            [ Modal / Bottom Sheet Status Aset ]
                              ├── Detail: Kode, Tipe Aset, Lokasi (Gedung & Ruangan)
                              ├── Status Fisik: Aktif / Rusak
                              ├── Tanggal Kedaluwarsa & Indikator Masa Berlaku
                              │
                              ├── [ Tombol 1: Kondisi Aman / Sesuai ] ──> Konfirmasi Verifikasi
                              └── [ Tombol 2: Laporkan Bahaya / Rusak ] ──> Form Temuan Bahaya
```

### A. Layanan Kamera Pemindai (html5-qrcode)
- Menggunakan library `html5-qrcode` untuk mengakses kamera native perangkat tanpa ketergantungan native framework.
- Otomatis memprioritaskan kamera belakang pada perangkat smartphone (`facingMode: "environment"`).
- Menyediakan visual viewport bidik (kotak pandu pemindaian) dengan animasi penunjuk garis pemindai (*scanner overlay*).
- Penanganan izin (*permission handling*) yang ramah pengguna jika akses kamera ditolak atau perangkat tidak memiliki kamera.

### B. Alur Validasi Aset K3
- Saat QR Code terbaca, pemindai langsung menjeda (*pause*) pembacaan untuk mencegah pemindaian berulang.
- Sistem mencari data aset di tabel `safety_assets` (beserta relasi ke tabel `rooms` dan `buildings`) berdasarkan `asset_code`.
- Jika data ditemukan, tampilkan kartu modal informasi aset:
  - **Nama & Kode Unik**: Misal `HSE-APAR-001`.
  - **Tipe Aset**: APAR, P3K, Fire Alarm, Hydran, atau Evacuation Sign.
  - **Lokasi Terpasang**: Nama Gedung & Ruangan.
  - **Masa Berlaku / Expiry Date**: Peringatan visual jika aset telah kedaluwarsa (*expired*).
  - **Status Fisik Terakhir**: `active`, `expired`, atau `damaged`.
- Menyediakan dua tombol aksi cepat:
  1. **"Kondisi Aman / Sesuai"**: Mengonfirmasi bahwa aset dalam kondisi baik dan siap digunakan.
  2. **"Laporkan Bahaya / Rusak"**: Membuka pelaporan temuan bahaya yang langsung mengikat data temuan ke aset dan ruangan tersebut.

### C. Rute & Aksesibilitas
- Membuat rute halaman khusus `/scan`.
- Memperbarui `MobileShell` bottom navigation bar agar auditor dapat berpindah ke fitur pemindai kamera dengan 1 kali tap.

---

## 2. Struktur File Target

```text
src/
├── actions/
│   └── asset-actions.ts              # Server Actions: pencarian aset via QR code & update verifikasi
├── app/
│   └── scan/
│       └── page.tsx                  # Halaman utama pemindai QR scanner K3
├── components/
│   ├── layout/
│   │   └── MobileShell.tsx           # Integrasi tautan navigasi /scan pada bottom bar
│   └── scan/
│       ├── QRScannerView.tsx         # Komponen container kamera html5-qrcode & overlay bidik
│       └── AssetValidationModal.tsx  # Modal detail status aset & tombol aksi cepat (Aman / Rusak)
```

---

## 3. Komponen UI Konseptual

1. **`QRScannerView`**:
   - Area video canvas dengan rasio persegi responsif di tengah layar.
   - Border sudut penanda fokus (*reticle visual*) dan pesan instruksi: *"Arahkan kamera ke stiker QR Code Aset K3"*.
   - Tombol toggle senter/flash jika didukung oleh perangkat.
2. **`AssetValidationModal`**:
   - Sheet modal yang muncul dari bawah (*bottom-up slide*).
   - Badge status: Hijau (Aktif & Aman), Merah (Kedaluwarsa/Rusak).
   - Dua tombol jempol kontras: Tombol Hijau ("Kondisi Aman/Sesuai") dan Tombol Merah ("Laporkan Bahaya/Rusak").

---

## 4. Dependensi Tambahan yang Diperlukan

- **`html5-qrcode`**: Library pemindai QR code cross-platform berbasis HTML5 Web API.

---

## 5. Definition of Done & Acceptance Criteria

Fitur dinyatakan selesai apabila memenuhi kriteria berikut:

1. **Akses Kamera Berfungsi**:
   - Kamera laptop atau smartphone dapat diaktifkan pada halaman `/scan` setelah izin diberikan oleh pengguna.
   - Area bidik kamera menampilkan feed gambar langsung dengan overlay visual kotak scanner.
2. **Dekode QR Code Akurat**:
   - Pemindai berhasil membaca teks QR Code aset (misal: `HSE-APAR-001`) dan tidak melakukan spamming request berkali-kali setelah terdeteksi.
3. **Modal Validasi Aset Muncul**:
   - Data aset yang tersimpan di database berhasil ditampilkan pada modal (tipe aset, ruangan/gedung, masa berlaku, status).
   - Aksi "Kondisi Aman" mencatat status verifikasi aset.
   - Aksi "Laporkan Bahaya" mengarahkan atau membuka form pencatatan temuan bahaya terkait.
4. **Navigasi Mobile Terintegrasi**:
   - Menu pemindai dapat diakses langsung dari bottom navigation bar di seluruh aplikasi.
5. **Kompilasi & Build Bersih**:
   - Perintah `npm run build` berjalan sukses tanpa error TypeScript maupun linting.
