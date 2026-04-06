import * as SQLite from 'expo-sqlite';
import { ARTWORKS_SEED } from '../data/artworksSeed';

const DATABASE_NAME = 'artworks.db';
const INSTALL_DATE_KEY = 'install_start_date';
let databasePromise;
let initializationPromise;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
}

async function seedDatabase(db) {
  await db.withTransactionAsync(async () => {
    for (const artwork of ARTWORKS_SEED) {
      await db.runAsync(
        `INSERT OR REPLACE INTO artworks (id, dateLabel, title, medium, artist, year, image, essay, day)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        artwork.id,
        artwork.dateLabel,
        artwork.title,
        artwork.medium,
        artwork.artist,
        artwork.year,
        artwork.image,
        artwork.essay,
        artwork.day ?? 0
      );
    }
  });
}

export async function initializeLocalDatabase() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const db = await getDatabase();

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS artworks (
          id TEXT PRIMARY KEY NOT NULL,
          dateLabel TEXT NOT NULL,
          title TEXT NOT NULL,
          medium TEXT NOT NULL,
          artist TEXT NOT NULL,
          year TEXT NOT NULL,
          image TEXT NOT NULL,
          essay TEXT NOT NULL,
          day INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);

      await db.execAsync(`
        ALTER TABLE artworks ADD COLUMN day INTEGER NOT NULL DEFAULT 0;
      `).catch(() => {});

      const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM artworks');
      const rowCount = Number(result?.count ?? 0);

      if (rowCount === 0) {
        await seedDatabase(db);
      }

      return db;
    })();
  }

  return initializationPromise;
}

export async function getLocalArtworks() {
  const db = await initializeLocalDatabase();

  return db.getAllAsync(`
    SELECT id, dateLabel, title, medium, artist, year, image, essay, day
    FROM artworks
    ORDER BY day ASC, dateLabel ASC
  `);
}

export async function getInstallStartDate() {
  const db = await initializeLocalDatabase();
  const existingRow = await db.getFirstAsync(
    'SELECT value FROM app_meta WHERE key = ?',
    INSTALL_DATE_KEY
  );

  if (existingRow?.value) {
    return existingRow.value;
  }

  const today = new Date().toISOString().slice(0, 10);
  await db.runAsync(
    'INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)',
    INSTALL_DATE_KEY,
    today
  );

  return today;
}
