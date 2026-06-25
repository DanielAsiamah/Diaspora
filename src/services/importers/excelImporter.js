const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = 'patois_learn_database_1.xlsx';
const OUTPUT_DIR = path.join(__dirname, '../../data/json');

function ensureDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function writeJson(filename, data) {
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Exported: ${filename}`);
}

function importContent() {
  console.log('🚀 Starting content import from Excel...');
  
  try {
    const workbook = xlsx.readFile(EXCEL_FILE);
    
    // 1. Languages
    const languagesSheet = xlsx.utils.sheet_to_json(workbook.Sheets['languages']);
    const languages = languagesSheet.map(row => ({
      id: row.language_id,
      name: row.language_name,
      category: row.category,
      baseLanguage: row.speakers_from,
      flag: row.flag,
      difficulty: row.difficulty
    }));

    // 2. Units (Generic framework)
    const unitsSheet = xlsx.utils.sheet_to_json(workbook.Sheets['units']);
    const units = unitsSheet.map((row, index) => ({
      id: `unit-${index + 1}`,
      number: row.unit_number,
      title: row.title,
      objective: row.objective,
      emoji: row.emoji
    }));

    // 3. Vocabulary
    const vocabSheet = xlsx.utils.sheet_to_json(workbook.Sheets['vocabulary']);
    const vocabulary = vocabSheet.map((row, index) => ({
      id: `vocab-${index + 1}`,
      languageId: row.language_id,
      english: row.english,
      native: row.native,
      pronunciation: row.pronunciation,
      category: row.category,
      audioName: row.audio_name,
      imageName: row.image_name
    }));

    // 4. Lessons (with deduplication)
    const lessonsSheet = xlsx.utils.sheet_to_json(workbook.Sheets['lessons']);
    const uniqueLessons = new Map();
    
    lessonsSheet.forEach((row, index) => {
      // Create a unique key to prevent repeating missions
      // Key: language_id | unit | lesson_number | exercise_type
      const uniqueKey = `${row.language_id}_${row.unit}_${row.lesson}_${row.exercise_type}`;
      
      if (!uniqueLessons.has(uniqueKey)) {
        uniqueLessons.set(uniqueKey, {
          id: `lesson-${index + 1}`,
          languageId: row.language_id,
          unit: row.unit,
          lessonNumber: row.lesson,
          type: row.exercise_type,
          description: row.description
        });
      } else {
        console.log(`⚠️ Skipping duplicate mission: ${uniqueKey}`);
      }
    });

    const lessons = Array.from(uniqueLessons.values());

    // Write all to JSON
    ensureDir();
    writeJson('languages.json', languages);
    writeJson('units.json', units);
    writeJson('vocabulary.json', vocabulary);
    writeJson('lessons.json', lessons);

    console.log('\n✨ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importContent();
