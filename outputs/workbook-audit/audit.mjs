import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const projectRoot = path.resolve(process.cwd(), "../..");
const workbookPath = path.join(projectRoot, "patois_learn_database_1.xlsx");
const outputDir = process.cwd();

const input = await FileBlob.load(workbookPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const overview = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 8,
  tableMaxCols: 16,
  tableMaxCellChars: 120,
});

await fs.writeFile(path.join(outputDir, "overview.ndjson"), overview.ndjson, "utf8");
console.log(overview.ndjson);

for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange();
  const region = await workbook.inspect({
    kind: "region",
    sheetId: sheet.name,
    range: used?.address ?? "A1:Z50",
    maxChars: 20000,
    tableMaxRows: 100,
    tableMaxCols: 30,
    tableMaxCellChars: 240,
  });
  await fs.writeFile(
    path.join(outputDir, `${sheet.name.replace(/[^a-z0-9_-]+/gi, "_")}.ndjson`),
    region.ndjson,
    "utf8",
  );

  const preview = await workbook.render({
    sheetName: sheet.name,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(
    path.join(outputDir, `${sheet.name.replace(/[^a-z0-9_-]+/gi, "_")}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}
