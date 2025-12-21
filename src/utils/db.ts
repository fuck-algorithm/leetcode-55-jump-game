import { openDB, type DBSchema } from 'idb';
import type { ProgrammingLanguage, GitHubStarCache } from '../types';

interface AppDB extends DBSchema {
  settings: {
    key: string;
    value: {
      key: string;
      value: string | number;
    };
  };
  githubCache: {
    key: string;
    value: GitHubStarCache;
  };
}

const DB_NAME = 'leetcode-55-jump-game';
const DB_VERSION = 1;

async function getDB() {
  return openDB<AppDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('githubCache')) {
        db.createObjectStore('githubCache', { keyPath: 'key' });
      }
    },
  });
}

// 保存编程语言偏好
export async function saveLanguagePreference(language: ProgrammingLanguage): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key: 'language', value: language });
}

// 获取编程语言偏好
export async function getLanguagePreference(): Promise<ProgrammingLanguage> {
  const db = await getDB();
  const result = await db.get('settings', 'language');
  return (result?.value as ProgrammingLanguage) || 'java';
}

// 保存播放速度
export async function savePlaybackSpeed(speed: number): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key: 'playbackSpeed', value: speed });
}

// 获取播放速度
export async function getPlaybackSpeed(): Promise<number> {
  const db = await getDB();
  const result = await db.get('settings', 'playbackSpeed');
  return (result?.value as number) || 1;
}

// 保存 GitHub Star 缓存
export async function saveGitHubStars(stars: number): Promise<void> {
  const db = await getDB();
  await db.put('githubCache', {
    key: 'stars',
    stars,
    timestamp: Date.now(),
  });
}

// 获取 GitHub Star 缓存
export async function getGitHubStarsCache(): Promise<GitHubStarCache | null> {
  const db = await getDB();
  const result = await db.get('githubCache', 'stars');
  return result || null;
}

// 检查缓存是否有效（1小时内）
export function isCacheValid(cache: GitHubStarCache | null): boolean {
  if (!cache) return false;
  const oneHour = 60 * 60 * 1000;
  return Date.now() - cache.timestamp < oneHour;
}
