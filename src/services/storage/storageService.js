import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { firebaseStorage } from '../../firebase/app';

export async function uploadFile(storagePath, fileUri, metadata = {}) {
  const storageRef = ref(firebaseStorage, storagePath);
  const response = await fetch(fileUri);
  const blob = await response.blob();

  await uploadBytes(storageRef, blob, metadata);
  return getDownloadURL(storageRef);
}

export async function getFileDownloadUrl(storagePath) {
  const storageRef = ref(firebaseStorage, storagePath);
  return getDownloadURL(storageRef);
}

export async function deleteFile(storagePath) {
  const storageRef = ref(firebaseStorage, storagePath);
  await deleteObject(storageRef);
}

export function buildUserAvatarPath(uid, filename = 'avatar.jpg') {
  return `avatars/${uid}/${filename}`;
}
