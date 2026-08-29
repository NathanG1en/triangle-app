import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, signUpWithEmail, logoutFirebase } from '../services/firebase';
import { X, LogIn, Mail, Lock, User, LogOut, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onAuthSuccess?: (user: FirebaseUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let user: FirebaseUser;
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your name');
        user = await signUpWithEmail(email, password, name);
        setSuccessMsg('Account created successfully!');
      } else {
        user = await loginWithEmail(email, password);
        setSuccessMsg('Signed in successfully!');
      }
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await loginWithGoogle();
      setSuccessMsg('Signed in with Google!');
      if (onAuthSuccess) onAuthSuccess(user);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg('Google Sign-In failed or popup was closed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logoutFirebase();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-[#FFFEFD] border border-[#E5E0D8] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#F5F1EC] border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogIn size={18} className="text-[#D95F4B]" />
            <h2 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A]">
              {currentUser ? 'Firebase Account' : isRegister ? 'Join Triangle Cohort' : 'Member Sign In'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#77736F] hover:bg-[#EBE5DD] hover:text-[#1A1A1A] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            /* Logged In View */
            <div className="space-y-4 text-center py-2">
              <img
                src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.displayName || 'User'}
                className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-[#D95F4B]"
              />
              <div>
                <h3 className="font-['Bricolage_Grotesque'] text-lg font-bold text-[#1A1A1A]">
                  {currentUser.displayName || 'Cohort Member'}
                </h3>
                <p className="text-xs text-[#77736F] font-semibold mt-0.5">
                  {currentUser.email}
                </p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold bg-[#075E59]/10 text-[#075E59] border border-[#075E59]/30">
                  Firebase Authenticated (UID: {currentUser.uid.slice(0, 8)}...)
                </span>
              </div>

              <div className="pt-4 border-t border-[#E5E0D8] flex justify-center">
                <button
                  onClick={handleSignOut}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Register Form */
            <>
              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-[#FFFEFD] hover:bg-[#F5F1EC] text-[#1A1A1A] text-xs font-bold py-2.5 px-4 rounded-xl border border-[#E5E0D8] transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center my-3">
                <div className="flex-grow border-t border-[#E5E0D8]"></div>
                <span className="shrink mx-3 text-[10px] font-bold text-[#77736F] uppercase">
                  or email sign in
                </span>
                <div className="flex-grow border-t border-[#E5E0D8]"></div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {isRegister && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736F]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Chen"
                        className="w-full bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] pl-9 pr-3 py-2 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                    Student / Personal Email
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736F]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@duke.edu"
                      className="w-full bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] pl-9 pr-3 py-2 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#77736F] uppercase mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77736F]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#F5F1EC] text-xs font-semibold text-[#1A1A1A] pl-9 pr-3 py-2 rounded-lg border border-[#E5E0D8] outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center gap-2">
                    <Check size={14} className="shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                </button>
              </form>

              {/* Toggle Register vs Sign In */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setErrorMsg('');
                  }}
                  className="text-xs font-bold text-[#D95F4B] hover:underline"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
