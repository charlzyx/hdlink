import { Database } from "bun:sqlite";

export const db = new Database("hdlink.sqlite", { create: true });

db.exec(`
  CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      dir BOOLEAN,
      link INTEGER,
      parent TEXT,
      value TEXT
  );
`);
