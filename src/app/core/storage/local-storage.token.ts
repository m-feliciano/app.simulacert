import {inject, InjectionToken, PLATFORM_ID, Provider} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

export const LOCAL_STORAGE = new InjectionToken<Storage | null>('LOCAL_STORAGE');

/**
 * Factory function to provide the localStorage object safely, ensuring it is only accessed in a browser environment.
 * If the code is running on the server (e.g., during SSR), it returns null to prevent errors.
 */
export function provideLocalStorage(): Provider {
  return {
    provide: LOCAL_STORAGE,
    useFactory: () => {
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) {
        return null;
      }

      try {
        return globalThis.localStorage;
      } catch {
        return null;
      }
    },
  };
}

