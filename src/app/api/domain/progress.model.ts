export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface UserProgress {
  level: number;
  totalPoints: number;
  achievements: Achievement[];
  streakDays: number;
  nextMilestone: string;
}

