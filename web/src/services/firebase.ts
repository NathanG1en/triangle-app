import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Environment variables or fallback demo credentials
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyDemoKey_ReplaceWithYourActualFirebaseKey",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "triangle-social-events.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "triangle-social-events",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "triangle-social-events.appspot.com",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await syncUserProfileToFirestore(user);
    return user;
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  } catch (err: any) {
    console.error('Email Sign-In Error:', err);
    throw err;
  }
}

export async function signUpWithEmail(email: string, pass: string, name: string) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const user = res.user;
    await syncUserProfileToFirestore(user, { name });
    return user;
  } catch (err: any) {
    console.error('Email Sign-Up Error:', err);
    throw err;
  }
}

export async function logoutFirebase() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign Out Error:', err);
  }
}

export function subscribeAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

async function syncUserProfileToFirestore(user: FirebaseUser, extra?: { name?: string }) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: extra?.name || user.displayName || 'Cohort Member',
        avatar_url: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        cohort_year: '2026',
        city: 'Durham',
        created_at: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Firestore user sync warning (check security rules / config):', err);
  }
}
