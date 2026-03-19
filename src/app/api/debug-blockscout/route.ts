import { NextResponse } from 'next/server';

const BSMT_CONTRACT = '0x41Cf00E593c5623B00F812bC70Ee1A737C5aFF06';
const BLOCKSCOUT_BASE = 'https://32f.blockv.io';
const OWNER = '0x2A976Bfa74Dd3212D93067708A32e3CE2bA58110';

export async function GET() {
  const debug: any = { steps: [] };
  try {
    const instUrl = `${BLOCKSCOUT_BASE}/api/v2/tokens/${BSMT_CONTRACT}/instances?holder_address_hash=${OWNER}`;
    debug.instUrl = instUrl;
    const instRes = await fetch(instUrl);
    debug.instStatus = instRes.status;
    const instData = await instRes.json();
    const instances = instData?.items || [];
    debug.instanceCount = instances.length;

    if (instances.length > 0) {
      const attrs = instances[0]?.metadata?.attributes || [];
      const ih = attrs.find((a: any) => a.trait_type === 'integrity_hash');
      debug.firstIH = ih?.value || 'NOT_FOUND';
      debug.firstName = instances[0]?.metadata?.name || '?';
    }

    const txUrl = `${BLOCKSCOUT_BASE}/api/v2/addresses/${OWNER}/token-transfers?type=ERC-721&filter=to`;
    const txRes = await fetch(txUrl);
    debug.txStatus = txRes.status;
    const txData = await txRes.json();
    debug.txCount = txData?.items?.length || 0;

    // Build maps
    const ihMap = new Map<string, string>();
    for (const inst of instances) {
      const attrs = inst?.metadata?.attributes || [];
      const ihAttr = attrs.find((a: any) => a.trait_type === 'integrity_hash');
      if (ihAttr?.value) ihMap.set(ihAttr.value, inst.id);
    }
    debug.ihMapSize = ihMap.size;

    // Test a known wine IH
    const testIH = '0x91d47a25cfcdc3ebb7d3483eb286504849d169fdb4dea53b2c5d1631def2e8de';
    debug.testIH = testIH;
    debug.testMatch = ihMap.has(testIH);
    debug.testTokenId = ihMap.get(testIH) || null;
  } catch (err: any) {
    debug.error = err.message;
  }
  return NextResponse.json(debug);
}
