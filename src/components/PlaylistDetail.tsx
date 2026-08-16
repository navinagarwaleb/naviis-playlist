'use client';

import { useState, useEffect } from 'react';
import { Song, Playlist } from '@/types';
import { SongCardInline } from '@/components/SongCard';

interface PlaylistDetailProps {
  playlistId: string;
  playlistName: string;
  onBack: () => void;
}

export default function PlaylistDetail({ playlistId, playlistName, onBack }: PlaylistDetailProps) {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState(playlistName);
  const [editingOrder, setEditingOrder] = useState(false);
  const [playlistInfo, setPlaylistInfo] = useState<Playlist | null>(null);

  const fetchPlaylistSongs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/playlist-songs?playlistId=${playlistId}`);
      const data = await res.json();
      if (res.ok) setSongs(data.songs);
      const pres = await fetch(`/api/playlists/${playlistId}`);
      const pdata = await pres.json();
      if (pres.ok) setPlaylistInfo(pdata.playlist);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaylistSongs(); }, [playlistId]);

  const handleRemove = async (entryId: string) => {
    await fetch(`/api/playlist-songs?entryId=${entryId}`, { method: 'DELETE' });
    fetchPlaylistSongs();
  };

  const handleReorder = async (entryId: string, dir: 'up' | 'down') => {
    const idx = songs.findIndex(s => s.id === entryId);
    if (idx < 0) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= songs.length) return;

    const currentOrder = songs[idx].order;
    const swapOrder = songs[newIdx].order;

    // Swap orders
    await fetch('/api/playlist-songs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', entryId, order: swapOrder }),
    });
    await fetch('/api/playlist-songs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', entryId: songs[newIdx].id, order: currentOrder }),
    });
    fetchPlaylistSongs();
  };

  const handleOpenAddSongs = async () => {
    const res = await fetch('/api/songs');
    const data = await res.json();
    setAllSongs(data.songs || []);
    setSelectedIds(new Set());
    setSearchQuery('');
    setShowAddSongs(true);
  };

  const handleAddSelectedSongs = async () => {
    let nextOrder = songs.length;
    for (const songId of selectedIds) {
      await fetch('/api/playlist-songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, songId, order: nextOrder++ }),
      });
    }
    setShowAddSongs(false);
    fetchPlaylistSongs();
  };

  const handleRename = async () => {
    if (!renameValue.trim()) return;
    await fetch(`/api/playlists/${playlistId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 'Playlist Name': renameValue.trim() }),
    });
    setShowRename(false);
    fetchPlaylistSongs();
  };

  const toggleSongSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredAllSongs = searchQuery
    ? allSongs.filter(s => 
        s.song.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase()))
    : allSongs;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-[#252525] transition-colors"
        >
          ←
        </button>
        <div className="flex-1">
          {showRename ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="bg-[#252525] text-white rounded-lg px-3 py-1.5 text-lg font-bold
                  border border-[#333] focus:outline-none focus:border-[#1db954] flex-1"
              />
              <button onClick={handleRename} className="px-3 py-1.5 bg-[#1db954] text-black text-sm rounded-lg">Save</button>
              <button onClick={() => setShowRename(false)} className="px-3 py-1.5 text-[#a0a0a0] text-sm">Cancel</button>
            </div>
          ) : (
            <h2
              className="text-2xl font-bold text-white cursor-pointer hover:text-[#1db954] transition-colors"
              onClick={() => { setRenameValue(playlistName); setShowRename(true); }}
            >
              {playlistName}
            </h2>
          )}
          <p className="text-sm text-[#a0a0a0]">{songs.length} songs</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={handleOpenAddSongs}
          className="px-4 py-2 rounded-lg bg-[#1db954] text-black text-sm font-semibold 
            hover:bg-[#1ed760] transition-colors"
        >
          + Add Songs
        </button>
        <button
          onClick={() => setEditingOrder(!editingOrder)}
          className={`px-4 py-2 rounded-lg border text-sm transition-colors
            ${editingOrder 
              ? 'bg-[#1db954]/10 text-[#1db954] border-[#1db954]/30' 
              : 'border-[#333] text-[#a0a0a0] hover:border-[#555]'}`}
        >
          {editingOrder ? 'Done Reordering' : 'Reorder'}
        </button>
      </div>

      {/* Song list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
              <div className="w-12 h-12 rounded-md bg-[#282828]" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-[#282828] rounded w-3/4" />
                <div className="h-3 bg-[#282828] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🎵</div>
          <p className="text-[#a0a0a0]">No songs in this playlist</p>
          <button
            onClick={handleOpenAddSongs}
            className="mt-4 px-6 py-2.5 rounded-lg bg-[#1db954] text-black text-sm font-semibold 
              hover:bg-[#1ed760] transition-colors"
          >
            + Add Songs
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {songs.map((entry, idx) => entry.song ? (
            <div key={entry.id} className="flex items-center gap-2 group">
              {editingOrder && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleReorder(entry.id, 'up')}
                    disabled={idx === 0}
                    className="w-6 h-4 flex items-center justify-center text-xs text-[#6b6b6b] 
                      hover:text-white disabled:opacity-30"
                  >▲</button>
                  <button
                    onClick={() => handleReorder(entry.id, 'down')}
                    disabled={idx === songs.length - 1}
                    className="w-6 h-4 flex items-center justify-center text-xs text-[#6b6b6b] 
                      hover:text-white disabled:opacity-30"
                  >▼</button>
                </div>
              )}
              <span className="text-xs text-[#6b6b6b] w-6 text-right flex-shrink-0">{idx + 1}</span>
              <div className="flex-1">
                <SongCardInline song={entry.song} />
              </div>
              <button
                onClick={() => handleRemove(entry.id)}
                className="p-2 text-[#6b6b6b] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ) : null)}
        </div>
      )}

      {/* Add Songs modal */}
      {showAddSongs && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-[#2a2a2a]">
            <div className="p-4 border-b border-[#2a2a2a]">
              <h3 className="text-white font-semibold mb-3">Add Songs to {playlistName}</h3>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs..."
                className="w-full bg-[#252525] text-white rounded-lg px-4 py-2.5 text-sm 
                  border border-[#333] focus:outline-none focus:border-[#1db954]"
              />
              <p className="text-xs text-[#6b6b6b] mt-2">
                {selectedIds.size} selected — songs already in playlist are hidden
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredAllSongs
                .filter(s => !songs.find((e: any) => e.songId === s.id))
                .map(song => (
                  <button
                    key={song.id}
                    onClick={() => toggleSongSelection(song.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left
                      ${selectedIds.has(song.id) ? 'bg-[#1db954]/10 ring-1 ring-[#1db954]/30' : 'hover:bg-[#252525]'}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                      ${selectedIds.has(song.id) 
                        ? 'bg-[#1db954] border-[#1db954]' 
                        : 'border-[#555]'}`}
                    >
                      {selectedIds.has(song.id) && <span className="text-black text-xs">✓</span>}
                    </div>
                    <div className="w-10 h-10 rounded bg-[#282828] flex-shrink-0 overflow-hidden">
                      {song.attachments?.[0]?.thumbnails?.small?.url ? (
                        <img src={song.attachments[0].thumbnails.small.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-[#555]">🎵</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{song.song}</p>
                      <p className="text-xs text-[#a0a0a0] truncate">{song.artist}</p>
                    </div>
                  </button>
                ))}
              {filteredAllSongs.filter(s => !songs.find((e: any) => e.songId === s.id)).length === 0 && (
                <p className="text-center text-[#6b6b6b] py-8 text-sm">
                  {searchQuery ? 'No matching songs' : 'All songs are already in this playlist'}
                </p>
              )}
            </div>
            <div className="p-3 border-t border-[#2a2a2a] flex gap-2">
              <button
                onClick={() => setShowAddSongs(false)}
                className="flex-1 py-2.5 rounded-lg border border-[#333] text-sm text-[#a0a0a0] 
                  hover:border-[#555] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelectedSongs}
                disabled={selectedIds.size === 0}
                className="flex-1 py-2.5 rounded-lg bg-[#1db954] text-black text-sm font-semibold 
                  hover:bg-[#1ed760] disabled:opacity-50 transition-colors"
              >
                Add {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}