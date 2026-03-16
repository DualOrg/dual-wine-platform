/**
 * DUAL SDK Client — Wine App
 * Uses the official @dual/sdk for all DUAL Platform API communication.
 * Falls back to demo data when DUAL_CONFIGURED is not set.
 */
import { DualClient, DualConfig, DualError } from './dual-sdk';

export { DualClient, DualConfig, DualError };

/** Check if DUAL SDK is configured with real credentials */
export function isDualConfigured(): boolean {
  return process.env.NEXT_PUBLIC_DUAL_CONFIGURED === 'true'
    && !!process.env.DUAL_API_TOKEN;
}

let client: DualClient | null = null;

/** Get or create the singleton DualClient instance */
export function getDualClient(): DualClient {
  if (!client) {
    client = new DualClient({
      token: process.env.DUAL_API_TOKEN || '',
      baseUrl: process.env.NEXT_PUBLIC_DUAL_API_URL || 'https://blockv-labs.io',
      timeout: 30000,
      retry: { maxAttempts: 3, backoffMs: 1000 },
    });
  }
  return client;
}
