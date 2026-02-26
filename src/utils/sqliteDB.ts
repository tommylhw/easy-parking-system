import * as SQLite from 'expo-sqlite';

import { FavoriteItemType, FavoriteRecord } from '@/src/types/domain';

const DB_NAME = 'easyparking.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  return dbPromise;
}

export async function initDatabase() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      payload TEXT,
      created_at INTEGER NOT NULL,
      UNIQUE(item_id, item_type)
    );

    CREATE TABLE IF NOT EXISTS recent_searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT NOT NULL,
      keyword TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
}

export async function listFavorites(itemType?: FavoriteItemType): Promise<FavoriteRecord[]> {
  const db = await getDb();
  if (itemType) {
    return db.getAllAsync<FavoriteRecord>(
      `SELECT item_id AS itemId, item_type AS itemType, name, latitude, longitude, payload
       FROM favorites
       WHERE item_type = ?
       ORDER BY created_at DESC`,
      [itemType]
    );
  }

  return db.getAllAsync<FavoriteRecord>(
    `SELECT item_id AS itemId, item_type AS itemType, name, latitude, longitude, payload
     FROM favorites
     ORDER BY created_at DESC`
  );
}

export async function listFavoriteIds(itemType?: FavoriteItemType): Promise<Set<string>> {
  const db = await getDb();
  const rows = itemType
    ? await db.getAllAsync<{ itemId: string }>(
        'SELECT item_id AS itemId FROM favorites WHERE item_type = ?',
        [itemType]
      )
    : await db.getAllAsync<{ itemId: string }>('SELECT item_id AS itemId FROM favorites');

  return new Set(rows.map((row) => row.itemId));
}

export async function saveFavorite(record: FavoriteRecord) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO favorites (item_id, item_type, name, latitude, longitude, payload, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(item_id, item_type)
     DO UPDATE SET
       name = excluded.name,
       latitude = excluded.latitude,
       longitude = excluded.longitude,
       payload = excluded.payload,
       created_at = excluded.created_at`,
    [
      record.itemId,
      record.itemType,
      record.name,
      record.latitude,
      record.longitude,
      record.payload ?? null,
      Date.now(),
    ]
  );
}

export async function removeFavorite(itemId: string, itemType: FavoriteItemType) {
  const db = await getDb();
  await db.runAsync('DELETE FROM favorites WHERE item_id = ? AND item_type = ?', [itemId, itemType]);
}

export async function toggleFavorite(record: FavoriteRecord): Promise<boolean> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(1) as count FROM favorites WHERE item_id = ? AND item_type = ?',
    [record.itemId, record.itemType]
  );

  if ((existing?.count ?? 0) > 0) {
    await removeFavorite(record.itemId, record.itemType);
    return false;
  }

  await saveFavorite(record);
  return true;
}

export async function addRecentSearch(itemType: FavoriteItemType, keyword: string) {
  const normalized = keyword.trim();
  if (!normalized) {
    return;
  }

  const db = await getDb();
  await db.runAsync('DELETE FROM recent_searches WHERE item_type = ? AND lower(keyword) = lower(?)', [
    itemType,
    normalized,
  ]);

  await db.runAsync(
    'INSERT INTO recent_searches (item_type, keyword, created_at) VALUES (?, ?, ?)',
    [itemType, normalized, Date.now()]
  );

  await db.runAsync(
    `DELETE FROM recent_searches
     WHERE id NOT IN (
       SELECT id FROM recent_searches WHERE item_type = ? ORDER BY created_at DESC LIMIT 15
     )
     AND item_type = ?`,
    [itemType, itemType]
  );
}

export async function listRecentSearches(itemType: FavoriteItemType, limit = 10): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ keyword: string }>(
    'SELECT keyword FROM recent_searches WHERE item_type = ? ORDER BY created_at DESC LIMIT ?',
    [itemType, limit]
  );

  return rows.map((row) => row.keyword);
}

export async function clearRecentSearches(itemType?: FavoriteItemType) {
  const db = await getDb();
  if (itemType) {
    await db.runAsync('DELETE FROM recent_searches WHERE item_type = ?', [itemType]);
    return;
  }

  await db.runAsync('DELETE FROM recent_searches');
}
