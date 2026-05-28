type AchievementKey =
  | 'firstStep'
  | 'persistent'
  | 'studious'
  | 'approved'
  | 'perfectionist'
  | 'fireStreak'
  | 'marathoner'
  | 'awsSpecialist'
  | 'cloudMaster'
  | 'helpfulCommunity'
  | 'questionSearch'
  | 'feedback100'
  | 'amazonRecommender'
  | 'feedbackLeader'
  | 'contentInfluencer';

export interface Achievement {
  id: AchievementKey;
  icon: 'target' | 'strength' | 'book' | 'award' | 'trophy' | 'flame' | 'medal' | 'cloud' | 'globe' | 'crown' | 'message-circle' | 'search' | 'check-square' | 'thumbs-up' | 'users';
  target: number;
  progress?: number;
  unlocked?: boolean;
  title?: string;
  description?: string;
}

export interface UserProgress {
  level: number;
  totalPoints: number;
  achievements: Achievement[];
  streakDays: number;
  nextMilestone: string;
}

