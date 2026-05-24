import {Component, Input, computed, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ExamResponse} from '../../api/domain';
import {getExamSeoContent} from '../../features/exams/exam-seo-content.registry';
import {TranslatePipe} from '../pipes/translate.pipe';
import {I18nService} from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-seo-rich-template',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    @if (exam) {
      <section class="seo" [attr.aria-label]="'seo.ariaLabel' | translate">

        <h1>
          {{ 'seo.simuladoTitle' | translate: {exam: exam.title} }}
        </h1>

        <div class="lead">
          @for (p of content().intro; track $index) {
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
          @for (topic of content().studyTopics; track $index) {
            <li>{{ topic }}</li>
          }
        </ul>

        <h2>{{ 'seo.strategy' | translate }}</h2>
        <ol>
          @for (tip of content().examStrategies; track $index) {
            <li>{{ tip }}</li>
          }
        </ol>

        @if (content().exampleQuestion) {
          <h2>{{ 'seo.exampleQuestion' | translate: {exam: exam.title} }}</h2>

          <div class="question-box">
            <p>{{ content().exampleQuestion?.question }}</p>

            <ul>
              @for (opt of content().exampleQuestion?.options; track $index) {
                <li>{{ String.fromCharCode(65 + $index) }}) {{ opt }}</li>
              }
            </ul>

            <p>
              <strong>{{ 'seo.correctAnswer' | translate }}:</strong>
              {{ content().exampleQuestion?.correctAnswer }}
            </p>

            <p class="explanation">
              {{ content().exampleQuestion?.explanation }}
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
          @for (item of content().faq; track $index) {
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

    .subtitle {
      font-size: 16px;
      color: var(--color-text-secondary);
      margin-bottom: 20px;
    }

    .cta {
      background: var(--color-bg-secondary);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      border: 1px solid rgba(0,0,0,0.08);
    }

    .cta-button {
      display: inline-block;
      margin-top: 10px;
      padding: 10px 16px;
      border-radius: 8px;
      background: var(--color-primary);
      color: white;
      text-decoration: none;
      font-weight: bold;
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

  content = computed(() => getExamSeoContent(this.exam, this.i18n));

  primaryKeyword = computed(() => {
    const c = this.content();
    return c.keywords?.[0] || `simulado ${this.exam?.title || ''}`.trim();
  });
  protected readonly String = String;
}
