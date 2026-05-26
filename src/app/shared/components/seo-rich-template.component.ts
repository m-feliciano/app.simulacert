import {Component, computed, DestroyRef, inject, Input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ExamResponse} from '../../api/domain';
import {getExamSeoContent} from '../../features/exams/exam-seo-content.registry';
import {TranslatePipe} from '../pipes/translate.pipe';
import {I18nService} from '../../core/i18n/i18n.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-seo-rich-template',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    @if (exam) {
      @if (content(); as seo) {
        <section class="seo" [attr.aria-label]="'seo.ariaLabel' | translate">

          <h1>
            {{ 'seo.simuladoTitle' | translate: {exam: exam.title} }}
          </h1>

          <div class="lead">
            @for (p of seo.intro; track $index) {
              <p>{{ p }}</p>
            }
            <p>
              {{ 'seo.searchIntention' | translate: {keyword: primaryKeyword()} }}
            </p>
          </div>

          <h2>{{ 'seo.howHelps' | translate }}</h2>
          <p>
            {{ 'seo.howHelpsContent' | translate }}
          </p>

          <h2>{{ 'seo.mainTopics' | translate }}</h2>
          <ul>
            @for (topic of seo.studyTopics; track $index) {
              <li>{{ topic }}</li>
            }
          </ul>

          <h2>{{ 'seo.strategy' | translate }}</h2>
          <ol>
            @for (tip of seo.examStrategies; track $index) {
              <li>{{ tip }}</li>
            }
          </ol>

          @if (seo.exampleQuestion) {
            <h2>{{ 'seo.exampleQuestion' | translate: {exam: exam.title} }}</h2>

            <div class="question-box">
              <p>{{ seo.exampleQuestion.question }}</p>

              <ul>
                @for (opt of seo.exampleQuestion.options; track $index) {
                  <li>{{ String.fromCharCode(65 + $index) }}) {{ opt }}</li>
                }
              </ul>

              <p>
                <strong>{{ 'seo.correctAnswer' | translate }}:</strong>
                {{ seo.exampleQuestion.correctAnswer }}
              </p>

              <p class="explanation">
                {{ seo.exampleQuestion.explanation }}
              </p>
            </div>
          }
          <h2>{{ 'seo.useEfficiently' | translate }}</h2>
          <p>
            {{ 'seo.useEfficientlyContent' | translate }}
          </p>

          <h2>{{ 'seo.continueLearning' | translate }}</h2>
          <p>
            {{ 'seo.continueLearningContent' | translate: {link: 'exams'} }}
            <a routerLink="/exams">{{ 'seo.fullExamList' | translate }}</a>
            {{ 'seo.continueLearningContent2' | translate }}
          </p>

          <h2>{{ 'seo.faq' | translate: {exam: exam.title} }}</h2>

          <div class="faq">
            @for (item of seo.faq; track $index) {
              <details>
                <summary>{{ item.question }}</summary>
                <div class="answer">
                  <p>{{ item.answer }}</p>
                </div>
              </details>
            }
          </div>

          <h2>{{ 'seo.aboutContent' | translate }}</h2>
          <p>
            {{ 'seo.aboutContentBody' | translate }}
          </p>

        </section>
      }
    }
  `,
  styles: [`
    .seo {
      margin-top: 40px;
      padding-top: 28px;
      border-top: 1px solid rgba(0,0,0,0.08);
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    .lead p {
      line-height: 1.8;
      margin-bottom: 12px;
    }

    h2 {
      margin-top: 28px;
      margin-bottom: 10px;
    }

    ul, ol {
      padding-left: 20px;
      line-height: 1.8;
    }

    .question-box {
      background: var(--color-bg-secondary);
      padding: 16px;
      border-radius: 10px;
      border: 1px solid rgba(0,0,0,0.06);
    }

    .explanation {
      margin-top: 10px;
      font-style: italic;
    }

    .faq details {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 8px;
      background: var(--color-bg-secondary);
    }

    .faq summary {
      font-weight: bold;
      cursor: pointer;
    }
  `]
})
export class SeoRichTemplateComponent {
  @Input({required: true}) exam!: ExamResponse;
  private readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = signal('pt-BR');

  constructor() {
    this.language.set(this.i18n.getLanguage());
    this.i18n.onLanguageChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((language) => this.language.set(language));
  }

  content = computed(() => {
    this.language();
    return getExamSeoContent(this.exam, this.i18n);
  });

  primaryKeyword = computed(() => {
    return this.content().keywords?.[0] || `simulado ${this.exam?.title || ''}`.trim();
  });
  protected readonly String = String;
}
