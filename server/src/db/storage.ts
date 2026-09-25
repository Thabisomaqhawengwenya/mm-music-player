import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';
import { User, UserLibraryData } from '../types';

interface DatabaseSchema {
  users: Record<string, User>;
  libraries: Record<string, UserLibraryData>;
}

export class Database {
  private static instance: Database;
  private data: DatabaseSchema = {
    users: {},
    libraries: {},
  };
  private isLoaded = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private init() {
    const dir = path.dirname(CONFIG.DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(CONFIG.DB_FILE)) {
      try {
        const raw = fs.readFileSync(CONFIG.DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse database file, starting fresh', e);
        this.data = { users: {}, libraries: {} };
      }
    } else {
      this.persist();
    }
    this.isLoaded = true;
  }

  private persist() {
    const tempFile = `${CONFIG.DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, CONFIG.DB_FILE);
  }

  // --- Users ---
  public findUserByEmail(email: string): User | null {
    const normalized = email.toLowerCase().trim();
    return Object.values(this.data.users).find((u) => u.email === normalized) || null;
  }

  public findUserById(id: string): User | null {
    return this.data.users[id] || null;
  }

  public createUser(user: User): User {
    this.data.users[user.id] = user;
    // Initialize empty library
    this.data.libraries[user.id] = {
      userId: user.id,
      playlists: {},
      favorites: { trackIds: [], updatedAt: Date.now() },
      metadataOverrides: {},
      eqSettings: {
        name: 'Balanced Clean',
        bands: [2, 1, 0, 1, 3],
        bassBoost: 20,
        virtualizer: 15,
        updatedAt: Date.now(),
      },
      lastSyncedAt: Date.now(),
    };
    this.persist();
    return user;
  }

  public updateUser(user: User): void {
    this.data.users[user.id] = user;
    this.persist();
  }

  // --- Library & Sync Data ---
  public getUserLibrary(userId: string): UserLibraryData {
    if (!this.data.libraries[userId]) {
      this.data.libraries[userId] = {
        userId,
        playlists: {},
        favorites: { trackIds: [], updatedAt: Date.now() },
        metadataOverrides: {},
        eqSettings: {
          name: 'Balanced Clean',
          bands: [2, 1, 0, 1, 3],
          bassBoost: 20,
          virtualizer: 15,
          updatedAt: Date.now(),
        },
        lastSyncedAt: Date.now(),
      };
      this.persist();
    }
    return this.data.libraries[userId];
  }

  public saveUserLibrary(library: UserLibraryData): void {
    this.data.libraries[library.userId] = library;
    this.persist();
  }
}
