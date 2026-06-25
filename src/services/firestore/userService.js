import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { firebaseDb } from '../../firebase/app';
import { COLLECTIONS } from '../../firebase/collections';
import { MAX_HEARTS } from '../../theme';

export const DEFAULT_USER_PROFILE = {
  xp: 0,
  streak: 0,
  hearts: MAX_HEARTS,
  nextHeartAt: null,
  gems: 100,
  completed: [],
  purchasedItems: [],
  currentCourse: null,
  currentLesson: null,
  onboardingCompleted: false,
  baseLanguage: null,
  baseLanguageLevels: {},
  recommendedStartUnit: 1,
  selectedStartUnit: 1,
};

function userDocRef(uid) {
  return doc(firebaseDb, COLLECTIONS.USERS, uid);
}

function languageProgressRef(uid, languageId) {
  return doc(firebaseDb, COLLECTIONS.USERS, uid, 'progress', languageId);
}

function userSessionsRef(uid) {
  return collection(firebaseDb, COLLECTIONS.USERS, uid, 'sessions');
}

export function createDefaultLanguageProgress(languageId, overrides = {}) {
  return {
    languageId,
    currentUnit: 1,
    currentLesson: null,
    completedLessons: [],
    openedChests: [],
    mistakes: [],
    unlockedUnits: [1],
    freeUnitCap: 4,
    lastPlayedAt: null,
    ...overrides,
  };
}

export async function createUserDocument(uid, { username, email }) {
  const payload = {
    username,
    email,
    xp: DEFAULT_USER_PROFILE.xp,
    streak: DEFAULT_USER_PROFILE.streak,
    hearts: DEFAULT_USER_PROFILE.hearts,
    nextHeartAt: DEFAULT_USER_PROFILE.nextHeartAt,
    gems: DEFAULT_USER_PROFILE.gems,
    completed: DEFAULT_USER_PROFILE.completed,
    purchasedItems: DEFAULT_USER_PROFILE.purchasedItems,
    currentCourse: DEFAULT_USER_PROFILE.currentCourse,
    currentLesson: DEFAULT_USER_PROFILE.currentLesson,
    onboardingCompleted: DEFAULT_USER_PROFILE.onboardingCompleted,
    baseLanguage: DEFAULT_USER_PROFILE.baseLanguage,
    baseLanguageLevels: DEFAULT_USER_PROFILE.baseLanguageLevels,
    recommendedStartUnit: DEFAULT_USER_PROFILE.recommendedStartUnit,
    selectedStartUnit: DEFAULT_USER_PROFILE.selectedStartUnit,
    joinedAt: serverTimestamp(),
  };

  await setDoc(userDocRef(uid), payload);
  return payload;
}

export async function getLanguageProgress(uid, languageId) {
  const snapshot = await getDoc(languageProgressRef(uid, languageId));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function ensureLanguageProgress(uid, languageId, overrides = {}) {
  const existing = await getLanguageProgress(uid, languageId);

  if (existing) {
    return existing;
  }

  const payload = {
    ...createDefaultLanguageProgress(languageId, overrides),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(languageProgressRef(uid, languageId), payload);
  return payload;
}

export async function updateLanguageProgress(uid, languageId, fields) {
  const allowed = [
    'currentUnit',
    'currentLesson',
    'completedLessons',
    'openedChests',
    'mistakes',
    'unlockedUnits',
    'freeUnitCap',
    'lastPlayedAt',
  ];
  const payload = Object.fromEntries(
    Object.entries(fields).filter(([key]) => allowed.includes(key))
  );

  if (Object.keys(payload).length === 0) {
    return;
  }

  await setDoc(
    languageProgressRef(uid, languageId),
    {
      languageId,
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function createLessonSession(uid, session) {
  const payload = {
    languageId: session.languageId,
    lessonId: session.lessonId,
    lessonTitle: session.lessonTitle || null,
    unitId: session.unitId || null,
    unitTitle: session.unitTitle || null,
    startedAt: session.startedAt || null,
    completedAt: session.completedAt || Date.now(),
    durationMs: session.durationMs || 0,
    totalQuestions: session.totalQuestions || 0,
    correctCount: session.correctCount || 0,
    mistakeCount: session.mistakeCount || 0,
    xpEarned: session.xpEarned || 0,
    gemsEarned: session.gemsEarned || 0,
    wasFirstCompletion: Boolean(session.wasFirstCompletion),
    nextLessonId: session.nextLessonId || null,
    attempts: Array.isArray(session.attempts) ? session.attempts.slice(-30) : [],
    teachingItems: Array.isArray(session.teachingItems) ? session.teachingItems.slice(0, 8) : [],
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(userSessionsRef(uid), payload);
  return { id: ref.id, ...payload };
}

export async function getUserDocument(uid) {
  const snapshot = await getDoc(userDocRef(uid));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function updateUserDocument(uid, fields) {
  await updateDoc(userDocRef(uid), fields);
}

export async function updateUserProgress(uid, fields) {
  const allowed = [
    'xp',
    'streak',
    'hearts',
    'nextHeartAt',
    'gems',
    'completed',
    'purchasedItems',
    'currentCourse',
    'currentLesson',
    'onboardingCompleted',
    'baseLanguage',
    'baseLanguageLevels',
    'recommendedStartUnit',
    'selectedStartUnit',
  ];
  const payload = Object.fromEntries(
    Object.entries(fields).filter(([key]) => allowed.includes(key))
  );

  if (Object.keys(payload).length === 0) {
    return;
  }

  await updateDoc(userDocRef(uid), payload);
}
