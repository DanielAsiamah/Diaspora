import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthState,
} from '../services/auth/authService';
import {
  addAnswerToLessonSession,
  completeLessonSession,
  createLessonSession,
  createUserDocument,
  getLanguageProgress,
  getUserDocument,
  setLanguageProgress,
  touchUserLastActive,
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

      if (firebaseUser) {
        const document = await getUserDocument(firebaseUser.uid);
        await touchUserLastActive(firebaseUser.uid).catch(() => {});
        setProfile(document);
      } else {
        setProfile(null);
      }

      setInitializing(false);
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
    return firebaseUser;
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const firebaseUser = await signInWithEmail(trimmedEmail, password);
    const document = await getUserDocument(firebaseUser.uid);
    setUser(firebaseUser);
    setProfile(document);
    return firebaseUser;
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

      return getLanguageProgress(user.uid, languageId);
    },
    [user]
  );

  const syncLanguageProgress = useCallback(
    async (languageId, fields) => {
      if (!user || !languageId) {
        return;
      }

      await setLanguageProgress(user.uid, languageId, fields);
    },
    [user]
  );

  const recordLessonSession = useCallback(
    async (fields) => {
      if (!user) {
        return null;
      }

      return createLessonSession(user.uid, fields);
    },
    [user]
  );

  const recordLessonAnswer = useCallback(
    async (sessionId, answer) => {
      if (!user || !sessionId) {
        return;
      }

      await addAnswerToLessonSession(user.uid, sessionId, answer);
    },
    [user]
  );

  const finishLessonSession = useCallback(
    async (sessionId, fields) => {
      if (!user || !sessionId) {
        return;
      }

      await completeLessonSession(user.uid, sessionId, fields);
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
      syncLanguageProgress,
      recordLessonSession,
      recordLessonAnswer,
      finishLessonSession,
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
      syncLanguageProgress,
      recordLessonSession,
      recordLessonAnswer,
      finishLessonSession,
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
