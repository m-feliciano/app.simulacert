import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewResponse, CreateReviewRequest, ReviewSummary } from './domain';
import { API_CONFIG, ApiConfig } from './config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ReviewsApiService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/reviews`;
  }

  createReview(request: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.baseUrl, request);
  }

  getReviewByAttempt(attemptId: string): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.baseUrl}/by-attempt/${attemptId}`);
  }

  getReviesSummary(userId: string): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.baseUrl}/summary/user/${userId}`);
  }
}

