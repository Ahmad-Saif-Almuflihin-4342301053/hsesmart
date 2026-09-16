import { NextRequest, NextResponse } from "next/server";
import { getAssetByCode } from "@/actions/asset-actions";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    if (!code) {
      return NextResponse.json(
        { success: false, error: "Kode aset tidak boleh kosong" },
        { status: 400 }
      );
    }

    const result = await getAssetByCode(code);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Aset K3 Tidak Dikenali" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API /api/assets/[code] error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
