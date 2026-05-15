import {HttpContext, HttpContextToken} from '@angular/common/http';

export const CACHE_HTTP_RESPONSE = new HttpContextToken<string | null>(() => null);

export function withCacheState(key: string) {
  return new HttpContext().set(CACHE_HTTP_RESPONSE, key);
}
