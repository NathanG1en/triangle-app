import React from 'react';
import { Bell, Plus, LogIn } from 'lucide-react';
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
}) => {
  const cities = ['All', 'Durham', 'Raleigh', 'Cary', 'Chapel Hill', 'Morrisville'];

  return (
    <header className="bg-[#FFFEFD] border-b border-[#E5E0D8] sticky top-0 z-30 shadow-xs">
      <div className="layout-container py-4 flex items-center justify-between gap-6">
        {/* Left: Brand Title & Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#D95F4B] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
            ▲
          </div>
          <div>
            <h1 className="font-['Bricolage_Grotesque'] text-xl font-bold text-[#1A1A1A] leading-none tracking-tight">
              Triangle Social
            </h1>
            <p className="font-['Outfit'] text-[11px] text-[#77736F] font-medium leading-none mt-1">
              Local events & plans · Cohort of '26
            </p>
          </div>
        </div>

        {/* Center: City Hub Selector Pills */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-extrabold text-[#77736F] uppercase tracking-wider mr-1">
            CITY:
          </span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => onSelectCity(city)}
              style={{ padding: '6px 14px' }}
              className={`rounded-full text-xs font-bold transition-all border shrink-0 ${
                selectedCity === city
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                  : 'bg-[#F5F1EC] text-[#1A1A1A] border-[#E5E0D8] hover:bg-[#EBE5DD]'
              }`}
            >
              {city === 'All' ? 'All Triangle' : city}
            </button>
          ))}
        </div>

        {/* Right: Actions & User Auth */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile City Selector Dropdown */}
          <select
            value={selectedCity}
            onChange={(e) => onSelectCity(e.target.value)}
            className="lg:hidden bg-[#F5F1EC] text-xs font-bold text-[#1A1A1A] px-3 py-1.5 rounded-lg border border-[#E5E0D8] outline-none"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Cities' : c}
              </option>
            ))}
          </select>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-[#F5F1EC] hover:bg-[#EBE5DD] text-[#1A1A1A] border border-[#E5E0D8] transition-colors"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D95F4B] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-[#FFFEFD]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Create Plan Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-xs"
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
                className="w-8 h-8 rounded-full object-cover border-1.5 border-[#D95F4B]"
              />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal || onOpenProfileModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E8D7CC] text-[#D95F4B] border border-[#D95F4B]/40 hover:bg-[#EBE5DD] transition-all"
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
