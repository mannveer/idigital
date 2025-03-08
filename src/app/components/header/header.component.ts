import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { ThemeService } from '../../services/theme.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header" [class.scrolled]="isScrolled">
      <div class="container">
        <div class="header-content">
          <a routerLink="/" class="logo">
            <i class="material-icons">storefront</i>
            <span>Digital Marketplace</span>
          </a>
          
          <nav class="nav-links">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <i class="material-icons">home</i>
              <span>Home</span>
            </a>
            <a routerLink="/products" routerLinkActive="active">
              <i class="material-icons">grid_view</i>
              <span>Products</span>
            </a>
            <a routerLink="/portal" routerLinkActive="active" class="nav-link purchases-link">
              <i class="fas fa-download"></i>
              My Purchases
            </a>
            <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="(isDarkMode$ | async) ? 'Switch to light mode' : 'Switch to dark mode'">
              <i class="material-icons">{{ (isDarkMode$ | async) ? 'light_mode' : 'dark_mode' }}</i>
            </button>
            <a routerLink="/cart" routerLinkActive="active" class="cart-link">
              <i class="material-icons">shopping_cart</i>
              <span class="cart-count" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
            </a>
          </nav>

          <button class="mobile-menu-btn" (click)="toggleMobileMenu()" [class.active]="isMobileMenuOpen" aria-label="Toggle mobile menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div class="mobile-menu" [class.open]="isMobileMenuOpen" (click)="closeMobileMenu()">
          <div class="mobile-menu-content" (click)="$event.stopPropagation()">
            <a routerLink="/" (click)="closeMobileMenu()">
              <i class="material-icons">home</i>
              <span>Home</span>
            </a>
            <a routerLink="/products" (click)="closeMobileMenu()">
              <i class="material-icons">grid_view</i>
              <span>Products</span>
            </a>
            <a routerLink="/portal" (click)="closeMobileMenu()" class="nav-link purchases-link">
              <i class="fas fa-download"></i>
              <span>My Purchases</span>
            </a>
            <a routerLink="/cart" (click)="closeMobileMenu()" class="cart-link">
              <i class="material-icons">shopping_cart</i>
              <span>Cart</span>
              @if (cartItemCount > 0) {
                <span class="cart-badge">{{ cartItemCount }}</span>
              }
            </a>
            <button class="theme-toggle" (click)="toggleTheme()">
              <i class="material-icons">{{ (isDarkMode$ | async) ? 'light_mode' : 'dark_mode' }}</i>
              <span>{{ (isDarkMode$ | async) ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      -webkit-tap-highlight-color: transparent;
      height: 70px;

      @media (max-width: 480px) {
        height: 60px;
      }
    }

    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: var(--surface-color);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border-color);
      transition: all 0.3s ease;
      z-index: 1000;

      @media (max-width: 480px) {
        height: 60px;
      }
    }

    .header.scrolled {
      height: 60px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

      @media (max-width: 480px) {
        height: 56px;
      }
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 100%;

      @media (max-width: 480px) {
        padding: 0 1rem;
      }
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--primary-color);
      font-weight: 700;
      font-size: 1.25rem;
      transition: all 0.3s ease;
      white-space: nowrap;

      @media (hover: hover) {
        &:hover {
          transform: translateX(3px);
        }
      }

      i {
        font-size: 28px;
      }

      @media (max-width: 768px) {
        font-size: 1.125rem;
        
        i {
          font-size: 24px;
        }
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-left: auto;

      a, button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: var(--text-color);
        font-weight: 500;
        padding: 0.5rem;
        border-radius: 0.5rem;
        transition: all 0.3s ease;
        position: relative;
        white-space: nowrap;

        i {
          font-size: 1.25rem;
        }

        @media (hover: hover) {
          &:hover {
            color: var(--primary-color);
            background: var(--hover-color);
          }
        }

        &.active {
          color: var(--primary-color);
          background: var(--hover-color);
        }

        @media (max-width: 768px) {
          padding: 0.375rem;
          
          span {
            display: none;
          }
        }
      }

      @media (max-width: 480px) {
        display: none;
      }
    }

    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      color: var(--text-color);
      transition: all 0.3s ease;

      @media (hover: hover) {
        &:hover {
          background: var(--hover-color);
          transform: rotate(15deg);
        }
      }

      i {
        font-size: 1.25rem;
      }

      @media (max-width: 768px) {
        padding: 0.375rem;
      }
    }

    .cart-link {
      position: relative;
    }

    .cart-count {
      position: absolute;
      top: -5px;
      right: -5px;
      background: var(--primary-color);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      min-width: 20px;
      text-align: center;
    }

    .mobile-menu-btn {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 24px;
      height: 18px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-left: 0.5rem;
      z-index: 1001;

      span {
        width: 100%;
        height: 2px;
        background: var(--text-color);
        transition: all 0.3s ease;
        transform-origin: left;
      }

      &.active {
        span:first-child {
          transform: rotate(45deg);
        }
        span:nth-child(2) {
          opacity: 0;
          transform: translateX(-100%);
        }
        span:last-child {
          transform: rotate(-45deg);
        }
      }

      @media (max-width: 480px) {
        display: flex;
      }
    }

    .mobile-menu {
      display: none;
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;

      &.open {
        opacity: 1;
        visibility: visible;

        .mobile-menu-content {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @media (max-width: 480px) {
        display: block;
      }
    }

    .mobile-menu-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      background: var(--surface-color);
      padding: 0.75rem;
      transform: translateY(-100%);
      transition: all 0.3s ease;
      opacity: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      a, button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        width: 100%;
        color: var(--text-color);
        text-decoration: none;
        font-weight: 500;
        border: none;
        background: var(--surface-color);
        text-align: left;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
        position: relative;

        i {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
          color: var(--primary-color);
        }

        span {
          font-size: 0.9375rem;
          display: block !important;
        }

        .cart-badge {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: var(--primary-color);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          min-width: 20px;
          text-align: center;
        }

        @media (hover: hover) {
          &:hover {
            background: var(--hover-color);
            color: var(--primary-color);
          }
        }

        &:active {
          transform: scale(0.98);
        }

        &.active {
          background: var(--hover-color);
          color: var(--primary-color);
        }
      }

      .theme-toggle {
        border-top: 1px solid var(--border-color);
        margin-top: 0.25rem;
        padding-top: 0.75rem;
      }
    }

    @media (max-width: 768px) {
      .logo span {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .header {
        position: fixed;
        z-index: 1000;
      }

      .mobile-menu {
        z-index: 999;
      }

      .mobile-menu-btn {
        z-index: 1001;
      }

      .nav-links {
        display: none;
      }

      .mobile-menu {
        display: block;
      }
    }

    @media (hover: none) {
      a, button {
        &:active {
          transform: scale(0.98);
        }
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount = 0;
  isScrolled = false;
  isMobileMenuOpen = false;
  isDarkMode$: Observable<boolean>;
  private cartSubscription!: Subscription;

  constructor(
    private cartService: CartService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.isDarkMode$ = this.themeService.isDarkMode$;

    // Subscribe to router events to handle scrolling
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
        this.closeMobileMenu();
      }
    });
  }

  ngOnInit() {
    this.cartSubscription = this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  private handleClickOutside(event: MouseEvent) {
    const mobileMenu = document.querySelector('.mobile-menu-content');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (this.isMobileMenuOpen && 
        mobileMenu && 
        mobileMenuBtn && 
        !mobileMenu.contains(event.target as Node) && 
        !mobileMenuBtn.contains(event.target as Node)) {
      this.closeMobileMenu();
    }
  }
} 