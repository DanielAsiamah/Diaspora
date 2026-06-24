import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { firebaseAuth } from '../../firebase/app';

export function subscribeToAuthState(listener) {
  return onAuthStateChanged(firebaseAuth, listener);
}

export async function signUpWithEmail(email, password) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  return credential.user;
}

export async function signInWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return credential.user;
}

export async function signOutUser() {
  await signOut(firebaseAuth);
}

export function getCurrentUser() {
  return firebaseAuth.currentUser;
}
