const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const imageRoot = path.join(projectRoot, 'assets', 'images', 'vocab');
const outputPath = path.join(projectRoot, 'src', 'data', 'generatedImageRegistry.js');
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

function toRegistryKey(filePath) {
  return path.relative(imageRoot, filePath).replace(/\\/g, '/');
}

function main() {
  const files = walk(imageRoot).sort((left, right) => left.localeCompare(right));
  const entries = files.map((filePath) => {
    const key = toRegistryKey(filePath);
    const requirePath = `../../assets/images/vocab/${key}`;
    return `  ${JSON.stringify(key)}: require(${JSON.stringify(requirePath)}),`;
  });

  const output = `// Generated from assets/images/vocab. Do not edit by hand.\n\nconst vocabImageSources = {\n${entries.join('\n')}\n};\n\nexport const vocabImageKeys = Object.freeze(Object.keys(vocabImageSources));\n\nfunction cleanImageName(value) {\n  return String(value ?? '').trim().split(/[\\\\/]/).pop();\n}\n\nfunction resolveVocabImageKey(imageKey, category) {\n  const filename = cleanImageName(imageKey);\n  if (!filename) return null;\n\n  const categoryKey = String(category ?? '').trim().toLowerCase();\n  if (categoryKey) {\n    const exactKey = \`\${categoryKey}/\${filename}\`;\n    if (vocabImageSources[exactKey]) return exactKey;\n  }\n\n  const filenameSuffix = \`/\${filename}\`;\n  const matches = vocabImageKeys.filter((key) => key === filename || key.endsWith(filenameSuffix));\n\n  return matches.length === 1 ? matches[0] : null;\n}\n\nexport function hasVocabImageSource(imageKey, category) {\n  return Boolean(resolveVocabImageKey(imageKey, category));\n}\n\nexport function getVocabImageSource(imageKey, category) {\n  const key = resolveVocabImageKey(imageKey, category);\n  return key ? vocabImageSources[key] : null;\n}\n`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`Generated image registry with ${files.length} vocab image asset(s).`);
}

main();
