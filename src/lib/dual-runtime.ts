const MAINNET_API_URL = "https://api.dual.network/";
const MAINNET_CONSOLE_URL = "https://console.dual.network/";
const MAINNET_L3_EXPLORER_URL = "https://explorer.dual.network/";
const MAINNET_L2_EXPLORER_URL = "https://blockscout.dual.network/";
const MAINNET_ORG_ID = "6a1a927534603174374c8ecf";

function cleanUrl(value: string | undefined, fallback: string): string {
  const url = (value || fallback).trim();
  return url.endsWith("/") ? url : `${url}/`;
}

function isTrue(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

function hasValue(value: string | undefined): boolean {
  return !!value && value.trim().length > 0;
}

export function getDualRuntimeStatus() {
  const apiUrl = cleanUrl(process.env.NEXT_PUBLIC_DUAL_API_URL || process.env.DUAL_API_URL, MAINNET_API_URL);
  const consoleUrl = cleanUrl(process.env.NEXT_PUBLIC_DUAL_CONSOLE_BASE_URL, MAINNET_CONSOLE_URL);
  const l3ExplorerUrl = cleanUrl(process.env.NEXT_PUBLIC_DUAL_L3_EXPLORER_BASE_URL, MAINNET_L3_EXPLORER_URL);
  const l2ExplorerUrl = cleanUrl(process.env.NEXT_PUBLIC_DUAL_L2_EXPLORER_BASE_URL, MAINNET_L2_EXPLORER_URL);
  const targetNetwork = process.env.DUAL_NETWORK || "mainnet";
  const writeMode = process.env.DUAL_WRITE_MODE || "read_only";
  const apiKeyConfigured = hasValue(process.env.DUAL_API_KEY);
  const apiTokenConfigured = hasValue(process.env.DUAL_API_TOKEN);
  const templateIds = [process.env.DUAL_TEMPLATE_ID].filter(hasValue);
  const credentialConfigured = apiKeyConfigured || apiTokenConfigured;
  const publicWrites = isTrue(process.env.DEMO_PUBLIC_DUAL_WRITES);
  const writeAllowed = writeMode === "event_bus" && publicWrites && credentialConfigured && templateIds.length > 0;

  return {
    app: "dual-wine-platform",
    targetNetwork,
    mainnetCutoverConfirmed: isTrue(process.env.DUAL_MAINNET_CUTOVER_CONFIRMED),
    apiUrl,
    consoleUrl,
    l3ExplorerUrl,
    l2ExplorerUrl,
    orgId: process.env.DUAL_ORG_ID || MAINNET_ORG_ID,
    templateIds,
    credentials: {
      apiKeyConfigured,
      apiTokenConfigured,
      secretReturned: false,
    },
    readOnly: writeMode === "read_only",
    writeMode,
    publicWrites,
    liveDualWrites: writeAllowed,
    writable: writeAllowed,
    read_allowed: targetNetwork === "mainnet" && apiUrl === MAINNET_API_URL,
    write_allowed: writeAllowed,
    readbackReady: credentialConfigured && templateIds.length > 0,
    mainnetMappingPending: !credentialConfigured || templateIds.length === 0,
    blockers: [
      ...(!credentialConfigured ? ["hosted_dual_credentials_not_configured"] : []),
      ...(templateIds.length === 0 ? ["production_wine_template_mapping_pending"] : []),
      ...(writeMode === "read_only" ? ["write_mode_read_only"] : []),
      ...(!publicWrites ? ["public_writes_disabled"] : []),
    ],
  };
}

export function getDualReadOnlyResponse(action: string) {
  const status = getDualRuntimeStatus();
  return {
    error: "DUAL writes are disabled for this production demo.",
    code: "DUAL_READ_ONLY",
    action,
    targetNetwork: status.targetNetwork,
    writeMode: status.writeMode,
    publicWrites: status.publicWrites,
    writable: status.writable,
    mainnetMappingPending: status.mainnetMappingPending,
  };
}
