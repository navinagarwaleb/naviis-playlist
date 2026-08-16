import { NextRequest } from 'next/server';
import { getPlaylist, deletePlaylist, updatePlaylist } from '@/lib/airtable';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const playlist = await getPlaylist(id);
    if (!playlist) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ playlist });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const playlist = await updatePlaylist(id, body);
    return Response.json({ playlist });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await deletePlaylist(id);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}