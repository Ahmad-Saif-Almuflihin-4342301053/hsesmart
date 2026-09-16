import { db } from "./index";
import { buildings, rooms, safetyAssets } from "./schema";

async function seed() {
  console.log("🌱 Mulai proses seeding database Audit K3 Kampus...");

  // Hapus data lama jika ada (clean state)
  await db.delete(safetyAssets);
  await db.delete(rooms);
  await db.delete(buildings);

  // 1. Gedung Utama
  const [b1] = await db
    .insert(buildings)
    .values({
      name: "Gedung Utama (Rektorat & Administrasi)",
      totalFloors: 4,
    })
    .returning();

  // 2. Gedung Lab & Bengkel Terpadu
  const [b2] = await db
    .insert(buildings)
    .values({
      name: "Gedung Lab & Bengkel Terpadu",
      totalFloors: 3,
    })
    .returning();

  // 3. Gedung Perkuliahan A
  const [b3] = await db
    .insert(buildings)
    .values({
      name: "Gedung Perkuliahan A (Tower Barat)",
      totalFloors: 5,
    })
    .returning();

  console.log("✅ 3 Gedung berhasil dibuat.");

  // Seed Ruangan untuk Gedung Utama
  await db.insert(rooms).values([
    {
      buildingId: b1.id,
      name: "Ruang Rapat Senat & Pimpinan",
      floor: 3,
      category: "office",
    },
    {
      buildingId: b1.id,
      name: "Kantor Bagian Keuangan & SDM",
      floor: 2,
      category: "office",
    },
    {
      buildingId: b1.id,
      name: "Kantin Pusat Gedung Rektorat",
      floor: 1,
      category: "canteen",
    },
  ]);

  // Seed Ruangan untuk Gedung Lab & Bengkel Terpadu
  await db.insert(rooms).values([
    {
      buildingId: b2.id,
      name: "Lab Kimia Dasar & Analitik",
      floor: 2,
      category: "lab",
    },
    {
      buildingId: b2.id,
      name: "Bengkel Mesin & Fabrikasi Logam",
      floor: 1,
      category: "workshop",
    },
    {
      buildingId: b2.id,
      name: "Lab Robotika & Sistem Otomasi",
      floor: 3,
      category: "lab",
    },
    {
      buildingId: b2.id,
      name: "Bengkel Kayu & Konstruksi Sipil",
      floor: 1,
      category: "workshop",
    },
  ]);

  // Seed Ruangan untuk Gedung Perkuliahan A
  await db.insert(rooms).values([
    {
      buildingId: b3.id,
      name: "Ruang Kelas Teori 101",
      floor: 1,
      category: "classroom",
    },
    {
      buildingId: b3.id,
      name: "Ruang Kelas Teori 204",
      floor: 2,
      category: "classroom",
    },
    {
      buildingId: b3.id,
      name: "Ruang Kuliah Teater 301",
      floor: 3,
      category: "classroom",
    },
    {
      buildingId: b3.id,
      name: "Kantin Mini Mahasiswa Tower A",
      floor: 1,
      category: "canteen",
    },
    {
      buildingId: b3.id,
      name: "Ruang Dosen Pengajar Lantai 4",
      floor: 4,
      category: "office",
    },
  ]);

  console.log("✅ Ruangan dengan berbagai kategori berhasil diisi.");
  console.log("🎉 Seeding database selesai!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Gagal melakukan seeding database:", err);
  process.exit(1);
});
