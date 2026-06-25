import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthState,
} from '../services/auth/authService';
import {
  createLessonSession,
  createUserDocument,
  ensureLanguageProgress,
  getLanguageProgress,
  getUserDocument,
  updateLanguageProgress,
  updateUserProgress,
} from '../services/firestore/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);

      try {
        if (firebaseUser) {
          const document = await getUserDocument(firebaseUser.uid);
          setProfile(document);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return null;
    }

    const document = await getUserDocument(user.uid);
    setProfile(document);
    return document;
  }, [user]);

  const signUp = useCallback(async ({ username, email, password }) => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const firebaseUser = await signUpWithEmail(trimmedEmail, password);
    await createUserDocument(firebaseUser.uid, {
      username: trimmedUsername,
      email: trimmedEmail,
    });

    const document = await getUserDocument(firebaseUser.uid);
    setUser(firebaseUser);
    setProfile(document);
    return { firebaseUser, profile: document };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const firebaseUser = await signInWithEmail(trimmedEmail, password);
    const document = await getUserDocument(firebaseUser.uid);
    setUser(firebaseUser);
    setProfile(document);
    return { firebaseUser, profile: document };
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setProfile(null);
  }, []);

  const syncProgress = useCallback(
    async (fields) => {
      if (!user) {
        return;
      }

      await updateUserProgress(user.uid, fields);
      setProfile((current) => (current ? { ...current, ...fields } : current));
    },
    [user]
  );

  const loadLanguageProgress = useCallback(
    async (languageId) => {
      if (!user || !languageId) {
        return null;
      }

      return ensureLanguageProgress(user.uid, languageId);
    },
    [user]
  );

  const refreshLanguageProgress = useCallback(
    async (languageId) => {
      if (!user || !languageId) {
        return null;
      }

      return getLanguageProgress(user.uid, languageId);
    },
    [user]
  );

  const syncLanguageProgress = useCallback(
    async (languageId, fields) => {
      if (!user || !languageId) {
        return;
      }

      await updateLanguageProgress(user.uid, languageId, fields);
    },
    [user]
  );

  const recordLessonSession = useCallback(
    async (session) => {
      if (!user || !session?.languageId || !session?.lessonId) {
        return null;
      }

      return createLessonSession(user.uid, session);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      initializing,
      isAuthenticated: Boolean(user),
      signUp,
      signIn,
      signOut,
      refreshProfile,
      syncProgress,
      loadLanguageProgress,
      refreshLanguageProgress,
      syncLanguageProgress,
      recordLessonSession,
    }),
    [
      user,
      profile,
      initializing,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      syncProgress,
      loadLanguageProgress,
      refreshLanguageProgress,
      syncLanguageProgress,
      recordLessonSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
