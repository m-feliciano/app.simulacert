import {onCLS, onINP, onLCP, onTTFB} from 'web-vitals';

declare const process: any;

export function reportWebVitals(callback: (metric: any) => void = () => {
}): void {
  onCLS(callback);
  onLCP(callback);
  onINP(callback);
  onTTFB(callback);
}

if (globalThis.window && (process?.env?.NODE_ENV === 'production' || globalThis.location.hostname !== 'localhost')) {

  reportWebVitals((metric) => {
    // TODO: analytics integration
  });
}
