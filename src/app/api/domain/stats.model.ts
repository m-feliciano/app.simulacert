export interface UserStatsDto {
  averageScore: number;
  bestScore: number;
  completedAttempts: number;
  lastAttemptAt?: string;
  totalAttempts: number;
  userId: string;
}

export interface AwsDomainStatsDto {
  accuracyRate: number;
  awsDomain: string;
  correctAnswers: number;
  totalQuestions: number;
}

