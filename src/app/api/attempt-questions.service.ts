import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttemptQuestionResponse } from './domain/attempt-question.model';
import { API_CONFIG, ApiConfig } from './config/api.config';

@Injectable({ providedIn: 'root' })
export class AttemptQuestionsApiService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/attempts`;
  }

  getAttemptQuestions(attemptId: string): Observable<AttemptQuestionResponse[]> {
    return this.http.get<AttemptQuestionResponse[]>(`${this.baseUrl}/${attemptId}/questions`);
  }
}
