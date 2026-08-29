import React, { useState } from 'react';
import { currentUser, deleteAccount } from '../services/api';
import { X, Trash2, Shield, User, CheckCircle2 } from 'lucide-react';

interface AccountPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountPrivacyModal: React.FC<AccountPrivacyModalProps> = ({ isOpen, onClose }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setIsDeleting(false);
      setShowConfirmDelete(false);
      setIsDeleted(true);
    } catch (err) {
      setIsDeleting(false);
      alert('Failed to delete account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#FFFEFD] rounded-2xl w-full max-w-md border-1.5 border-[#1A1A1A] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#F5F1EC] px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={18} className="text-[#D95F4B]" />
            <h2 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A]">
              Member Profile & Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EBE5DD] text-[#1A1A1A] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isDeleted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E8D7CC] text-[#D95F4B] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-['Bricolage_Grotesque'] text-xl font-bold text-[#1A1A1A] mb-2">Account Deleted</h3>
            <p className="text-xs text-[#77736F] leading-relaxed">
              Your account and associated personal data have been permanently deleted from Triangle Cohort Events.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* User Card */}
            <div className="flex items-center gap-4 bg-[#F5F1EC] p-4 rounded-xl border border-[#E5E0D8]">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#D95F4B]"
              />
              <div>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A]">
                  {currentUser.name}
                </h3>
                <div className="text-xs text-[#075E59] font-bold">💻 {currentUser.company}</div>
                <div className="text-[11px] text-[#77736F] mt-0.5">🎓 Cohort of {currentUser.cohort_year}</div>
              </div>
            </div>

            {/* Hubs */}
            <div>
              <h4 className="text-xs font-extrabold text-[#D95F4B] uppercase tracking-wider mb-2">
                Preferred Hubs
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {['Durham', 'Cary', 'Raleigh', 'Morrisville', 'Chapel Hill'].map((city) => (
                  <span key={city} className="bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] px-2.5 py-1 rounded-lg border border-[#E5E0D8]">
                    📍 {city}
                  </span>
                ))}
              </div>
            </div>

            {/* Account Settings */}
            <div className="space-y-2 border-t border-[#E5E0D8] pt-4">
              <h4 className="text-xs font-extrabold text-[#D95F4B] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield size={13} />
                <span>Account Privacy & Safety</span>
              </h4>

              <div className="flex items-center justify-between text-xs py-1.5 text-[#1A1A1A]">
                <span className="font-semibold">Cohort Access Code</span>
                <span className="text-[#77736F]">RTP-GRAD-2026</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 text-[#1A1A1A]">
                <span className="font-semibold">Attendance Visibility</span>
                <span className="text-[#77736F]">Cohort Only</span>
              </div>

              {/* Delete Account Action */}
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="w-full mt-4 flex items-center justify-between p-3 rounded-xl bg-[#FFF5F5] hover:bg-[#FFEBEB] text-[#D95F4B] border border-[#F5C2C2] transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Trash2 size={15} />
                  <span>Delete Account & Personal Data</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#D95F4B] text-white px-2 py-0.5 rounded-full">
                  Permanent
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#FFFEFD] rounded-2xl p-6 w-full max-w-sm border border-[#1A1A1A] shadow-2xl">
            <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#D95F4B] mb-2">Delete Account Permanently?</h3>
            <p className="text-xs text-[#1A1A1A] leading-relaxed mb-6">
              This will permanently delete your account, your RSVPs, custom plans, and all associated personal data from our servers. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#F5F1EC] text-[#1A1A1A] border border-[#E5E0D8]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#D95F4B] text-white"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
