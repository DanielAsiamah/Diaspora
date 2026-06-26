const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const coursesPath = path.join(projectRoot, 'src', 'data', 'generatedCourses.js');
const imageRoot = path.join(projectRoot, 'assets', 'images', 'vocab');
const supportedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!supportedExtensions.has(path.extname(entry.name).toLowerCase())) return [];
    return [fullPath];
  });
}

function normaliseCategory(value) {
  return String(value || '').trim().toLowerCase();
}

function collectLessonImageRefs() {
  const source = fs.readFileSync(coursesPath, 'utf8');
  const refs = [];
  const lessonBlocks = source.match(/\{[\s\S]*?"imageKey":\s*"[^"]+"[\s\S]*?\}/g) || [];

  for (const block of lessonBlocks) {
    const imageKey = block.match(/"imageKey":\s*"([^"]+)"/)?.[1];
    const category = block.match(/"category":\s*"([^"]+)"/)?.[1] || '';
    const phrase = block.match(/"phrase":\s*"([^"]+)"/)?.[1] || '';
    const courseMatch = block.match(/"id":\s*"([^"]+)"/)?.[1] || '';
    if (imageKey) refs.push({ imageKey, category: normaliseCategory(category), phrase, id: courseMatch });
  }

  return refs;
}

function main() {
  const files = walk(imageRoot);
  const imageKeys = new Set(files.map((filePath) => path.relative(imageRoot, filePath).replace(/\\/g, '/')));
  const refs = collectLessonImageRefs();
  const covered = [];
  const missing = [];

  for (const ref of refs) {
    const exactKey = ref.category ? `${ref.category}/${ref.imageKey}` : ref.imageKey;
    if (imageKeys.has(exactKey)) {
      covered.push(ref);
    } else {
      missing.push(ref);
    }
  }

  const uniqueMissing = [...new Map(missing.map((item) => [`${item.category}/${item.imageKey}`, item])).values()];

  console.log('Vocab image audit');
  console.log('=================');
  console.log(`Image assets found: ${files.length}`);
  console.log(`Lesson image refs covered: ${covered.length}/${refs.length}`);

  if (uniqueMissing.length) {
    console.log('\nMissing curated images:');
    uniqueMissing.slice(0, 40).forEach((item) => {
      const categoryPrefix = item.category ? `${item.category}/` : '';
      console.log(`- ${categoryPrefix}${item.imageKey}${item.phrase ? ` (${item.phrase})` : ''}`);
    });
    if (uniqueMissing.length > 40) {
      console.log(`...and ${uniqueMissing.length - 40} more.`);
    }
  } else {
    console.log('\nAll lesson image refs are covered.');
  }

  console.log('\nRule: image-choice steps should only use assets that exist in assets/images/vocab/{category}/.');
}

main();
