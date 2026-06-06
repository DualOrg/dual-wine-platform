import { NextRequest, NextResponse } from "next/server";
import { getDualReadOnlyResponse } from "./lib/dual-runtime";

const DUAL_WRITE_PATHS = [
  /^\/api\/auth\/(otp|login)(?:\/|$)/,
  /^\/api\/mint(?:\/|$)/,
  /^\/api\/transfer(?:\/|$)/,
  /^\/api\/actions(?:\/|$)/,
  /^\/api\/templates\/[^/]+(?:\/|$)/,
  /^\/api\/objects\/[^/]+(?:\/|$)/,
  /^\/api\/tickets(?:\/|$)/,
  /^\/api\/wines(?:\/|$)/,
  /^\/api\/properties(?:\/|$)/,
  /^\/api\/faces(?:\/|$)/,
  /^\/api\/webhooks\/(?:auto-register|register)(?:\/|$)/,
];

function writesEnabled(): boolean {
  return process.env.DUAL_WRITE_MODE === "event_bus" && process.env.DEMO_PUBLIC_DUAL_WRITES === "true";
}

export function middleware(req: NextRequest) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return NextResponse.next();
  }
  if (writesEnabled()) {
    return NextResponse.next();
  }
  if (!DUAL_WRITE_PATHS.some((pattern) => pattern.test(req.nextUrl.pathname))) {
    return NextResponse.next();
  }
  return NextResponse.json(getDualReadOnlyResponse(`${req.method} ${req.nextUrl.pathname}`), { status: 403 });
}

export const config = {
  matcher: "/api/:path*",
};
