import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ExplanationRequest,
  ExplanationResponse,
  ExplanationFeedbackRequest,
  ExplanationFeedbackResponse
} from './domain';
import { API_CONFIG, ApiConfig } from './config/api.config';

@Injectable({ providedIn: 'root' })
export class ExplanationsApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1`;
  }

  generateExplanation(questionId: string, request: ExplanationRequest): Observable<ExplanationResponse> {
    return this.http.post<ExplanationResponse>(
      `${this.baseUrl}/questions/${questionId}/explanations`,
      request
    );
  }

  submitFeedback(explanationId: string, feedback: ExplanationFeedbackRequest): Observable<ExplanationFeedbackResponse> {
    return this.http.post<ExplanationFeedbackResponse>(
      `${this.baseUrl}/explanations/${explanationId}/feedback`,
      feedback
    );
  }
}

