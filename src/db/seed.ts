import "dotenv/config";
import { db, client } from "./index";
import { buildings, rooms, safetyAssets } from "./schema";

export async function seedSafetyAssets() {
  console.log("🌱 Memulai seeding data aset K3 (safety_assets)...");

  // 1. Pastikan gedung dasar tersedia
  let building = await db.query.buildings.findFirst();
  if (!building) {
    console.log("Menambahkan gedung awal...");
    const [newBuilding] = await db
      .insert(buildings)
      .values({
        name: "Gedung Utama (Rektorat & Administrasi)",
        totalFloors: 4,
      })
      .returning();
    building = newBuilding;
  }

  // 2. Cari atau buat ruangan-ruangan yang diperlukan
  // a. Lab Kimia
  let labKimia = await db.query.rooms.findFirst({
    where: (r, { ilike }) => ilike(r.name, "%Lab Kimia%"),
  });
  if (!labKimia) {
    console.log("Membuat ruangan: Lab Kimia Dasar & Analitik...");
    const [created] = await db
      .insert(rooms)
      .values({
        buildingId: building.id,
        name: "Lab Kimia Dasar & Analitik",
        floor: 2,
        category: "lab",
      })
      .returning();
    labKimia = created;
  }

  // b. Bengkel Mesin
  let bengkelMesin = await db.query.rooms.findFirst({
    where: (r, { ilike }) => ilike(r.name, "%Bengkel Mesin%"),
  });
  if (!bengkelMesin) {
    console.log("Membuat ruangan: Bengkel Mesin & Fabrikasi Logam...");
    const [created] = await db
      .insert(rooms)
      .values({
        buildingId: building.id,
        name: "Bengkel Mesin & Fabrikasi Logam",
        floor: 1,
        category: "workshop",
      })
      .returning();
    bengkelMesin = created;
  }

  // c. Ruang Dosen
  let ruangDosen = await db.query.rooms.findFirst({
    where: (r, { ilike }) => ilike(r.name, "%Ruang Dosen%"),
  });
  if (!ruangDosen) {
    console.log("Membuat ruangan: Ruang Dosen Pengajar Lantai 4...");
    const [created] = await db
      .insert(rooms)
      .values({
        buildingId: building.id,
        name: "Ruang Dosen Pengajar Lantai 4",
        floor: 4,
        category: "office",
      })
      .returning();
    ruangDosen = created;
  }

  // d. Koridor Utama
  let koridorUtama = await db.query.rooms.findFirst({
    where: (r, { ilike }) => ilike(r.name, "%Koridor Utama%"),
  });
  if (!koridorUtama) {
    console.log("Membuat ruangan: Koridor Utama Lt.1...");
    const [created] = await db
      .insert(rooms)
      .values({
        buildingId: building.id,
        name: "Koridor Utama Lt.1",
        floor: 1,
        category: "office",
      })
      .returning();
    koridorUtama = created;
  }

  // 3. Masukkan 4 data aset K3 dummy
  const dummyAssets = [
    {
      assetCode: "HSE-APAR-001",
      type: "apar" as const,
      roomId: labKimia.id,
      status: "active" as const,
      expiryDate: new Date("2027-12-31T00:00:00Z"),
      description: "APAR Powder 6kg di Lab Kimia",
    },
    {
      assetCode: "HSE-APAR-002",
      type: "apar" as const,
      roomId: bengkelMesin.id,
      status: "expired" as const,
      expiryDate: new Date("2024-01-01T00:00:00Z"),
      description: "APAR CO2 5kg di Bengkel Mesin",
    },
    {
      assetCode: "HSE-P3K-001",
      type: "p3k" as const,
      roomId: ruangDosen.id,
      status: "active" as const,
      expiryDate: new Date("2026-10-15T00:00:00Z"),
      description: "Kotak P3K Dinding di Ruang Dosen",
    },
    {
      assetCode: "HSE-HYD-001",
      type: "hydran" as const,
      roomId: koridorUtama.id,
      status: "damaged" as const,
      expiryDate: new Date("2028-05-20T00:00:00Z"),
      description: "Hydrant Box Lt.1 di Koridor Utama",
    },
  ];

  for (const asset of dummyAssets) {
    await db
      .insert(safetyAssets)
      .values({
        assetCode: asset.assetCode,
        type: asset.type,
        roomId: asset.roomId,
        status: asset.status,
        expiryDate: asset.expiryDate,
      })
      .onConflictDoUpdate({
        target: safetyAssets.assetCode,
        set: {
          type: asset.type,
          roomId: asset.roomId,
          status: asset.status,
          expiryDate: asset.expiryDate,
        },
      });

    console.log(`✅ [${asset.assetCode}] ${asset.description} -> Status: ${asset.status}, Exp: ${asset.expiryDate.toISOString().split("T")[0]}`);
  }

  console.log("✨ Seeding data aset K3 berhasil diselesaikan!");
}

// Jalankan jika dieksekusi langsung
if (require.main === module || process.argv[1]?.includes("seed")) {
  seedSafetyAssets()
    .then(async () => {
      await client.end();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("❌ Gagal seeding data aset K3:", error);
      await client.end();
      process.exit(1);
    });
}
