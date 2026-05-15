import {ComponentFixture, TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {of} from 'rxjs';
import {AchievementsComponent} from '../../../../src/app/features/achievements/achievements.component';
import {AuthFacade} from '../../../../src/app/core/auth/auth.facade';
import {ReviewsApiService} from '../../../../src/app/api/reviews.service';
import {StatsApiService} from '../../../../src/app/api/stats.service';
import {SeoFactoryService} from '../../../../src/app/core/seo/seo-factory.service';
import {SeoFacadeService} from '../../../../src/app/core/seo/seo-facade.service';

function buildUtcDay(offsetDays = 0): string {
  const now = new Date();
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString();
}

function createAuthFacadeMock(user: {id: string} | null = {id: 'user-1'}) {
  return {
    currentUser: jest.fn(() => user),
  } as unknown as Pick<AuthFacade, 'currentUser'>;
}

function createStatsApiMock() {
  return {
    getUserStatistics: jest.fn(),
    getAttemptHistory: jest.fn(),
    getPerformanceByDomain: jest.fn(),
  } as unknown as Pick<StatsApiService, 'getUserStatistics' | 'getAttemptHistory' | 'getPerformanceByDomain'>;
}

function createReviewsApiMock() {
  return {
    getReviesSummary: jest.fn(),
  } as unknown as Pick<ReviewsApiService, 'getReviesSummary'>;
}

function createSeoFactoryMock() {
  return {
    website: jest.fn((meta) => meta),
    canonicalFromPath: jest.fn((path: string) => `https://app.simulacert.com${path.startsWith('/') ? path : `/${path}`}`),
    origin: jest.fn(() => 'https://app.simulacert.com'),
  } as unknown as Pick<SeoFactoryService, 'website' | 'canonicalFromPath' | 'origin'>;
}

function createSeoFacadeMock() {
  return {
    set: jest.fn(),
    clearJsonLd: jest.fn(),
    update: jest.fn(),
  } as unknown as Pick<SeoFacadeService, 'set' | 'clearJsonLd' | 'update'>;
}

describe('AchievementsComponent', () => {
  let fixture: ComponentFixture<AchievementsComponent>;
  let component: AchievementsComponent;
  let authFacade: ReturnType<typeof createAuthFacadeMock>;
  let statsApi: ReturnType<typeof createStatsApiMock>;
  let reviewsApi: ReturnType<typeof createReviewsApiMock>;
  let seoFactory: ReturnType<typeof createSeoFactoryMock>;
  let seoFacade: ReturnType<typeof createSeoFacadeMock>;

  beforeEach(() => {
    authFacade = createAuthFacadeMock();
    statsApi = createStatsApiMock();
    reviewsApi = createReviewsApiMock();
    seoFactory = createSeoFactoryMock();
    seoFacade = createSeoFacadeMock();

    TestBed.configureTestingModule({
      imports: [AchievementsComponent],
      providers: [
        {provide: AuthFacade, useValue: authFacade},
        {provide: StatsApiService, useValue: statsApi},
        {provide: ReviewsApiService, useValue: reviewsApi},
        {provide: SeoFactoryService, useValue: seoFactory},
        {provide: SeoFacadeService, useValue: seoFacade},
      ],
    });

    fixture = TestBed.createComponent(AchievementsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fixture?.destroy();
  });

  it('sets the initial SEO metadata in the constructor', () => {
    expect(seoFactory.website).toHaveBeenCalledWith({
      title: 'Conquistas | SimulaCert',
      description: 'Acompanhe suas conquistas e marcos de estudo na SimulaCert.',
      canonicalPath: '/achievements',
      robots: 'index, follow',
      jsonLdId: 'achievements',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Conquistas',
        description: 'Acompanhe suas conquistas e marcos de estudo na SimulaCert.',
        url: 'https://app.simulacert.com/achievements',
        isPartOf: {
          '@type': 'WebSite',
          name: 'SimulaCert',
          url: 'https://app.simulacert.com',
        },
      },
    });
    expect(seoFacade.set).toHaveBeenCalledTimes(1);
  });

  it('stops loading when there is no authenticated user', () => {
    (authFacade as any).currentUser = jest.fn(() => null);

    fixture = TestBed.createComponent(AchievementsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(statsApi.getUserStatistics).not.toHaveBeenCalled();
    expect(statsApi.getAttemptHistory).not.toHaveBeenCalled();
    expect(statsApi.getPerformanceByDomain).not.toHaveBeenCalled();
    expect(reviewsApi.getReviesSummary).not.toHaveBeenCalled();
    expect(component.loading()).toBe(false);
    expect(component.level()).toBe(0);
    expect(component.totalPoints()).toBe(0);
  });

  it('loads data, updates achievements and refreshes SEO metadata', async () => {
    statsApi.getUserStatistics = jest.fn(() => of({
      averageScore: 7,
      bestScore: 85,
      completedAttempts: 12,
      lastAttemptAt: buildUtcDay(-1),
      totalAttempts: 12,
      userId: 'user-1',
    }));

    statsApi.getAttemptHistory = jest.fn(() => of([
      {attemptId: 'a1', examId: 'e1', examTitle: 'AWS', finishedAt: buildUtcDay(0), score: 90, startedAt: buildUtcDay(0), status: 'COMPLETED'},
      {attemptId: 'a2', examId: 'e2', examTitle: 'Azure', finishedAt: buildUtcDay(-1), score: 80, startedAt: buildUtcDay(-1), status: 'COMPLETED'},
    ]));

    statsApi.getPerformanceByDomain = jest.fn(() => of([
      {awsDomain: 'AWS Cloud Practitioner', accuracyRate: 80, correctAnswers: 8, totalQuestions: 10},
      {awsDomain: 'AWS Solutions Architect', accuracyRate: 75, correctAnswers: 15, totalQuestions: 20},
      {awsDomain: 'Azure Fundamentals', accuracyRate: 70, correctAnswers: 7, totalQuestions: 10},
      {awsDomain: 'Google Cloud Associate', accuracyRate: 65, correctAnswers: 13, totalQuestions: 20},
    ]));

    reviewsApi.getReviesSummary = jest.fn(() => of({
      submitted: 12,
      detailed: 25,
      useful: 10,
      approved: 25,
    }));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.loading()).toBe(false);
    expect(component.streakDays()).toBe(2);
    expect(component.level()).toBe(4);
    expect(component.totalPoints()).toBe(584);

    const achievements = component.achievements();
    const unlockedIds = achievements.filter((achievement) => achievement.unlocked).map((achievement) => achievement.id);

    expect(unlockedIds).toEqual(['1', '2', '4', '8', '9', '11', '12', '13', '14', '15']);
    expect(achievements.find((achievement) => achievement.id === '3')?.progress).toBe(12);
    expect(achievements.find((achievement) => achievement.id === '6')?.progress).toBe(2);
    expect(achievements.find((achievement) => achievement.id === '10')?.progress).toBe(12);

    expect(seoFacade.set).toHaveBeenCalledTimes(2);
    expect(seoFacade.set).toHaveBeenLastCalledWith(expect.objectContaining({
      title: 'Conquistas (10) | SimulaCert',
      canonicalPath: '/achievements',
      jsonLdId: 'achievements',
    }));

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.achievements-loading')).toBeNull();
    expect(compiled.querySelector('h1')?.textContent).toContain('Conquistas');
    expect(compiled.querySelector('.pill-strong')?.textContent).toContain('Nível 4');
    expect(compiled.querySelector('.pill-muted')?.textContent).toContain('pontos');
    expect(compiled.querySelector('.streak-number')?.textContent).toBe('2');
    expect(compiled.querySelectorAll('.grid .card')).toHaveLength(15);
    expect(compiled.querySelectorAll('.state--unlocked')).toHaveLength(10);
    expect(compiled.querySelectorAll('.state--locked')).toHaveLength(5);
    expect(compiled.querySelector('.card.unlocked h3')?.textContent).toBe('Primeiro Passo');
    expect(compiled.querySelector('.card.unlocked .state--unlocked')?.textContent).toContain('Conquistado');
    expect(compiled.querySelector('.card:not(.unlocked) .progress-text')?.textContent).toContain('12 / 50');
  });
});

