export interface ExplanationRequest {
  examAttemptId: string;
  language: string;
  certification: string;
  questionId: string;
}

export interface ExplanationResponse {
  explanationId: string;
  content: string;
  model: string;
  expiresAt: string;
}

export interface ExplanationFeedbackRequest {
  rating: number;
  comment?: string;
}

export interface ExplanationFeedbackResponse {
  success: boolean;
}

