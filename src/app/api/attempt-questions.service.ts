import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttemptQuestionResponse } from './domain/attempt-question.model';

@Injectable({ providedIn: 'root' })
export class AttemptQuestionsApiService {
  constructor(private http: HttpClient) {}

  getAttemptQuestions(attemptId: string): Observable<AttemptQuestionResponse[]> {
    return this.http.get<AttemptQuestionResponse[]>(`/api/v1/attempts/${attemptId}/questions`);
  }
}
