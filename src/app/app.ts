import {Component, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './core/theme/theme.service';
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

  protected readonly themeService = inject(ThemeService);

  toggleThemeMenu(): void {
    this.showThemeMenu.set(!this.showThemeMenu());
  }

  get language(): string {
    return this.themeService.getLanguage();
  }

  set language(lang: string) {
    this.themeService.setLanguage(lang as any);
  }
}
