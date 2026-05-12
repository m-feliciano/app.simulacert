import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  QuestionResponse,
  CreateQuestionRequest,
  PagedModelQuestionResponse,
  Pageable,
  ExplanationResponse
} from './domain';
import { API_CONFIG, ApiConfig } from './config/api.config';

@Injectable({
  providedIn: 'root'
})
export class QuestionsApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/questions`;
  }

  createQuestion(request: CreateQuestionRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, request);
  }

  getQuestion(questionId: string): Observable<QuestionResponse> {
    return this.http.get<QuestionResponse>(`${this.baseUrl}/${questionId}`);
  }

  getQuestionsByExam(examId: string, pageable: Pageable): Observable<PagedModelQuestionResponse> {
    let params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString());

    if (pageable.sort) {
      pageable.sort.forEach(s => {
        params = params.append('sort', s);
      });
    }

    return this.http.get<PagedModelQuestionResponse>(`${this.baseUrl}/exam/${examId}`, { params });
  }

  getAllExplanations(param: { questionIds: string[] }): Observable<ExplanationResponse[]> {
    return this.http.get<ExplanationResponse[]>(`${this.baseUrl}/explanations`, {
      params: new HttpParams().set('questionIds', param.questionIds.join(','))
    });
  }
}

