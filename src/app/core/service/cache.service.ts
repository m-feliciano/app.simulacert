import {Inject, Injectable, Optional} from '@angular/core';
import {SESSION_STORAGE} from '../storage/session-storage.token';

type CacheData<T> = {
  value: T;
  timestamp: number;
};

type RequiredNonEmpty<T> = {
  [K in keyof T]-?: T[K] extends string
    ? Exclude<T[K], ''>
    : NonNullable<T[K]>;
};

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  readonly CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours
  readonly CACHE_PREFIX = 'cache_';

  constructor(
    @Optional() @Inject(SESSION_STORAGE) private readonly storage: Storage | null,
  ) {
  }

  set<T>(key: Required<string>, value: RequiredNonEmpty<T>, ttl = this.CACHE_TTL): void {
    this.setWithPrefix(this.CACHE_PREFIX, key, value, ttl);
  }

  get<T>(key: Required<string>): T | null {
    return this.getWithPrefix<T>(this.CACHE_PREFIX, key);
  }

  clearAll(): void {
    if (!this.storage?.length) return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);

      if (key?.startsWith(this.CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((k) => this.storage?.removeItem(k));
  }

  private buildCacheKey(key: Required<string>, prefix: Required<string>): string {
    return `${prefix}${key}`.toLowerCase();
  }

  private safeParse<T>(raw: string | null): T | null {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private setWithPrefix<T>(prefix: Required<string>,
                           key: Required<string>,
                           value: RequiredNonEmpty<T>,
                           ttl: Required<number>): void {
    const cacheKey = this.buildCacheKey(key, prefix);

    try {
      this.storage?.setItem(cacheKey, JSON.stringify({
        value,
        timestamp: Date.now() + ttl,
      }));
    } catch {
    }
  }

  private getWithPrefix<T>(prefix: string, key: string): T | null {
    const cacheKey = this.buildCacheKey(key, prefix);
    const cached = this.storage?.getItem(cacheKey) ?? null;
    if (!cached) return null;

    const data = this.safeParse<CacheData<T>>(cached);
    if (!data || (typeof data.timestamp !== 'number') || data.timestamp < Date.now()) {
      this.storage?.removeItem(cacheKey);
      return null;
    }

    return data.value;
  }
}
