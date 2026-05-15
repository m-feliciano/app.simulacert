import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CreateExamRequest, ExamResponse, UpdateExamRequest} from './domain';
import {API_CONFIG, ApiConfig} from './config/api.config';
import {withCacheState} from '../core/transfer/exam-state.transfer';

@Injectable({
  providedIn: 'root'
})
export class ExamsApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/exams`;
  }

  getAllExams(): Observable<ExamResponse[]> {
    return this.http.get<ExamResponse[]>(this.baseUrl, {context: withCacheState('exams_get_all')});
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

  importFromDirectory(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/import/directory`, {});
  }

  getExamBySlug(slug: string): Observable<ExamResponse> {
    const encoded = encodeURIComponent(slug);
    return this.http.get<ExamResponse>(`${this.baseUrl}/slug/${encoded}`, {context: withCacheState(`exams_get_by_slug_${encoded}`)});
  }
}
