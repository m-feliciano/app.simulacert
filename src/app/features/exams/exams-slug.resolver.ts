import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {makeStateKey, TransferState} from '@angular/core';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {ExamsApiService} from '../../api/exams.service';
import {Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {ExamResponse} from '../../api/domain';

@Injectable({ providedIn: 'root' })
export class ExamsSlugResolver implements Resolve<ExamResponse | null> {
  constructor(
    private examsApi: ExamsApiService,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ExamResponse | null> {
    const slug = route.paramMap.get('slug');
    if (!slug) {
      return of(null);
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(slug)) {
      return of(null);
    }

    const key = makeStateKey<ExamResponse | null>(`exam:slug:${slug}`);

    // Browser: prefer TransferState to avoid double-fetch and hydration mismatch.
    if (isPlatformBrowser(this.platformId) && this.transferState.hasKey(key)) {
      const cached = this.transferState.get(key, null);
      // Optional: clean up to keep memory small.
      this.transferState.remove(key);
      return of(cached);
    }

    // Server (or Browser fallback): fetch from API.
    return this.examsApi.getExamBySlug(slug).pipe(
      tap((exam) => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(key, exam ?? null);
        }
      }),
      map((exam) => exam ?? null),
      catchError(() => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(key, null);
        }
        return of(null);
      }),
    );
  }
}
