import {Inject, Injectable} from '@angular/core';
import {SESSION_STORAGE} from '../storage/session-storage.token';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor(
    @Inject(SESSION_STORAGE) private readonly storage: Storage | null,
  ) {
  }

  set<T>(key: string, value: T): void {
    this.storage?.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const cached = this.storage?.getItem(key);
    if (!cached) return null;
    return JSON.parse(cached);
  }

  remove(key: string): void {
    this.storage?.removeItem(key);
  }

  clear(): void {
    this.storage?.clear();
  }
}
