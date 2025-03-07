import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1 class="cart-title">Shopping Cart</h1>
      @if (cartItems.length > 0) {
        <div class="cart-content">
          <div class="cart-items">
            @for (item of cartItems; track item.product.id) {
              <div class="cart-item">
                <img [src]="item.product.thumbnailUrl" [alt]="item.product.name" class="item-image">
                <div class="item-details">
                  <h3>{{ item.product.name }}</h3>
                  <p class="item-price">{{ item.product.price | currency }}</p>
                  <div class="quantity-controls">
                    <button (click)="updateQuantity(item.product.id, item.quantity - 1)" [disabled]="item.quantity <= 1">-</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="updateQuantity(item.product.id, item.quantity + 1)">+</button>
                  </div>
                </div>
                <button class="remove-button" (click)="removeFromCart(item.product.id)">
                  <i class="material-icons">delete</i>
                </button>
              </div>
            }
          </div>
          <div class="cart-summary">
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ cartTotal | currency }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ cartTotal | currency }}</span>
            </div>
            <button class="checkout-button">
              Proceed to Checkout
            </button>
          </div>
        </div>
      } @else {
        <div class="empty-cart">
          <i class="material-icons">shopping_cart</i>
          <p>Your cart is empty</p>
          <a routerLink="/" class="continue-shopping">Continue Shopping</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .cart-title {
      font-size: 2rem;
      margin-bottom: 2rem;
      color: var(--text-color);
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .item-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 0.5rem;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--text-color);
      }
    }

    .item-price {
      font-weight: 600;
      color: var(--primary-color);
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 1rem;

      button {
        background: var(--surface-color);
        border: none;
        padding: 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
        color: var(--text-color);

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .remove-button {
      background: none;
      border: none;
      color: var(--error-color);
      cursor: pointer;
      padding: 0.5rem;
      opacity: 0.7;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }

    .cart-summary {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      height: fit-content;

      h2 {
        margin: 0 0 1.5rem;
        font-size: 1.25rem;
        color: var(--text-color);
      }
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      color: var(--text-color-secondary);

      &.total {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--surface-color);
        font-weight: 600;
        color: var(--text-color);
      }
    }

    .checkout-button {
      width: 100%;
      padding: 1rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background: var(--primary-color-hover);
      }
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 0;
      color: var(--text-color-secondary);

      i {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1.25rem;
        margin-bottom: 2rem;
      }
    }

    .continue-shopping {
      display: inline-block;
      padding: 1rem 2rem;
      background: var(--primary-color);
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 600;
      transition: background-color 0.3s ease;

      &:hover {
        background: var(--primary-color-hover);
      }
    }

    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .container {
        padding: 1rem;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
    });
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
} 