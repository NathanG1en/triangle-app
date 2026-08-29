import React from 'react';
import { Search } from 'lucide-react';

interface VibeBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedTimeType: string;
  onSelectTimeType: (timeType: string) => void;
  freeOnly: boolean;
  onToggleFreeOnly: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const VibeBar: React.FC<VibeBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedTimeType,
  onSelectTimeType,
  freeOnly,
  onToggleFreeOnly,
  searchQuery,
  onSearchChange,
}) => {
  const vibes = [
    { label: 'All Plans', cat: 'All', time: 'all' },
    { label: 'Tonight', cat: 'All', time: 'tonight' },
    { label: 'This Weekend', cat: 'All', time: 'weekend' },
    { label: 'Free Only', isFree: true },
    { label: 'Outdoors', cat: 'Outdoors' },
    { label: 'Arts & Music', cat: 'Arts & Music' },
    { label: 'Food & Drink', cat: 'Food & Drink' },
    { label: 'Sports', cat: 'Sports & Fitness' },
    { label: 'Nightlife', cat: 'Nightlife' },
    { label: 'Anytime Spots', cat: 'All', time: 'spot' },
  ];

  return (
    <div className="bg-[#FFFEFD] border-b border-[#E5E0D8] py-3">
      <div className="layout-container flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          {vibes.map((v, idx) => {
            let isActive = false;
            if (v.isFree) {
              isActive = freeOnly;
            } else if (v.time) {
              isActive = selectedTimeType === v.time && selectedCategory === (v.cat || 'All');
            } else {
              isActive = selectedCategory === v.cat && selectedTimeType === 'all' && !freeOnly;
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  if (v.isFree) {
                    onToggleFreeOnly();
                  } else {
                    if (v.cat) onSelectCategory(v.cat);
                    if (v.time) onSelectTimeType(v.time);
                  }
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 ${
                  isActive
                    ? 'bg-[#E8D7CC] text-[#D95F4B] border-[#D95F4B] font-bold shadow-xs'
                    : 'bg-[#F5F1EC] text-[#1A1A1A] border-[#E5E0D8] hover:bg-[#EBE5DD]'
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        {/* Right: Clean Search Input */}
        <div className="relative shrink-0 md:w-72 flex items-center">
          <div className="absolute left-3 pointer-events-none text-[#77736F] flex items-center justify-center z-10">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Search plans or spots..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: '38px', paddingRight: '14px' }}
            className="w-full bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] py-2 rounded-full border border-[#E5E0D8] outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
