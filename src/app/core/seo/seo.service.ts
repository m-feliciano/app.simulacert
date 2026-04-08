import {DOCUMENT, Inject, Injectable} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';

@Injectable({providedIn: 'root'})
export class SeoService {

  constructor(private title: Title,
              private meta: Meta,
              @Inject(DOCUMENT) private document: Document) {
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
    let link = this.document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}
