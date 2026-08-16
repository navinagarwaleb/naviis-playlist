'use client';

import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/types';
import SongCard from '@/components/SongCard';
import SongDetail from '@/components/SongDetail';
import FilterBar from '@/components/FilterBar';

export default function SongLibrary() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentSort, setCurrentSort] = useState('');
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [playlists, setPlaylists] = useState<{ id: string; name: string }[]>([]);
  const [addingSongId, setAddingSongId] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const check = () => setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fetch filter options once
  useEffect(() => {
    fetch('/api/songs').then(r => r.json()).then(data => {
      if (data.songs?.length) {
        const g = [...new Set(data.songs.flatMap((s: Song) => s.genre))].sort() as string[];
        const a = [...new Set(data.songs.map((s: Song) => s.artist).filter(Boolean))].sort() as string[];
        const yearVals: (number | null)[] = data.songs.map((s: Song) => s.year);
        const yearsArr: number[] = [...new Set(yearVals.filter((y): y is number => y !== null))].sort((a: any, b: any) => b - a);
        const v = [...new Set(data.songs.flatMap((s: Song) => s.vibe))].sort() as string[];
        const e = [...new Set(data.songs.map((s: Song) => s.energy).filter(Boolean))].sort() as string[];
        const p = [...new Set(data.songs.flatMap((s: Song) => s.performanceStyle))].sort() as string[];
        const vf = [...new Set(data.songs.flatMap((s: Song) => s.venueFit))].sort() as string[];
        const st = [...new Set(data.songs.map((s: Song) => s.status).filter(Boolean))].sort() as string[];
        setFilterOptions({ genres: g, artists: a, years: yearsArr, vibes: v, energies: e, performanceStyles: p, venueFits: vf, statuses: st });
      }
    }).catch(() => {});
  }, []);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      if (currentSort) params.set('sort', currentSort);

      const res = await fetch(`/api/songs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setSongs(data.songs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, currentSort]);

  useEffect(() => {
    const timer = setTimeout(fetchSongs, 200);
    return () => clearTimeout(timer);
  }, [fetchSongs]);

  const handleSongClick = useCallback((song: Song) => {
    setSelectedSong(song);
    if (!isTablet) setShowMobileDetail(true);
  }, [isTablet]);

  const handleAddToPlaylist = useCallback(async () => {
    if (!selectedSong) return;
    // Fetch playlists
    const res = await fetch('/api/playlists');
    const data = await res.json();
    setPlaylists(data.playlists.map((p: any) => ({ id: p.id, name: p.playlistName })));
    setShowAddToPlaylist(true);
  }, [selectedSong]);

  const handleSelectPlaylist = useCallback(async (playlistId: string) => {
    if (!selectedSong) return;
    try {
      // Get current playlist songs to determine next order
      const res = await fetch(`/api/playlist-songs?playlistId=${playlistId}`);
      const data = await res.json();
      const nextOrder = data.songs?.length || 0;

      await fetch('/api/playlist-songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, songId: selectedSong.id, order: nextOrder }),
      });
      setShowAddToPlaylist(false);
      // Refresh song to show new playlist membership
      fetchSongs();
    } catch (err: any) {
      alert('Failed to add song: ' + err.message);
    }
  }, [selectedSong, fetchSongs]);

  return (
    <div className={`flex ${isTablet ? 'h-full gap-4' : 'flex-col'}`}>
      {/* Left side - Song grid */}
      <div className={`${isTablet ? 'w-1/2 overflow-y-auto pr-2' : 'w-full'}`}>
        <FilterBar
          onFilter={setFilters}
          onSort={setCurrentSort}
          currentSort={currentSort}
          filterOptions={filterOptions}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />

        {error && (
          <div className="text-red-400 text-sm p-4 bg-red-900/20 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#181818] rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-[#282828]" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-[#282828] rounded w-3/4" />
                  <div className="h-3 bg-[#282828] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🎵</div>
            <p className="text-[#a0a0a0] text-lg">No songs found</p>
            <p className="text-[#6b6b6b] text-sm mt-2">Try adjusting your filters or search</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#6b6b6b] mb-2">{songs.length} songs</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {songs.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  isSelected={selectedSong?.id === song.id && isTablet}
                  onClick={() => handleSongClick(song)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right side - Song detail (tablet split screen) */}
      {isTablet && selectedSong && (
        <div className="w-1/2 overflow-y-auto pl-2 border-l border-[#2a2a2a]">
          <div className="sticky top-0 pt-2">
            <SongDetail
              song={selectedSong}
              onAddToPlaylist={handleAddToPlaylist}
              playlists={[]}
            />
          </div>
        </div>
      )}

      {/* Mobile detail overlay */}
      {showMobileDetail && selectedSong && !isTablet && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto p-4">
          <SongDetail
            song={selectedSong}
            onAddToPlaylist={handleAddToPlaylist}
            playlists={[]}
            onClose={() => setShowMobileDetail(false)}
          />
        </div>
      )}

      {/* Add to Playlist modal */}
      {showAddToPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#121212] rounded-2xl w-full max-w-sm border border-[#2a2a2a] overflow-hidden">
            <div className="p-4 border-b border-[#2a2a2a]">
              <h3 className="text-white font-semibold">Add to Playlist</h3>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {playlists.length === 0 ? (
                <p className="text-[#6b6b6b] text-sm p-4 text-center">No playlists yet. Create one first.</p>
              ) : (
                playlists.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPlaylist(p.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-[#252525] transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">📁</span>
                    <span className="text-white text-sm">{p.name}</span>
                  </button>
                ))
              )}
            </div>
            <div className="p-3 border-t border-[#2a2a2a]">
              <button
                onClick={() => setShowAddToPlaylist(false)}
                className="w-full py-2 text-sm text-[#a0a0a0] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}