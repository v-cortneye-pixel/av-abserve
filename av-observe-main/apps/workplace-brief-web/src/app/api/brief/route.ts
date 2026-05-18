import { NextResponse } from 'next/server';
import { buildDemoBrief } from '@/lib/demoBrief';

export const dynamic = 'force-dynamic';

export async function GET() {
  const brief = buildDemoBrief();
  return NextResponse.json(brief, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
