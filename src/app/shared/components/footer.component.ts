import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PersonalizationService} from '../../core/theme/personalization.service';
import {TranslatePipe} from '../pipes/translate.pipe';

type Language = {
  desc: string,
  name: string
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, TranslatePipe],
  template: `
    <footer class="app-footer sc-glass">
      <div class="footer-content sc-page">
        <p class="copyright">{{ 'footer.copyright' | translate: {year: currentYear} }}</p>
        <nav class="footer-links">
          <select
            class="form-control"
            [ngModel]="getLanguage()"
            (change)="changeLanguage($any($event.target).value)"
          >
            @for (lang of languages(); track lang) {
              <option [value]="lang.name" [selected]="getLanguage() == lang.name">
                {{ lang.desc }}
              </option>
            }
          </select>
          <a routerLink="/contato" class="footer-link">{{'footer.contact' | translate}}</a>
          <a routerLink="/termos-de-uso" class="footer-link">{{'footer.terms' | translate}}</a>
          <a routerLink="/politica-de-privacidade" class="footer-link">{{'footer.privacy' | translate}}</a>
        </nav>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      color: var(--muted);
      padding: var(--spacing-md) 0;
      border-top: 1px solid var(--border);
      margin-top: auto;
      position: relative;
      z-index: 10;
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      padding-left: var(--spacing-lg);
      padding-right: var(--spacing-lg);
    }

    .copyright {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
    }

    .footer-links {
      display: flex;
      gap: var(--spacing-lg);
    }

    .footer-link {
      color: var(--muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: var(--transition-fast);
      position: relative;
      z-index: 11;
    }

    .footer-link:hover {
      color: var(--text);
    }

    .form-control {
      color: var(--text-2);
      background: var(--surface);
      border: none;
      font-size: 14px;
      cursor: pointer;
    }

    @media (min-width: 640px) {
      .footer-content {
        flex-direction: row;
        justify-content: space-between;
      }
    }
  `]
})
export class FooterComponent {
  protected readonly personalization = inject(PersonalizationService);
  protected readonly currentYear = new Date().getFullYear();

  private readonly ENGLISH: Language = {
    desc: 'English',
    name: 'en-US',
  };

  private readonly PORTUGUESE: Language = {
    desc: 'Português',
    name: 'pt-BR',
  };

  protected languages(): Language[] {
    return [this.ENGLISH, this.PORTUGUESE];
  }

  protected getLanguage() {
    return this.personalization.getLanguage();
  }

  protected changeLanguage(value: string) {
    return this.personalization.setLanguage(value);
  }
}

