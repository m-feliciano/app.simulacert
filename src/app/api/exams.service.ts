import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of} from 'rxjs';
import {CreateExamRequest, ExamResponse, UpdateExamRequest} from './domain';
import {API_CONFIG, ApiConfig} from './config/api.config';
import {withCacheState} from '../core/transfer/exam-state.transfer';
import {switchMap} from 'rxjs/operators';
import {v4 as uuid4} from 'uuid';

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

  getAllAvailable(): Observable<ExamResponse[]> {
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

  getAllIncoming(): Observable<ExamResponse[]> {
    return of([
      {
        id: uuid4(),
        title: 'AWS Certified Developer - Associate (DVA-C02)',
        description: 'Exame prático com questões alinhadas ao conteúdo e ao nível de dificuldade da certificação AWS Certified Developer – Associate, voltado para treino e revisão.',
        difficulty: 'MEDIUM',
        totalQuestions: 235,
        incoming: true,
        slug: 'aws-certified-developer-dva-c02'
      },
      {
        id: uuid4(),
        title: 'AWS Certified AI Practitioner',
        description: 'Exame prático focado em inteligência artificial e machine learning na AWS, com questões alinhadas ao conteúdo da certificação AWS Certified AI Practitioner, ideal para quem busca se aprofundar nessa área.',
        difficulty: 'EASY',
        totalQuestions: 150,
        incoming: true,
        slug: 'aws-certified-ai-practitioner'
      },
      {
        id: uuid4(),
        title: 'Microsoft Certified Azure Fundamentals (AZ-900)',
        description: 'Exame prático para avaliar conhecimentos nos conceitos fundamentais do Microsoft Azure, conforme os tópicos cobrados na certificação.',
        difficulty: 'EASY',
        totalQuestions: 174,
        incoming: true,
        slug: 'azure-certified-fundamentals-az-900'
      },
      {
        id: uuid4(),
        title: 'Microsoft Certified Azure AI Fundamentals (AI-900)',
        description: 'Exame prático para avaliar conhecimentos nos conceitos fundamentais de inteligência artificial e machine learning no Microsoft Azure, conforme os tópicos cobrados na certificação.',
        difficulty: 'EASY',
        totalQuestions: 120,
        incoming: true,
        slug: 'azure-certified-fundamentals-ai-900'
      }
    ]);
  }

  getAll(): Observable<ExamResponse[]> {
    return this.getAllAvailable()
      .pipe(switchMap(exams => {
          if (exams.some(exam => exam.incoming)) {
            return of(exams);
          } else {
            return this.getAllIncoming().pipe(
              map(incomingExams => [...exams, ...incomingExams])
            );
          }
        })
      );
  }
}
