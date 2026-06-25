const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const projectRoot = path.resolve(__dirname, '..');
const defaultWorkbook = path.join(projectRoot, 'patois_learn_database_1.xlsx');
const defaultJson = path.join(projectRoot, 'src', 'data', 'json', 'vocabulary.json');
const defaultConfig = path.join(projectRoot, 'config', 'elevenlabs-voices.json');
const outputRoot = path.join(projectRoot, 'assets', 'audio');
const registryOutputPath = path.join(projectRoot, 'src', 'data', 'generatedAudioRegistry.js');

function normalise(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function keyPart(value) {
  return normalise(value).toLocaleLowerCase('en');
}

function fileSlug(value) {
  return keyPart(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'phrase';
}

function loadLocalEnv() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    const name = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

function parseArgs(argv) {
  const options = {
    source: 'excel',
    dryRun: false,
    force: false,
    language: null,
    limit: null,
    concurrency: null,
    configPath: defaultConfig,
    registryOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--force') options.force = true;
    else if (argument === '--registry-only') options.registryOnly = true;
    else if (argument === '--source') options.source = argv[++index];
    else if (argument === '--language') options.language = keyPart(argv[++index]);
    else if (argument === '--limit') options.limit = Number(argv[++index]);
    else if (argument === '--concurrency') options.concurrency = Number(argv[++index]);
    else if (argument === '--config') options.configPath = path.resolve(projectRoot, argv[++index]);
    else if (argument === '--help') options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }

  if (!['excel', 'json'].includes(options.source)) {
    throw new Error('--source must be "excel" or "json".');
  }
  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit < 1)) {
    throw new Error('--limit must be a positive integer.');
  }
  if (options.concurrency !== null && (!Number.isInteger(options.concurrency) || options.concurrency < 1)) {
    throw new Error('--concurrency must be a positive integer.');
  }
  return options;
}

function printHelp() {
  console.log(`Generate ElevenLabs lesson audio from workbook or JSON content.

Usage:
  node scripts/generate-audio.js [options]

Options:
  --dry-run              Show planned files without calling ElevenLabs
  --source excel|json    Content source (default: excel)
  --language patois      Generate one language only
  --limit 10             Process at most 10 phrases
  --concurrency 2        Number of simultaneous API calls
  --force                Regenerate MP3 files that already exist
  --registry-only        Rebuild the Expo static audio registry without API calls
  --config path          Voice configuration path
  --help                 Show this message`);
}

function collectAudioFiles() {
  if (!fs.existsSync(outputRoot)) return [];

  return fs.readdirSync(outputRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((languageEntry) => {
      const languageId = keyPart(languageEntry.name);
      const languagePath = path.join(outputRoot, languageEntry.name);
      return fs.readdirSync(languagePath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.mp3')
        .map((entry) => ({ languageId, filename: entry.name }));
    })
    .sort((left, right) =>
      left.languageId.localeCompare(right.languageId) || left.filename.localeCompare(right.filename)
    );
}

function writeAudioRegistry() {
  const files = collectAudioFiles();
  const entries = files.map(({ languageId, filename }) => {
    const key = `${languageId}/${filename}`;
    const assetPath = `../../assets/audio/${languageId}/${filename}`;
    return `  ${JSON.stringify(key)}: require(${JSON.stringify(assetPath)}),`;
  });
  const output = `// Generated from assets/audio. Do not edit by hand.\n\nconst lessonAudioSources = {\n${entries.join('\n')}\n};\n\nexport function getLessonAudioSource(languageId, audioName) {\n  const language = String(languageId ?? '').trim().toLowerCase();\n  const filename = String(audioName ?? '').trim().split(/[\\\\/]/).pop();\n  if (!filename) return null;\n\n  const exactSource = lessonAudioSources[\`\${language}/\${filename}\`];\n  if (exactSource) return exactSource;\n\n  const filenameSuffix = \`/\${filename}\`;\n  const matches = Object.entries(lessonAudioSources)\n    .filter(([key]) => key.endsWith(filenameSuffix));\n  return matches.length === 1 ? matches[0][1] : null;\n}\n`;
  fs.mkdirSync(path.dirname(registryOutputPath), { recursive: true });
  fs.writeFileSync(registryOutputPath, output, 'utf8');
  return files.length;
}

function loadRows(source) {
  if (source === 'json') {
    if (!fs.existsSync(defaultJson)) throw new Error(`JSON source not found: ${defaultJson}`);
    return { sourcePath: defaultJson, rows: JSON.parse(fs.readFileSync(defaultJson, 'utf8')) };
  }

  if (!fs.existsSync(defaultWorkbook)) throw new Error(`Workbook not found: ${defaultWorkbook}`);
  const workbook = xlsx.readFile(defaultWorkbook);
  const sheet = workbook.Sheets.vocabulary;
  if (!sheet) throw new Error('Workbook is missing the "vocabulary" sheet.');
  return {
    sourcePath: defaultWorkbook,
    rows: xlsx.utils.sheet_to_json(sheet, { defval: '' }),
  };
}

function createTasks(rows, options, config) {
  const tasks = [];
  const seenPhrases = new Set();
  const claimedPaths = new Map();

  for (const row of rows) {
    const languageId = keyPart(row.language_id ?? row.languageId);
    const phrase = normalise(row.native ?? row.prompt ?? row.phrase);
    if (!languageId || !phrase || (options.language && languageId !== options.language)) continue;

    const phraseKey = `${languageId}|${keyPart(phrase)}`;
    if (seenPhrases.has(phraseKey)) continue;
    seenPhrases.add(phraseKey);

    const configuredName = normalise(row.audio_name ?? row.audioName);
    const safeConfiguredName = configuredName ? path.basename(configuredName, path.extname(configuredName)) : '';
    const filename = `${fileSlug(safeConfiguredName || phrase)}.mp3`;
    const relativePath = path.posix.join(languageId, filename);
    const existingPhrase = claimedPaths.get(relativePath);
    if (existingPhrase && keyPart(existingPhrase) !== keyPart(phrase)) {
      throw new Error(`Audio filename collision: ${relativePath} is used by "${existingPhrase}" and "${phrase}".`);
    }
    claimedPaths.set(relativePath, phrase);

    const languageConfig = config.languages?.[languageId] ?? {};
    const voiceId = languageConfig.voiceId
      || process.env[languageConfig.voiceIdEnv]
      || process.env.ELEVENLABS_DEFAULT_VOICE_ID;

    tasks.push({
      languageId,
      phrase,
      filename,
      relativePath,
      outputPath: path.join(outputRoot, languageId, filename),
      voiceId,
      voiceIdEnv: languageConfig.voiceIdEnv,
      modelId: languageConfig.modelId || config.defaults?.modelId || 'eleven_multilingual_v2',
      outputFormat: languageConfig.outputFormat || config.defaults?.outputFormat || 'mp3_44100_128',
      voiceSettings: languageConfig.voiceSettings || config.defaults?.voiceSettings,
    });
  }

  return options.limit ? tasks.slice(0, options.limit) : tasks;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function requestAudio(task, apiKey) {
  const endpoint = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(task.voiceId)}`);
  endpoint.searchParams.set('output_format', task.outputFormat);
  const requestBody = { text: task.phrase, model_id: task.modelId };
  if (task.voiceSettings) requestBody.voice_settings = task.voiceSettings;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) return Buffer.from(await response.arrayBuffer());

    const details = (await response.text()).slice(0, 500);
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 4) {
      throw new Error(`ElevenLabs ${response.status} for ${task.relativePath}: ${details}`);
    }

    const retryAfter = Number(response.headers.get('retry-after'));
    await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : attempt * 1500);
  }
  throw new Error(`Audio request failed for ${task.relativePath}.`);
}

async function runPool(tasks, concurrency, worker) {
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (nextIndex < tasks.length) {
      const task = tasks[nextIndex];
      nextIndex += 1;
      await worker(task);
    }
  });
  await Promise.all(runners);
}

async function main() {
  loadLocalEnv();
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return printHelp();
  if (options.registryOnly) {
    const fileCount = writeAudioRegistry();
    console.log(`Audio registry updated with ${fileCount} local MP3 file(s).`);
    return;
  }
  if (!fs.existsSync(options.configPath)) throw new Error(`Voice config not found: ${options.configPath}`);

  const config = JSON.parse(fs.readFileSync(options.configPath, 'utf8'));
  const { sourcePath, rows } = loadRows(options.source);
  const tasks = createTasks(rows, options, config);
  if (!tasks.length) throw new Error('No phrases matched the selected source and language.');

  const missingVoices = [...new Set(tasks.filter((task) => !task.voiceId).map(
    (task) => `${task.languageId} (${task.voiceIdEnv || 'ELEVENLABS_DEFAULT_VOICE_ID'})`
  ))];

  console.log(`Source: ${path.relative(projectRoot, sourcePath)}`);
  console.log(`Planned: ${tasks.length} unique phrase(s) across ${new Set(tasks.map((task) => task.languageId)).size} language(s)`);
  if (missingVoices.length) console.log(`Voice IDs still needed: ${missingVoices.join(', ')}`);

  if (options.dryRun) {
    tasks.forEach((task) => console.log(`[dry-run] ${task.phrase} -> assets/audio/${task.relativePath}`));
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is missing. Add it to .env; never use an EXPO_PUBLIC_ variable.');
  if (missingVoices.length) throw new Error(`Missing ElevenLabs voice IDs: ${missingVoices.join(', ')}`);

  const manifestItems = [];
  let generated = 0;
  let skipped = 0;
  const concurrency = options.concurrency || config.defaults?.concurrency || 2;

  await runPool(tasks, concurrency, async (task) => {
    fs.mkdirSync(path.dirname(task.outputPath), { recursive: true });
    if (!options.force && fs.existsSync(task.outputPath)) {
      skipped += 1;
      console.log(`[skip] assets/audio/${task.relativePath}`);
    } else {
      const audio = await requestAudio(task, apiKey);
      const temporaryPath = `${task.outputPath}.tmp`;
      fs.writeFileSync(temporaryPath, audio);
      fs.renameSync(temporaryPath, task.outputPath);
      generated += 1;
      console.log(`[generated] assets/audio/${task.relativePath}`);
    }
    manifestItems.push({ languageId: task.languageId, phrase: task.phrase, file: task.relativePath });
  });

  manifestItems.sort((left, right) => left.languageId.localeCompare(right.languageId) || left.phrase.localeCompare(right.phrase));
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(path.join(outputRoot, 'manifest.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: path.relative(projectRoot, sourcePath).replace(/\\/g, '/'),
    files: manifestItems,
  }, null, 2));
  writeAudioRegistry();
  console.log(`Complete: ${generated} generated, ${skipped} already existed.`);
}

main().catch((error) => {
  console.error(`Audio generation failed: ${error.message}`);
  process.exitCode = 1;
});
