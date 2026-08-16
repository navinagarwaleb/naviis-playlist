import { NextRequest } from 'next/server';
import { getPlaylistSongs, addSongToPlaylist, removeSongFromPlaylist, reorderPlaylistSong } from '@/lib/airtable';

// GET /api/playlist-songs?playlistId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get('playlistId');
  if (!playlistId) return Response.json({ error: 'playlistId required' }, { status: 400 });

  try {
    const songs = await getPlaylistSongs(playlistId);
    return Response.json({ songs });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/playlist-songs - add song to playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await addSongToPlaylist(body.playlistId, body.songId, body.order);
    return Response.json({ success: true }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/playlist-songs - reorder
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === 'reorder') {
      await reorderPlaylistSong(body.entryId, body.order);
      return Response.json({ success: true });
    }
    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/playlist-songs?entryId=xxx
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get('entryId');
  if (!entryId) return Response.json({ error: 'entryId required' }, { status: 400 });

  try {
    await removeSongFromPlaylist(entryId);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}