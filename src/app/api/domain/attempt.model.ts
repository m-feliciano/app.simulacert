import { QuestionOption } from './question.model';

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED'
}

export interface AttemptResponse {
  examId: string;
  finishedAt?: string;
  id: string;
  questionIds: string[];
  score?: number;
  seed: number;
  startedAt: string;
  status: AttemptStatus;
  userId: string;
}

export interface StartAttemptRequest {
  examId: string;
  questionCount: number;
  userId: string;
}

export interface AttemptQuestionResponse {
  difficulty: string;
  domain: string;
  options: QuestionOption[];
  questionId: string;
  text: string;
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

