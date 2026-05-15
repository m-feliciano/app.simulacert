import {inject, InjectionToken, PLATFORM_ID, Provider} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

export const SESSION_STORAGE = new InjectionToken<Storage | null>('SESSION_STORAGE');

export function provideSessionStorage(): Provider {
  return {
    provide: SESSION_STORAGE,
    useFactory: () => {
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) {
        return null;
      }

      try {
        return globalThis.sessionStorage;
      } catch {
        return null;
      }
    },
  };
}

