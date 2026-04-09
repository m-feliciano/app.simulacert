export interface SeoOpenGraph {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  siteName?: string;
}

export interface SeoTwitter {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title?: string;
  description?: string;
  image?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  robots?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  openGraph?: SeoOpenGraph;
  twitter?: SeoTwitter;
  jsonLd?: unknown;
  jsonLdId?: string;
}
