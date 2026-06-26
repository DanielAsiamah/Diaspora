import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = process.cwd();
const projectRoot = path.resolve(outputDir, "../..");
const inputPath = path.join(projectRoot, "patois_learn_database_1.xlsx");
const outputPath = path.join(outputDir, "patois_learn_database_mvp.xlsx");
const normalise = (value) => String(value ?? "").trim().replace(/\s+/g, " ");
const keyPart = (value) => normalise(value).toLocaleLowerCase("en");

const source = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sourceValues = (sheetName) => source.worksheets.getItem(sheetName).getUsedRange().values;
const languageValues = sourceValues("languages");
const unitValues = sourceValues("units");
const vocabularyValues = sourceValues("vocabulary");
const originalLessonCount = Math.max(0, sourceValues("lessons").length - 1);

const unitHeaders = unitValues[0].map(keyPart);
const vocabularyHeaders = vocabularyValues[0].map(keyPart);
const unitRows = unitValues.slice(1).map((values) =>
  Object.fromEntries(unitHeaders.map((header, index) => [header, values[index]])),
);
const vocabularyRows = vocabularyValues.slice(1).map((values) =>
  Object.fromEntries(vocabularyHeaders.map((header, index) => [header, values[index]])),
);
const unitByTitle = new Map(unitRows.map((row) => [keyPart(row.title), row]));

const seen = new Set();
const lessonCounters = new Map();
const cleanedRows = [];
for (const row of vocabularyRows) {
  const languageId = keyPart(row.language_id);
  const english = normalise(row.english);
  const native = normalise(row.native);
  const category = keyPart(row.category) || "essentials";
  if (!languageId || !english || !native) continue;

  const uniqueKey = [languageId, keyPart(english), keyPart(native)].join("|");
  if (seen.has(uniqueKey)) continue;
  seen.add(uniqueKey);

  const counterKey = `${languageId}|${category}`;
  const lessonNumber = (lessonCounters.get(counterKey) ?? 0) + 1;
  lessonCounters.set(counterKey, lessonNumber);
  cleanedRows.push([
    languageId,
    Number(unitByTitle.get(category)?.unit_number ?? 0),
    lessonNumber,
    "tap_reveal",
    native,
    english,
    normalise(row.pronunciation),
    category,
    normalise(row.audio_name),
  ]);
}

const lessonValues = [[
  "language_id", "unit", "lesson", "exercise_type", "prompt", "answer",
  "pronunciation", "category", "audio_name",
], ...cleanedRows];

const workbook = Workbook.create();
const definitions = [
  { name: "languages", values: languageValues, color: "#22C55E", widths: [16, 24, 20, 18, 10, 12] },
  { name: "units", values: unitValues, color: "#008C87", widths: [14, 24, 42, 10] },
  { name: "lessons", values: lessonValues, color: "#7030A0", widths: [16, 10, 10, 18, 28, 28, 28, 18, 20] },
  { name: "vocabulary", values: vocabularyValues, color: "#F5A623", widths: [16, 24, 28, 30, 18, 24, 22] },
];

for (const definition of definitions) {
  const sheet = workbook.worksheets.add(definition.name);
  const rowCount = definition.values.length;
  const columnCount = definition.values[0].length;
  const range = sheet.getRangeByIndexes(0, 0, rowCount, columnCount);
  range.values = definition.values;
  const lastColumn = String.fromCharCode(64 + columnCount);
  const table = sheet.tables.add(`A1:${lastColumn}${rowCount}`, true, `${definition.name}Table`);
  table.showBandedRows = true;
  sheet.freezePanes.freezeRows(1);
  sheet.showGridLines = false;
  sheet.getRange(`A1:${lastColumn}1`).format = {
    fill: definition.color,
    font: { bold: true, color: definition.name === "vocabulary" ? "#3B2A11" : "#FFFFFF" },
    horizontalAlignment: "center",
  };
  definition.widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, rowCount, 1).format.columnWidth = width;
  });
}

await fs.mkdir(outputDir, { recursive: true });
const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(outputPath);

for (const sheet of workbook.worksheets.items) {
  const preview = await workbook.render({ sheetName: sheet.name, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(
    path.join(outputDir, `${sheet.name.replace(/[^a-z0-9_-]+/gi, "_")}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const verification = await workbook.inspect({
  kind: "region",
  sheetId: "lessons",
  range: `A1:I${lessonValues.length}`,
  maxChars: 6000,
  tableMaxRows: 12,
  tableMaxCols: 9,
});
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
await fs.writeFile(path.join(outputDir, "verification.ndjson"), `${verification.ndjson}\n${errors.ndjson}`, "utf8");
console.log(`Replaced ${originalLessonCount} generic lesson templates with ${cleanedRows.length} unique tap-to-reveal lessons.`);
console.log(verification.ndjson);
console.log(errors.ndjson);
