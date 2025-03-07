import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <a routerLink="/" class="logo">
            <i class="material-icons">store</i>
            <span>Digital Marketplace</span>
          </a>
          <nav class="nav-links">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
            <a routerLink="/products" routerLinkActive="active">Products</a>
            <a routerLink="/cart" routerLinkActive="active" class="cart-link">
              <i class="material-icons">shopping_cart</i>
              <span class="cart-count" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      height: 100%;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--primary-color);
      font-weight: 600;
      font-size: 1.25rem;

      i {
        font-size: 24px;
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;

      a {
        text-decoration: none;
        color: var(--text-color);
        font-weight: 500;
        transition: color 0.3s ease;
        position: relative;

        &:hover {
          color: var(--primary-color);
        }

        &.active {
          color: var(--primary-color);
        }
      }
    }

    .cart-link {
      display: flex;
      align-items: center;
      position: relative;
    }

    .cart-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background: var(--primary-color);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      min-width: 20px;
      text-align: center;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .logo span {
        display: none;
      }

      .nav-links {
        gap: 1rem;
      }
    }
  `]
})
export class HeaderComponent {
  cartItemCount = 0;

  constructor(private cartService: CartService) {
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
  }
} 