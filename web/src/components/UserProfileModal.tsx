import React, { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile, deleteAccount } from '../services/api';
import { X, User, MapPin, GraduationCap, AtSign, ShieldAlert, Check, Loader2 } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'safety'>('profile');

  // Form Fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Durham');
  const [cohortYear, setCohortYear] = useState('2026');
  const [company, setCompany] = useState('');
  const [interests, setInterests] = useState('');
  const [instagram, setInstagram] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchUserProfile()
        .then((p) => {
          setName(p.name || '');
          setBio(p.bio || '');
          setCity(p.city || 'Durham');
          setCohortYear(p.cohort_year || '2026');
          setCompany(p.company || '');
          setInterests(p.interests || 'Outdoors, Food & Drink');
          setInstagram(p.instagram_handle || '');
          setAvatarUrl(p.avatar_url || '');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateUserProfile({
        name,
        bio,
        city,
        cohort_year: cohortYear,
        company,
        interests,
        instagram_handle: instagram,
        avatar_url: avatarUrl,
      });
      setSuccessMsg('Profile updated successfully!');
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        alert('Your account and personal data have been permanently deleted.');
        window.location.reload();
      } catch (err) {
        alert('Failed to delete account.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-[#FFFEFD] border border-[#E5E0D8] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#F5F1EC] border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={18} className="text-[#D95F4B]" />
            <h2 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A]">
              Member Profile & Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#77736F] hover:bg-[#EBE5DD] hover:text-[#1A1A1A] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#E5E0D8] px-6 flex items-center gap-4 bg-[#FFFEFD]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#D95F4B] text-[#D95F4B]'
                : 'border-transparent text-[#77736F] hover:text-[#1A1A1A]'
            }`}
          >
            Edit Profile & Social Bio
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'safety'
                ? 'border-[#D95F4B] text-[#D95F4B]'
                : 'border-transparent text-[#77736F] hover:text-[#1A1A1A]'
            }`}
          >
            Account Safety & Privacy
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#77736F] space-y-2">
              <Loader2 size={24} className="animate-spin text-[#D95F4B]" />
              <span className="text-xs font-bold">Loading member profile...</span>
            </div>
          ) : activeTab === 'profile' ? (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Avatar Preview & URL */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#F5F1EC] border border-[#E5E0D8]">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt="Avatar Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#D95F4B] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#FFFEFD] text-xs font-semibold text-[#1A1A1A] px-3 py-1.5 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Name & Cohort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F5F1EC] text-xs font-bold text-[#1A1A1A] px-3 py-2 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                    Cohort Graduation Year
                  </label>
                  <div className="relative">
                    <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736F]" />
                    <input
                      type="text"
                      value={cohortYear}
                      onChange={(e) => setCohortYear(e.target.value)}
                      placeholder="e.g. 2026"
                      className="w-full bg-[#F5F1EC] text-xs font-bold text-[#1A1A1A] pl-9 pr-3 py-2 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                </div>
              </div>

              {/* City Hub & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                    Home City Hub
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736F]" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#F5F1EC] text-xs font-bold text-[#1A1A1A] pl-9 pr-3 py-2 rounded-lg border border-[#E5E0D8] outline-none"
                    >
                      {['Durham', 'Raleigh', 'Cary', 'Chapel Hill', 'Morrisville'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                    University / Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Duke / UNC / Cisco"
                    className="w-full bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] px-3 py-2 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                  Bio / Social Intro
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short intro with your cohort members..."
                  className="w-full bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] px-3 py-2 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                />
              </div>

              {/* Interests & Social */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                    Favorite Vibes / Interests
                  </label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="Outdoors, Food & Drink, Coffee"
                    className="w-full bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] px-3 py-2 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                    Social Handle
                  </label>
                  <div className="relative">
                    <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736F]" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@username"
                      className="w-full bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] pl-9 pr-3 py-2 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              {successMsg && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
                  <Check size={14} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#77736F] hover:bg-[#F5F1EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[#1A1A1A] hover:bg-black text-white transition-all shadow-xs flex items-center gap-1.5"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          ) : (
            /* Safety & Delete Account Tab */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#F5F1EC] border border-[#E5E0D8] space-y-2">
                <h4 className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-[#D95F4B]" />
                  <span>Privacy & App Safety Guidelines</span>
                </h4>
                <p className="text-xs text-[#77736F] leading-relaxed">
                  Triangle Social Events strictly enforces safety and privacy rules. Your contact information is never shared with third parties. You can report objectionable content or block abusive users anytime.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
                <h4 className="text-xs font-bold text-red-900">
                  Delete Account & Data Cleanup
                </h4>
                <p className="text-xs text-red-700 leading-relaxed">
                  Permanently delete your account, created events, attendance RSVPs, and personal notifications. This action is immediate and irreversible.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Delete Account Permanently
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
