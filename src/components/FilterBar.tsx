'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Song } from '@/types';

interface FilterBarProps {
  onFilter: (params: Record<string, string>) => void;
  onSort: (sort: string) => void;
  currentSort: string;
  filterOptions: {
    genres: string[];
    artists: string[];
    years: number[];
    vibes: string[];
    energies: string[];
    performanceStyles: string[];
    venueFits: string[];
    statuses: string[];
  } | null;
  searchQuery: string;
  onSearch: (q: string) => void;
}

export default function FilterBar({ onFilter, onSort, currentSort, filterOptions, searchQuery, onSearch }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const applyFilter = useCallback((key: string, value: string) => {
    const next = { ...activeFilters };
    if (value) {
      next[key] = value;
    } else {
      delete next[key];
    }
    setActiveFilters(next);
    onFilter(next);
  }, [activeFilters, onFilter]);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    onFilter({});
    onSearch('');
  }, [onFilter, onSearch]);

  const hasFilters = Object.keys(activeFilters).length > 0;
  const hasAnyFilter = hasFilters || currentSort !== '' || searchQuery !== '';

  const filterSections = [
    {
      key: 'genre',
      label: 'Genre',
      options: filterOptions?.genres || [],
    },
    {
      key: 'vibe',
      label: 'Vibe',
      options: filterOptions?.vibes || [],
    },
    {
      key: 'energy',
      label: 'Energy',
      options: filterOptions?.energies || [],
    },
    {
      key: 'performanceStyle',
      label: 'Style',
      options: filterOptions?.performanceStyles || [],
    },
    {
      key: 'venueFit',
      label: 'Venue',
      options: filterOptions?.venueFits || [],
    },
    {
      key: 'status',
      label: 'Status',
      options: filterOptions?.statuses || [],
    },
    {
      key: 'crowdAppeal',
      label: 'Crowd Appeal',
      options: ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐', '⭐'],
    },
  ];

  return (
    <div className="mb-4">
      {/* Search row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          {showSearch ? (
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              onKeyDown={(e) => { if (e.key === 'Escape') { setShowSearch(false); onSearch(''); } }}
              placeholder="Search songs or artists..."
              className="w-full bg-[#252525] text-white rounded-lg px-4 py-2.5 text-sm 
                border border-[#333] focus:outline-none focus:border-[#1db954] transition-colors
                placeholder:text-[#6b6b6b]"
            />
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full bg-[#252525] text-[#a0a0a0] rounded-lg px-4 py-2.5 text-sm text-left
                border border-[#333] hover:border-[#555] transition-colors"
            >
              🔍 Search songs or artists...
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3 py-2.5 rounded-lg text-sm border transition-colors whitespace-nowrap
            ${showAdvanced || hasFilters 
              ? 'bg-[#1db954]/10 text-[#1db954] border-[#1db954]/30' 
              : 'bg-[#252525] text-[#a0a0a0] border-[#333] hover:border-[#555]'}`}
        >
          ⏷ Filters{hasFilters ? ` (${Object.keys(activeFilters).length})` : ''}
        </button>
        {hasAnyFilter && (
          <button
            onClick={clearFilters}
            className="px-3 py-2.5 rounded-lg text-sm border border-[#333] text-[#a0a0a0] 
              hover:border-[#555] transition-colors whitespace-nowrap"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-[#6b6b6b]">Sort:</span>
        <select
          value={currentSort}
          onChange={(e) => onSort(e.target.value)}
          className="bg-[#252525] text-white text-xs rounded-lg px-3 py-1.5 border border-[#333] 
            focus:outline-none focus:border-[#1db954]"
        >
          <option value="">Default</option>
          <option value="song-asc">Song A→Z</option>
          <option value="artist-asc">Artist A→Z</option>
          <option value="year-asc">Year ↑</option>
          <option value="year-desc">Year ↓</option>
          <option value="crowd-appeal">Crowd Appeal</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      {/* Advanced filters - collapsible */}
      {showAdvanced && filterOptions && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 bg-[#121212] rounded-lg border border-[#2a2a2a] mb-2">
          {filterSections.map(section => (
            <div key={section.key}>
              <label className="block text-xs text-[#6b6b6b] mb-1">{section.label}</label>
              <select
                value={activeFilters[section.key] || ''}
                onChange={(e) => applyFilter(section.key, e.target.value)}
                className="w-full bg-[#252525] text-white text-xs rounded-lg px-2 py-1.5 
                  border border-[#333] focus:outline-none focus:border-[#1db954]"
              >
                <option value="">All</option>
                {section.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}