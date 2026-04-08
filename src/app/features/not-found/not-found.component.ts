import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {SeoHeadDirective} from '../../shared/components/seo-head.component';
import {SeoFactoryService} from '../../core/seo/seo-factory.service';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, SeoHeadDirective],
  template: `
    <div seoHead>
      <main class="nf" aria-labelledby="nf-title">
        <section class="nf__card" role="region" aria-label="Página 404">
          <div class="nf__badge" aria-hidden="true">404</div>

          <h1 id="nf-title" class="nf__title">Página não encontrada</h1>
          <p class="nf__subtitle">
            A página que você tentou acessar não existe ou foi movida. Verifique o endereço ou explore outras seções do site.
          </p>

          <div class="nf__actions" aria-label="Ações">
            <a routerLink="/exams" class="nf__btn nf__btn--primary">Ver exames</a>
            <a routerLink="/" class="nf__btn nf__btn--ghost">Voltar ao início</a>
          </div>

          <nav class="nf__links" aria-label="Links úteis">
            <a routerLink="/how-it-works" class="nf__link">Como funciona</a>
            <a routerLink="/contato" class="nf__link">Contato</a>
          </nav>
        </section>
      </main>
    </div>
  `
})
export class NotFoundComponent {
  constructor(private seoFactory: SeoFactoryService,
              private seoFacade: SeoFacadeService) {

    const seo = this.seoFactory.website({
      title: 'Página não encontrada (404) | SimulaCert',
      description: 'A página que você tentou acessar não existe.',
      canonicalPath: '/404',
      robots: 'noindex, follow',
      jsonLdId: 'not-found',
    });

    this.seoFacade.set(seo);
  }
}

