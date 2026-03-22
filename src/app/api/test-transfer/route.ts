import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/dual-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const client = await getAuthenticatedClient();
    if (!client) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const objectId = "69bf6b8ec90496da12892bdb";
    const toEmail = "icbuswell@gmail.com";

    // Try format 1: object_id + new_owner (email)
    const formats = [
      { name: "object_id+email", payload: { action: { transfer: { object_id: objectId, new_owner: toEmail } } } },
      { name: "id+email", payload: { action: { transfer: { id: objectId, new_owner: toEmail } } } },
      { name: "object_id+to", payload: { action: { transfer: { object_id: objectId, to: toEmail } } } },
      { name: "id+to_address", payload: { action: { transfer: { id: objectId, to_address: toEmail } } } },
      { name: "flat+email", payload: { action: { name: "transfer", object_id: objectId, new_owner: toEmail } } },
    ];

    const results: any[] = [];
    for (const fmt of formats) {
      try {
        const result = await client.ebus.execute(fmt.payload);
        results.push({ format: fmt.name, success: true, result });
        break; // stop on first success
      } catch (err: any) {
        results.push({ 
          format: fmt.name, 
          error: err.body?.message || err.message || String(err),
          status: err.status 
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
