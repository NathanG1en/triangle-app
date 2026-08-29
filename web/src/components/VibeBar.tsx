import React from 'react';
import { Search, Check, Clock, Calendar, Sparkles, X } from 'lucide-react';

interface VibeBarProps {
  selectedCategories: string[];
  onToggleCategory: (cat: string) => void;
  selectedTimeType: string; // 'all' | 'timed' | 'untimed'
  onSelectTimeType: (timeType: string) => void;
  freeOnly: boolean;
  onToggleFreeOnly: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onResetAllFilters: () => void;
  hasActiveFilters: boolean;
}

export const VibeBar: React.FC<VibeBarProps> = ({
  selectedCategories,
  onToggleCategory,
  selectedTimeType,
  onSelectTimeType,
  freeOnly,
  onToggleFreeOnly,
  searchQuery,
  onSearchChange,
  onResetAllFilters,
  hasActiveFilters,
}) => {
  const categories = [
    'Outdoors',
    'Arts & Music',
    'Food & Drink',
    'Sports & Fitness',
    'Nightlife',
  ];

  return (
    <div className="bg-[#FFFEFD] dark:bg-[#050E21] border-b border-[#E5E0D8] dark:border-white/10 py-3 transition-colors">
      <div className="layout-container flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Timing Type Segmented Filter + Multi-Select Category Chips */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          {/* Requirement 2: Scheduled Events vs Anytime Activities Segmented Switcher */}
          <div className="flex items-center bg-[#F5F1EC] dark:bg-[#0B172E] p-1 rounded-full border border-[#E5E0D8] dark:border-white/10 shrink-0">
            <button
              onClick={() => onSelectTimeType('all')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedTimeType === 'all'
                  ? 'bg-[#1A1A1A] dark:bg-[#0018A8] text-white shadow-xs'
                  : 'text-[#77736F] dark:text-[#94A3B8] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
            >
              <Sparkles size={12} />
              <span>All Types</span>
            </button>

            <button
              onClick={() => onSelectTimeType('timed')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedTimeType === 'timed'
                  ? 'bg-[#D95F4B] dark:bg-[#0018A8] text-white shadow-xs'
                  : 'text-[#77736F] dark:text-[#94A3B8] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
              title="Events with scheduled dates and times"
            >
              <Calendar size={12} />
              <span>📅 Scheduled Events</span>
            </button>

            <button
              onClick={() => onSelectTimeType('untimed')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedTimeType === 'untimed'
                  ? 'bg-[#D95F4B] dark:bg-[#0018A8] text-white shadow-xs'
                  : 'text-[#77736F] dark:text-[#94A3B8] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
              title="Anytime spots, parks, trails, and open hours"
            >
              <Clock size={12} />
              <span>⏰ Anytime Spots</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-[#E5E0D8] dark:bg-white/10 mx-1 hidden sm:block shrink-0" />

          {/* Free Only Toggle */}
          <button
            onClick={onToggleFreeOnly}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 ${
              freeOnly
                ? 'bg-[#E8D7CC] dark:bg-[#0018A8] text-[#D95F4B] dark:text-[#F8FAFC] border-[#D95F4B] dark:border-[#38BDF8] font-bold shadow-xs'
                : 'bg-[#F5F1EC] dark:bg-[#0B172E] text-[#1A1A1A] dark:text-[#F8FAFC] border-[#E5E0D8] dark:border-white/10 hover:bg-[#EBE5DD] dark:hover:bg-[#122244]'
            }`}
          >
            {freeOnly ? '✓ Free Only' : 'Free Only'}
          </button>

          {/* Requirement 1: Multi-Select Category Pills */}
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-[#1A1A1A] dark:bg-[#0018A8] text-white border-[#1A1A1A] dark:border-[#38BDF8] font-bold shadow-xs'
                    : 'bg-[#F5F1EC] dark:bg-[#0B172E] text-[#1A1A1A] dark:text-[#F8FAFC] border-[#E5E0D8] dark:border-white/10 hover:bg-[#EBE5DD] dark:hover:bg-[#122244]'
                }`}
              >
                {isSelected && <Check size={12} strokeWidth={3} />}
                <span>{cat}</span>
              </button>
            );
          })}

          {/* Reset All Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[#D95F4B] dark:text-[#38BDF8] bg-[#E8D7CC]/60 dark:bg-[#0018A8]/30 border border-[#D95F4B]/40 dark:border-[#38BDF8]/40 hover:bg-[#E8D7CC] transition-colors shrink-0"
            >
              <X size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Right: Clean Search Input */}
        <div className="relative shrink-0 lg:w-64 flex items-center">
          <div className="absolute left-3 pointer-events-none text-[#77736F] dark:text-[#94A3B8] flex items-center justify-center z-10">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Search plans or spots..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: '38px', paddingRight: '14px' }}
            className="w-full bg-[#F5F1EC] dark:bg-[#0B172E] text-xs font-semibold text-[#1A1A1A] dark:text-[#F8FAFC] py-2 rounded-full border border-[#E5E0D8] dark:border-white/10 outline-none focus:border-[#1A1A1A] dark:focus:border-[#38BDF8] transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
