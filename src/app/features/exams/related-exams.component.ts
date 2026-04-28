import {Component, Input, makeStateKey, OnInit, signal, TransferState} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ExamsApiService} from '../../api/exams.service';
import {ExamResponse} from '../../api/domain';

@Component({
  selector: 'app-related-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (related().length > 0) {
      <section class="related">
        <h2>Exames relacionados</h2>
        <p class="hint">
          Continue praticando com outros simulados semelhantes. Linkagem interna ajuda você a navegar e ajuda o Google a descobrir as páginas.
        </p>

        <ul class="list">
          @for (exam of related(); track exam.id) {
            <li>
              <a class="card" [routerLink]="['/exams', exam.slug || exam.id]">
                <div class="title">{{ exam.title }}</div>
                @if (exam.description) {
                  <div class="desc">{{ exam.description }}</div>
                }
              </a>
            </li>
          }
        </ul>
      </section>
    }
  `,
  styles: [`
    .related {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(0,0,0,0.08);
    }

    .related h2 {
      margin: 0 0 8px;
    }

    .hint {
      margin: 0 0 16px;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    .list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 12px;
    }

    .card {
      display: block;
      padding: 14px 14px;
      border-radius: 10px;
      background: var(--color-bg-secondary);
      text-decoration: none;
      border: 1px solid rgba(0,0,0,0.06);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      color: inherit;
      height: 100%;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .title {
      font-weight: 700;
      margin-bottom: 6px;
    }

    .desc {
      color: var(--color-text-secondary);
      font-size: 14px;
      line-height: 1.5;
    }
  `]
})
export class RelatedExamsComponent implements OnInit {
  @Input({required: true}) currentExam!: ExamResponse;

  related = signal<ExamResponse[]>([]);
  private readonly examsKey = makeStateKey<ExamResponse[]>(`exams`);

  constructor(private examsApi: ExamsApiService,
              private transferState: TransferState
  ) {
  }

  ngOnInit(): void {

    if (this.transferState.hasKey(this.examsKey)) {
      const exams = this.transferState.get<ExamResponse[]>(this.examsKey, []);
      this.setRelatedExams(exams);
      this.transferState.remove(this.examsKey);

    } else {
      this.examsApi.getAllExams().subscribe({
        next: (all) => this.setRelatedExams(all),
        error: () => this.related.set([])
      });
    }
  }

  private setRelatedExams(all: ExamResponse[]) {
    const currentId = this.currentExam?.id;
    const currentSlug = this.currentExam?.slug;

    const filtered = (all || []).filter(e => e && e.id !== currentId && e.slug !== currentSlug);

    const scored = filtered
      .map(e => ({exam: e, score: this.score(e)}))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(x => x.exam);

    this.related.set(scored);
  }

  private score(exam: ExamResponse): number {
    const title = (exam.title || '').toLowerCase();
    const slug = (exam.slug || '').toLowerCase();
    const currentTitle = (this.currentExam?.title || '').toLowerCase();
    const currentSlug = (this.currentExam?.slug || '').toLowerCase();

    const keywordBoost = (kw: string) => (title.includes(kw) || slug.includes(kw) ? 20 : 0);

    let s = 0;
    for (const kw of ['aws', 'azure', 'gcp', 'google', 'microsoft']) {
      if ((currentTitle.includes(kw) || currentSlug.includes(kw)) && (title.includes(kw) || slug.includes(kw))) {
        s += 50;
      }
      s += keywordBoost(kw);
    }

    const tokens = new Set(currentTitle.split(/\s+/).filter(Boolean));
    for (const t of tokens) {
      if (t.length >= 4 && title.includes(t)) s += 5;
    }

    return s;
  }
}

