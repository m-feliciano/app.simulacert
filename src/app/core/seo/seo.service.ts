import {DOCUMENT, Inject, Injectable} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {SeoOpenGraph, SeoTwitter} from './seo.model';

@Injectable({providedIn: 'root'})
export class SeoService {

  constructor(private readonly title: Title,
              private readonly meta: Meta,
              @Inject(DOCUMENT) private readonly document: Document) {
  }

  updateTitle(title: string) {
    this.title.setTitle(title);
  }

  updateDescription(desc: string) {
    this.meta.updateTag({name: 'description', content: desc});
  }

  updateRobots(robots: string) {
    this.meta.updateTag({name: 'robots', content: robots});
  }

  updateCanonical(url: string) {
    const normalized = this.normalizeUrl(url);
    let link = this.document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', normalized);
    this.updateMetaProperty('og:url', normalized);
  }

  updateOpenGraph(og: SeoOpenGraph): void {
    if (og.type) this.updateMetaProperty('og:type', og.type);
    if (og.siteName) this.updateMetaProperty('og:site_name', og.siteName);
    if (og.title) this.updateMetaProperty('og:title', og.title);
    if (og.description) this.updateMetaProperty('og:description', og.description);
    if (og.url) this.updateMetaProperty('og:url', og.url);
    if (og.image) this.updateMetaProperty('og:image', og.image);
  }

  updateTwitter(twitter: SeoTwitter): void {
    if (twitter.card) this.updateMetaName('twitter:card', twitter.card);
    if (twitter.title) this.updateMetaName('twitter:title', twitter.title);
    if (twitter.description) this.updateMetaName('twitter:description', twitter.description);
    if (twitter.image) this.updateMetaName('twitter:image', twitter.image);
  }

  updateMetaName(name: string, content: string): void {
    this.meta.updateTag({name, content});
  }

  updateMetaProperty(property: string, content: string): void {
    this.meta.updateTag({property, content} as any);
  }

  setJsonLd(id: string, data: unknown): void {
    const scriptId = this.normalizeJsonLdId(id);

    const selectorId = (globalThis as any)?.CSS?.escape === 'function'
      ? (globalThis as any).CSS.escape(scriptId)
      : scriptId.replaceAll(/([^a-zA-Z0-9_-])/g, String.raw`\$1`);

    const existing = this.document.head.querySelector(`script#${selectorId}`) as HTMLScriptElement | null;

    const script = existing ?? this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.text = JSON.stringify(data);

    if (!existing) {
      this.document.head.appendChild(script);
    }
  }

  removeJsonLd(id: string): void {
    const scriptId = this.normalizeJsonLdId(id);

    const selectorId = typeof (globalThis as any)?.CSS?.escape === 'function'
      ? (globalThis as any).CSS.escape(scriptId)
      : scriptId.replaceAll(/([^a-zA-Z0-9_-])/g, String.raw`\$1`);

    const existing = this.document.head.querySelector(`script#${selectorId}`);
    existing?.remove();
  }

  private normalizeJsonLdId(id: string): string {
    const raw = id.startsWith('ld-json:') ? id : `ld-json-${id}`;
    return raw.replaceAll(/[^a-zA-Z0-9_-]/g, '-');
  }

  private normalizeUrl(url: string): string {
    const trimmed = (url || '').trim();
    if (!trimmed) return trimmed;

    try {
      const u = new URL(trimmed);
      if (u.pathname !== '/' && trimmed.endsWith('/')) {
        return trimmed.replace(/\/+$/, '');
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }
}
