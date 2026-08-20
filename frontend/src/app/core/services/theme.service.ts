import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(true);
  isDarkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('gaara_theme');
    if (saved) {
      this.setTheme(saved === 'dark');
    } else {
      this.setTheme(true); // Padrão Dark Mode
    }
  }

  toggleTheme(): void {
    this.setTheme(!this.darkModeSubject.value);
  }

  setTheme(isDark: boolean): void {
    this.darkModeSubject.next(isDark);
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gaara_theme', theme);
  }
}
