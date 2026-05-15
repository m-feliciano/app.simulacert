import {TestBed} from '@angular/core/testing';
import {App} from '../../src/app/app';
import {LOCAL_STORAGE} from '../../src/app/core/storage/local-storage.token';
import {I18nService} from '../../src/app/core/i18n/i18n.service';

function mockI18nService() {
  return {
    get currentLanguage() {
      return 'en';
    }
  } as any;
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: LOCAL_STORAGE, useValue: window.localStorage },
        {provide: I18nService, useValue: mockI18nService()},
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toBe(undefined);
  });
});
