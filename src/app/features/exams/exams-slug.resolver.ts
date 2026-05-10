import {Inject, Injectable, makeStateKey, PLATFORM_ID, TransferState} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {ExamsApiService} from '../../api/exams.service';
import {Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
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

    if (isPlatformBrowser(this.platformId) && this.transferState.hasKey(key)) {
      const cached = this.transferState.get(key, null);
      this.transferState.remove(key);
      return of(cached);
    }

    return this.examsApi.getExamBySlug(slug).pipe(
      tap((exam) => {
        if (isPlatformServer(this.platformId)) {
          if (exam) {
            this.transferState.set(key, exam);
          } else {
            this.transferState.remove(key);
          }
        }
      }),
      catchError(() => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.remove(key);
        }
        return of(null);
      }),
    );
  }
}
