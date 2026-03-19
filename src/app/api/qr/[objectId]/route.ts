import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { objectId: string } }
): Promise<NextResponse> {
  try {
    const { objectId } = params;

    if (!objectId || typeof objectId !== "string") {
      return NextResponse.json({ error: "Invalid objectId" }, { status: 400 });
    }

    // Build the claim URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dual-wine-platform.vercel.app";
    const claimUrl = `${baseUrl}/claim/${objectId}`;

    // Generate QR code as PNG
    const qrImage = await QRCode.toBuffer(claimUrl, {
      type: "png",
      width: 300,
      margin: 2,
      color: {
        dark: "#440a1d", // wine-950
        light: "#ffffff",
      },
    });

    // Return PNG response with cache headers
    const response = new NextResponse(Buffer.from(qrImage));
    response.headers.set("Content-Type", "image/png");
    response.headers.set("Cache-Control", "public, max-age=3600, immutable");
    response.headers.set("Content-Length", qrImage.length.toString());

    return response;
  } catch (err: unknown) {
    console.error("QR generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
