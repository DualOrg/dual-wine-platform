import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload-image
 * Upload a base64-encoded image to Vercel Blob Storage.
 *
 * Body: { base64: string, mimeType?: string, filename?: string }
 *
 * Returns: { success: true, url: string }
 *
 * Requires BLOB_READ_WRITE_TOKEN env var in Vercel project settings.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64, mimeType = "image/png", filename } = body;

    if (!base64) {
      return NextResponse.json({ error: "base64 field is required" }, { status: 400 });
    }

    // Strip data URL prefix if present
    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, "");

    // Convert base64 to buffer
    const buffer = Buffer.from(cleanBase64, "base64");

    // Generate a unique filename
    const ext = mimeType.split("/")[1] || "png";
    const blobFilename = filename || `wine-${randomUUID().slice(0, 8)}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(blobFilename, buffer, {
      access: "public",
      contentType: mimeType,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error("Image upload error:", err);

    // Provide a clear error if the blob token is missing
    if (err.message?.includes("BLOB_READ_WRITE_TOKEN") || err.message?.includes("BlobAccessError")) {
      return NextResponse.json(
        {
          error: "Vercel Blob not configured. Add BLOB_READ_WRITE_TOKEN to your Vercel environment variables.",
          details: err.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
