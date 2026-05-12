import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserStatsDto, AttemptHistoryItemDto, AwsDomainStatsDto } from './domain';
import { API_CONFIG, ApiConfig } from './config/api.config';

@Injectable({
  providedIn: 'root'
})
export class StatsApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly config: ApiConfig
  ) {
    this.baseUrl = `${this.config.baseUrl}/api/v1/stats`;
  }

  getUserStatistics(userId: string): Observable<UserStatsDto> {
    return this.http.get<UserStatsDto>(`${this.baseUrl}/user/${userId}`);
  }

  getAttemptHistory(userId: string): Observable<AttemptHistoryItemDto[]> {
    return this.http.get<AttemptHistoryItemDto[]>(`${this.baseUrl}/user/${userId}/history`);
  }

  getPerformanceByDomain(userId: string): Observable<AwsDomainStatsDto[]> {
    return this.http.get<AwsDomainStatsDto[]>(`${this.baseUrl}/user/${userId}/domains`);
  }
}

