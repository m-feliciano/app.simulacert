import {Component, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {PersonalizationService} from './core/theme/personalization.service';
import {LucideAngularModule, Palette} from 'lucide-angular';
import {TranslatePipe} from './shared/pipes/translate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly icons = {
    palette: Palette
  };

  showThemeMenu = signal(false);

  protected readonly personalization = inject(PersonalizationService);

  toggleThemeMenu(): void {
    this.showThemeMenu.set(!this.showThemeMenu());
  }

  get language(): string {
    return this.personalization.getLanguage();
  }

  set language(lang: string) {
    this.personalization.setLanguage(lang);
  }
}
