import {Directive, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Directive({
  selector: '[seoHead]',
  standalone: true,
})
export class SeoHeadDirective implements OnInit, OnChanges, OnDestroy {
  constructor(
    private seoFacade: SeoFacadeService,
  ) {
  }

  ngOnChanges(): void {
    this.seoFacade.update();
  }

  ngOnInit(): void {
    this.seoFacade.update();
  }

  ngOnDestroy(): void {
    this.seoFacade.clearJsonLd();
  }
}

