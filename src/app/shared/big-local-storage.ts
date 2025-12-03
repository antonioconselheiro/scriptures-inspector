// bigLocalStorage.ts
const DB_NAME = "BigLocalStorageDB";
const STORE_NAME = "KeyValueStore";
const DB_VERSION = 1;

class BigLocalStorage {
  private cache = new Map<string, string>();
  private db: IDBDatabase | null = null;
  private ready = false;

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      this.db = request.result;
      this.loadCache();
    };

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
    };
  }

  private loadCache() {
    const tx = this.db!.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const cursor = store.openCursor();

    cursor.onsuccess = () => {
      const cur = cursor.result;
      if (cur) {
        this.cache.set(cur.key as string, cur.value as string);
        cur.continue();
      } else {
        this.ready = true;
      }
    };
  }

  private saveToDB(key: string, value: string | null) {
    if (!this.db) return;

    const tx = this.db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    if (value === null) {
      store.delete(key);
    } else {
      store.put(value, key);
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  setItem(key: string, value: string): void {
    this.cache.set(key, value);
    this.saveToDB(key, value); // grava em background
  }

  getItem(key: string): string | null {
    return this.cache.has(key) ? this.cache.get(key)! : null;
  }

  removeItem(key: string): void {
    this.cache.delete(key);
    this.saveToDB(key, null);
  }

  clear(): void {
    this.cache.clear();
    if (this.db) {
      const tx = this.db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
    }
  }

  key(index: number): string | null {
    const keys = Array.from(this.cache.keys());
    return keys[index] ?? null;
  }

  get length(): number {
    return this.cache.size;
  }
}

export const bigLocalStorage = new BigLocalStorage();
