import * as SQLite from 'expo-sqlite';
import { ARTWORKS_SEED } from '../data/artworksSeed';

const DATABASE_NAME = 'artworks.db';
const INSTALL_DATE_KEY = 'install_start_date';
const LEGACY_SEED_IDS = new Set(ARTWORKS_SEED.map((artwork) => String(artwork.id)));
let databasePromise;
let initializationPromise;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
}

async function clearLegacySeedDataIfNeeded(db) {
  const rows = await db.getAllAsync(`
    SELECT id
    FROM artworks
  `);

  if (!Array.isArray(rows) || rows.length === 0) {
    return;
  }

  const shouldClearLegacySeedData =
    rows.length === LEGACY_SEED_IDS.size &&
    rows.every((row) => LEGACY_SEED_IDS.has(String(row?.id)));

  if (shouldClearLegacySeedData) {
    await db.runAsync('DELETE FROM artworks');
  }
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

        CREATE TABLE IF NOT EXISTS artwork_reactions (
          artwork_id TEXT PRIMARY KEY NOT NULL,
          reaction TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      await db.execAsync(`
        ALTER TABLE artworks ADD COLUMN day INTEGER NOT NULL DEFAULT 0;
      `).catch(() => {});

      await clearLegacySeedDataIfNeeded(db);

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

export async function getLocalArtworksUpToDay(day) {
  const db = await initializeLocalDatabase();

  return db.getAllAsync(
    `
      SELECT id, dateLabel, title, medium, artist, year, image, essay, day
      FROM artworks
      WHERE day <= ?
      ORDER BY day ASC, dateLabel ASC
    `,
    Number(day ?? 0)
  );
}

export async function hasLocalArtworkForDay(day) {
  const db = await initializeLocalDatabase();
  const result = await db.getFirstAsync(
    `
      SELECT COUNT(*) as count
      FROM artworks
      WHERE day = ?
    `,
    Number(day ?? 0)
  );

  return Number(result?.count ?? 0) > 0;
}

export async function hasLocalArtworksForDayRange(startDay, endDay) {
  const db = await initializeLocalDatabase();
  const normalizedStartDay = Number(startDay ?? 0);
  const normalizedEndDay = Number(endDay ?? 0);

  if (normalizedEndDay < normalizedStartDay) {
    return true;
  }

  const rows = await db.getAllAsync(
    `
      SELECT DISTINCT day
      FROM artworks
      WHERE day >= ? AND day <= ?
    `,
    normalizedStartDay,
    normalizedEndDay
  );

  const availableDays = new Set(
    rows.map((row) => Number(row?.day ?? 0)).filter((day) => Number.isFinite(day))
  );

  for (let day = normalizedStartDay; day <= normalizedEndDay; day += 1) {
    if (!availableDays.has(day)) {
      return false;
    }
  }

  return true;
}

export async function upsertLocalArtworks(artworks) {
  if (!Array.isArray(artworks) || artworks.length === 0) {
    return;
  }

  const db = await initializeLocalDatabase();

  await db.withTransactionAsync(async () => {
    for (const artwork of artworks) {
      await db.runAsync(
        `INSERT OR REPLACE INTO artworks (id, dateLabel, title, medium, artist, year, image, essay, day)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        String(artwork.id),
        artwork.dateLabel ?? 'COMING SOON',
        artwork.title ?? 'Untitled artwork',
        artwork.medium ?? 'Unknown medium',
        artwork.artist ?? 'Unknown artist',
        String(artwork.year ?? ''),
        artwork.image ?? '',
        artwork.essay ?? 'No description available yet.',
        Number(artwork.day ?? 0)
      );
    }
  });
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

export async function getArtworkReactions() {
  const db = await initializeLocalDatabase();
  const rows = await db.getAllAsync(`
    SELECT artwork_id, reaction
    FROM artwork_reactions
  `);

  return rows.reduce((accumulator, row) => {
    if (row?.artwork_id && row?.reaction) {
      accumulator[String(row.artwork_id)] = String(row.reaction);
    }

    return accumulator;
  }, {});
}

export async function setArtworkReaction(artworkId, reaction) {
  const db = await initializeLocalDatabase();

  if (!reaction) {
    await db.runAsync('DELETE FROM artwork_reactions WHERE artwork_id = ?', artworkId);
    return;
  }

  await db.runAsync(
    `INSERT OR REPLACE INTO artwork_reactions (artwork_id, reaction, updated_at)
     VALUES (?, ?, ?)`,
    artworkId,
    reaction,
    new Date().toISOString()
  );
}
