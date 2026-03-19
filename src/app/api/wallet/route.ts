import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieValue = cookieHeader
      .split(";")
      .find((c: string) => c.trim().startsWith("dual_wallet="))
      ?.split("=")[1];

    const claimedIds: string[] = cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : [];

    return NextResponse.json({ claimedIds });
  } catch (err: unknown) {
    return NextResponse.json({ claimedIds: [] });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("dual_wallet");
  return response;
}
