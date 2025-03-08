import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-page">
      <div class="container">
        <header class="cart-header">
          <h1>Your Cart</h1>
          <p class="cart-count" *ngIf="cartItems.length > 0">{{ cartItems.length }} {{ cartItems.length === 1 ? 'item' : 'items' }}</p>
        </header>

        @if (cartItems.length > 0) {
          <div class="cart-layout">
            <div class="cart-items">
              @for (item of cartItems; track item.product.id) {
                <div class="cart-item" @slideIn>
                  <div class="item-image-container">
                    <img [src]="item.product.thumbnailUrl" [alt]="item.product.name" class="item-image">
                    <div class="item-category">{{ item.product.category }}</div>
                  </div>
                  <div class="item-details">
                    <div class="item-info">
                      <h3 [routerLink]="['/product', item.product.id]">{{ item.product.name }}</h3>
                      <p class="item-meta">by {{ item.product.author }}</p>
                      <div class="item-type">
                        <i class="material-icons">description</i>
                        <span>{{ item.product.fileType }} • {{ item.product.fileSize }}</span>
                      </div>
                    </div>
                    <div class="item-actions">
                      <div class="quantity-controls">
                        <button 
                          class="quantity-btn"
                          (click)="updateQuantity(item.product.id, item.quantity - 1)" 
                          [disabled]="item.quantity <= 1"
                        >
                          <i class="material-icons">remove</i>
                        </button>
                        <span class="quantity">{{ item.quantity }}</span>
                        <button 
                          class="quantity-btn"
                          (click)="updateQuantity(item.product.id, item.quantity + 1)"
                        >
                          <i class="material-icons">add</i>
                        </button>
                      </div>
                      <div class="price-info">
                        <p class="item-price">{{ item.product.price | currency }}</p>
                        <button class="remove-button" (click)="removeFromCart(item.product.id)">
                          <i class="material-icons">delete_outline</i>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div class="cart-summary">
              <h2>Order Summary</h2>
              <div class="summary-row">
                <span>Subtotal</span>
                <span>\${{ calculateSubtotal().toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Tax (10%)</span>
                <span>\${{ calculateTax().toFixed(2) }}</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>\${{ calculateTotal().toFixed(2) }}</span>
              </div>
              <button class="checkout-btn" (click)="proceedToCheckout()">
                <span>Proceed to Checkout</span>
                <i class="material-icons">arrow_forward</i>
              </button>
            </div>
          </div>
        } @else {
          <div class="empty-cart" @fadeIn>
            <div class="empty-cart-content">
              <i class="material-icons">shopping_cart</i>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any digital assets to your cart yet.</p>
              <a routerLink="/" class="continue-shopping">
                <i class="material-icons">arrow_back</i>
                <span>Continue Shopping</span>
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      min-height: 100vh;
      padding: 2rem 0;
      background: var(--background-color);
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .cart-header {
      margin-bottom: 2rem;
      text-align: center;

      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: 0.5rem;
      }

      .cart-count {
        font-size: 1.1rem;
        color: var(--text-color-secondary);
      }
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: start;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .cart-item {
      display: flex;
      gap: 1.5rem;
      padding: 1.5rem;
      background: var(--surface-color);
      border-radius: 1rem;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .item-image-container {
      position: relative;
      width: 180px;
      height: 180px;
      flex-shrink: 0;
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .item-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-category {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      padding: 0.5rem 1rem;
      background: var(--surface-color);
      backdrop-filter: blur(8px);
      border-radius: 2rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--primary-color);
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .item-info {
      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
        margin: 0 0 0.5rem;
        cursor: pointer;
        transition: color 0.3s ease;

        &:hover {
          color: var(--primary-color);
        }
      }
    }

    .item-meta {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .item-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-color-secondary);
      font-size: 0.875rem;

      i {
        font-size: 1.25rem;
      }
    }

    .item-actions {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 1.5rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      background: var(--hover-color);
      border-radius: 0.5rem;
    }

    .quantity-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border: none;
      background: var(--surface-color);
      color: var(--text-color);
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: var(--primary-color);
        color: white;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      i {
        font-size: 1.25rem;
      }
    }

    .quantity {
      font-weight: 600;
      color: var(--text-color);
      min-width: 1.5rem;
      text-align: center;
    }

    .price-info {
      text-align: right;
    }

    .item-price {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .remove-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      background: var(--hover-color);
      color: var(--text-color-secondary);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        color: var(--error-color);
        background: rgba(var(--error-color), 0.1);
      }

      i {
        font-size: 1.25rem;
      }
    }

    .cart-summary {
      position: sticky;
      top: 90px;
    }

    .summary-card {
      padding: 2rem;
      background: var(--surface-color);
      border-radius: 1rem;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 1.5rem;
      }
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-color);
      font-size: 1rem;

      &.total {
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
        font-weight: 600;
        font-size: 1.25rem;
      }
    }

    .shipping-info {
      text-align: right;

      .free-shipping {
        color: var(--success-color);
        font-weight: 600;
      }

      .shipping-note {
        display: block;
        font-size: 0.875rem;
        color: var(--text-color-secondary);
      }
    }

    .checkout-btn {
      width: 100%;
      padding: 1.25rem;
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
      margin-top: 1.5rem;
    }

    .checkout-btn:hover {
      background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(99, 102, 241, 0.3);
    }

    .checkout-btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
    }

    .checkout-btn i {
      font-size: 1.25rem;
    }

    .empty-cart {
      padding: 4rem 0;
      text-align: center;
    }

    .empty-cart-content {
      max-width: 400px;
      margin: 0 auto;

      i {
        font-size: 4rem;
        color: var(--text-color-secondary);
        margin-bottom: 1.5rem;
      }

      h2 {
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 1rem;
      }

      p {
        color: var(--text-color-secondary);
        margin-bottom: 2rem;
      }
    }

    .continue-shopping {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      background: var(--primary-color);
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        background: var(--primary-color-hover);
        transform: translateY(-2px);
      }

      i {
        font-size: 1.25rem;
      }
    }

    @media (max-width: 1024px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }

      .cart-summary {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .cart-header h1 {
        font-size: 2rem;
      }

      .cart-item {
        flex-direction: column;
      }

      .item-image-container {
        width: 100%;
        height: 240px;
      }

      .item-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .price-info {
        text-align: left;
      }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-20px)', opacity: 0 }),
        animate('300ms ease', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  calculateSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.1;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }
} 