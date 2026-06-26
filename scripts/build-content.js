const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const projectRoot = path.resolve(__dirname, '..');
const workbookPath = path.join(projectRoot, 'patois_learn_database_1.xlsx');
const outputPath = path.join(projectRoot, 'src', 'data', 'generatedCourses.js');

const normalise = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');
const keyPart = (value) => normalise(value).toLocaleLowerCase('en');
const slug = (value) =>
  keyPart(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item';

const titleCase = (value) =>
  normalise(value).replace(/\b\w/g, (character) => character.toUpperCase());

const workbook = xlsx.readFile(workbookPath);
const rows = (sheetName) =>
  xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

const languages = rows('languages');
const units = rows('units');
const vocabulary = rows('vocabulary');

const unitByTitle = new Map(units.map((unit) => [keyPart(unit.title), unit]));
const seen = new Set();
const uniqueVocabulary = [];

for (const row of vocabulary) {
  const languageId = keyPart(row.language_id);
  const english = normalise(row.english);
  const native = normalise(row.native);
  if (!languageId || !english || !native) continue;

  const uniqueKey = [languageId, keyPart(english), keyPart(native)].join('|');
  if (seen.has(uniqueKey)) continue;
  seen.add(uniqueKey);
  uniqueVocabulary.push({ ...row, language_id: languageId, english, native });
}

const palette = ['#009B3A', '#D4782C', '#7B61A8', '#237A4B', '#B9523F', '#28766F'];
const coursesData = {};

languages.forEach((language, languageIndex) => {
  const languageId = keyPart(language.language_id);
  const languageWords = uniqueVocabulary.filter((word) => word.language_id === languageId);
  const categories = [...new Set(languageWords.map((word) => keyPart(word.category) || 'essentials'))]
    .sort((left, right) => {
      const leftUnit = Number(unitByTitle.get(left)?.unit_number ?? 999);
      const rightUnit = Number(unitByTitle.get(right)?.unit_number ?? 999);
      return leftUnit - rightUnit || left.localeCompare(right);
    });

  coursesData[languageId] = {
    title: normalise(language.language_name),
    flag: normalise(language.flag),
    themeColor: palette[languageIndex % palette.length],
    accentColor: '#F4B942',
    units: categories.map((category, unitIndex) => {
      const sourceUnit = unitByTitle.get(category);
      const categoryWords = languageWords.filter(
        (word) => (keyPart(word.category) || 'essentials') === category
      );

      return {
        id: `${languageId}-${slug(category)}`,
        order: unitIndex + 1,
        status: 'published',
        title: `SECTION 1, UNIT ${unitIndex + 1}`,
        description: titleCase(category),
        goal: normalise(sourceUnit?.objective) || `Learn essential ${category} words.`,
        themeColor: palette[unitIndex % palette.length],
        lessons: categoryWords.map((word, lessonIndex) => ({
          id: `${languageId}-${slug(category)}-${slug(word.native)}-${lessonIndex + 1}`,
          order: lessonIndex + 1,
          status: 'published',
          version: 1,
          title: titleCase(word.english),
          subtitle: 'Tap the word to reveal its meaning',
          phrase: word.native,
          meaning: word.english,
          category,
          note: normalise(word.pronunciation)
            ? `Pronounced: ${normalise(word.pronunciation)}`
            : 'Pronunciation guide coming soon.',
          type: 'star',
          exerciseType: 'tap_reveal',
          xp: 10,
          audioKey: normalise(word.audio_name) || null,
          imageKey: normalise(word.image_name) || null,
        })),
      };
    }),
  };
});

const generated = `// Generated from patois_learn_database_1.xlsx. Do not edit by hand.\n\nexport const coursesData = ${JSON.stringify(coursesData, null, 2)};\n`;
fs.writeFileSync(outputPath, generated, 'utf8');

console.log(
  `Generated ${uniqueVocabulary.length} unique tap-to-reveal lessons across ${languages.length} languages. ` +
    `Removed ${vocabulary.length - uniqueVocabulary.length} exact duplicate vocabulary rows.`
);
