export type AttemptDifficulty = 'any' | 'easy' | 'medium' | 'hard';

export interface AttemptSetup {
  questionCount: number;
  durationMinutes: number;
  difficulty: AttemptDifficulty;
}

export const DEFAULT_ATTEMPT_SETUP: AttemptSetup = {
  questionCount: 20,
  durationMinutes: 30,
  difficulty: 'any',
};

