import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const dummyAssets = [
  {
    code: "HSE-APAR-001",
    name: "APAR Powder 6kg",
    location: "Lab Kimia Dasar & Analitik",
  },
  {
    code: "HSE-APAR-002",
    name: "APAR CO2 5kg",
    location: "Bengkel Mesin & Fabrikasi Logam",
  },
  {
    code: "HSE-P3K-001",
    name: "Kotak P3K Dinding",
    location: "Ruang Dosen Pengajar Lantai 4",
  },
  {
    code: "HSE-HYD-001",
    name: "Hydrant Box Lt.1",
    location: "Koridor Utama Lt.1",
  },
];

async function generateQRCodes() {
  const outputDir = path.join(process.cwd(), "public", "dummy-qr");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Membuat direktori output: ${outputDir}`);
  }

  console.log("⚡ Memulai pembuatan file gambar QR Code dummy...");

  for (const asset of dummyAssets) {
    const filePath = path.join(outputDir, `${asset.code}.png`);
    await QRCode.toFile(filePath, asset.code, {
      type: "png",
      width: 400,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#0f172a", // slate-900
        light: "#ffffff",
      },
    });

    console.log(
      `✅ Berhasil digenerate: ${asset.code}.png (Payload: "${asset.code}") -> ${asset.name} [${asset.location}]`
    );
  }

  console.log(`\n🎉 Selesai! Semua file QR code tersimpan di: ${outputDir}`);
}

generateQRCodes().catch((err) => {
  console.error("❌ Terjadi kesalahan saat membuat QR Code:", err);
  process.exit(1);
});
