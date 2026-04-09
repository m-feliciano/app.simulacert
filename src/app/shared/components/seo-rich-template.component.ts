import {Component, Input, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ExamResponse} from '../../api/domain';
import {getExamSeoContent} from '../../features/exams/exam-seo-content.registry';

@Component({
  selector: 'app-seo-rich-template',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (exam) {
      <section class="seo" aria-label="Simulado e guia completo">

        <h1>
          Simulado {{ exam.title }} gratuito com questões comentadas
        </h1>

        <div class="lead">
          @for (p of content().intro; track $index) {
            <p>{{ p }}</p>
          }
          <p>
            Se você está procurando por <strong>{{ primaryKeyword() }}</strong>,
            este simulador foi feito para acelerar sua aprovação com prática direcionada.
          </p>
        </div>

        <h2>Como este simulado ajuda você a passar</h2>
        <p>
          Diferente de conteúdos genéricos, aqui você pratica com foco no formato real da prova,
          entendendo o motivo de cada resposta. Isso reduz erros recorrentes e melhora sua tomada de decisão.
        </p>

        <h2>Principais tópicos cobrados na prova</h2>
        <ul>
          @for (topic of content().studyTopics; track $index) {
            <li>{{ topic }}</li>
          }
        </ul>

        <h2>Estratégia para aumentar sua taxa de acertos</h2>
        <ol>
          @for (tip of content().examStrategies; track $index) {
            <li>{{ tip }}</li>
          }
        </ol>

        @if (content().exampleQuestion) {
          <h2>Exemplo de questão do {{ exam.title }}</h2>

          <div class="question-box">
            <p>{{ content().exampleQuestion?.question }}</p>

            <ul>
              @for (opt of content().exampleQuestion?.options; track $index) {
                <li>{{ String.fromCharCode(65 + $index) }}) {{ opt }}</li>
              }
            </ul>

            <p>
              <strong>Resposta correta:</strong>
              {{ content().exampleQuestion?.correctAnswer }}
            </p>

            <p class="explanation">
              {{ content().exampleQuestion?.explanation }}
            </p>
          </div>
        }
        <h2>Como usar o simulado de forma eficiente</h2>
        <p>
          Use ciclos curtos de prática e revisão:
          <strong>simulado → análise de erros → reforço → novo simulado</strong>.
        </p>

        <h2>Continue seus estudos</h2>
        <p>
          Explore outros simulados disponíveis em
          <a routerLink="/exams">lista completa de exames</a>
          e aumente sua cobertura de tópicos.
        </p>

        <h2>Perguntas frequentes sobre {{ exam.title }}</h2>

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

        <h2>Sobre este conteúdo</h2>
        <p>
          Este material foi estruturado com base nos tópicos oficiais da certificação e nos padrões mais comuns
          de questões cobradas em provas de cloud computing.
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
      background: #f8f9fa;
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

  content = computed(() => getExamSeoContent(this.exam));

  primaryKeyword = computed(() => {
    const c = this.content();
    return c.keywords?.[0] || `simulado ${this.exam?.title || ''}`.trim();
  });
  protected readonly String = String;
}
