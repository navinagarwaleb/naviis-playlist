'use client';

import { Song } from '@/types';

interface SongDetailProps {
  song: Song;
  onAddToPlaylist?: () => void;
  playlists?: { id: string; name: string }[];
  onClose?: () => void;
}

export default function SongDetail({ song, onAddToPlaylist, onClose }: SongDetailProps) {
  const albumUrl = song.attachments?.[0]?.thumbnails?.large?.url
    || song.attachments?.[0]?.thumbnails?.full?.url
    || song.attachments?.[0]?.url
    || null;

  const detailItems = [
    { label: 'Artist', value: song.artist },
    { label: 'Year', value: song.year?.toString() },
    { label: 'Genre', value: song.genre?.join(', ') },
    { label: 'Vibe', value: song.vibe?.join(', ') },
    { label: 'Energy', value: song.energy },
    { label: 'Crowd Appeal', value: song.crowdAppeal },
    { label: 'Performance Style', value: song.performanceStyle?.join(', ') },
    { label: 'Venue Fit', value: song.venueFit?.join(', ') },
    { label: 'Duration', value: song.duration },
    { label: 'Status', value: song.status },
    { label: 'In Playlists', value: song.playlistNames?.join(', ') || 'None' },
  ].filter(item => item.value && item.value.trim());

  return (
    <div>
      {/* Close button (mobile) */}
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 -ml-2 mb-4 rounded-lg hover:bg-[#252525] transition-colors text-[#a0a0a0]"
        >
          ← Back
        </button>
      )}

      {/* Album artwork */}
      <div className="w-full max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden bg-[#181818] mb-6 shadow-lg">
        {albumUrl ? (
          <img
            src={albumUrl}
            alt={song.song}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-[#333]">
            🎵
          </div>
        )}
      </div>

      {/* Song title */}
      <h2 className="text-2xl font-bold text-white mb-1">{song.song}</h2>
      <p className="text-base text-[#a0a0a0] mb-6">{song.artist}</p>

      {/* Details grid */}
      <div className="space-y-2 mb-6">
        {detailItems.map((item) => (
          <div
            key={item.label}
            className="flex justify-between items-center py-2 border-b border-[#2a2a2a] last:border-b-0"
          >
            <span className="text-xs text-[#6b6b6b] uppercase tracking-wider">{item.label}</span>
            <span className="text-sm text-white text-right max-w-[60%] truncate">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Playlist memberships */}
      {song.playlistNames && song.playlistNames.length > 0 && song.playlistNames[0] !== '' && (
        <div className="mb-6">
          <p className="text-xs text-[#6b6b6b] uppercase tracking-wider mb-2">In Playlists</p>
          <div className="flex flex-wrap gap-2">
            {song.playlistNames.filter(Boolean).map((name) => (
              <span
                key={name}
                className="text-xs px-3 py-1.5 rounded-full bg-[#252525] text-[#a0a0a0] border border-[#333]"
              >
                📁 {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add to playlist button */}
      {onAddToPlaylist && (
        <button
          onClick={onAddToPlaylist}
          className="w-full py-3 rounded-xl bg-[#1db954] text-black font-semibold text-sm 
            hover:bg-[#1ed760] transition-colors"
        >
          + Add to Playlist
        </button>
      )}
    </div>
  );
}