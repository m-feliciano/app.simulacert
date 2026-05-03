import {Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ThemeService} from './core/theme/theme.service';
import {LucideAngularModule, Palette} from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly icons = {
    palette: Palette
  };

  showThemeMenu = signal(false);
  public themeService = inject(ThemeService);

  toggleThemeMenu(): void {
    this.showThemeMenu.set(!this.showThemeMenu());
  }
}
