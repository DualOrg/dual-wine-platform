import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/lib/data-provider';

const isDualConfigured = !!process.env.DUAL_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isDualConfigured) {
    return NextResponse.json(
      { error: 'DUAL_API_KEY is not configured' },
      { status: 503 }
    );
  }

  try {
    const provider = getDataProvider();
    const tickets = await provider.listTickets();
    const eventTickets = tickets.filter((t: any) => t.eventId === params.id || t.id === params.id);

    return NextResponse.json({
      data: {
        id: params.id,
        ticketCount: eventTickets.length,
        tickets: eventTickets,
        ticketsSold: eventTickets.filter((t: any) => t.status === 'scanned').length,
        totalCapacity: eventTickets.length,
        revenue: 0,
      },
    });
  } catch (error) {
    console.error('Failed to fetch template from DUAL API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template from DUAL API' },
      { status: 500 }
    );
  }
}
