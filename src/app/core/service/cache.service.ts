import {Inject, Injectable} from '@angular/core';
import {SESSION_STORAGE} from '../storage/session-storage.token';

type CacheData<T> = {
  value: T;
  timestamp: number;
};

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  readonly CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours
  readonly CACHE_PREFIX = 'cache_';

  constructor(
    @Inject(SESSION_STORAGE) private readonly storage: Storage | null,
  ) {
  }

  set<T>(key: string, value: T, ttl = this.CACHE_TTL): void {
    const cacheKey = this.CACHE_PREFIX + key;
    this.storage?.setItem(cacheKey, JSON.stringify({
      value,
      timestamp: Date.now() + ttl
    }));
  }

  get<T>(key: string): T | null {
    const cacheKey = this.CACHE_PREFIX + key;
    const cached = this.storage?.getItem(cacheKey) as unknown as CacheData<T>;

    if (!cached || cached.timestamp < Date.now()) {
      this.remove(key);
      return null;
    }

    return cached.value;
  }

  remove(key: string): void {
    const cacheKey = this.CACHE_PREFIX + key;
    this.storage?.removeItem(cacheKey);
  }

  clearAll(): void {
    if (this.storage?.length) {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key?.startsWith(this.CACHE_PREFIX)) {
          this.storage.removeItem(key);
        }
      }
    }
  }
}
