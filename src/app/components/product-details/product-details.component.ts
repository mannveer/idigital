import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ImageLazyLoadComponent } from '../image-lazy-load/image-lazy-load.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ImageLazyLoadComponent],
  template: `
    <div class="container">
      <div class="product-details" *ngIf="product">
        <div class="product-images">
          <img [src]="product.thumbnailUrl" [alt]="product.name" class="main-image">
          <div class="sample-images">
            @for (image of product.sampleImages; track image) {
              <img [src]="image" [alt]="product.name" class="sample-image">
            }
          </div>
        </div>
        <div class="product-info">
          <h1 class="product-title">{{product.name}}</h1>
          <p class="product-author">by {{product.author}}</p>
          <p class="product-price">{{product.price | currency}}</p>
          <div class="product-meta">
            <span class="meta-item">
              <i class="material-icons">description</i>
              {{product.fileType}}
            </span>
            <span class="meta-item">
              <i class="material-icons">sd_card</i>
              {{product.fileSize}}
            </span>
          </div>
          <p class="product-description">{{product.description}}</p>
          <button class="btn btn-primary add-to-cart" (click)="addToCart()">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .product-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 2rem;
      background: var(--surface-color);
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .main-image {
      width: 100%;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .sample-images {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }

    .sample-image {
      width: 100%;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .sample-image:hover {
      transform: scale(1.05);
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .product-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .product-author {
      font-size: 1.1rem;
      color: var(--text-color-secondary);
    }

    .product-price {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .product-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-color-secondary);
      font-size: 0.875rem;

      i {
        font-size: 1.25rem;
      }
    }

    .product-description {
      font-size: 1.1rem;
      color: var(--text-color-secondary);
      line-height: 1.6;
    }

    .add-to-cart {
      margin-top: 1rem;
      padding: 1rem 2rem;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .product-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProduct(productId).subscribe((product) => {
        this.product = product;
      });
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product);
    }
  }
} 