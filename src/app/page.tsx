'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SongLibrary from '@/components/SongLibrary';
import PlaylistsView from '@/components/PlaylistsView';
import PlaylistDetail from '@/components/PlaylistDetail';

export default function Home() {
  const [view, setView] = useState<'songs' | 'playlists' | 'ready' | 'learning'>('songs');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleSelectPlaylist = (id: string, name: string) => {
    setSelectedPlaylistId(id);
    setSelectedPlaylistName(name);
  };

  const handleBackFromPlaylist = () => {
    setSelectedPlaylistId(null);
  };

  // Smart views: filter in songs view
  const smartViewFilter = view === 'ready' ? { status: 'Ready' } 
    : view === 'learning' ? { status: 'Learning' } 
    : null;

  // Determine what to show based on selected playist
  const showPlaylistDetail = selectedPlaylistId !== null && selectedPlaylistName !== '';

  // Content based on view
  const renderContent = () => {
    if (showPlaylistDetail) {
      return (
        <PlaylistDetail
          playlistId={selectedPlaylistId!}
          playlistName={selectedPlaylistName}
          onBack={handleBackFromPlaylist}
        />
      );
    }

    if (view === 'playlists') {
      return <PlaylistsView onSelectPlaylist={handleSelectPlaylist} />;
    }

    // Songs, Ready, Learning all use SongLibrary
    return <SongLibrary />;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0a]">
      {/* Mobile header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a] border-b border-[#2a2a2a] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-[#252525] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-bold text-white">NAVII&apos;S PLAYLIST</h1>
            <p className="text-[10px] text-[#6b6b6b]">Live Repertoire</p>
          </div>
        </div>
      )}

      {/* Sidebar overlay (mobile) */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isMobile 
          ? `fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#0a0a0a] border-r border-[#2a2a2a] 
             transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : 'w-56 flex-shrink-0 border-r border-[#2a2a2a]'}`}
      >
        <Sidebar
          activeView={view}
          onViewChange={setView}
          onOpenChange={setSidebarOpen}
        />
      </aside>

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto ${isMobile ? 'pt-14' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* View label */}
          <div className="flex items-center gap-2 mb-2">
            {smartViewFilter && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1db954]/10 text-[#1db954]">
                {view === 'ready' ? '✅ Ready' : '📖 Learning'}
              </span>
            )}
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}