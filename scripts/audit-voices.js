const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const voiceConfigPath = path.join(projectRoot, 'config', 'elevenlabs-voices.json');
const strictMode = process.argv.includes('--strict');

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .reduce((env, line) => {
      const [name, ...rest] = line.split('=');
      env[name.trim()] = rest.join('=').trim();
      return env;
    }, {});
}

function mask(value = '') {
  if (!value) return 'missing';
  if (value.length <= 8) return 'set';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function main() {
  if (!fs.existsSync(voiceConfigPath)) {
    throw new Error(`Voice config not found: ${voiceConfigPath}`);
  }

  const env = { ...readEnv(envPath), ...process.env };
  const config = JSON.parse(fs.readFileSync(voiceConfigPath, 'utf8'));
  const languages = Object.entries(config.languages || {});
  const voiceGroups = new Map();
  const missing = [];

  for (const [languageId, languageConfig] of languages) {
    const envName = languageConfig.voiceIdEnv;
    const voiceId = env[envName];

    if (!voiceId) {
      missing.push({ languageId, envName });
      continue;
    }

    const group = voiceGroups.get(voiceId) || [];
    group.push({ languageId, envName });
    voiceGroups.set(voiceId, group);
  }

  console.log('ElevenLabs voice audit');
  console.log('======================');

  if (missing.length) {
    console.log('\nMissing voice IDs:');
    for (const item of missing) {
      console.log(`- ${item.languageId}: ${item.envName}`);
    }
  }

  const duplicates = [...voiceGroups.entries()].filter(([, group]) => group.length > 1);
  if (duplicates.length) {
    console.log('\nShared voice IDs detected:');
    for (const [voiceId, group] of duplicates) {
      console.log(`- ${mask(voiceId)} -> ${group.map((item) => item.languageId).join(', ')}`);
    }
    console.log('\nRecommendation: replace temporary placeholder voices before generating more language audio.');
  } else {
    console.log('\nNo shared voice IDs detected.');
  }

  console.log('\nConfigured voices:');
  for (const [voiceId, group] of voiceGroups.entries()) {
    console.log(`- ${mask(voiceId)}: ${group.map((item) => item.languageId).join(', ')}`);
  }

  if (strictMode && (missing.length || duplicates.length)) process.exitCode = 1;
}

main();
