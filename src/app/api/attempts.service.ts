import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {
  AnswerResponse,
  AttemptQuestionResponse,
  AttemptResponse,
  StartAttemptRequest,
  SubmitAnswerRequest
} from './domain';
import {AttemptTimingResponse} from './domain';
import {API_CONFIG, ApiConfig} from './config/api.config';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AttemptsApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/attempts`;
  }

  startAttempt(request: StartAttemptRequest): Observable<HttpResponse<void>> {
    return this.http.post<void>(this.baseUrl, request, { observe: 'response' });
  }

  getAttempt(attemptId: string): Observable<AttemptResponse> {
    return this.http.get<AttemptResponse>(`${this.baseUrl}/${attemptId}`);
  }

  getAttemptsByUser(userId: string): Observable<AttemptResponse[]> {
    return this.http.get<AttemptResponse[]>(`${this.baseUrl}/user/${userId}?page=0&size=5&sort=desc&sortBy=finishedAt`);
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

  getAnswers(attemptId: string): Observable<AnswerResponse[]> {
    return this.http.get<AnswerResponse[]>(`${this.baseUrl}/${attemptId}/answers`);
  }

  finishAttempt(attemptId: string): Observable<AttemptResponse> {
    return this.http.post<AttemptResponse>(`${this.baseUrl}/${attemptId}/finish`, {});
  }

  pauseAttempt(attemptId: string): Observable<AttemptTimingResponse> {
    return this.http.post<AttemptTimingResponse>(`${this.baseUrl}/${attemptId}/pause`, {});
  }

  resumeAttempt(attemptId: string): Observable<AttemptTimingResponse> {
    return this.http.post<AttemptTimingResponse>(`${this.baseUrl}/${attemptId}/resume`, {});
  }

  heartbeatAttempt(attemptId: string): Observable<AttemptTimingResponse> {
    return this.http.post<AttemptTimingResponse>(`${this.baseUrl}/${attemptId}/heartbeat`, {});
  }

  cancelAttempt(attemptId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${attemptId}/cancel`, {});
  }

  retakeAttempt(id: string): Observable<AttemptResponse> {
    return this.http.post<AttemptResponse>(`${this.baseUrl}/${id}/retake`, {});
  }
}

