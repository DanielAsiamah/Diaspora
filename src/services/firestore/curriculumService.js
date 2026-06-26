import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';

import { firebaseDb } from '../../firebase/app';
import { COLLECTIONS } from '../../firebase/collections';

function dataWithId(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function sortByOrder(items = []) {
  return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function normaliseLesson(lesson) {
  const steps = Array.isArray(lesson.steps)
    ? sortByOrder(lesson.steps).map((step, index) => ({
      id: step.id || `${lesson.id}-step-${index}`,
      order: step.order ?? index,
      ...step,
    }))
    : undefined;

  return {
    ...lesson,
    ...(steps?.length ? { steps } : {}),
  };
}

async function getOrderedCollection(pathRef) {
  const orderedQuery = query(pathRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(orderedQuery);
  return snapshot.docs.map(dataWithId);
}

export async function getFirestoreCourse(languageId = 'patois') {
  const courseRef = doc(firebaseDb, COLLECTIONS.LANGUAGES, languageId);
  const courseSnapshot = await getDoc(courseRef);

  if (!courseSnapshot.exists()) {
    return null;
  }

  const unitSnapshots = await getOrderedCollection(collection(courseRef, 'units'));
  const units = await Promise.all(unitSnapshots.map(async (unit) => {
    const lessonsRef = collection(courseRef, 'units', unit.id, 'lessons');
    const lessons = await getOrderedCollection(lessonsRef);

    return {
      ...unit,
      lessons: lessons.map(normaliseLesson),
    };
  }));

  return {
    id: courseSnapshot.id,
    ...courseSnapshot.data(),
    units,
  };
}
