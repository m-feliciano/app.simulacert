import {QuestionOption} from './question.model';
import {ExplanationResponse} from './explanation.model';

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED'
}

export interface AttemptResponse {
  examId: string;
  endsAt: string;
  paused?: boolean;
  pausedAt?: string;
  finishedAt?: string;
  id: string;
  questionIds: string[];
  score?: number;
  seed: number;
  startedAt: string;
  status: AttemptStatus;
  userId: string;
  mode?: 'exam' | 'practice';
}

export interface AttemptTimingResponse {
  endsAt: string;
  remainingSeconds: number;
  paused: boolean;
  pausedAt?: string;
}

export interface StartAttemptRequest {
  examId: string;
  questionCount: number;
  userId: string;
  limitSeconds: number;
  durationMinutes?: number;
  difficulty?: 'any' | 'easy' | 'medium' | 'hard';
  mode?: string;
}

export interface AttemptQuestionResponse {
  difficulty: string;
  domain: string;
  options: QuestionOption[];
  questionId: string;
  text: string;
  questionCode?: string;
  explanation?: ExplanationResponse;
}

export interface SubmitAnswerRequest {
  selectedOption: string;
}

export interface AttemptHistoryItemDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  finishedAt: string;
  score: number;
  startedAt: string;
  status: string;
}

export interface AnswerResponse {
  questionId: string;
  selectedOption?: string;
  answeredAt?: string;
}
