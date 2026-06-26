#!/usr/bin/env node

/**
 * Upload generated curriculum content into Firestore.
 *
 * Default mode is dry-run. Real writes require:
 *   npm run content:upload-firestore -- --language=patois --write
 *
 * Requires a Firebase Admin service account JSON at:
 *   serviceAccountKey.json
 *
 * That file must stay local and must never be committed.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_SEED_PATH = path.join(PROJECT_ROOT, 'outputs', 'firestore-content-seed.json');
const DEFAULT_SERVICE_ACCOUNT_PATH = path.join(PROJECT_ROOT, 'serviceAccountKey.json');
const BATCH_LIMIT = 450;

function parseArgs(argv) {
  const options = {
    seedPath: DEFAULT_SEED_PATH,
    serviceAccountPath: DEFAULT_SERVICE_ACCOUNT_PATH,
    languageId: null,
    write: false,
  };

  argv.forEach((arg) => {
    if (arg === '--write') {
      options.write = true;
      return;
    }

    if (arg.startsWith('--language=')) {
      options.languageId = arg.replace('--language=', '').trim();
      return;
    }

    if (arg.startsWith('--seed=')) {
      options.seedPath = path.resolve(PROJECT_ROOT, arg.replace('--seed=', '').trim());
      return;
    }

    if (arg.startsWith('--service-account=')) {
      options.serviceAccountPath = path.resolve(PROJECT_ROOT, arg.replace('--service-account=', '').trim());
      return;
    }

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  });

  return options;
}

function printHelp() {
  console.log(`
Usage:
  npm run content:upload-firestore
  npm run content:upload-firestore -- --language=patois
  npm run content:upload-firestore -- --language=patois --write

Options:
  --write                         Actually write to Firestore. Omit for dry-run.
  --language=<id>                 Upload only one language, e.g. patois.
  --seed=<relative-or-abs-path>   Seed JSON path. Defaults to outputs/firestore-content-seed.json.
  --service-account=<path>        Firebase Admin service account JSON. Defaults to serviceAccountKey.json.
`);
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function withoutNestedCollections(documentData, nestedKeys) {
  const clean = { ...documentData };
  nestedKeys.forEach((key) => {
    delete clean[key];
  });
  return clean;
}

function createUploadPlan(seed, languageFilter) {
  const languages = seed?.collections?.languages;
  if (!languages || typeof languages !== 'object') {
    throw new Error('Invalid seed: expected collections.languages object.');
  }

  const writes = [];
  const summary = {
    languages: 0,
    units: 0,
    lessons: 0,
    stepArrays: 0,
  };

  Object.entries(languages).forEach(([languageId, language]) => {
    if (languageFilter && languageId !== languageFilter) return;

    const units = language.units || {};
    writes.push({
      path: `languages/${languageId}`,
      data: withoutNestedCollections(language, ['units']),
    });
    summary.languages += 1;

    Object.entries(units).forEach(([unitId, unit]) => {
      const lessons = unit.lessons || {};
      writes.push({
        path: `languages/${languageId}/units/${unitId}`,
        data: withoutNestedCollections(unit, ['lessons']),
      });
      summary.units += 1;

      Object.entries(lessons).forEach(([lessonId, lesson]) => {
        writes.push({
          path: `languages/${languageId}/units/${unitId}/lessons/${lessonId}`,
          data: lesson,
        });
        summary.lessons += 1;
        if (Array.isArray(lesson.steps)) summary.stepArrays += 1;
      });
    });
  });

  if (languageFilter && summary.languages === 0) {
    throw new Error(`Language "${languageFilter}" was not found in the seed file.`);
  }

  return { writes, summary };
}

function printPlan({ writes, summary }, options) {
  console.log(options.write ? 'Firestore upload plan:' : 'Firestore dry-run plan:');
  console.log(`  seed: ${options.seedPath}`);
  console.log(`  mode: ${options.write ? 'WRITE' : 'DRY RUN'}`);
  console.log(`  language: ${options.languageId || 'all'}`);
  console.log(`  languages: ${summary.languages}`);
  console.log(`  units: ${summary.units}`);
  console.log(`  lessons: ${summary.lessons}`);
  console.log(`  lesson step arrays: ${summary.stepArrays}`);
  console.log(`  total document writes: ${writes.length}`);
  console.log('');
  console.log('First planned writes:');
  writes.slice(0, 8).forEach((write) => {
    console.log(`  - ${write.path}`);
  });
  if (writes.length > 8) {
    console.log(`  ... ${writes.length - 8} more`);
  }
}

function loadFirebaseAdmin(serviceAccountPath) {
  let admin;
  let firestoreModule;
  try {
    admin = require('firebase-admin');
    firestoreModule = require('firebase-admin/firestore');
  } catch (error) {
    throw new Error(
      'Missing dependency "firebase-admin". Run: npm install firebase-admin --save-dev'
    );
  }

  const serviceAccount = readJson(serviceAccountPath, 'Firebase service account');
  const apps = typeof admin.getApps === 'function' ? admin.getApps() : admin.apps || [];
  let app = apps[0];

  if (!apps.length) {
    const credential = admin.credential?.cert
      ? admin.credential.cert(serviceAccount)
      : admin.cert(serviceAccount);

    app = admin.initializeApp({
      credential,
    });
  }

  if (typeof firestoreModule?.initializeFirestore === 'function') {
    try {
      return firestoreModule.initializeFirestore(app, { preferRest: true });
    } catch (error) {
      if (!String(error?.message || '').includes('already been called')) {
        throw error;
      }
    }
  }

  if (typeof firestoreModule?.getFirestore === 'function') {
    return firestoreModule.getFirestore(app);
  }

  return admin.firestore();
}

function withTimeout(promise, timeoutMs, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function commitWrites(db, writes) {
  let batch = db.batch();
  let batchCount = 0;
  let committed = 0;

  for (const write of writes) {
    batch.set(db.doc(write.path), write.data, { merge: true });
    batchCount += 1;

    if (batchCount >= BATCH_LIMIT) {
      await withTimeout(batch.commit(), 45000, 'Firestore batch commit');
      committed += batchCount;
      console.log(`Committed ${committed}/${writes.length} documents...`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await withTimeout(batch.commit(), 45000, 'Firestore batch commit');
    committed += batchCount;
  }

  console.log(`Committed ${committed}/${writes.length} documents.`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const seed = readJson(options.seedPath, 'Firestore content seed');
  const plan = createUploadPlan(seed, options.languageId);

  printPlan(plan, options);

  if (!options.write) {
    console.log('');
    console.log('Dry run only. Add --write to upload to Firestore.');
    return;
  }

  if (!fs.existsSync(options.serviceAccountPath)) {
    throw new Error(
      `Service account file missing: ${options.serviceAccountPath}\n` +
      'Download it from Firebase Console > Project settings > Service accounts > Generate new private key.'
    );
  }

  const db = loadFirebaseAdmin(options.serviceAccountPath);
  await commitWrites(db, plan.writes);
}

main().catch((error) => {
  console.error('');
  console.error(`Upload failed: ${error.message}`);
  process.exit(1);
});
