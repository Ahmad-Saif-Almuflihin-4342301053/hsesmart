# Planning: Scaffolding Project Audit K3 (HSE Smart)

Dokumen ini berisi panduan *high-level planning* untuk proses scaffolding awal aplikasi Audit K3 (**HSE Smart**). Dokumen ini ditujukan sebagai acuan bagi implementation agent / junior developer.

---

## 1. Arsitektur & Pilihan Tech Stack

- **Framework**: **Next.js (App Router, TypeScript)**
  - *Alasan*: Mendukung full-stack dalam satu codebase (Server Components, API Routes/Server Actions), integrasi metadata PWA mudah, dan performa tinggi untuk web app mobile-first.
- **Styling**: **Tailwind CSS** (Mobile-first responsive utilities, safe-area padding).
- **Icon Library**: **lucide-react** (Standar visual modern dan ringan).
- **Backend & Database**: **Drizzle ORM** dengan driver **PostgreSQL** (opsional MySQL) untuk mengelola data inspeksi K3, temuan (*findings*), dan kepatuhan (*compliance checklist*).
- **Mobile / PWA**: Web App Manifest (`manifest.json`), meta tags viewport mobile-first, dan konfigurasi mode `standalone`.

---

## 2. Daftar Dependensi

### Production Dependencies (`dependencies`)
- `next`: Framework React utama (App Router)
- `react`, `react-dom`: Library core UI
- `lucide-react`: Kumpulan ikon HSE/Audit (checklist, alert, camera, user, report)
- `drizzle-orm`: TypeScript ORM untuk manipulasi data audit/inspeksi
- `postgres` (atau `mysql2` jika target database MySQL): Database client driver
- `clsx`, `tailwind-merge`: Helper manipulasi class Tailwind conditionally

### Development Dependencies (`devDependencies`)
- `typescript`: Type safety
- `@types/react`, `@types/react-dom`, `@types/node`: Type definitions
- `tailwindcss`, `postcss`, `autoprefixer`: Toolchain CSS
- `drizzle-kit`: Migration tool dan schema generator untuk Drizzle
- `dotenv`: Environment variables management

---

## 3. Rekomendasi Struktur Folder

```text
hsesmart/
├── public/
│   ├── icons/                 # PWA icons (192x192, 512x512)
│   └── manifest.json          # Web App Manifest PWA dasar
├── src/
│   ├── app/
│   │   ├── (auth)/            # Routing grup untuk login/otentikasi
│   │   ├── (dashboard)/       # Routing grup antarmuka audit K3
│   │   │   ├── audits/        # Halaman daftar & formulir inspeksi
│   │   │   └── page.tsx       # Beranda / ringkasan kepatuhan K3
│   │   ├── api/               # Endpoint REST API (bila dibutuhkan client)
│   │   ├── favicon.ico
│   │   ├── globals.css        # Konfigurasi Tailwind dasar & custom utilities
│   │   └── layout.tsx         # Root layout (Viewport & PWA Metadata)
│   ├── components/
│   │   ├── layout/            # BottomNavigation, MobileHeader, MobileShell
│   │   └── ui/                # Tombol, badge status K3, card temuan
│   ├── db/
│   │   ├── schema/            # Definisi tabel Drizzle (inspections, findings, users)
│   │   │   └── index.ts
│   │   └── index.ts           # Inisialisasi koneksi Drizzle client
│   ├── lib/
│   │   └── utils.ts           # Utility helper (cn / classnames)
│   └── types/
│       └── index.ts           # Custom types & domain interfaces HSE
├── drizzle.config.ts          # Konfigurasi Drizzle Kit
├── next.config.mjs            # Konfigurasi Next.js
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## 4. Langkah-Langkah Scaffolding (Implementation Tasks)

1. **Inisialisasi Project**:
   - Inisialisasi project Next.js menggunakan TypeScript, Tailwind CSS, App Router, dan `src/` directory.
2. **Instalasi Paket Tambahan**:
   - Tambahkan `lucide-react`, `drizzle-orm`, driver database (`postgres` atau `mysql2`), dan `drizzle-kit`.
3. **Konfigurasi Mobile & PWA**:
   - Siapkan `public/manifest.json` dengan:
     - `display: "standalone"`
     - `start_url: "/"`
     - Nama: `"HSE Smart - Audit K3"`
     - Penyiapan placeholder ikon PWA.
   - Atur `viewport` pada root layout (`src/app/layout.tsx`) agar responsif terhadap perangkat mobile (`width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`).
4. **Konfigurasi Database & ORM**:
   - Buat `drizzle.config.ts` yang mengarah ke folder schema `src/db/schema`.
   - Siapkan file koneksi database dasar di `src/db/index.ts` menggunakan environment variable (`DATABASE_URL`).
5. **Layout Mobile-First**:
   - Siapkan wrapper layout mobile (`MobileShell`) dengan container responsif (`max-w-md mx-auto min-h-screen bg-slate-50`) serta placeholder navigasi bawah (*Bottom Bar*).

---

## 5. Acceptance Criteria

Scaffolding dinyatakan selesai apabila:

1. **Build Valid**:
   - Perintah `npm run build` berjalan sukses tanpa error kompilasi TypeScript atau CSS.
2. **Local Server Ready**:
   - Perintah `npm run dev` dapat dijalankan dan merespons pada `http://localhost:3000`.
3. **HTTP / curl Verification**:
   - Pengecekan via terminal:
     ```bash
     curl -I http://localhost:3000
     ```
     Menghasilkan status HTTP `200 OK`.
4. **PWA Manifest Accessible**:
   - Pengecekan endpoint manifest:
     ```bash
     curl -s http://localhost:3000/manifest.json | grep '"standalone"'
     ```
     Menghasilkan konfigurasi manifest yang valid dengan `display: "standalone"`.
5. **Mobile-First Layout**:
   - Halaman root (`/`) memuat tampilan dasar mobile-first dengan icon `lucide-react` tanpa error layout shift / styling breakdown.
