import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const manifestPath = path.join(root, "src", "data", "dual-production-content.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const execute = process.argv.includes("--execute");
const dryRun = !execute || process.argv.includes("--dry-run");

const baseUrl = (process.env.DUAL_API_URL || process.env.NEXT_PUBLIC_DUAL_API_URL || manifest.network.apiUrl).replace(/\/?$/, "/");
const templateId = process.env.DUAL_TEMPLATE_ID || "";
const credential = process.env.DUAL_API_KEY || process.env.DUAL_API_TOKEN || "";
const approved = process.env.DUAL_LIVE_WRITE_APPROVED === "true";
const writeMode = process.env.DUAL_WRITE_MODE || "read_only";

function authHeaders() {
  if (!credential) return {};
  const isJwt = credential.split(".").length === 3;
  return isJwt ? { Authorization: `Bearer ${credential}` } : { "X-Api-Key": credential };
}

function payloadFor(item) {
  return {
    action: {
      mint: {
        template_id: templateId || "<DUAL_TEMPLATE_ID>",
        num: 1,
        data: {
          metadata: item.metadata,
          custom: item.custom,
        },
      },
    },
  };
}

console.log(JSON.stringify({
  app: manifest.app,
  mode: dryRun ? "dry_run" : "execute",
  targetNetwork: manifest.network.target,
  orgId: manifest.network.orgId,
  templateEnv: manifest.template.env,
  templateIdConfigured: Boolean(templateId),
  credentialConfigured: Boolean(credential),
  approved,
  writeMode,
  objectCount: manifest.objects.length,
  secretsReturned: false,
}, null, 2));

if (dryRun) {
  for (const item of manifest.objects) {
    console.log(JSON.stringify({
      contentId: item.contentId,
      action: "mint",
      templateId: templateId || "<DUAL_TEMPLATE_ID>",
      name: item.custom.name,
    }));
  }
  process.exit(0);
}

if (!approved || writeMode !== "event_bus" || !templateId || !credential) {
  console.error("Live DUAL seed blocked: require DUAL_LIVE_WRITE_APPROVED=true, DUAL_WRITE_MODE=event_bus, template ID, and credential.");
  process.exit(2);
}

for (const item of manifest.objects) {
  const response = await fetch(new URL("ebus/execute", baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payloadFor(item)),
  });
  const body = await response.json().catch(() => ({}));
  console.log(JSON.stringify({
    contentId: item.contentId,
    ok: response.ok,
    status: response.status,
    actionId: body.action_id || body.actionId || null,
    objectIds: body.steps?.[0]?.output?.ids || [],
    error: response.ok ? null : body.message || body.error || body.code || "seed_failed",
    secretsReturned: false,
  }));
  if (!response.ok) process.exitCode = 1;
}
