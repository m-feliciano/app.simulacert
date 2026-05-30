import {Component, inject, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FontFamily, FontSize, PersonalizationService, ThemeMode} from './core/theme/personalization.service';
import {LucideAngularModule, Palette} from 'lucide-angular';
import {TranslatePipe} from './shared/pipes/translate.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  readonly icons = {
    palette: Palette
  };

  protected showThemeMenu = signal(false);
  private readonly personalization = inject(PersonalizationService);

  ngOnInit(): void {
    globalThis.document.documentElement.lang = this.language;
  }

  toggleThemeMenu(): void {
    this.showThemeMenu.set(!this.showThemeMenu());
  }

  get language(): string {
    return this.personalization.getLanguage();
  }

  set language(lang: string) {
    this.personalization.setLanguage(lang);
  }

  get theme() {
    return this.personalization.themeMode();
  }

  set theme(theme: ThemeMode) {
    this.personalization.setTheme(theme);
  }

  get fontSize() {
    return this.personalization.fontSize();
  }

  set fontSize(font: FontSize) {
    this.personalization.setFontSize(font);
  }

  set fontFamily(font: FontFamily) {
    this.personalization.setFontFamily(font);
  }

  get fontFamily() {
    return this.personalization.fontFamily();
  }
}
