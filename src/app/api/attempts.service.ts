import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttemptResponse, StartAttemptRequest, AttemptQuestionResponse, SubmitAnswerRequest } from './domain';
import { API_CONFIG, ApiConfig } from './config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AttemptsApiService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/attempts`;
  }

  startAttempt(request: StartAttemptRequest): Observable<AttemptResponse> {
    return this.http.post<AttemptResponse>(this.baseUrl, request);
  }

  getAttempt(attemptId: string): Observable<AttemptResponse> {
    return this.http.get<AttemptResponse>(`${this.baseUrl}/${attemptId}`);
  }

  getAttemptsByUser(userId: string): Observable<AttemptResponse[]> {
    return this.http.get<AttemptResponse[]>(`${this.baseUrl}/user/${userId}`);
  }

  getAttemptQuestions(attemptId: string): Observable<AttemptQuestionResponse[]> {
    return this.http.get<AttemptQuestionResponse[]>(`${this.baseUrl}/${attemptId}/questions`);
  }

  submitAnswer(attemptId: string, questionId: string, request: SubmitAnswerRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${attemptId}/answers/${questionId}`, request);
  }

  finishAttempt(attemptId: string): Observable<AttemptResponse> {
    return this.http.post<AttemptResponse>(`${this.baseUrl}/${attemptId}/finish`, {});
  }
}

