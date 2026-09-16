export interface AuditCriterion {
  id: string;
  label: string;
  description: string;
}

export const AUDIT_TEMPLATES: Record<string, AuditCriterion[]> = {
  lab: [
    {
      id: "lab-1",
      label: "Penyimpanan Bahan Kimia / B3",
      description: "Bahan kimia tersimpan dalam lemari khusus B3 dengan label dan MSDS jelas.",
    },
    {
      id: "lab-2",
      label: "Kelayakan Alat Keselamatan (Eye Washer & Shower)",
      description: "Emergency eye washer dan body shower berfungsi normal dengan tekanan air cukup.",
    },
    {
      id: "lab-3",
      label: "Sistem Ventilasi & Fume Hood (Lemari Asam)",
      description: "Exhaust fan dan lemari asam berfungsi baik tanpa kebocoran udara.",
    },
    {
      id: "lab-4",
      label: "Kesiapan APAR Khusus Lab",
      description: "Tersedia APAR tipe CO2 atau Clean Agent dalam masa berlaku aktif dan mudah diakses.",
    },
    {
      id: "lab-5",
      label: "Ketersediaan Kotak P3K Lengkap",
      description: "Kotak P3K berisi obat luka bakar, perban, antiseptik, dan daftar inventaris lengkap.",
    },
  ],
  workshop: [
    {
      id: "ws-1",
      label: "Jalur Evakuasi & Emergency Exit",
      description: "Jalur evakuasi dan pintu keluar darurat bebas dari halangan barang atau material kerja.",
    },
    {
      id: "ws-2",
      label: "Grounding & Pengaman Mesin Listrik",
      description: "Panel listrik tertutup rapat, kabel tidak terkelupas, dan tombol emergency stop berfungsi.",
    },
    {
      id: "ws-3",
      label: "Kepatuhan APD (Alat Pelindung Diri)",
      description: "Rambu wajib APD terpasang dan praktikan/pekerja menggunakan kacamata, helm, & sepatu safety.",
    },
    {
      id: "ws-4",
      label: "Kerapian Kerja & Housekeeping (5R/5S)",
      description: "Lantai bersih dari tumpahan oli/cairan licin dan perkakas tertata di rak penyimpanan.",
    },
  ],
  classroom: [
    {
      id: "cr-1",
      label: "Kondisi Instalasi Listrik & Stopkontak",
      description: "Stopkontak tidak mengalami penumpukan beban berlebih dan terpasang kokoh di dinding.",
    },
    {
      id: "cr-2",
      label: "Penerangan & Sirkulasi Udara",
      description: "Lampu penerangan ruangan menyala cukup terang dan ventilasi udara berfungsi baik.",
    },
    {
      id: "cr-3",
      label: "Rambu Jalur Evakuasi",
      description: "Petunjuk denah evakuasi dan nomor darurat terpasang jelas di dekat pintu keluar.",
    },
    {
      id: "cr-4",
      label: "Kelayakan Pintu & Jendela Ruang",
      description: "Pintu dapat dibuka ke arah luar tanpa macet dan engsel kokoh.",
    },
  ],
  office: [
    {
      id: "off-1",
      label: "Ergonomi & Tata Letak Kerja",
      description: "Kursi dan meja dalam posisi ergonomis, monitor tidak silau, dan kabel rapi tersusun.",
    },
    {
      id: "off-2",
      label: "Aksesibilitas APAR & Alarm Kebakaran",
      description: "APAR di koridor/kantor tidak terhalang lemari/dokumen dan terinspeksi rutin.",
    },
    {
      id: "off-3",
      label: "Penerangan & Kebersihan Ruang",
      description: "Tingkat pencahayaan nyaman dan tidak ada tumpukan kardus yang menghalangi jalan.",
    },
  ],
  canteen: [
    {
      id: "cnt-1",
      label: "Penempatan Tabung Gas LPG",
      description: "Tabung gas diletakkan di area berventilasi baik, regulator berstandar SNI tanpa kebocoran.",
    },
    {
      id: "cnt-2",
      label: "Kebersihan Sanitasi & Saluran Air",
      description: "Area cuci piring bersih, tidak ada genangan air licin, dan saluran pembuangan lancar.",
    },
    {
      id: "cnt-3",
      label: "Kesiapan APAR Tipe Dapur / Wet Chemical",
      description: "Tersedia APAR atau fire blanket di area memasak.",
    },
  ],
};

export function getAuditTemplateByCategory(category: string): AuditCriterion[] {
  return AUDIT_TEMPLATES[category] || AUDIT_TEMPLATES.classroom;
}
