import {DOCUMENT, effect, Inject, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {LOCAL_STORAGE} from '../storage/local-storage.token';
import {I18nService, Language} from '../i18n/i18n.service';

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

  themeMode = signal<ThemeMode>('light');
  fontSize = signal<FontSize>('medium');
  fontFamily = signal<FontFamily>('serif');

  private readonly isBrowser: boolean;
  private readonly i18nService = inject(I18nService);

  constructor(
    @Inject(LOCAL_STORAGE) private readonly storage: Storage | null,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Inject(DOCUMENT) private readonly document: Document
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
    const root = this.document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-warm', 'theme-high-contrast');
    root.classList.add(`theme-${mode}`);

    const themeColors: Record<ThemeMode, string> = {
      'light': '#f6f7f9',
      'dark': '#1e1e1e',
      'warm': '#fdf6e3',
      'high-contrast': '#000000'
    };

    let metaThemeColor = this.document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = this.document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      this.document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', themeColors[mode]);
  }

  private applyFontSize(size: FontSize) {
    const root = this.document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge', 'font-extra-small');
    root.classList.add(`font-${size}`);
  }

  private applyFontFamily(family: FontFamily) {
    const root = this.document.documentElement;
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
    const stored = this.storage?.getItem(this.THEME_KEY) as ThemeMode;
    if (stored) return stored;

    if (globalThis.window && globalThis.matchMedia) {
      return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  }

  private getStoredFontSize(): FontSize {
    return (this.storage?.getItem(this.FONT_SIZE_KEY) as FontSize) || 'medium';
  }

  private getStoredFontFamily(): FontFamily {
    return (this.storage?.getItem(this.FONT_FAMILY_KEY) as FontFamily) || 'serif';
  }

  setLanguage(lang: Language) {
    if (!this.isBrowser) return;

    this.i18nService.get('alerts.change_language')
      .subscribe((message) => {
        if (confirm(message)) {

          this.i18nService.changeLanguage(lang)
            .subscribe(() => {
              setTimeout(() => globalThis.location.reload(), 1000);
              alert(this.i18nService.instant('alerts.language_changed'));
            });
        }
      });
  }

  getLanguage(): Language {
    return this.i18nService.getLanguage();
  }
}
