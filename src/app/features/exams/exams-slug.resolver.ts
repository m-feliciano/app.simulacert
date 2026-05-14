import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {ExamsApiService} from '../../api/exams.service';
import {Observable, of} from 'rxjs';
import {ExamResponse} from '../../api/domain';

@Injectable({ providedIn: 'root' })
export class ExamsSlugResolver implements Resolve<ExamResponse | null> {

  constructor(
    private readonly examsApi: ExamsApiService,
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

    return this.examsApi.getExamBySlug(slug);
  }
}
