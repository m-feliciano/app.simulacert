import { Injectable, Inject } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { AttemptResponse, StartAttemptRequest, AttemptQuestionResponse, SubmitAnswerRequest } from './domain';
import { API_CONFIG, ApiConfig } from './config/api.config';
import {catchError} from 'rxjs/operators';

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

  startAttempt(request: StartAttemptRequest): Observable<HttpResponse<void>> {
    return this.http.post<void>(this.baseUrl, request, { observe: 'response' })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
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

  deleteAnswer(attemptId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${attemptId}/answers/${questionId}`);
  }

  finishAttempt(attemptId: string): Observable<AttemptResponse> {
    return this.http.post<AttemptResponse>(`${this.baseUrl}/${attemptId}/finish`, {});
  }

  cancelAttempt(attemptId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${attemptId}/cancel`, {});
  }
}

