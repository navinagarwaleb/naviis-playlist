import { NextRequest } from 'next/server';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist } from '@/lib/airtable';

export async function GET() {
  try {
    const playlists = await getPlaylists();
    return Response.json({ playlists });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const playlist = await createPlaylist(body.name, body.description);
    return Response.json({ playlist }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}