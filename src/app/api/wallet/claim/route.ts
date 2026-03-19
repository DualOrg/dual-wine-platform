import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ClaimRequest {
  objectId: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: ClaimRequest = await req.json();
    const { objectId } = body;

    if (!objectId || typeof objectId !== "string") {
      return NextResponse.json({ error: "Invalid objectId" }, { status: 400 });
    }

    // Parse existing wallet from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieValue = cookieHeader
      .split(";")
      .find((c: string) => c.trim().startsWith("dual_wallet="))
      ?.split("=")[1];

    let claimedIds: string[] = cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : [];

    // Add new objectId if not already claimed
    if (!claimedIds.includes(objectId)) {
      claimedIds.push(objectId);
    }

    // Create response
    const response = NextResponse.json(
      { success: true, claimedIds },
      { status: 201 }
    );

    // Set cookie with JSON array
    response.cookies.set("dual_wallet", encodeURIComponent(JSON.stringify(claimedIds)), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to claim object" }, { status: 500 });
  }
}
