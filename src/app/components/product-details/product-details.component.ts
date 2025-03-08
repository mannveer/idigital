import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageLazyLoadComponent } from '../image-lazy-load/image-lazy-load.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { register } from 'swiper/element/bundle';
import { Subscription, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
      <div class="product-details" [class.preview-open]="isPreviewOpen">
        <div class="product-gallery">
          <div 
            class="main-image-container" 
            [class.zoomed]="isZoomed"
            (click)="toggleZoom()"
            #imageContainer
            (mousemove)="handleMouseMove($event)"
            (mouseleave)="handleMouseLeave()"
            (touchstart)="handleTouchStart($event)"
            (touchmove)="handleTouchMove($event)"
            (touchend)="handleTouchEnd()"
          >
            <img 
              [src]="selectedImage" 
              [alt]="product.name" 
              [style.transform]="zoomTransform"
              [class.zoomed]="isZoomed" 
            />
            <div class="image-overlay">
              <button class="zoom-button" (click)="toggleZoom(); $event.stopPropagation()">
                <i class="fas" [class.fa-search-plus]="!isZoomed" [class.fa-search-minus]="isZoomed"></i>
              </button>
              <button class="preview-button" (click)="openPreview(); $event.stopPropagation()">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>

          @if (product.sampleImages && product.sampleImages.length > 1) {
            <swiper-container 
              class="sample-images" 
              [attr.slides-per-view]="isMobile ? '3.5' : '4'"
              space-between="10"
              free-mode="true"
              grab-cursor="true"
            >
              @for (image of product.sampleImages; track image) {
                <swiper-slide>
                  <div 
                    class="thumbnail-container"
                    [class.active]="selectedImage === image"
                    (click)="selectImage(image)"
                  >
                    <img [src]="image" [alt]="product.name" />
                  </div>
                </swiper-slide>
              }
            </swiper-container>
          }
        </div>

        <div class="product-info">
          <div class="product-header">
            <h1>{{ product.name }}</h1>
            <div class="meta-info">
              <div class="price-rating">
                <span class="price">\${{ product.price.toFixed(2) }}</span>
                <div class="rating">
                  <div class="stars">
                    @for (star of [1,2,3,4,5]; track star) {
                      <i class="fas fa-star"></i>
                    }
                  </div>
                  <span class="count">(50 reviews)</span>
                </div>
              </div>
              <div class="license-badge">
                <i class="fas fa-shield-alt"></i>
                <span>Commercial License</span>
              </div>
            </div>
          </div>

          <div class="product-meta">
            <div class="meta-item">
              <i class="fas fa-file"></i>
              <div class="meta-content">
                <span class="meta-label">File Type</span>
                <span class="meta-value">{{ product.fileType }}</span>
              </div>
            </div>
            <div class="meta-item">
              <i class="fas fa-hdd"></i>
              <div class="meta-content">
                <span class="meta-label">Size</span>
                <span class="meta-value">{{ product.fileSize }}</span>
              </div>
            </div>
            <div class="meta-item">
              <i class="fas fa-user"></i>
              <div class="meta-content">
                <span class="meta-label">Author</span>
                <span class="meta-value">{{ product.author }}</span>
              </div>
            </div>
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <div class="meta-content">
                <span class="meta-label">Released</span>
                <span class="meta-value">{{ product.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h2>Description</h2>
            <p class="description">{{ product.description }}</p>
          </div>

          <div class="features-section">
            <h2>What's Included</h2>
            <div class="features-grid">
              <div class="feature-item">
                <i class="fas fa-file-image"></i>
                <div class="feature-content">
                  <h3>High-resolution Files</h3>
                  <p>Premium quality source files</p>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-book"></i>
                <div class="feature-content">
                  <h3>Documentation</h3>
                  <p>Detailed usage guidelines</p>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-sync"></i>
                <div class="feature-content">
                  <h3>Free Updates</h3>
                  <p>Access to future versions</p>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-headset"></i>
                <div class="feature-content">
                  <h3>Support</h3>
                  <p>6 months technical support</p>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button 
              class="btn-primary buy-now" 
              (click)="buyNow()"
            >
              <i class="fas fa-bolt"></i>
              <span>Buy Now</span>
            </button>
            <button 
              class="btn-secondary add-to-cart" 
              [class.in-cart]="isInCart"
              (click)="toggleCart()"
            >
              @if (isInCart) {
                <i class="fas fa-check"></i>
                <span>In Cart</span>
              } @else {
                <i class="fas fa-shopping-cart"></i>
                <span>Add to Cart</span>
              }
            </button>
          </div>
        </div>

        @if (isPreviewOpen) {
          <div class="preview-modal" (click)="closePreview()">
            <div class="preview-content" (click)="$event.stopPropagation()">
              <button class="close-preview" (click)="closePreview()">
                <i class="fas fa-times"></i>
              </button>
              <div class="preview-header">
                <h2>{{ product.name }}</h2>
                <span class="file-type">{{ product.fileType }}</span>
              </div>
              <div class="preview-image">
                <img [src]="selectedImage" [alt]="product.name" />
              </div>
              <div class="preview-thumbnails">
                @for (image of product.sampleImages; track image) {
                  <div 
                    class="preview-thumbnail"
                    [class.active]="selectedImage === image"
                    (click)="selectImage(image)"
                  >
                    <img [src]="image" [alt]="product.name" />
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 1400px;
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
      background: var(--surface-color);
      border-radius: 1rem;
      box-shadow: var(--shadow-lg);
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .product-details {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 3rem;
      width: 100%;
      background: var(--surface-color);
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      position: relative;
    }

    .product-gallery {
      padding: 1.5rem;
      width: 100%;
      max-width: 100%;
      background: var(--background-color);
    }

    .main-image-container {
      position: relative;
      width: 100%;
      border-radius: 1rem;
      overflow: hidden;
      cursor: zoom-in;
      aspect-ratio: 4/3;
      background: var(--surface-color);
      box-shadow: var(--shadow-md);
    }

    .main-image-container.zoomed {
      cursor: zoom-out;
    }

    .main-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .main-image-container img.zoomed {
      transform-origin: center;
      will-change: transform;
    }

    .image-overlay {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      display: flex;
      gap: 0.75rem;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    }

    .main-image-container:hover .image-overlay {
      opacity: 1;
      transform: translateY(0);
    }

    .zoom-button, .preview-button {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: var(--surface-color);
      color: var(--text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
        background: var(--primary-color);
        color: white;
      }

      i {
        font-size: 1.125rem;
      }
    }

    .sample-images {
      margin-top: 1.5rem;
      padding: 0.5rem;
    }

    .thumbnail-container {
      position: relative;
      aspect-ratio: 1;
      border-radius: 0.5rem;
      overflow: hidden;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &.active {
        border: 2px solid var(--primary-color);
        transform: translateY(-2px);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .product-info {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .product-header {
      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-color);
        margin-bottom: 1rem;
        line-height: 1.2;
      }
    }

    .meta-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .price-rating {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .price {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
      font-feature-settings: "tnum";
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .stars {
      color: #ffd700;
      display: flex;
      gap: 0.25rem;
    }

    .count {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .license-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--success-color-light);
      color: var(--success-color);
      border-radius: 2rem;
      font-weight: 500;
      font-size: 0.875rem;

      i {
        font-size: 1rem;
      }
    }

    .product-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 1.5rem;
      background: var(--background-color);
      border-radius: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: var(--surface-color);
      border-radius: 0.75rem;
      box-shadow: var(--shadow-sm);

      i {
        font-size: 1.25rem;
        color: var(--primary-color);
        padding-top: 0.25rem;
      }
    }

    .meta-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .meta-label {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-weight: 500;
      color: var(--text-color);
    }

    .description-section,
    .features-section {
      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 1rem;
      }
    }

    .description {
      color: var(--text-color);
      line-height: 1.6;
      font-size: 1rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: var(--background-color);
      border-radius: 0.75rem;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
      }

      i {
        font-size: 1.25rem;
        color: var(--primary-color);
        padding-top: 0.25rem;
      }
    }

    .feature-content {
      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.875rem;
        color: var(--text-color-secondary);
      }
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: auto;
    }

    .btn-primary,
    .btn-secondary {
      flex: 1;
      height: 3.5rem;
      border: none;
      border-radius: 0.75rem;
      font-size: 1rem;
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


    //     .btn-primary {
    //   background: var(--primary-color);
    //   color: white;
    //   box-shadow: 0 4px 6px rgba(var(--primary-color-rgb), 0.2);
    //   position: relative;
    //   overflow: hidden;

    //   &::before {
    //     content: '';
    //     position: absolute;
    //     top: 0;
    //     left: 0;
    //     right: 0;
    //     bottom: 0;
    //     background: linear-gradient(135deg, 
    //       var(--primary-color) 0%, 
    //       var(--primary-color-dark) 100%
    //     );
    //     transition: opacity 0.3s ease;
    //     z-index: 1;
    //   }

    //   span, i {
    //     position: relative;
    //     z-index: 2;
    //   }

    //   &:hover {
    //     transform: translateY(-2px);
    //     box-shadow: 0 6px 12px rgba(var(--primary-color-rgb), 0.3);

    //     &::before {
    //       opacity: 0.8;
    //     }
    //   }

    //   &:active {
    //     transform: translateY(0);
    //     box-shadow: 0 4px 6px rgba(var(--primary-color-rgb), 0.2);
    //   }

    //   i {
    //     font-size: 1.125rem;
    //   }
    // }

    // .btn-secondary {
    //   background: transparent;
    //   color: var(--primary-color);
    //   border: 2px solid var(--primary-color);
    //   position: relative;
    //   overflow: hidden;

    //   &::before {
    //     content: '';
    //     position: absolute;
    //     top: 0;
    //     left: 0;
    //     right: 0;
    //     bottom: 0;
    //     background: var(--primary-color);
    //     opacity: 0;
    //     transition: opacity 0.3s ease;
    //     z-index: 1;
    //   }

    //   span, i {
    //     position: relative;
    //     z-index: 2;
    //   }

    //   &:hover {
    //     color: white;
    //     transform: translateY(-2px);
    //     box-shadow: 0 4px 8px rgba(var(--primary-color-rgb), 0.2);

    //     &::before {
    //       opacity: 0.1;
    //     }
    //   }

    //   &:active {
    //     transform: translateY(0);
    //   }

    //   &.in-cart {
    //     background: var(--success-color);
    //     color: white;
    //     border-color: var(--success-color);

    //     &:hover {
    //       background: var(--success-color-dark);
    //       border-color: var(--success-color-dark);
    //     }
    //   }
    // }

    .preview-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
      animation: fadeIn 0.3s ease;
    }

    .preview-content {
      width: 100%;
      max-width: 1200px;
      background: var(--surface-color);
      border-radius: 1rem;
      position: relative;
      animation: slideUp 0.3s ease;
    }

    .close-preview {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: var(--surface-color);
      color: var(--text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
      transition: all 0.2s ease;
      z-index: 1;

      &:hover {
        transform: scale(1.1);
        background: var(--error-color);
        color: white;
      }
    }

    .preview-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
        margin: 0;
      }

      .file-type {
        padding: 0.5rem 1rem;
        background: var(--background-color);
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-color-secondary);
      }
    }

    .preview-image {
      width: 100%;
      height: 600px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--background-color);
      overflow: hidden;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .preview-thumbnails {
      padding: 1rem;
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      background: var(--background-color);
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;

      &::-webkit-scrollbar {
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: var(--background-color);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 4px;

        &:hover {
          background: var(--text-color-secondary);
        }
      }
    }

    .preview-thumbnail {
      flex: 0 0 100px;
      height: 100px;
      border-radius: 0.5rem;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &.active {
        border: 2px solid var(--primary-color);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 1024px) {
      :host {
        padding: 1rem;
      }

      .product-details {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .product-gallery {
        border-bottom: 1px solid var(--border-color);
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .main-image-container {
        aspect-ratio: 3/2;
      }

      .product-meta {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .preview-modal {
        padding: 0;
      }

      .preview-content {
        height: 100%;
        border-radius: 0;
      }

      .preview-image {
        height: 400px;
      }
    }

    @media (max-width: 480px) {
      :host {
        padding: 0;
      }

      .product-details {
        border-radius: 0;
        box-shadow: none;
      }

      .product-gallery {
        padding: 1rem;
      }

      .product-info {
        padding: 1.5rem;
      }

      .product-header h1 {
        font-size: 1.5rem;
      }

      .price {
        font-size: 1.5rem;
      }

      .meta-item {
        padding: 0.75rem;
      }

      .preview-header h2 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('imageContainer') imageContainer!: ElementRef;
  
  product: Product | undefined;
  isLoading = true;
  isZoomed = false;
  isInCart = false;
  selectedImage: string | undefined;
  isPreviewOpen = false;
  isMobile = window.innerWidth <= 768;
  zoomTransform = '';
  private subscription: Subscription | undefined;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
  }

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
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        if (product) {
          this.selectedImage = product.thumbnailUrl || product.sampleImages?.[0];
          this.checkCartStatus();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.product = undefined;
        this.isLoading = false;
      }
    });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
    this.isZoomed = false;
  }

  toggleZoom(): void {
    this.isZoomed = !this.isZoomed;
    if (!this.isZoomed) {
      this.zoomTransform = '';
    }
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

  handleMouseMove(event: MouseEvent) {
    if (!this.isZoomed || !this.imageContainer) return;
    
    const rect = this.imageContainer.nativeElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    this.zoomTransform = `scale(2) translate(${(0.5 - x) * 100}%, ${(0.5 - y) * 100}%)`;
  }

  handleMouseLeave() {
    if (this.isZoomed) {
      this.zoomTransform = 'scale(2)';
    }
  }

  handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      this.toggleZoom();
    }
  }

  handleTouchMove(event: TouchEvent) {
    if (!this.isZoomed || event.touches.length !== 1 || !this.imageContainer) return;
    
    const touch = event.touches[0];
    const rect = this.imageContainer.nativeElement.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;
    
    this.zoomTransform = `scale(2) translate(${(0.5 - x) * 100}%, ${(0.5 - y) * 100}%)`;
  }

  handleTouchEnd() {
    if (this.isZoomed) {
      this.zoomTransform = 'scale(2)';
    }
  }

  openPreview() {
    this.isPreviewOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closePreview() {
    this.isPreviewOpen = false;
    document.body.style.overflow = '';
  }
} 