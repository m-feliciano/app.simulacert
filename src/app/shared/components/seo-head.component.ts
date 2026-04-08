import {Directive, Input, OnChanges, OnInit, Renderer2} from '@angular/core';
import {SeoService} from '../../core/seo/seo.service';

@Directive({
  selector: '[seoHead]',
  standalone: true,
})
export class SeoHeadDirective implements OnInit, OnChanges {
  @Input() seoTitle = '';
  @Input() seoDescription = '';
  @Input() seoRobots = 'index, follow';
  // SEO canonical is the preferred URL for the page
  @Input() seoCanonical = '';

  constructor(
    private seoService: SeoService
  ) {
  }

  ngOnChanges(): void {
    this.updateSeo();
  }

  ngOnInit(): void {
    this.updateSeo();
  }

  private updateSeo(): void {
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
  }
}

