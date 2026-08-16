'use client';

interface SidebarProps {
  activeView: 'songs' | 'playlists' | 'ready' | 'learning';
  onViewChange: (view: 'songs' | 'playlists' | 'ready' | 'learning') => void;
  onOpenChange?: (open: boolean) => void;
}

export default function Sidebar({ activeView, onViewChange, onOpenChange }: SidebarProps) {
  const links = [
    { id: 'songs' as const, label: 'All Songs', icon: '🎵' },
    { id: 'ready' as const, label: 'Ready', icon: '✅' },
    { id: 'learning' as const, label: 'Learning', icon: '📖' },
    { id: 'playlists' as const, label: 'Playlists', icon: '📁' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="px-4 py-6">
        <h1 className="text-lg font-bold text-white">NAVII&apos;S</h1>
        <p className="text-xs text-[#1db954] tracking-widest uppercase">Playlist</p>
        <p className="text-[10px] text-[#6b6b6b] mt-2">Live Repertoire</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => { onViewChange(link.id); onOpenChange?.(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5
              ${activeView === link.id 
                ? 'bg-[#252525] text-white font-medium' 
                : 'text-[#a0a0a0] hover:text-white hover:bg-[#1a1a1a]'}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#2a2a2a]">
        <p className="text-[10px] text-[#6b6b6b]">Navii&apos;s Playlist</p>
      </div>
    </div>
  );
}