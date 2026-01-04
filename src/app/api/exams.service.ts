import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExamResponse, CreateExamRequest, UpdateExamRequest } from './domain';
import { API_CONFIG, ApiConfig } from './config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ExamsApiService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/exams`;
  }

  getAllExams(): Observable<ExamResponse[]> {
    return this.http.get<ExamResponse[]>(this.baseUrl);
  }

  getExam(examId: string): Observable<ExamResponse> {
    return this.http.get<ExamResponse>(`${this.baseUrl}/${examId}`);
  }

  createExam(request: CreateExamRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, request);
  }

  updateExam(examId: string, request: UpdateExamRequest): Observable<ExamResponse> {
    return this.http.put<ExamResponse>(`${this.baseUrl}/${examId}`, request);
  }

  deleteExam(examId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${examId}`);
  }

  examExists(examId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${examId}/exists`);
  }

  importFromDirectory(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/import/directory`, {});
  }
}

