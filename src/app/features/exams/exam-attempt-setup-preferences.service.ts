import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {AttemptSetup, DEFAULT_ATTEMPT_SETUP} from './exam-attempt-setup.model';
import {LOCAL_STORAGE} from '../../core/storage/local-storage.token';

@Injectable({providedIn: 'root'})
export class ExamAttemptSetupPreferencesService {
  private readonly GLOBAL_KEY = 'simulacert.examAttemptSetup.global.v1';
  private readonly PER_EXAM_PREFIX = 'simulacert.examAttemptSetup.exam.';
  private isBrowser: boolean;

  constructor(
    @Inject(LOCAL_STORAGE) private storage: Storage | null,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  loadGlobal(): AttemptSetup {
    return this.load(this.GLOBAL_KEY, DEFAULT_ATTEMPT_SETUP);
  }

  saveGlobal(value: AttemptSetup): void {
    this.save(this.GLOBAL_KEY, value);
  }

  loadForExam(examId: string): AttemptSetup {
    return this.load(`${this.PER_EXAM_PREFIX}${examId}.v1`, this.loadGlobal());
  }

  saveForExam(examId: string, value: AttemptSetup): void {
    this.save(`${this.PER_EXAM_PREFIX}${examId}.v1`, value);
  }

  private load(key: string, fallback: AttemptSetup): AttemptSetup {
    if (!this.isBrowser || !this.storage) return fallback;
    try {
      const raw = this.storage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AttemptSetup> | null;
        if (parsed) {
          return {
            questionCount: this.clampInt(parsed.questionCount, 10, 65, fallback.questionCount),
            durationMinutes: this.clampInt(parsed.durationMinutes, 5, 3 * 60, fallback.durationMinutes),
            difficulty: (parsed.difficulty as any) ?? fallback.difficulty,
          };
        }
      }
    } catch {
    }

    return fallback;
  }

  private save(key: string, value: AttemptSetup): void {
    if (!this.isBrowser || !this.storage) return;
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch {
    }
  }

  private clampInt(value: unknown, min: number, max: number, fallback: number): number {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return fallback;

    return Math.min(max, Math.max(min, Math.round(n)));
  }
}

