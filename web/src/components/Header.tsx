import React from 'react';
import { Bell, Plus, LogIn, Sun, Moon } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenCreateModal: () => void;
  onOpenProfileModal: () => void;
  firebaseUser?: FirebaseUser | null;
  onOpenAuthModal?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  onSelectCity,
  unreadCount,
  onOpenNotifications,
  onOpenCreateModal,
  onOpenProfileModal,
  firebaseUser,
  onOpenAuthModal,
  darkMode,
  onToggleDarkMode,
}) => {
  const cities = ['All', 'Durham', 'Raleigh', 'Cary', 'Chapel Hill', 'Morrisville'];

  return (
    <header className="bg-[#FFFEFD] dark:bg-[#050E21] border-b border-[#E5E0D8] dark:border-white/10 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="layout-container py-4 flex items-center justify-between gap-6">
        {/* Left: Brand Title & Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#D95F4B] dark:bg-[#0018A8] text-white flex items-center justify-center font-extrabold text-sm shadow-xs transition-colors">
            ▲
          </div>
          <div>
            <h1 className="font-['Bricolage_Grotesque'] text-xl font-bold text-[#1A1A1A] dark:text-[#F8FAFC] leading-none tracking-tight">
              Triangle Social
            </h1>
            <p className="font-['Outfit'] text-[11px] text-[#77736F] dark:text-[#94A3B8] font-medium leading-none mt-1">
              Local events & plans · Cohort of '26
            </p>
          </div>
        </div>

        {/* Center: City Hub Selector Pills */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-extrabold text-[#77736F] dark:text-[#94A3B8] uppercase tracking-wider mr-1">
            CITY:
          </span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => onSelectCity(city)}
              style={{ padding: '6px 14px' }}
              className={`rounded-full text-xs font-bold transition-all border shrink-0 ${
                selectedCity === city
                  ? 'bg-[#1A1A1A] dark:bg-[#0018A8] text-white border-[#1A1A1A] dark:border-[#0018A8] shadow-xs'
                  : 'bg-[#F5F1EC] dark:bg-[#0B172E] text-[#1A1A1A] dark:text-[#F8FAFC] border-[#E5E0D8] dark:border-white/10 hover:bg-[#EBE5DD] dark:hover:bg-[#122244]'
              }`}
            >
              {city === 'All' ? 'All Triangle' : city}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile City Selector Dropdown */}
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity(e.target.value)}
            className="lg:hidden bg-[#F5F1EC] dark:bg-[#0B172E] text-xs font-bold text-[#1A1A1A] dark:text-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E5E0D8] dark:border-white/10 outline-none"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Cities' : c}
              </option>
            ))}
          </select>

          {/* Deutsche Bank Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg bg-[#F5F1EC] dark:bg-[#0B172E] hover:bg-[#EBE5DD] dark:hover:bg-[#122244] text-[#1A1A1A] dark:text-[#F8FAFC] border border-[#E5E0D8] dark:border-white/10 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Deutsche Bank Dark Mode'}
          >
            {darkMode ? <Sun size={16} className="text-[#38BDF8]" /> : <Moon size={16} />}
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-[#F5F1EC] dark:bg-[#0B172E] hover:bg-[#EBE5DD] dark:hover:bg-[#122244] text-[#1A1A1A] dark:text-[#F8FAFC] border border-[#E5E0D8] dark:border-white/10 transition-colors"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D95F4B] dark:bg-[#0018A8] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-[#FFFEFD] dark:border-[#050E21]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Create Plan Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-[#1A1A1A] dark:bg-[#0018A8] hover:bg-black dark:hover:bg-[#001073] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-xs"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Create Plan</span>
          </button>

          {/* Firebase Auth / Profile Avatar Button */}
          {firebaseUser ? (
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:opacity-85 transition-opacity"
              title="Profile & Settings"
            >
              <img
                src={firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={firebaseUser.displayName || 'Profile'}
                className="w-8 h-8 rounded-full object-cover border-1.5 border-[#D95F4B] dark:border-[#38BDF8]"
              />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal || onOpenProfileModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8D7CC] dark:bg-[#0018A8]/30 text-[#D95F4B] dark:text-[#38BDF8] border border-[#D95F4B]/40 dark:border-[#38BDF8]/40 hover:bg-[#EBE5DD] dark:hover:bg-[#0018A8]/50 transition-all"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
