'use client';

import { useState, useEffect } from 'react';
import { Playlist } from '@/types';
import PlaylistCard from '@/components/PlaylistCard';

interface PlaylistsViewProps {
  onSelectPlaylist: (id: string, name: string) => void;
}

export default function PlaylistsView({ onSelectPlaylist }: PlaylistsViewProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      if (res.ok) setPlaylists(data.playlists);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this playlist?')) return;
    await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
    fetchPlaylists();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Playlists</h2>
          <p className="text-xs text-[#6b6b6b] mt-1">{playlists.length} playlists</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg bg-[#1db954] text-black text-sm font-semibold 
            hover:bg-[#1ed760] transition-colors"
        >
          + New Playlist
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#181818] rounded-xl p-4 animate-pulse">
              <div className="w-10 h-10 bg-[#282828] rounded-lg mb-3" />
              <div className="h-4 bg-[#282828] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#282828] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-[#a0a0a0]">No playlists yet</p>
          <p className="text-[#6b6b6b] text-sm mt-2">Create your first playlist to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-6 py-2.5 rounded-lg bg-[#1db954] text-black text-sm font-semibold 
              hover:bg-[#1ed760] transition-colors"
          >
            + Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {playlists.map(p => (
            <div key={p.id} className="relative group">
              <PlaylistCard playlist={p} onClick={() => onSelectPlaylist(p.id, p.playlistName)} />
              <button
                onClick={(e) => handleDelete(p.id, e)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white 
                  text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create playlist modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl w-full max-w-sm border border-[#2a2a2a] p-6">
            <h3 className="text-white font-semibold text-lg mb-4">New Playlist</h3>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Playlist name"
              className="w-full bg-[#252525] text-white rounded-lg px-4 py-2.5 text-sm 
                border border-[#333] focus:outline-none focus:border-[#1db954] mb-3"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-[#252525] text-white rounded-lg px-4 py-2.5 text-sm 
                border border-[#333] focus:outline-none focus:border-[#1db954] mb-4 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-lg border border-[#333] text-sm text-[#a0a0a0] 
                  hover:border-[#555] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 py-2.5 rounded-lg bg-[#1db954] text-black text-sm font-semibold 
                  hover:bg-[#1ed760] disabled:opacity-50 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}