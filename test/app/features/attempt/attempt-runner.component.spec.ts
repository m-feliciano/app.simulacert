import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import {of, throwError} from 'rxjs';
import {AttemptRunnerComponent} from '../../../../src/app/features/attempt/attempt-runner.component';
import {AttemptsApiService} from '../../../../src/app/api/attempts.service';
import {ExamsApiService} from '../../../../src/app/api/exams.service';
import {AttemptQuestionResponse, AttemptResponse, AttemptStatus, ExamResponse} from '../../../../src/app/api/domain';

function createAttempt(overrides: Partial<AttemptResponse> = {}): AttemptResponse {
  return {
    examId: 'exam-1',
    endsAt: '2099-05-14T10:10:00.000Z',
    id: 'attempt-1',
    questionIds: ['q1', 'q2', 'q3'],
    seed: 42,
    startedAt: '2099-05-14T10:00:00.000Z',
    status: AttemptStatus.IN_PROGRESS,
    userId: 'user-1',
    mode: 'exam',
    ...overrides,
  };
}

function createExam(overrides: Partial<ExamResponse> = {}): ExamResponse {
  return {
    id: 'exam-1',
    slug: 'aws-practitioner',
    title: 'AWS Practitioner',
    totalQuestions: 3,
    durationMinutes: 10,
    ...overrides,
  };
}

function createQuestion(overrides: Partial<AttemptQuestionResponse> = {}): AttemptQuestionResponse {
  return {
    questionId: 'q1',
    questionCode: 'Q1',
    text: 'Escolha uma opção correta',
    domain: 'Cloud',
    difficulty: 'easy',
    options: [
      {key: 'A', text: 'Alpha', isCorrect: true},
      {key: 'B', text: 'Beta', isCorrect: false},
    ],
    ...overrides,
  };
}

function createMultiQuestion(overrides: Partial<AttemptQuestionResponse> = {}): AttemptQuestionResponse {
  return createQuestion({
    questionId: 'q1',
    questionCode: 'Q1',
    text: 'Escolha duas opções corretas',
    options: [
      {key: 'A', text: 'Alpha', isCorrect: true},
      {key: 'B', text: 'Beta', isCorrect: true},
      {key: 'C', text: 'Gamma', isCorrect: false},
    ],
    ...overrides,
  });
}

function createRouteMock(attemptId = 'attempt-1') {
  return {
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'id' ? attemptId : null),
      },
    },
  } as any;
}

function createAttemptsApiMock() {
  return {
    getAttempt: jest.fn(),
    getAttemptQuestions: jest.fn(),
    getAnswers: jest.fn(),
    heartbeatAttempt: jest.fn(),
    pauseAttempt: jest.fn(),
    resumeAttempt: jest.fn(),
    submitAnswer: jest.fn(),
    finishAttempt: jest.fn(),
  } as unknown as jest.Mocked<Pick<AttemptsApiService, 'getAttempt' | 'getAttemptQuestions' | 'getAnswers' | 'heartbeatAttempt' | 'pauseAttempt' | 'resumeAttempt' | 'submitAnswer' | 'finishAttempt'>>;
}

function createExamsApiMock() {
  return {
    getExam: jest.fn(),
  } as unknown as jest.Mocked<Pick<ExamsApiService, 'getExam'>>;
}

function createRouterMock() {
  return {
    navigate: jest.fn(() => Promise.resolve(true)),
  } as any;
}

describe('AttemptRunnerComponent', () => {
  let fixture: ComponentFixture<AttemptRunnerComponent>;
  let component: AttemptRunnerComponent;
  let attemptsApi: ReturnType<typeof createAttemptsApiMock>;
  let examsApi: ReturnType<typeof createExamsApiMock>;
  let router: ReturnType<typeof createRouterMock>;
  let route: Partial<ActivatedRoute>;

  beforeEach(() => {
    attemptsApi = createAttemptsApiMock();
    examsApi = createExamsApiMock();
    router = createRouterMock();
    route = createRouteMock();

    TestBed.configureTestingModule({
      imports: [AttemptRunnerComponent],
      providers: [
        {provide: ActivatedRoute, useValue: route},
        {provide: Router, useValue: router},
        {provide: AttemptsApiService, useValue: attemptsApi},
        {provide: ExamsApiService, useValue: examsApi},
      ],
    });

    fixture = TestBed.createComponent(AttemptRunnerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fixture?.destroy();
  });

  it('loads attempt, exam, questions and pending answer state on init', async () => {
    attemptsApi.getAttempt.mockReturnValue(of(createAttempt()));
    examsApi.getExam.mockReturnValue(of(createExam()));
    attemptsApi.getAttemptQuestions.mockReturnValue(
      of([
        createQuestion({questionId: 'q1', questionCode: 'Q1'}),
        createQuestion({questionId: 'q2', questionCode: 'Q2', text: 'Questão 2'}),
        createQuestion({questionId: 'q3', questionCode: 'Q3', text: 'Questão 3'}),
      ])
    );
    attemptsApi.getAnswers.mockReturnValue(of([{questionId: 'q1', selectedOption: 'A'}]));
    attemptsApi.heartbeatAttempt.mockReturnValue(of({endsAt: '2099-05-14T10:10:00.000Z', remainingSeconds: 600, paused: false}));

    const startTimerSpy = jest.spyOn(component, 'startTimer').mockImplementation(() => undefined);
    const startHeartbeatSpy = jest.spyOn(component as any, 'startHeartbeat').mockImplementation(() => undefined);
    const startFirstHeartbeatSpy = jest.spyOn(component as any, 'startFirstHeartbeat').mockImplementation(() => undefined);

    fixture.detectChanges();
    await fixture.whenStable();

    expect((route as any).snapshot.paramMap.get('id')).toBe('attempt-1');
    expect(component.attemptId).toBe('attempt-1');
    expect(attemptsApi.getAttempt).toHaveBeenCalledWith('attempt-1');
    expect(examsApi.getExam).toHaveBeenCalledWith('exam-1');
    expect(attemptsApi.getAttemptQuestions).toHaveBeenCalledWith('attempt-1');
    expect(attemptsApi.getAnswers).toHaveBeenCalledWith('attempt-1');
    expect(startFirstHeartbeatSpy).toHaveBeenCalled();
    expect(startTimerSpy).toHaveBeenCalled();
    expect(startHeartbeatSpy).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
    expect(component.exam()?.title).toBe('AWS Practitioner');
    expect(component.questions()).toHaveLength(3);
    expect(component.answeredQuestions().size).toBe(1);
    expect(component.currentQuestionIndex()).toBe(1);
    expect(component.selectedAnswers()[0]).toEqual(['A']);
    expect(component.progress).toBeCloseTo(33.333, 1);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.loading-state')).toBeNull();
    expect(compiled.querySelector('.attempt-header h3')?.textContent).toBe('AWS Practitioner');
    expect(compiled.querySelector('.question-number')?.textContent).toContain('Questão Q2');
    expect(compiled.querySelector('.question-text')?.textContent).toBe('Questão 2');
    expect(compiled.querySelectorAll('.question-nav-btn')).toHaveLength(3);
    expect(compiled.querySelectorAll('.question-nav-btn.active')).toHaveLength(1);
    expect(compiled.querySelectorAll('.question-nav-btn.answered')).toHaveLength(1);
    expect(compiled.querySelector('.question-nav-btn.active')?.textContent?.trim()).toBe('2');
    expect(compiled.querySelector('.progress-fill')?.getAttribute('style')).toContain('33.333');
    expect(compiled.querySelector('.btn-finish')).toBeNull();
  });

  it('handles attempt loading errors', async () => {
    attemptsApi.getAttempt.mockReturnValue(throwError(() => new Error('load failed')));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('Erro ao carregar tentativa. Por favor, tente novamente.');
    expect(examsApi.getExam).not.toHaveBeenCalled();
    expect(attemptsApi.getAttemptQuestions).not.toHaveBeenCalled();
  });

  it('keeps unanswered state when the API returns no saved answers', async () => {
    attemptsApi.getAttempt.mockReturnValue(of(createAttempt()));
    examsApi.getExam.mockReturnValue(of(createExam()));
    attemptsApi.getAttemptQuestions.mockReturnValue(of([createQuestion(), createQuestion({questionId: 'q2', questionCode: 'Q2'})]));
    attemptsApi.getAnswers.mockReturnValue(of([]));
    attemptsApi.heartbeatAttempt.mockReturnValue(of({endsAt: '2099-05-14T10:10:00.000Z', remainingSeconds: 600, paused: false}));

    jest.spyOn(component as any, 'startHeartbeat').mockImplementation(() => undefined);
    jest.spyOn(component, 'startTimer').mockImplementation(() => undefined);
    jest.spyOn(component as any, 'startFirstHeartbeat').mockImplementation(() => undefined);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.answeredQuestions().size).toBe(0);
    expect(component.currentQuestionIndex()).toBe(0);
    expect(component.hasAtLeastOneAnswer()).toBe(false);
  });

  it('calculates the expected answer count from the question text and options', () => {
    expect(component.getExpectedAnswerCount(createQuestion({text: 'Escolha dois itens'}))).toBe(2);
    expect(component.getExpectedAnswerCount(createQuestion({text: 'Selecione três opções'}))).toBe(3);
    expect(component.getExpectedAnswerCount(createQuestion({text: 'Escolha quatro opções'}))).toBe(4);
    expect(component.getExpectedAnswerCount(createQuestion({text: 'Pergunta normal (selecione)', options: [
      {key: 'A', text: 'Alpha', isCorrect: true},
      {key: 'B', text: 'Beta', isCorrect: true},
      {key: 'C', text: 'Gamma', isCorrect: false},
    ]}))).toBe(2);
    expect(component.getExpectedAnswerCount(createQuestion({text: 'Pergunta simples', options: [
      {key: 'A', text: 'Alpha', isCorrect: false},
      {key: 'B', text: 'Beta', isCorrect: false},
    ]}))).toBe(1);
  });

  it('marks finish errors and resets the finishing state when the request fails', () => {
    attemptsApi.submitAnswer.mockReturnValue(of(void 0));
    attemptsApi.finishAttempt.mockReturnValue(throwError(() => new Error('finish failed')));

    component.attemptId = 'attempt-1';
    component.loading.set(false);
    component.questions.set([createQuestion()]);
    component.currentQuestionIndex.set(0);
    component.selectedAnswers.set({0: ['A']});

    component.finishAttempt();

    expect(attemptsApi.submitAnswer).toHaveBeenCalledWith('attempt-1', 'q1', {selectedOption: 'A'});
    expect(component.finishingAttempt()).toBe(false);
    expect(component.finishError()).toBe('Erro ao finalizar o exame. Suas respostas estão salvas. Por favor, tente novamente.');
  });

  it('auto-finishes the attempt when time reaches zero', async () => {
    attemptsApi.getAttempt.mockReturnValue(of(createAttempt()));
    examsApi.getExam.mockReturnValue(of(createExam()));
    attemptsApi.getAttemptQuestions.mockReturnValue(of([createQuestion()]));
    attemptsApi.getAnswers.mockReturnValue(of([]));

    const finishAttemptSpy = jest.spyOn(component, 'finishAttempt').mockImplementation(() => undefined);
    const unsubscribeSpy = jest.spyOn(component as any, 'unsubscribe').mockImplementation(() => undefined);

    jest.spyOn(component, 'startTimer').mockImplementation(() => undefined);
    jest.spyOn(component as any, 'startHeartbeat').mockImplementation(() => undefined);
    jest.spyOn(component as any, 'startFirstHeartbeat').mockImplementation(() => undefined);

    fixture.detectChanges();
    component.timeRemaining.set(0);
    fixture.detectChanges();
    await Promise.resolve();

    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(finishAttemptSpy).toHaveBeenCalled();
  });

  it('toggles answers and enforces the maximum selection count for multiple choice questions', () => {
    jest.spyOn(window, 'alert').mockImplementationOnce(() => undefined);

    component.questions.set([createMultiQuestion()]);
    component.currentQuestionIndex.set(0);

    component.toggleAnswer('A');
    component.toggleAnswer('B');
    component.toggleAnswer('C');

    expect(component.selectedAnswers()[0]).toEqual(['A', 'B']);
    expect(window.alert).toHaveBeenCalledWith('Você só pode selecionar 2 opções para esta questão.');
  });

  it('submits the current answer when moving forward and backward between questions', () => {
    attemptsApi.submitAnswer.mockReturnValue(of(void 0));

    component.attemptId = 'attempt-1';
    component.questions.set([
      createQuestion({questionId: 'q1', questionCode: 'Q1'}),
      createQuestion({questionId: 'q2', questionCode: 'Q2', text: 'Questão 2'}),
    ]);
    component.currentQuestionIndex.set(0);
    component.selectedAnswers.set({0: ['A']});

    component.nextQuestion();

    expect(attemptsApi.submitAnswer).toHaveBeenCalledWith('attempt-1', 'q1', {selectedOption: 'A'});
    expect(component.currentQuestionIndex()).toBe(1);

    component.selectedAnswers.set({1: ['B']});
    component.previousQuestion();

    expect(attemptsApi.submitAnswer).toHaveBeenCalledWith('attempt-1', 'q2', {selectedOption: 'B'});
    expect(component.currentQuestionIndex()).toBe(0);
  });

  it('pauses and resumes the attempt updating modal and timer state', () => {
    attemptsApi.pauseAttempt.mockReturnValue(of({endsAt: '2026-05-14T10:20:00.000Z', remainingSeconds: 300, paused: true}));
    attemptsApi.resumeAttempt.mockReturnValue(of({endsAt: '2026-05-14T10:25:00.000Z', remainingSeconds: 600, paused: false}));

    const startTimerSpy = jest.spyOn(component, 'startTimer').mockImplementation(() => undefined);
    const startHeartbeatSpy = jest.spyOn(component as any, 'startHeartbeat').mockImplementation(() => undefined);

    component.attemptId = 'attempt-1';
    component.loading.set(false);

    component.pauseAttempt();

    expect(attemptsApi.pauseAttempt).toHaveBeenCalledWith('attempt-1');
    expect(component.isPaused()).toBe(true);
    expect(component.showPauseModal()).toBe(true);

    component.resumeAttempt();

    expect(attemptsApi.resumeAttempt).toHaveBeenCalledWith('attempt-1');
    expect(component.showPauseModal()).toBe(false);
    expect(startTimerSpy).toHaveBeenCalled();
    expect(startHeartbeatSpy).toHaveBeenCalled();
  });

  it('finishes the attempt after submitting the current answer', () => {
    attemptsApi.submitAnswer.mockReturnValue(of(void 0));
    attemptsApi.finishAttempt.mockReturnValue(of(createAttempt({status: AttemptStatus.COMPLETED})));

    component.attemptId = 'attempt-1';
    component.loading.set(false);
    component.questions.set([createQuestion()]);
    component.currentQuestionIndex.set(0);
    component.selectedAnswers.set({0: ['A']});

    component.finishAttempt();

    expect(attemptsApi.submitAnswer).toHaveBeenCalledWith('attempt-1', 'q1', {selectedOption: 'A'});
    expect(attemptsApi.finishAttempt).toHaveBeenCalledWith('attempt-1');
    expect(component.finishingAttempt()).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/attempt', 'attempt-1', 'result']);
  });
});

