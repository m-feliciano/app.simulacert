import {Injectable, signal, effect, inject, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {LOCAL_STORAGE} from '../storage/local-storage.token';

export type ThemeMode = 'light' | 'dark' | 'warm' | 'high-contrast';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge' | 'extra-small';
export type FontFamily = 'sans' | 'serif' | 'mono' | 'fantasy' | 'slab' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'sc_theme_mode';
  private readonly FONT_SIZE_KEY = 'sc_font_size';
  private readonly FONT_FAMILY_KEY = 'sc_font_family';

  themeMode = signal<ThemeMode>('dark');
  fontSize = signal<FontSize>('medium');
  fontFamily = signal<FontFamily>('serif');

  private readonly isBrowser: boolean;

  constructor(
    @Inject(LOCAL_STORAGE) private storage: Storage | null,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.themeMode.set(this.getStoredTheme());
      this.fontSize.set(this.getStoredFontSize());
      this.fontFamily.set(this.getStoredFontFamily());
    }

    effect(() => {
      const mode = this.themeMode();
      const size = this.fontSize();
      const family = this.fontFamily();

      if (this.isBrowser) {
        this.applyTheme(mode);
        this.applyFontSize(size);
        this.applyFontFamily(family);

        this.storage?.setItem(this.THEME_KEY, mode);
        this.storage?.setItem(this.FONT_SIZE_KEY, size);
        this.storage?.setItem(this.FONT_FAMILY_KEY, family);
      }
    });
  }

  setTheme(mode: ThemeMode) {
    this.themeMode.set(mode);
  }

  setFontSize(size: FontSize) {
    this.fontSize.set(size);
  }

  setFontFamily(family: FontFamily) {
    this.fontFamily.set(family);
  }

  private applyTheme(mode: ThemeMode) {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-warm', 'theme-high-contrast');
    root.classList.add(`theme-${mode}`);

    const themeColors: Record<ThemeMode, string> = {
      'light': '#f6f7f9',
      'dark': '#1e1e1e',
      'warm': '#fdf6e3',
      'high-contrast': '#000000'
    };

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', themeColors[mode]);
  }

  private applyFontSize(size: FontSize) {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge', 'font-extra-small');
    root.classList.add(`font-${size}`);
  }

  private applyFontFamily(family: FontFamily) {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    root.classList.remove(
      'font-family-sans',
      'font-family-serif',
      'font-family-mono',
      'font-family-fantasy',
      'font-family-slab',
      'font-family-system'
    );
    root.classList.add(`font-family-${family}`);
  }

  private getStoredTheme(): ThemeMode {
    if (!this.isBrowser) return 'dark';

    const stored = this.storage?.getItem(this.THEME_KEY) as ThemeMode;
    if (stored) return stored;

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    return 'dark';
  }

  private getStoredFontSize(): FontSize {
    if (!this.isBrowser || !this.storage) return 'medium';

    return (this.storage.getItem(this.FONT_SIZE_KEY) as FontSize) || 'medium';
  }

  private getStoredFontFamily(): FontFamily {
    if (!this.isBrowser || !this.storage) return 'serif';

    return (this.storage.getItem(this.FONT_FAMILY_KEY) as FontFamily) || 'serif';
  }
}
