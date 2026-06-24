import { coursesData } from './lessons';

// The UI reads curriculum through this boundary rather than importing seed
// records directly. A Firestore implementation can replace this data source
// later while preserving the course, unit, lesson, and exercise shapes.
export function getCourseById(courseId) {
  return coursesData[courseId] || coursesData.patois;
}

export function getPublishedUnits(courseId) {
  return getCourseById(courseId).units
    .filter((unit) => unit.status !== 'draft')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
