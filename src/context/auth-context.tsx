"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { z } from 'zod';
import { reportError } from '@/services/error-reporting';

const profileSchema = z.object({
  fullName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  artistName: z.string().min(2, "O nome artístico deve ter pelo menos 2 caracteres."),
  email: z.string().email("Por favor, insira um endereço de e-mail válido."),
  bio: z.string().max(280, "A biografia deve ter no máximo 280 caracteres.").optional(),
  preferredStyle: z.string().optional(),
  preferredRhythm: z.string().optional(),
  role: z.enum(['client', 'staff', 'admin']),
  createdAt: z.any(),
  uid: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

interface AuthContextType {
  user: User | null;
  userProfile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as Profile);
            setLoading(false);
          } else {
            // Create user profile if it doesn't exist
            const newProfile: Profile = {
              uid: user.uid,
              email: user.email || '',
              fullName: user.displayName || 'Novo Usuário',
              artistName: user.displayName || 'Novo Artista',
              role: user.email === 'gracetonestudios@gmail.com' ? 'admin' : 'client',
              createdAt: serverTimestamp(),
            };
            setDoc(userRef, newProfile).then(() => {
              setUserProfile(newProfile);
              setLoading(false);
            });
          }
        });
         return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const signInWithApple = async () => {
    try {
      await signInWithPopup(auth, appleProvider);
    } catch (error) {
      console.error("Error signing in with Apple: ", error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (user) {
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, data, { merge: true });
        } catch (error) {
            console.error("Error updating profile:", error);
            await reportError({
                component: "auth-context/updateProfile",
                errorMessage: (error as Error).message,
                errorStack: (error as Error).stack,
                userId: user.uid,
                userEmail: user.email || undefined,
            });
            // Re-throw o erro para que o chamador saiba que a operação falhou
            throw error;
        }
    } else {
        const error = new Error("User not authenticated to update profile");
         await reportError({
            component: "auth-context/updateProfile",
            errorMessage: error.message,
            errorStack: error.stack,
        });
        throw error;
    }
  }

  const value = { user, userProfile, loading, signInWithGoogle, signInWithApple, signOut, updateProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
