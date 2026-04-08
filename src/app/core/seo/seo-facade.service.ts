import {Injectable, signal} from '@angular/core';
import {SeoService} from './seo.service';
import {SeoMeta} from './seo.model';

@Injectable({providedIn: 'root'})
export class SeoFacadeService {
  private readonly state = signal<SeoMeta | null>(null);
  readonly seo = this.state.asReadonly();

  constructor(private seoService: SeoService) {
  }

  set(meta: SeoMeta): void {
    const previous = this.state();
    if (previous?.jsonLdId) {
      this.seoService.removeJsonLd(previous.jsonLdId);
    }

    this.state.set(meta);

    if (meta.title) this.seoService.updateTitle(meta.title);
    if (meta.description) this.seoService.updateDescription(meta.description);
    if (meta.robots) this.seoService.updateRobots(meta.robots);
    if (meta.canonicalUrl) this.seoService.updateCanonical(meta.canonicalUrl);
    if (meta.openGraph) this.seoService.updateOpenGraph(meta.openGraph);
    if (meta.twitter) this.seoService.updateTwitter(meta.twitter);
    if (meta.jsonLd) this.seoService.setJsonLd(meta.jsonLdId || 'page', meta.jsonLd);
  }

  clearJsonLd(): void {
    const current = this.state();
    const id = current?.jsonLdId || 'page';
    this.seoService.removeJsonLd(id);
  }
}

