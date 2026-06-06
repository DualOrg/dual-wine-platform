import { NextResponse } from "next/server";
import { getDualRuntimeStatus } from "@/lib/dual-runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getDualRuntimeStatus());
}
