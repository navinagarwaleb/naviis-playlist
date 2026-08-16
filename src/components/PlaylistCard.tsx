'use client';

import { Playlist } from '@/types';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

export default function PlaylistCard({ playlist, onClick }: PlaylistCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#181818] hover:bg-[#232323] rounded-xl p-4 
        transition-all duration-200 border border-[#2a2a2a] hover:border-[#444]"
    >
      <div className="text-3xl mb-3">📁</div>
      <h3 className="text-white font-semibold text-base truncate">{playlist.playlistName}</h3>
      <p className="text-[#a0a0a0] text-sm mt-1">
        {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
      </p>
      {playlist.description && (
        <p className="text-[#6b6b6b] text-xs mt-1 line-clamp-2">{playlist.description}</p>
      )}
    </button>
  );
}