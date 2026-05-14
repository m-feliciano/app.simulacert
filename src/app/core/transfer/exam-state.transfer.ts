import {HttpContext, HttpContextToken} from '@angular/common/http';

export const CACHE_TRANSFER_STATE = new HttpContextToken<string>(() => 'x-cache-transfer-state');

export function withCacheState(key: string) {
  return new HttpContext().set(CACHE_TRANSFER_STATE, key);
}
