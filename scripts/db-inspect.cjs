const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "app.sqlite");

const db = new Database(dbPath, {
  readonly: true,
  fileMustExist: true,
});

function redactRow(row) {
  const sensitiveWords = ["password", "hash", "token", "secret", "session"];

  const redacted = {};

  for (const [key, value] of Object.entries(row)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveWords.some((word) => lowerKey.includes(word))) {
      redacted[key] = "[REDACTED]";
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

console.log(`Inspecting database: ${dbPath}`);
console.log("");

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
  .all();

console.log("Tables:");
console.table(tables);

for (const table of tables) {
  const tableName = table.name;

  console.log("");
  console.log(`=== ${tableName} ===`);

  const count = db.prepare(`SELECT COUNT(*) AS count FROM "${tableName}"`).get();
  console.log(`Rows: ${count.count}`);

  const columns = db.prepare(`PRAGMA table_info("${tableName}")`).all();
  console.log("Columns:");
  console.table(columns.map((col) => ({
    name: col.name,
    type: col.type,
    notnull: col.notnull,
    pk: col.pk,
  })));

  const sampleRows = db
    .prepare(`SELECT * FROM "${tableName}" LIMIT 10`)
    .all()
    .map(redactRow);

  if (sampleRows.length > 0) {
    console.log("Sample rows:");
    console.table(sampleRows);
  } else {
    console.log("No rows.");
  }
}

db.close();