import { NextResponse } from 'next/server';

export async function GET() {
  // Returns recent property activity/transactions
  return NextResponse.json({ activity: [] });
}
