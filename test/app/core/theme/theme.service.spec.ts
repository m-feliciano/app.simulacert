import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {Component, PLATFORM_ID} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {afterEach, describe, expect, it, jest} from '@jest/globals';
import {LOCAL_STORAGE} from '../../../../src/app/core/storage/local-storage.token';
import {ThemeService} from '../../../../src/app/core/theme/theme.service';
import {I18nService} from '../../../../src/app/core/i18n/i18n.service';

type StorageMock = Storage & {
  data: Record<string, string>;
};

@Component({
  standalone: true,
  template: '',
})
class ThemeServiceHostComponent {
  constructor(public readonly themeService: ThemeService) {}
}

function createStorageMock(initial: Record<string, string> = {}): StorageMock {
  const data = {...initial};

  return {
    data,
    get length() {
      return Object.keys(data).length;
    },
    clear: jest.fn(() => {
      Object.keys(data).forEach((key) => delete data[key]);
    }),
    getItem: jest.fn((key: string) => (key in data ? data[key] : null)),
    key: jest.fn((index: number) => Object.keys(data)[index] ?? null),
    removeItem: jest.fn((key: string) => {
      delete data[key];
    }),
    setItem: jest.fn((key: string, value: string) => {
      data[key] = value;
    }),
  } as StorageMock;
}

function mockI18nService() {
  return {
    get currentLanguage() {
      return 'en';
    }
  } as any;
}

function resetDom() {
  globalThis.document.documentElement.className = '';
  globalThis.document.head.querySelector('meta[name="theme-color"]')?.remove();
}

function setupBrowserThemeTestingModule(storage: StorageMock) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ThemeServiceHostComponent],
    providers: [
      {provide: DOCUMENT, useValue: globalThis.document},
      {provide: I18nService, useValue: mockI18nService()},
      {provide: LOCAL_STORAGE, useValue: storage},
      {provide: PLATFORM_ID, useValue: 'browser'},
    ],
  });
}

function setupServerThemeTestingModule(storage: StorageMock | null) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {provide: DOCUMENT, useValue: globalThis.document},
      {provide: LOCAL_STORAGE, useValue: storage},
      {provide: I18nService, useValue: mockI18nService()},
      {provide: PLATFORM_ID, useValue: 'server'},
    ],
  });
}

describe('ThemeService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetDom();
  });

  it('should initialize from storage and apply theme classes and meta color', async () => {
    const storage = createStorageMock({
      sc_theme_mode: 'light',
      sc_font_size: 'large',
      sc_font_family: 'mono',
    });

    setupBrowserThemeTestingModule(storage);

    const fixture = TestBed.createComponent(ThemeServiceHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const service = fixture.componentInstance.themeService;

    expect(service.themeMode()).toBe('light');
    expect(service.fontSize()).toBe('large');
    expect(service.fontFamily()).toBe('mono');
    expect(globalThis.document.documentElement.classList.contains('theme-light')).toBe(true);
    expect(globalThis.document.documentElement.classList.contains('font-large')).toBe(true);
    expect(globalThis.document.documentElement.classList.contains('font-family-mono')).toBe(true);
    expect(globalThis.document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#f6f7f9');
    expect(storage.setItem).toHaveBeenCalledWith('sc_theme_mode', 'light');
    expect(storage.setItem).toHaveBeenCalledWith('sc_font_size', 'large');
    expect(storage.setItem).toHaveBeenCalledWith('sc_font_family', 'mono');
  });

  it('should persist signal changes and update the DOM', async () => {
    const storage = createStorageMock();

    setupBrowserThemeTestingModule(storage);

    const fixture = TestBed.createComponent(ThemeServiceHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const service = fixture.componentInstance.themeService;

    service.setTheme('warm');
    service.setFontSize('xlarge');
    service.setFontFamily('system');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(storage.getItem('sc_theme_mode')).toBe('warm');
    expect(storage.getItem('sc_font_size')).toBe('xlarge');
    expect(storage.getItem('sc_font_family')).toBe('system');
    expect(globalThis.document.documentElement.classList.contains('theme-warm')).toBe(true);
    expect(globalThis.document.documentElement.classList.contains('font-xlarge')).toBe(true);
    expect(globalThis.document.documentElement.classList.contains('font-family-system')).toBe(true);
    expect(globalThis.document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#fdf6e3');
  });

  it('should use prefers-color-scheme when storage does not contain a theme', async () => {
    const storage = createStorageMock();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: jest.fn().mockReturnValue({matches: true}),
    });

    setupBrowserThemeTestingModule(storage);

    const fixture = TestBed.createComponent(ThemeServiceHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const service = fixture.componentInstance.themeService;

    expect(service.themeMode()).toBe('light');
    expect(globalThis.document.documentElement.classList.contains('theme-light')).toBe(true);
  });

  it('should not touch DOM when running outside the browser', () => {
    const storage = createStorageMock();

    setupServerThemeTestingModule(storage);

    const service = TestBed.inject(ThemeService);

    expect(isPlatformBrowser(TestBed.inject(PLATFORM_ID))).toBe(false);
    expect(service.themeMode()).toBe('dark');
    expect(globalThis.document.documentElement.classList.contains('theme-dark')).toBe(false);
    expect(globalThis.document.querySelector('meta[name="theme-color"]')).toBeNull();
  });
});
