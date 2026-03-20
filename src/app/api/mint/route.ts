import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/mint
 * Mint a new wine token via /ebus/execute.
 * Requires prior authentication via /api/auth/login.
 *
 * Body: { templateId?, num?, data? }
 */
export async function POST(req: NextRequest) {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json(
        { error: "Not authenticated. Send OTP and login first via /api/auth/otp and /api/auth/login." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const templateId = body.templateId || process.env.DUAL_TEMPLATE_ID || '';
    const num = body.num || 1;
    const data = body.data || undefined;

    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

    // Build the action payload per API v3 spec
    const actionPayload: any = {
      action: {
        mint: {
          template_id: templateId,
          num,
          ...(data ? { data } : {}),
        },
      },
    };

    const result = await client.ebus.execute(actionPayload);

    return NextResponse.json({
      success: true,
      actionId: result.action_id,
      steps: result.steps,
      objectIds: result.steps?.[0]?.output?.ids || [],
    }, { status: 201 });
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.body?.message || err.message || "Mint failed";
    return NextResponse.json({ error: message }, { status });
  }
}
