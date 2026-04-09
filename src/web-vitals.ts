import {onCLS, onINP, onLCP, onTTFB} from 'web-vitals';

export function reportWebVitals(callback: (metric: any) => void = () => {
}): void {
  onCLS(callback);
  onLCP(callback);
  onINP(callback);
  onTTFB(callback);
}

declare const process: any;
if (typeof window !== 'undefined' && (process?.env?.NODE_ENV === 'production' || window.location.hostname !== 'localhost')) {

  reportWebVitals((metric) => {
    // TODO: analytics integration
    // console.debug('[Core Web Vitals]', metric);
  });
}
