import { Song, Playlist, PlaylistSong, Attachment } from '@/types';

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY = process.env.AIRTABLE_API_KEY!;
const BASE = `https://api.airtable.com/v0/${BASE_ID}`;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

async function airtableFetch(url: string, options?: RequestInit) {
  const isGet = !options?.method || options.method === 'GET';
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options?.headers },
    ...(isGet ? { next: { revalidate: 30 } } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Airtable error: ${res.status} ${JSON.stringify(err)}`);
  }
  return res.json();
}

function getAttachmentUrl(attachments: any[] | undefined): string | null {
  if (!attachments || attachments.length === 0) return null;
  const a = attachments[0];
  return a?.thumbnails?.large?.url || a?.thumbnails?.full?.url || a?.url || null;
}

function mapSongRecord(rec: any): Song {
  const f = rec.fields;
  return {
    id: rec.id,
    song: f.Song || '',
    artist: f.Artist || '',
    year: f.Year ?? null,
    genre: f.Genre || [],
    vibe: f.Vibe || [],
    energy: f.Energy || null,
    crowdAppeal: f['Crowd Appeal'] || null,
    performanceStyle: f['Performance Style'] || [],
    venueFit: f['Venue Fit'] || [],
    duration: f.Duration || null,
    status: f.Status || null,
    attachments: f.Attachments || [],
    playlistNames: f['Playlist Songs']
      ? [...new Set(f['Playlist Songs'].map((ps: any) => {
          if (typeof ps === 'string') return ps;
          // If Airtable expands the linked records
          return ps.fields?.['Playlist Name'] || ps.name || '';
        }))].filter(Boolean) as string[]
      : [],
  };
}

function mapPlaylistRecord(rec: any): Playlist {
  const f = rec.fields;
  return {
    id: rec.id,
    playlistName: f['Playlist Name'] || '',
    description: f.Description || null,
    createdDate: f['Created Date'] || null,
    updatedDate: f['Updated Date'] || null,
    songCount: f['Playlist Songs']?.length || 0,
  };
}

// GET /api/songs?search=&genre=&artist=&year=&vibe=&energy=&crowdAppeal=&performanceStyle=&venueFit=&status=&sort=&order=
export async function getSongs(params: Record<string, string> = {}): Promise<Song[]> {
  const filterParts: string[] = [];

  if (params.search) {
    const q = params.search.replace(/'/g, "\\'");
    filterParts.push(
      `OR(FIND(LOWER('${q}'), LOWER({Song})), FIND(LOWER('${q}'), LOWER({Artist})))`
    );
  }
  if (params.genre) {
    const genres = params.genre.split(',');
    const conditions = genres.map(g => `FIND('${g.replace(/'/g, "\\'")}', {Genre})`);
    filterParts.push(`AND(${conditions.join(',')})`);
  }
  if (params.vibe) {
    const vibes = params.vibe.split(',');
    const conditions = vibes.map(v => `FIND('${v.replace(/'/g, "\\'")}', {Vibe})`);
    filterParts.push(`AND(${conditions.join(',')})`);
  }
  if (params.energy) {
    filterParts.push(`{Energy}='${params.energy.replace(/'/g, "\\'")}'`);
  }
  if (params.performanceStyle) {
    const styles = params.performanceStyle.split(',');
    const conditions = styles.map(s => `FIND('${s.replace(/'/g, "\\'")}', {Performance Style})`);
    filterParts.push(`AND(${conditions.join(',')})`);
  }
  if (params.venueFit) {
    const venues = params.venueFit.split(',');
    const conditions = venues.map(v => `FIND('${v.replace(/'/g, "\\'")}', {Venue Fit})`);
    filterParts.push(`AND(${conditions.join(',')})`);
  }
  if (params.status) {
    filterParts.push(`{Status}='${params.status.replace(/'/g, "\\'")}'`);
  }
  if (params.crowdAppeal) {
    filterParts.push(`{Crowd Appeal}='${params.crowdAppeal.replace(/'/g, "\\'")}'`);
  }
  if (params.artist) {
    filterParts.push(`{Artist}='${params.artist.replace(/'/g, "\\'")}'`);
  }
  if (params.year) {
    filterParts.push(`{Year}=${parseInt(params.year)}`);
  }

  let filterFormula = '';
  if (filterParts.length > 0) {
    filterFormula = `?filterByFormula=${encodeURIComponent(filterParts.length > 1 ? `AND(${filterParts.join(',')})` : filterParts[0])}`;
  }

  let sortParam = '';
  if (params.sort) {
    const sortMap: Record<string, string> = {
      'song-asc': 'Song',
      'artist-asc': 'Artist',
      'year-asc': 'Year',
      'year-desc': 'Year',
      'crowd-appeal': 'Crowd Appeal',
      'duration': 'Duration',
    };
    const field = sortMap[params.sort];
    if (field) {
      const dir = params.sort.endsWith('-desc') ? 'desc' : 'asc';
      sortParam = `&sort%5B0%5D%5Bfield%5D=${encodeURIComponent(field)}&sort%5B0%5D%5Bdirection%5D=${dir}`;
    }
  }

  const url = `${BASE}/Songs?pageSize=100${filterFormula}${sortParam}`;
  const data = await airtableFetch(url);

  const songs: Song[] = data.records.map(mapSongRecord);

  // If sort by crowd-appeal, sort by star count descending
  if (params.sort === 'crowd-appeal') {
    songs.sort((a, b) => {
      const aStars = (a.crowdAppeal || '').split('⭐').length - 1;
      const bStars = (b.crowdAppeal || '').split('⭐').length - 1;
      return bStars - aStars;
    });
  }

  return songs;
}

export async function getSong(id: string): Promise<Song | null> {
  const data = await airtableFetch(`${BASE}/Songs/${id}`);
  return mapSongRecord(data);
}

export async function getSongsByIds(ids: string[]): Promise<Song[]> {
  if (ids.length === 0) return [];
  const formula = `OR(${ids.map(id => `RECORD_ID()='${id}'`).join(',')})`;
  const url = `${BASE}/Songs?pageSize=100&filterByFormula=${encodeURIComponent(formula)}`;
  const data = await airtableFetch(url);
  return data.records.map(mapSongRecord);
}

export async function getPlaylists(): Promise<Playlist[]> {
  const data = await airtableFetch(`${BASE}/Playlists?pageSize=100`);
  return data.records.map(mapPlaylistRecord);
}

export async function getPlaylist(id: string): Promise<Playlist | null> {
  const data = await airtableFetch(`${BASE}/Playlists/${id}`);
  return mapPlaylistRecord(data);
}

export async function createPlaylist(name: string, description?: string): Promise<Playlist> {
  const now = new Date().toISOString().split('T')[0];
  const data = await airtableFetch(`${BASE}/Playlists`, {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        'Playlist Name': name,
        'Description': description || '',
        'Created Date': now,
        'Updated Date': now,
      },
      typecast: true,
    }),
  });
  return mapPlaylistRecord(data);
}

export async function updatePlaylist(id: string, fields: Record<string, any>): Promise<Playlist> {
  const data = await airtableFetch(`${BASE}/Playlists/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      fields: {
        ...fields,
        'Updated Date': new Date().toISOString().split('T')[0],
      },
      typecast: true,
    }),
  });
  return mapPlaylistRecord(data);
}

export async function deletePlaylist(id: string): Promise<void> {
  await airtableFetch(`${BASE}/Playlists/${id}`, { method: 'DELETE' });
}

// Playlist Songs (junction table)
export interface PlaylistSongEntry {
  id: string;
  playlistId: string;
  songId: string;
  order: number;
  song?: Song;
}

export async function getPlaylistSongs(playlistId: string): Promise<PlaylistSongEntry[]> {
  const formula = `FIND('${playlistId}-', {Entry ID})`;
  const url = `${BASE}/Playlist%20Songs?pageSize=100&filterByFormula=${encodeURIComponent(formula)}&sort%5B0%5D%5Bfield%5D=Order&sort%5B0%5D%5Bdirection%5D=asc`;
  const data = await airtableFetch(url);

  const songIds: string[] = [];
  const entries: PlaylistSongEntry[] = data.records.map((rec: any) => {
    const f = rec.fields;
    const sid = f.Song?.[0] || '';
    if (sid) songIds.push(sid);
    return {
      id: rec.id,
      playlistId: playlistId,
      songId: sid,
      order: f.Order || 0,
    };
  });

  // Fetch actual song data
  if (songIds.length > 0) {
    const songs = await getSongsByIds(songIds);
    const songMap = new Map(songs.map(s => [s.id, s]));
    entries.forEach(e => {
      e.song = songMap.get(e.songId);
    });
  }

  return entries;
}

export async function addSongToPlaylist(playlistId: string, songId: string, order: number): Promise<void> {
  const now = new Date().toISOString().split('T')[0];
  await airtableFetch(`${BASE}/Playlist%20Songs`, {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        'Entry ID': `${playlistId}-${songId}`,
        'Playlist': [playlistId],
        'Song': [songId],
        'Order': order,
      },
      typecast: true,
    }),
  });
  // Update playlist's Updated Date
  await updatePlaylist(playlistId, {});
}

export async function removeSongFromPlaylist(entryId: string): Promise<void> {
  await airtableFetch(`${BASE}/Playlist%20Songs/${entryId}`, { method: 'DELETE' });
}

export async function reorderPlaylistSong(entryId: string, newOrder: number): Promise<void> {
  await airtableFetch(`${BASE}/Playlist%20Songs/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      fields: { Order: newOrder },
      typecast: true,
    }),
  });
}

// Smart views
export async function getSongsByStatus(status: string): Promise<Song[]> {
  return getSongs({ status });
}

// Get all filter options (for dropdowns)
export async function getFilterOptions(): Promise<{
  genres: string[];
  artists: string[];
  years: number[];
  vibes: string[];
  energies: string[];
  performanceStyles: string[];
  venueFits: string[];
  statuses: string[];
}> {
  const songs = await getSongs();
  const genres = [...new Set(songs.flatMap(s => s.genre))].sort() as string[];
  const artists = [...new Set(songs.map(s => s.artist).filter(Boolean))].sort() as string[];
  const years = [...new Set(songs.map(s => s.year).filter((y): y is number => y !== null))].sort((a, b) => b - a) as number[];
  const vibes = [...new Set(songs.flatMap(s => s.vibe))].sort() as string[];
  const energies = [...new Set(songs.map(s => s.energy).filter(Boolean))].sort() as string[];
  const performanceStyles = [...new Set(songs.flatMap(s => s.performanceStyle))].sort() as string[];
  const venueFits = [...new Set(songs.flatMap(s => s.venueFit))].sort() as string[];
  const statuses = [...new Set(songs.map(s => s.status).filter(Boolean))].sort() as string[];
  return { genres, artists, years, vibes, energies, performanceStyles, venueFits, statuses };
}