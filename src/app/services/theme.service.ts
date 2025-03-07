import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      // Check if user has a preferred theme stored
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDarkMode.next(savedTheme === 'dark');
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkMode.next(prefersDark);
      }

      this.isDarkMode.subscribe(isDark => {
        if (isDark) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      });
    }
  }

  isDarkTheme(): Observable<boolean> {
    return this.isDarkMode.asObservable();
  }

  toggleTheme(): void {
    this.isDarkMode.next(!this.isDarkMode.value);
  }
} 