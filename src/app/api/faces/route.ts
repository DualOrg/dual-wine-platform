import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/faces
 * List all faces in the org.
 */
export async function GET() {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const data = await client.faces.listFaces();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

/**
 * POST /api/faces
 * Create a new face.
 *
 * Body: { name, content?, url?, config? }
 *
 * - content: inline HTML/SVG string
 * - url: external URL for the face
 * - config: optional configuration object
 */
export async function POST(req: NextRequest) {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const result = await client.faces.createFace(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err.body?.message || "Face creation failed" }, { status: err.status || 500 });
  }
}
