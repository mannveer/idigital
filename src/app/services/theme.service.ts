import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.darkModeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Check if user has a preferred theme
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme) {
        this.setDarkMode(savedTheme === 'dark');
      } else {
        this.setDarkMode(prefersDark);
      }

      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          this.setDarkMode(e.matches);
        }
      });
    }
  }

  public toggleDarkMode(): void {
    this.setDarkMode(!this.darkModeSubject.value);
  }

  public setDarkMode(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      this.darkModeSubject.next(isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      if (isDark) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#ffffff');
      }
    }
  }
} 