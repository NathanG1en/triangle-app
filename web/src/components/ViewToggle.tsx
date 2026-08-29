import React from 'react';
import { LayoutGrid, Map, Search } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'feed' | 'map';
  onToggleView: (view: 'feed' | 'map') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onToggleView,
  searchQuery,
  onSearchChange,
  totalCount,
}) => {
  return (
    <div className="bg-[#FFFEFD] border-b border-[#E5E0D8] py-2.5 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736F]" />
          <input
            type="text"
            placeholder="Search plans, venues, or sports..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] pl-9 pr-3 py-2 rounded-full border border-[#E5E0D8] outline-none focus:border-[#D95F4B] transition-colors"
          />
        </div>

        {/* Right: View Switcher & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="font-['Outfit'] text-xs font-bold text-[#77736F]">
            {totalCount} {totalCount === 1 ? 'Plan' : 'Plans'} Found
          </span>

          <div className="flex items-center bg-[#F5F1EC] p-1 rounded-full border border-[#E5E0D8]">
            <button
              onClick={() => onToggleView('feed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                currentView === 'feed'
                  ? 'bg-[#1A1A1A] text-[#FFFEFD] shadow-xs'
                  : 'text-[#77736F] hover:text-[#1A1A1A]'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Feed</span>
            </button>
            <button
              onClick={() => onToggleView('map')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                currentView === 'map'
                  ? 'bg-[#1A1A1A] text-[#FFFEFD] shadow-xs'
                  : 'text-[#77736F] hover:text-[#1A1A1A]'
              }`}
            >
              <Map size={14} />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
