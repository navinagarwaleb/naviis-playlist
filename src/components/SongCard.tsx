'use client';

import { Song } from '@/types';

interface SongCardProps {
  song: Song;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function SongCard({ song, isSelected, onClick }: SongCardProps) {
  const albumUrl = song.attachments?.[0]?.thumbnails?.small?.url 
    || song.attachments?.[0]?.url 
    || null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl overflow-hidden transition-all duration-200 
        ${isSelected 
          ? 'ring-2 ring-[#1db954] bg-[#232323]' 
          : 'bg-[#181818] hover:bg-[#232323]'}`}
      style={{ aspectRatio: '2/3' }}
    >
      {/* Album art */}
      <div className="w-full h-0 pb-[100%] bg-[#282828] relative overflow-hidden">
        {albumUrl ? (
          <img
            src={albumUrl}
            alt={song.song}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-[#555]">
            🎵
          </div>
        )}
      </div>
      {/* Song info */}
      <div className="p-2">
        <p className="text-sm font-medium text-white truncate">{song.song}</p>
        <p className="text-xs text-[#a0a0a0] truncate">{song.artist}</p>
      </div>
    </button>
  );
}

export function SongCardInline({ song, onClick }: { song: Song; onClick?: () => void }) {
  const albumUrl = song.attachments?.[0]?.thumbnails?.small?.url 
    || song.attachments?.[0]?.url 
    || null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#252525] transition-colors text-left"
    >
      {/* Album art */}
      <div className="w-12 h-12 rounded-md bg-[#282828] flex-shrink-0 overflow-hidden">
        {albumUrl ? (
          <img src={albumUrl} alt={song.song} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg text-[#555]">🎵</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{song.song}</p>
        <p className="text-xs text-[#a0a0a0] truncate">{song.artist}</p>
      </div>
      {song.energy && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          song.energy === 'High' ? 'bg-green-900/50 text-green-400' :
          song.energy === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
          'bg-blue-900/50 text-blue-400'
        }`}>
          {song.energy}
        </span>
      )}
    </button>
  );
}