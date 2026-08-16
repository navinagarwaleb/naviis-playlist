import { NextRequest } from 'next/server';
import { getSongs } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => { params[key] = value; });

  try {
    const songs = await getSongs(params);
    return Response.json({ songs });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}