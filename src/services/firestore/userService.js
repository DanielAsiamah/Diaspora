import {
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
  currentCourse: null,
  currentLesson: null,
};

function userDocRef(uid) {
  return doc(firebaseDb, COLLECTIONS.USERS, uid);
}

export async function createUserDocument(uid, { username, email }) {
  const payload = {
    username,
    email,
    xp: DEFAULT_USER_PROFILE.xp,
    streak: DEFAULT_USER_PROFILE.streak,
    hearts: DEFAULT_USER_PROFILE.hearts,
    currentCourse: DEFAULT_USER_PROFILE.currentCourse,
    currentLesson: DEFAULT_USER_PROFILE.currentLesson,
    joinedAt: serverTimestamp(),
  };

  await setDoc(userDocRef(uid), payload);
  return payload;
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
  const allowed = ['xp', 'streak', 'hearts', 'currentCourse', 'currentLesson'];
  const payload = Object.fromEntries(
    Object.entries(fields).filter(([key]) => allowed.includes(key))
  );

  if (Object.keys(payload).length === 0) {
    return;
  }

  await updateDoc(userDocRef(uid), payload);
}
