import {Directive, effect, inject, OnDestroy} from '@angular/core';
import {SeoFacadeService} from '../../core/seo/seo-facade.service';

@Directive({
  selector: '[seoHead]',
  standalone: true,
})
export class SeoHeadDirective implements OnDestroy {

  private readonly seoFacade = inject(SeoFacadeService);

  private readonly seoEffect = effect(() => {
    this.seoFacade.update();
  });

  ngOnDestroy(): void {
    this.seoFacade.clearJsonLd();
  }
}

