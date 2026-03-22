import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/lib/data-provider';
import { getDualClient } from '@/lib/dual-client';

const isDualConfigured = !!process.env.DUAL_API_KEY;
const orgId = process.env.DUAL_ORG_ID || '69b935b4187e903f826bbe71';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const city = searchParams.get('city');
  const status = searchParams.get('status');
  const sortBy = searchParams.get('sortBy') || 'date-asc';

  if (!isDualConfigured) {
    return NextResponse.json(
      { error: 'DUAL_API_KEY is not configured' },
      { status: 503 }
    );
  }

  try {
    const client = getDualClient();
    const response = await client.templates.listTemplates({ org_id: orgId });
    let events = response.data?.map((template: any) => ({
      id: template.id,
      name: template.metadata?.name || 'DUAL Template',
      type: 'template',
      category: template.metadata?.category || 'general',
      venue: { name: 'DUAL Network', address: '', city: '', country: '', capacity: 0 },
      date: { start: template.when_created, end: template.when_created },
      description: template.metadata?.description || '',
      imageUrl: template.metadata?.image?.url || '',
      organizerId: orgId,
      tiers: [],
      status: 'active',
      resaleEnabled: false,
      resaleMaxMarkup: 1.0,
      createdAt: template.when_created,
      updatedAt: template.when_modified || template.when_created,
    })) || [];

    if (type && type !== 'all') events = events.filter((e: any) => e.type === type);
    if (category && category !== 'all') events = events.filter((e: any) => e.category === category);
    if (city && city !== 'all') events = events.filter((e: any) => e.venue.city.toLowerCase() === city.toLowerCase());
    if (status && status !== 'all') events = events.filter((e: any) => e.status === status);

    switch (sortBy) {
      case 'date-asc':
        events.sort((a: any, b: any) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime());
        break;
      case 'date-desc':
        events.sort((a: any, b: any) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime());
        break;
      case 'price-asc':
        events.sort((a: any, b: any) => Math.min(...(a.tiers?.map((t: any) => t.price) || [0])) - Math.min(...(b.tiers?.map((t: any) => t.price) || [0])));
        break;
      case 'price-desc':
        events.sort((a: any, b: any) => Math.max(...(b.tiers?.map((t: any) => t.price) || [0])) - Math.max(...(a.tiers?.map((t: any) => t.price) || [0])));
        break;
      case 'popularity':
        events.sort((a: any, b: any) => (b.tiers?.reduce((s: any, t: any) => s + (t.sold || 0), 0) || 0) - (a.tiers?.reduce((s: any, t: any) => s + (t.sold || 0), 0) || 0));
        break;
    }

    return NextResponse.json({ data: events, total: events.length });
  } catch (error) {
    console.error('Failed to fetch from DUAL API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events from DUAL API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!isDualConfigured) {
    return NextResponse.json(
      { error: 'DUAL_API_KEY is not configured' },
      { status: 503 }
    );
  }

  try {
    const client = getDualClient();
    const response = await client.templates.createTemplate(body);
    return NextResponse.json({ data: response, message: 'Template created on DUAL network' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create template via DUAL API:', error);
    return NextResponse.json(
      { error: 'Failed to create template on DUAL network' },
      { status: 500 }
    );
  }
}
