import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product';
import { ImageLazyLoadComponent } from '../image-lazy-load/image-lazy-load.component';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ImageLazyLoadComponent],
  template: `
    <div class="product-card">
      <div class="product-image" [routerLink]="['/product', product.id]">
        <app-image-lazy-load
          [src]="product.thumbnailUrl"
          [alt]="product.name"
        ></app-image-lazy-load>
        <div class="product-overlay">
          <span class="product-category">{{ product.category }}</span>
          <span class="product-file-type">{{ product.fileType.toUpperCase() }}</span>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-title" [routerLink]="['/product', product.id]">{{ product.name }}</h3>
        <p class="product-description">{{ product.description }}</p>
        <div class="product-footer">
          <span class="product-price">{{ product.price | currency }}</span>
          <button 
            class="add-to-cart-btn" 
            [class.added]="isInCart"
            [disabled]="isInCart"
            (click)="addToCart($event)"
          >
            <i class="material-icons">{{ isInCart ? 'check' : 'add_shopping_cart' }}</i>
            {{ isInCart ? 'Added to Cart' : 'Add to Cart' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
    }

    .product-image {
      position: relative;
      padding-top: 66.67%;
      background: var(--surface-color);
    }

    .product-image app-image-lazy-load {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .product-overlay {
      position: absolute;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      display: flex;
      justify-content: space-between;
      z-index: 1;
    }

    .product-category,
    .product-file-type {
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--primary-color);
    }

    .product-info {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .product-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0 0 0.5rem;
      line-height: 1.4;
    }

    .product-description {
      font-size: 0.9rem;
      color: var(--text-color-secondary);
      margin: 0 0 1rem;
      line-height: 1.6;
      flex: 1;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-color);
    }

    .product-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .add-to-cart-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 2rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: var(--primary-color-hover);
        transform: translateY(-2px);
      }

      &.added {
        background: var(--success-color);
        cursor: default;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      i {
        font-size: 1.25rem;
      }
    }

    @media (max-width: 768px) {
      .product-card {
        border-radius: 0.75rem;
      }

      .product-info {
        padding: 1rem;
      }

      .product-title {
        font-size: 1.1rem;
      }

      .product-price {
        font-size: 1.1rem;
      }
    }
  `]
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) product!: Product;
  isInCart: boolean = false;
  private cartSubscription?: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.cartItems$.subscribe(() => {
      this.isInCart = this.cartService.isProductInCart(this.product.id);
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  addToCart(event: Event): void {
    event.stopPropagation(); // Prevent navigation when clicking the button
    if (!this.isInCart) {
      this.cartService.addToCart(this.product);
    }
  }
} 