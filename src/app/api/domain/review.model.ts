export interface ReviewResponse {
  id: string;
  attemptId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  attemptId: string;
  rating: number;
  comment?: string;
}

