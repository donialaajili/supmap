import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  enableLight() {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }

  enableDark() {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }

  toggleTheme(isDark: boolean) {
    if (isDark) {
      localStorage.setItem('theme', 'dark');
      this.enableDark();
    } else {
      localStorage.setItem('theme', 'light');
      this.enableLight();
    }
  }

  initTheme() {
    const saved = localStorage.getItem('theme');
    this.toggleTheme(saved === 'dark');
  }
}

