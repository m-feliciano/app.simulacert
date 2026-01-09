export interface ExamResponse {
  description?: string;
  id: string;
  title: string;
  totalQuestions?: number;
  durationMinutes?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  incoming?: boolean;
  slug: string;
}

export interface CreateExamRequest {
  description?: string;
  title: string;
}

export interface UpdateExamRequest {
  description?: string;
  title: string;
}

