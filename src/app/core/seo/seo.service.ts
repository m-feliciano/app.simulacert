import {Injectable, Renderer2} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';

@Injectable({providedIn: 'root'})
export class SeoService {

  constructor(private title: Title, private meta: Meta) {
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

  updateCanonical(url: string, renderer: Renderer2) {
    const link: HTMLLinkElement = renderer.createElement('link');
    renderer.setAttribute(link, 'rel', 'canonical');
    renderer.setAttribute(link, 'href', url);

    const old = document.head.querySelector('link[rel=canonical]');
    if (old) renderer.removeChild(document.head, old);
    renderer.appendChild(document.head, link);
  }
}
