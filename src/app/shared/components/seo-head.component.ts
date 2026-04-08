import {Directive, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {SeoService} from '../../core/seo/seo.service';
import {SeoOpenGraph, SeoTwitter} from '../../core/seo/seo.model';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Directive({
  selector: '[seoHead]',
  standalone: true,
})
export class SeoHeadDirective implements OnInit, OnChanges, OnDestroy {
  @Input() seoTitle = '';
  @Input() seoDescription = '';
  @Input() seoRobots = 'index, follow';

  /** URL canônica para a página (se omitido, mantém o default do index.html). */
  @Input() seoCanonical = '';

  /** Open Graph overrides (se omitido, mantém o default do index.html). */
  @Input() seoOpenGraph: SeoOpenGraph | null = null;

  /** Twitter Cards overrides (se omitido, mantém o default do index.html). */
  @Input() seoTwitter: SeoTwitter | null = null;

  /** JSON-LD (structured data) para a página. Pode ser objeto ou array de objetos. */
  @Input() seoJsonLd: unknown | null = null;

  /** id estável para substituir/remover JSON-LD entre navegações */
  @Input() seoJsonLdId = 'page';

  constructor(
    private seoService: SeoService,
    private seoFacade: SeoFacadeService,
  ) {
  }

  ngOnChanges(): void {
    this.updateSeo();
  }

  ngOnInit(): void {
    this.updateSeo();
  }

  ngOnDestroy(): void {
    if (this.seoJsonLdId) {
      this.seoService.removeJsonLd(this.seoJsonLdId);
    }
  }

  private updateSeo(): void {
    const noBindingsProvided =
      !this.seoTitle &&
      !this.seoDescription &&
      !this.seoCanonical &&
      !this.seoOpenGraph &&
      !this.seoTwitter &&
      !this.seoJsonLd &&
      ((this.seoRobots ?? '') === 'index, follow') &&
      ((this.seoJsonLdId ?? '') === 'page');

    if (noBindingsProvided) {
      const meta = this.seoFacade.seo();
      if (!meta) return;

      if (meta.title) this.seoService.updateTitle(meta.title);
      if (meta.description) this.seoService.updateDescription(meta.description);
      if (meta.robots) this.seoService.updateRobots(meta.robots);
      if (meta.canonicalUrl) this.seoService.updateCanonical(meta.canonicalUrl);
      if (meta.openGraph) this.seoService.updateOpenGraph(meta.openGraph);
      if (meta.twitter) this.seoService.updateTwitter(meta.twitter);
      if (meta.jsonLd) this.seoService.setJsonLd(meta.jsonLdId || 'page', meta.jsonLd);
      return;
    }

    if (this.seoTitle) {
      this.seoService.updateTitle(this.seoTitle);
    }

    if (this.seoDescription) {
      this.seoService.updateDescription(this.seoDescription);
    }

    if (this.seoRobots) {
      this.seoService.updateRobots(this.seoRobots);
    }

    if (this.seoCanonical) {
      this.seoService.updateCanonical(this.seoCanonical);
    }

    if (this.seoOpenGraph) {
      this.seoService.updateOpenGraph(this.seoOpenGraph);
    }

    if (this.seoTwitter) {
      this.seoService.updateTwitter(this.seoTwitter);
    }

    if (this.seoJsonLd) {
      this.seoService.setJsonLd(this.seoJsonLdId || 'page', this.seoJsonLd);
    }
  }
}

