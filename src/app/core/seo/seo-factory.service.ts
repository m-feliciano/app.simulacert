import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {SeoMeta} from './seo.model';

@Injectable({providedIn: 'root'})
export class SeoFactoryService {

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
  }

  origin(): string {
    const envOrigin = (globalThis as any)?.process?.env?.['APP_ORIGIN'] as string | undefined;
    if (envOrigin) {
      const normalized = envOrigin.trim().replace(/\/$/, '');
      if (normalized) return normalized;
    }

    const docAny = this.document as any;
    const loc = docAny?.location;
    const origin = loc && typeof loc === 'object' ? loc.origin : undefined;
    if (origin && typeof origin === 'string') {
      return origin;
    }

    return 'https://app.simulacert.com';
  }

  canonicalFromPath(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.origin()}${normalized}`;
  }

  build(meta: SeoMeta): SeoMeta {
    const canonicalUrl = meta.canonicalUrl || (meta.canonicalPath ? this.canonicalFromPath(meta.canonicalPath) : '');

    return {
      ...meta,
      canonicalUrl,
      openGraph: meta.openGraph
        ? {
          ...meta.openGraph,
          title: meta.openGraph.title ?? meta.title,
          description: meta.openGraph.description ?? meta.description,
          url: meta.openGraph.url ?? canonicalUrl,
          siteName: meta.openGraph.siteName ?? 'SimulaCert',
        }
        : undefined,
      twitter: meta.twitter
        ? {
          ...meta.twitter,
          title: meta.twitter.title ?? meta.title,
          description: meta.twitter.description ?? meta.description,
        }
        : undefined,
    };
  }

  website(meta: {
    title: string;
    description: string;
    canonicalPath: string;
    robots?: string;
    imagePath?: string;
    jsonLd?: unknown;
    jsonLdId?: string;
  }): SeoMeta {
    const canonicalUrl = this.canonicalFromPath(meta.canonicalPath);
    const image = meta.imagePath ? `${this.origin()}${meta.imagePath}` : `${this.origin()}/simulacert-logo.svg`;

    return this.build({
      title: meta.title,
      description: meta.description,
      robots: meta.robots,
      canonicalUrl,
      openGraph: {
        type: 'website',
        url: canonicalUrl,
        image,
        siteName: 'SimulaCert',
      },
      twitter: {
        card: 'summary_large_image',
        image,
      },
      jsonLd: meta.jsonLd,
      jsonLdId: meta.jsonLdId,
    });
  }
}

