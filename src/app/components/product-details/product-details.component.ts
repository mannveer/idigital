import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageLazyLoadComponent } from '../image-lazy-load/image-lazy-load.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { register } from 'swiper/element/bundle';
import { Subscription } from 'rxjs';

register();

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ImageLazyLoadComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (isLoading) {
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    } @else if (!product) {
      <div class="error-container">
        <h2>Product Not Found</h2>
        <p>Sorry, we couldn't find the product you're looking for.</p>
        <button class="btn-primary" (click)="navigateToHome()">Back to Home</button>
      </div>
    } @else {
      <div class="product-details">
        <div class="product-gallery">
          <div class="main-image-container" (click)="toggleZoom()">
            <img [src]="selectedImage" [alt]="product.name" [class.zoomed]="isZoomed" />
            <button class="zoom-button" (click)="toggleZoom(); $event.stopPropagation()">
              <i class="fas" [class.fa-search-plus]="!isZoomed" [class.fa-search-minus]="isZoomed"></i>
            </button>
          </div>
          @if (product.sampleImages.length > 1) {
            <swiper-container class="sample-images" slides-per-view="4" space-between="10">
              @for (image of product.sampleImages; track image) {
                <swiper-slide>
                  <img 
                    [src]="image" 
                    [alt]="product.name" 
                    [class.active]="selectedImage === image"
                    (click)="selectImage(image)" 
                  />
                </swiper-slide>
              }
            </swiper-container>
          }
        </div>

        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <div class="meta-info">
            <span class="price">\${{ product.price.toFixed(2) }}</span>
            <div class="rating">
              <span class="stars">★★★★★</span>
              <span class="count">(50 reviews)</span>
            </div>
          </div>

          <div class="product-meta-grid">
            <div class="meta-item">
              <i class="fas fa-file"></i>
              <span>{{ product.fileType }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-hdd"></i>
              <span>{{ product.fileSize }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-user"></i>
              <span>{{ product.author }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>{{ product.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>

          <div class="license-info">
            <i class="fas fa-check-circle"></i>
            <span>Commercial License Included</span>
          </div>

          <p class="description">{{ product.description }}</p>

          <div class="features">
            <h3>What's Included</h3>
            <ul>
              <li><i class="fas fa-check"></i> High-resolution files</li>
              <li><i class="fas fa-check"></i> Documentation and support</li>
              <li><i class="fas fa-check"></i> Regular updates</li>
              <li><i class="fas fa-check"></i> Commercial license</li>
            </ul>
          </div>

          <div class="action-buttons">
            <button 
              class="btn-primary buy-now" 
              (click)="buyNow()"
            >
              Buy Now
            </button>
            <button 
              class="btn-secondary add-to-cart" 
              [class.in-cart]="isInCart"
              (click)="toggleCart()"
            >
              @if (isInCart) {
                <span><i class="fas fa-check"></i> In Cart</span>
              } @else {
                <span><i class="fas fa-shopping-cart"></i> Add to Cart</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      box-sizing: border-box;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
      width: 100%;
      background: var(--color-background);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .product-details {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 2rem;
      width: 100%;
      background: var(--color-background);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }

    .product-gallery {
      padding: 1rem;
      width: 100%;
      max-width: 100%;
    }

    .main-image-container {
      position: relative;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      cursor: zoom-in;
      aspect-ratio: 4/3;
    }

    .main-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .main-image-container img.zoomed {
      transform: scale(1.5);
      cursor: zoom-out;
    }

    .zoom-button {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: var(--color-background);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      box-shadow: var(--shadow-md);
      transition: transform 0.2s ease;
    }

    .zoom-button:hover {
      transform: scale(1.1);
    }

    .sample-images {
      margin-top: 1rem;
    }

    .sample-images img {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .sample-images img:hover {
      transform: translateY(-2px);
    }

    .sample-images img.active {
      border: 2px solid var(--color-primary);
    }

    .product-info {
      padding: 2rem;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--color-text);
    }

    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .price {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--color-primary);
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stars {
      color: #ffd700;
    }

    .count {
      color: var(--color-text-light);
    }

    .product-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--color-background-light);
      border-radius: 8px;
    }

    .meta-item i {
      color: var(--color-primary);
    }

    .license-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      color: var(--color-success);
    }

    .description {
      margin-bottom: 1.5rem;
      color: var(--color-text);
      line-height: 1.6;
    }

    .features {
      margin-bottom: 2rem;
    }

    .features h3 {
      margin-bottom: 1rem;
      color: var(--color-text);
    }

    .features ul {
      list-style: none;
      padding: 0;
    }

    .features li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      color: var(--color-text);
    }

    .features i {
      color: var(--color-success);
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 1.25rem;
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
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: white;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(99, 102, 241, 0.3);
    }

    .btn-primary:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
    }

    .btn-secondary {
      background: var(--color-background);
      color: #6366F1;
      border: 2px solid #6366F1;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1);
    }

    .btn-secondary:hover {
      background: rgba(99, 102, 241, 0.05);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(99, 102, 241, 0.2);
    }

    .btn-secondary:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.1);
    }

    .btn-secondary.in-cart {
      background: #10B981;
      color: white;
      border-color: #10B981;
    }

    .btn-secondary.in-cart:hover {
      background: #059669;
    }

    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .product-details {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .main-image-container {
        aspect-ratio: 3/2;
      }

      .product-meta-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product: Product | undefined;
  isLoading = true;
  isZoomed = false;
  isInCart = false;
  selectedImage: string | undefined;
  private subscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.subscription = this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      } else {
        this.navigateToHome();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe(product => {
      this.product = product;
      if (product) {
        this.selectedImage = product.thumbnailUrl;
        this.checkCartStatus();
      }
      this.isLoading = false;
    });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
    this.isZoomed = false;
  }

  toggleZoom(): void {
    this.isZoomed = !this.isZoomed;
  }

  toggleCart(): void {
    if (!this.product) return;
    
    if (this.isInCart) {
      this.cartService.removeFromCart(this.product.id);
    } else {
      this.cartService.addToCart(this.product);
    }
    this.checkCartStatus();
  }

  buyNow(): void {
    if (!this.product) return;
    
    this.router.navigate(['/checkout'], {
      queryParams: { productId: this.product.id }
    });
  }

  private checkCartStatus(): void {
    if (!this.product) return;
    this.isInCart = this.cartService.isProductInCart(this.product.id);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
} 